/**
 * employee-internal-transfer.T03 — Migration: transfer_request
 * Prompt: PM03.RED
 * AC:     AC12 (database half)
 * Tests:  .UT13, .UT90
 */
import { Pool } from 'pg';
import { newPool, migrate, resetSchema, SUBJECT_A } from '../helpers/db';

let pool: Pool;

beforeAll(async () => {
  pool = newPool();
  await resetSchema(pool);
  await migrate(pool);
});
afterAll(async () => { await pool.end(); });

beforeEach(async () => { await pool.query('TRUNCATE transfer_request CASCADE;'); });

async function insert(status: string, subject = SUBJECT_A) {
  return pool.query(
    `INSERT INTO transfer_request (subject_ref, status) VALUES ($1, $2::transfer_status) RETURNING id`,
    [subject, status],
  );
}

describe('transfer_request schema', () => {
  it('.UT13 — a second non-terminal request for the same subject is rejected', async () => {
    await insert('PENDING_HR_VALIDATION');
    await expect(insert('DRAFT')).rejects.toMatchObject({ code: '23505' });
  });

  it('.UT14/.UT15 — a new request is allowed once the prior one is terminal', async () => {
    for (const terminal of ['COMPLETED', 'REJECTED', 'WITHDRAWN', 'CANCELLED']) {
      await pool.query('TRUNCATE transfer_request CASCADE;');
      await insert(terminal);
      await expect(insert('DRAFT')).resolves.toBeDefined();
    }
  });

  it('.UT90 — two genuinely concurrent inserts for one subject produce exactly one row', async () => {
    // Two separate connections committing in parallel. A sequential test would
    // pass against a naive application-level check and prove nothing.
    const c1 = await pool.connect();
    const c2 = await pool.connect();
    try {
      await c1.query('BEGIN');
      await c2.query('BEGIN');
      const q = (c: typeof c1) =>
        c.query(
          `INSERT INTO transfer_request (subject_ref, status) VALUES ($1,'DRAFT'::transfer_status)`,
          [SUBJECT_A],
        );
      const r1 = q(c1);
      const r2 = q(c2);
      const settled = await Promise.allSettled([
        r1.then(() => c1.query('COMMIT')),
        r2.then(() => c2.query('COMMIT')),
      ]);
      const ok = settled.filter((s) => s.status === 'fulfilled').length;
      expect(ok).toBe(1);
    } finally {
      await c1.query('ROLLBACK').catch(() => {});
      await c2.query('ROLLBACK').catch(() => {});
      c1.release();
      c2.release();
    }
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM transfer_request');
    expect(rows[0].n).toBe(1);
  });

  it('position_id carries no foreign key — the position model is gated on C3', async () => {
    const { rows } = await pool.query(
      `SELECT count(*)::int AS n FROM information_schema.table_constraints
       WHERE table_name = 'transfer_request' AND constraint_type = 'FOREIGN KEY'`,
    );
    expect(rows[0].n).toBe(0);
  });
});
