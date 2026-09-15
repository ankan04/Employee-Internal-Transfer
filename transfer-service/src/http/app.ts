/**
 * employee-internal-transfer — HTTP composition root.
 * Implements API01 (T13) and API03 (T16) of the vertical slice.
 */
import express, { Express, Request, Response } from 'express';
import { Pool } from 'pg';
import { JSONWebKeySet } from 'jose';
import { z } from 'zod';
import { TransferRequest } from '../domain/request/transferRequest';
import { canAccess } from '../domain/authorization/canAccess';
import { TransferRequestRepository, ActiveRequestExists } from '../persistence/transferRequestRepository';
import { InMemoryMasterData } from '../persistence/inMemoryMasterData';
import { submitRequest, ValidationFailed } from '../application/submitRequest';
import { authMiddleware } from './middleware/auth';
import { correlationMiddleware } from './middleware/correlation';
import { withIdempotency, IdempotencyKeyRequired, IdempotencyKeyMismatch } from './middleware/idempotency';

const DraftSchema = z.object({
  departmentId: z.string().nullish(),
  locationId: z.string().nullish(),
  positionId: z.string().nullish(),
  effectiveDate: z.string().nullish(),
  reason: z.string().nullish(),
  // NOTE: any caller-supplied subject is not modelled here at all — AC7.
}).passthrough();

const fail = (res: Response, req: Request, status: number, code: string, message: string, details: unknown[] = []) =>
  res.status(status).json({ error: { code, message, details, correlationId: req.correlationId } });

export function createApp(cfg: { connectionString: string; jwks: JSONWebKeySet }): Express {
  const pool = new Pool({ connectionString: cfg.connectionString, max: 10 });
  const repo = new TransferRequestRepository(pool);
  const master = new InMemoryMasterData();

  const app = express();
  // Exposed so a host (or a test) can close the pool on shutdown.
  app.locals.pool = pool;
  app.use(express.json());
  app.use(correlationMiddleware);
  app.use(authMiddleware(cfg.jwks));

  // ---- API01 — create draft (T13, AC1) ----
  app.post('/api/v1/transfer-requests', async (req: Request, res: Response) => {
    const parsed = DraftSchema.safeParse(req.body ?? {});
    if (!parsed.success) return fail(res, req, 400, 'BAD_REQUEST', 'Malformed request body');

    // AC7: subject from the session only. Any body/header subject is ignored.
    const subjectRef = req.actor!.subjectRef;
    const draft = TransferRequest.createDraft({ subjectRef });
    const s = draft.snapshot();
    const body = parsed.data;
    const hydrated = TransferRequest.rehydrate({
      ...s,
      departmentId: body.departmentId ?? null,
      locationId: body.locationId ?? null,
      positionId: body.positionId ?? null,
      effectiveDate: body.effectiveDate ?? null,
      reason: body.reason && body.reason.trim() !== '' ? body.reason : null,
    });

    try {
      await repo.insertDraft(hydrated);
    } catch (e) {
      if (e instanceof ActiveRequestExists) {
        return fail(res, req, 409, 'ACTIVE_REQUEST_EXISTS',
          'An active transfer request already exists', [{ requestId: e.requestId }]);
      }
      throw e;
    }

    const out = hydrated.snapshot();
    // G1-F04: presence-by-omission. No hasReason field exists.
    const payload: Record<string, unknown> = {
      requestId: out.id,
      status: out.status,
      departmentId: out.departmentId,
      locationId: out.locationId,
      positionId: out.positionId,
      effectiveDate: out.effectiveDate,
      createdAt: new Date().toISOString(),
    };
    if (out.reason !== null) payload.reason = out.reason;
    return res.status(201).json(payload);
  });

  // ---- API03 — submission (T16, AC12–AC14; idempotent via T15) ----
  app.post('/api/v1/transfer-requests/:id/submission', async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!/^[0-9a-f-]{36}$/i.test(id)) return fail(res, req, 404, 'NOT_FOUND', 'Not found');

    const existing = await repo.findById(id);
    // AC39 / constitution §2: not visible → 404, never 403.
    if (!existing || canAccess(req.actor!, { id: existing.id, subjectRef: existing.subjectRef }) !== 'SUBJECT') {
      return fail(res, req, 404, 'NOT_FOUND', 'Not found');
    }

    try {
      const outcome = await withIdempotency(
        pool,
        { key: req.header('idempotency-key'), subjectRef: req.actor!.subjectRef,
          endpoint: 'submission', resourceId: id, body: req.body },
        async () => submitRequest(pool, repo, master, {
          request: existing, actorRef: req.actor!.subjectRef, correlationId: req.correlationId!,
        }),
      );
      return res.status(outcome.statusCode).json(outcome.body);
    } catch (e) {
      if (e instanceof IdempotencyKeyRequired)
        return fail(res, req, 400, 'IDEMPOTENCY_KEY_REQUIRED', 'Idempotency-Key header is required');
      if (e instanceof IdempotencyKeyMismatch)
        return fail(res, req, 409, 'IDEMPOTENCY_KEY_MISMATCH',
          'This request was already submitted under a different Idempotency-Key');
      if (e instanceof ValidationFailed)
        return fail(res, req, 422, 'VALIDATION_FAILED', 'Validation failed', e.failures);
      if ((e as Error).message === 'INVALID_STATE_TRANSITION' || (e as { code?: string }).code === 'INVALID_STATE_TRANSITION')
        return fail(res, req, 409, 'INVALID_STATE_TRANSITION', 'Not permitted from the current state');
      throw e;
    }
  });

  return app;
}
