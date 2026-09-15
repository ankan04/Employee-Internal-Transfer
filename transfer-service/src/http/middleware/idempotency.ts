/**
 * employee-internal-transfer.T15 — Implements AC15 and G1-F06.
 * Constitution §2: idempotency is an engineering obligation, never escalated.
 */
import { Pool } from 'pg';
import { createHash } from 'crypto';

export interface IdemOutcome { statusCode: number; body: unknown }

export class IdempotencyKeyRequired extends Error {}
export class IdempotencyKeyMismatch extends Error {}

const hash = (v: unknown) => createHash('sha256').update(JSON.stringify(v ?? {})).digest('hex');

export async function withIdempotency(
  pool: Pool,
  args: { key: string | undefined; subjectRef: string; endpoint: string; resourceId: string; body: unknown },
  execute: () => Promise<IdemOutcome>,
): Promise<IdemOutcome> {
  if (!args.key || args.key.trim() === '') throw new IdempotencyKeyRequired();
  const requestHash = hash(args.body);

  const existing = await pool.query(
    `SELECT key, request_hash, response_body, status_code
       FROM idempotency_record WHERE endpoint=$1 AND resource_id=$2`,
    [args.endpoint, args.resourceId],
  );

  if (existing.rowCount && existing.rows[0]) {
    const rec = existing.rows[0];
    if (rec.key !== args.key) throw new IdempotencyKeyMismatch();
    if (rec.request_hash !== requestHash) throw new IdempotencyKeyMismatch();
    return { statusCode: rec.status_code, body: rec.response_body };
  }

  const outcome = await execute();
  await pool.query(
    `INSERT INTO idempotency_record
       (key, subject_ref, endpoint, resource_id, request_hash, response_body, status_code)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)
     ON CONFLICT DO NOTHING`,
    [args.key, args.subjectRef, args.endpoint, args.resourceId, requestHash,
     JSON.stringify(outcome.body), outcome.statusCode],
  );
  return outcome;
}
