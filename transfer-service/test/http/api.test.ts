/**
 * employee-internal-transfer.T18 — OIDC + subject derivation      (PM18.RED, AC7)
 * employee-internal-transfer.T13 — API01 create draft             (PM13.RED, AC1)
 * employee-internal-transfer.T15 — Idempotency                    (PM15.RED, AC15)
 * employee-internal-transfer.T16 — API03 submission               (PM16.RED, AC12–AC14)
 * Tests: .UT01, .UT07, .UT13–.UT18, .UT51, .UT65, .UT73, .UT78, .UT79, .UT90, .UT108
 */
import request from 'supertest';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { createApp } from '../../src/http/app';
import { newPool, migrate, resetSchema, SUBJECT_A, SUBJECT_B, TEST_DB_URL } from '../helpers/db';
import { tokenFor, jwks } from '../helpers/token';
import { firstPendingState } from '../../src/domain/workflow/stateMachine';

let pool: Pool;
let app: import('express').Express;
let tokA: string;
let tokB: string;

const future = (d: number) => {
  const x = new Date();
  x.setUTCDate(x.getUTCDate() + d);
  return x.toISOString().slice(0, 10);
};

const validBody = { departmentId: 'D1', locationId: 'L1', positionId: 'P1', effectiveDate: future(20) };

beforeAll(async () => {
  pool = newPool();
  await resetSchema(pool);
  await migrate(pool);
  app = createApp({ connectionString: TEST_DB_URL, jwks: await jwks() });
  tokA = await tokenFor(SUBJECT_A);
  tokB = await tokenFor(SUBJECT_B);
});
// RD-02: the app's own connection pool was never closed, leaving an open handle
// after the run. Teardown only — no assertion added, removed or weakened.
afterAll(async () => {
  await pool.end();
  await (app.locals.pool as Pool).end();
});
beforeEach(async () => {
  await pool.query('TRUNCATE transfer_request CASCADE;');
  await pool.query('TRUNCATE idempotency_record;');
});

const post = (p: string, tok: string) => request(app).post(p).set('Authorization', `Bearer ${tok}`);

describe('T18 — authentication and subject derivation (AC7)', () => {
  it('an unauthenticated request is refused', async () => {
    await request(app).post('/api/v1/transfer-requests').send(validBody).expect(401);
  });

  it('an invalid token is refused', async () => {
    await post('/api/v1/transfer-requests', 'not.a.token').send(validBody).expect(401);
  });

  it('.UT79 — a subjectRef in the body is IGNORED, not rejected; the session subject is used', async () => {
    const res = await post('/api/v1/transfer-requests', tokA)
      .send({ ...validBody, subjectRef: SUBJECT_B })
      .expect(201);
    const { rows } = await pool.query('SELECT subject_ref FROM transfer_request WHERE id=$1', [res.body.requestId]);
    expect(rows[0].subject_ref).toBe(SUBJECT_A);
  });

  it('.UT78 — an X-On-Behalf-Of header is ignored', async () => {
    const res = await post('/api/v1/transfer-requests', tokA)
      .set('X-On-Behalf-Of', SUBJECT_B)
      .send(validBody)
      .expect(201);
    const { rows } = await pool.query('SELECT subject_ref FROM transfer_request WHERE id=$1', [res.body.requestId]);
    expect(rows[0].subject_ref).toBe(SUBJECT_A);
  });
});

describe('T13 — API01 create draft (AC1)', () => {
  it('.UT01 — creates a DRAFT owned by the authenticated subject', async () => {
    const res = await post('/api/v1/transfer-requests', tokA).send(validBody).expect(201);
    expect(res.body.status).toBe('DRAFT');
    expect(res.body.requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('G1-F04 — the response uses presence-by-omission; no hasReason field exists', async () => {
    const noReason = await post('/api/v1/transfer-requests', tokA).send(validBody).expect(201);
    expect(noReason.body).not.toHaveProperty('hasReason');
    expect(noReason.body).not.toHaveProperty('reason');
    await pool.query('TRUNCATE transfer_request CASCADE;');
    const withReason = await post('/api/v1/transfer-requests', tokA)
      .send({ ...validBody, reason: 'Closer to family' })
      .expect(201);
    expect(withReason.body).not.toHaveProperty('hasReason');
    expect(withReason.body.reason).toBe('Closer to family');
  });

  it('AC12 — a second draft while one is active returns 409 with the existing id', async () => {
    const first = await post('/api/v1/transfer-requests', tokA).send(validBody).expect(201);
    const second = await post('/api/v1/transfer-requests', tokA).send(validBody).expect(409);
    expect(second.body.error.code).toBe('ACTIVE_REQUEST_EXISTS');
    expect(second.body.error.details[0].requestId).toBe(first.body.requestId);
  });
});

describe('T16 — API03 submission (AC12, AC13, AC14)', () => {
  // RD-01: this helper was declared `async`, which returned a Promise and broke
  // supertest's chainable .expect(). Corrected in the RED phase, before any
  // implementation existed. No assertion was added, removed or weakened.
  const submit = (id: string, tok: string, key = randomUUID()) =>
    post(`/api/v1/transfer-requests/${id}/submission`, tok).set('Idempotency-Key', key).send({});

  const draft = async (tok = tokA, body = validBody) =>
    (await post('/api/v1/transfer-requests', tok).send(body).expect(201)).body.requestId;

  it('AC14 / D5-F01 — a valid submission lands on the RESOLVED first pending state', async () => {
    const id = await draft();
    const res = await submit(id, tokA).expect(200);
    expect(res.body.status).toBe(firstPendingState());
    expect(res.body.pendingWith[0].role).toBeDefined();
  });

  it('AC14 — an audit row is written for the transition', async () => {
    const id = await draft();
    await submit(id, tokA).expect(200);
    const { rows } = await pool.query(
      `SELECT from_status, to_status, actor_ref, correlation_id FROM transfer_audit WHERE request_id=$1`, [id]);
    expect(rows.length).toBeGreaterThanOrEqual(1);
    const t = rows.find((r) => r.to_status === firstPendingState());
    expect(t).toBeDefined();
    expect(t.from_status).toBe('DRAFT');
    expect(t.actor_ref).toBe(SUBJECT_A);
    expect(t.correlation_id).toBeTruthy();
  });

  it('.UT73 — an incomplete draft reports every validation failure at once', async () => {
    const id = await draft(tokA, { departmentId: 'D1' } as never);
    const res = await submit(id, tokA).expect(422);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    const fields = res.body.error.details.map((d: { field: string }) => d.field).sort();
    expect(fields).toEqual(['effectiveDate', 'locationId', 'positionId']);
  });

  it('.UT65 — effectiveDate at the 15-day boundary is accepted (PD08, replaceable validator)', async () => {
    const id = await draft(tokA, { ...validBody, effectiveDate: future(15) });
    await submit(id, tokA).expect(200);
  });

  it('.UT09 — effectiveDate at 14 days is refused citing VR04', async () => {
    const id = await draft(tokA, { ...validBody, effectiveDate: future(14) });
    const res = await submit(id, tokA).expect(422);
    expect(res.body.error.details).toContainEqual({ field: 'effectiveDate', rule: 'VR04' });
  });

  it('.UT16 — submitting an already-submitted request is refused', async () => {
    const id = await draft();
    await submit(id, tokA).expect(200);
    await submit(id, tokA).expect(409);
  });

  it('.UT33 — submitting another employee\'s request returns 404, never 403', async () => {
    const id = await draft(tokA);
    await submit(id, tokB).expect(404);
  });

  it('C2 — the eligibility pre-check is NOT performed; NOT_ELIGIBLE is unreachable', async () => {
    const id = await draft();
    const res = await submit(id, tokA).expect(200);
    expect(res.body.error).toBeUndefined();
  });
});

describe('T15 — idempotency (AC15)', () => {
  const draft = async () =>
    (await post('/api/v1/transfer-requests', tokA).send(validBody).expect(201)).body.requestId;

  it('.UT17/.UT88 — replaying the same key returns the original result and records one submission', async () => {
    const id = await draft();
    const key = randomUUID();
    const first = await post(`/api/v1/transfer-requests/${id}/submission`, tokA)
      .set('Idempotency-Key', key).send({}).expect(200);
    const replay = await post(`/api/v1/transfer-requests/${id}/submission`, tokA)
      .set('Idempotency-Key', key).send({}).expect(200);
    expect(replay.body).toEqual(first.body);
    const { rows } = await pool.query(
      `SELECT count(*)::int AS n FROM transfer_audit WHERE request_id=$1 AND to_status=$2`,
      [id, firstPendingState()]);
    expect(rows[0].n).toBe(1);
  });

  it('.UT18/.UT108 / G1-F06 — a different key on the same request is IDEMPOTENCY_KEY_MISMATCH', async () => {
    const id = await draft();
    await post(`/api/v1/transfer-requests/${id}/submission`, tokA)
      .set('Idempotency-Key', randomUUID()).send({}).expect(200);
    const res = await post(`/api/v1/transfer-requests/${id}/submission`, tokA)
      .set('Idempotency-Key', randomUUID()).send({}).expect(409);
    expect(res.body.error.code).toBe('IDEMPOTENCY_KEY_MISMATCH');
  });

  it('VR12 — a state-changing call without an Idempotency-Key is refused 400', async () => {
    const id = await draft();
    const res = await post(`/api/v1/transfer-requests/${id}/submission`, tokA).send({}).expect(400);
    expect(res.body.error.code).toBe('IDEMPOTENCY_KEY_REQUIRED');
  });
});
