/** employee-internal-transfer.T08 — Implements AC41. Written INSIDE the transition transaction. */
import { PoolClient } from 'pg';
import { Status } from '../domain/workflow/stateMachine';

export async function writeAudit(
  client: PoolClient,
  e: {
    requestId: string; actorRef: string; action: string;
    fromStatus: Status | null; toStatus: Status | null; correlationId: string;
  },
): Promise<void> {
  await client.query(
    `INSERT INTO transfer_audit
       (request_id, actor_ref, action, from_status, to_status, correlation_id, metadata)
     VALUES ($1,$2,$3,$4::transfer_status,$5::transfer_status,$6,'{}'::jsonb)`,
    [e.requestId, e.actorRef, e.action, e.fromStatus, e.toStatus, e.correlationId],
  );
}
