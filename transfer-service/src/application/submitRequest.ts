/**
 * employee-internal-transfer.T16 — Implements AC12, AC13, AC14.
 *
 * D5-F01: the target state is resolved from the transition table. No approval
 * stage name appears in this file.
 * ⛔ No eligibility pre-check — gated on C2.
 * ⛔ No payroll-aligned date validation — gated on C7.
 */
import { Pool } from 'pg';
import { TransferRequest } from '../domain/request/transferRequest';
import { pendingRoleFor } from '../domain/workflow/stateMachine';
import { ValidationEngine, Failure } from '../domain/validation/engine';
import { SUBMISSION_RULES } from '../domain/validation/rules';
import { MasterDataPort } from '../ports/masterDataPort';
import { TransferRequestRepository } from '../persistence/transferRequestRepository';
import { writeAudit } from '../persistence/auditWriter';

export class ValidationFailed extends Error {
  constructor(public readonly failures: Failure[]) { super('VALIDATION_FAILED'); }
}

export async function submitRequest(
  pool: Pool,
  repo: TransferRequestRepository,
  master: MasterDataPort,
  args: { request: TransferRequest; actorRef: string; correlationId: string },
): Promise<{ statusCode: number; body: unknown }> {
  const { request, actorRef, correlationId } = args;
  const s = request.snapshot();

  const md = await master.load();
  const currentPositionId = await master.currentPositionOf(s.subjectRef);
  const result = new ValidationEngine(SUBMISSION_RULES, md).run({
    subjectRef: s.subjectRef,
    currentPositionId,
    departmentId: s.departmentId,
    locationId: s.locationId,
    positionId: s.positionId,
    effectiveDate: s.effectiveDate,
    reason: s.reason,
  });
  if (!result.ok) throw new ValidationFailed(result.failures);

  const fromStatus = request.status;
  const expectedVersion = request.version;
  const toStatus = request.apply('SUBMIT'); // resolved via the table — D5-F01

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await repo.saveTransition(client, request, expectedVersion);
    await writeAudit(client, {
      requestId: s.id, actorRef, action: 'SUBMIT',
      fromStatus, toStatus, correlationId,
    });
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  return {
    statusCode: 200,
    body: {
      requestId: s.id,
      status: toStatus,
      pendingWith: [{ role: pendingRoleFor(toStatus) }],
      effectiveDate: s.effectiveDate,
      submittedAt: new Date().toISOString(),
    },
  };
}
