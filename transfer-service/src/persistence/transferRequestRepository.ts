/** employee-internal-transfer.T06 — repository with optimistic locking. */
import { Pool, PoolClient } from 'pg';
import { TransferRequest, TransferRequestState } from '../domain/request/transferRequest';
import { Status } from '../domain/workflow/stateMachine';

type Row = {
  id: string; subject_ref: string; status: Status; version: number;
  department_id: string | null; location_id: string | null; position_id: string | null;
  effective_date: Date | null; reason: string | null;
};

const toState = (r: Row): TransferRequestState => ({
  id: r.id,
  subjectRef: r.subject_ref,
  status: r.status,
  version: r.version,
  departmentId: r.department_id,
  locationId: r.location_id,
  positionId: r.position_id,
  effectiveDate: r.effective_date ? r.effective_date.toISOString().slice(0, 10) : null,
  reason: r.reason,
});

export class ActiveRequestExists extends Error {
  constructor(public readonly requestId: string) { super('ACTIVE_REQUEST_EXISTS'); }
}

export class TransferRequestRepository {
  constructor(private readonly pool: Pool) {}

  async insertDraft(r: TransferRequest): Promise<TransferRequest> {
    const s = r.snapshot();
    try {
      await this.pool.query(
        `INSERT INTO transfer_request
           (id, subject_ref, status, department_id, location_id, position_id, effective_date, reason, version)
         VALUES ($1,$2,$3::transfer_status,$4,$5,$6,$7,$8,$9)`,
        [s.id, s.subjectRef, s.status, s.departmentId, s.locationId, s.positionId, s.effectiveDate, s.reason, s.version],
      );
      return r;
    } catch (e) {
      if ((e as { code?: string }).code === '23505') {
        const existing = await this.findActiveBySubject(s.subjectRef);
        throw new ActiveRequestExists(existing?.id ?? 'unknown');
      }
      throw e;
    }
  }

  async findActiveBySubject(subjectRef: string): Promise<TransferRequest | null> {
    const { rows } = await this.pool.query<Row>(
      `SELECT * FROM transfer_request
        WHERE subject_ref=$1
          AND status NOT IN ('COMPLETED','REJECTED','WITHDRAWN','CANCELLED')`,
      [subjectRef],
    );
    return rows[0] ? TransferRequest.rehydrate(toState(rows[0])) : null;
  }

  async findById(id: string, client?: PoolClient): Promise<TransferRequest | null> {
    const q = client ?? this.pool;
    const { rows } = await q.query<Row>(`SELECT * FROM transfer_request WHERE id=$1`, [id]);
    return rows[0] ? TransferRequest.rehydrate(toState(rows[0])) : null;
  }

  /** Optimistic lock: the update matches on the version we read. */
  async saveTransition(client: PoolClient, r: TransferRequest, expectedVersion: number): Promise<void> {
    const s = r.snapshot();
    const { rowCount } = await client.query(
      `UPDATE transfer_request
          SET status=$1::transfer_status, version=$2, submitted_at=COALESCE(submitted_at, now())
        WHERE id=$3 AND version=$4`,
      [s.status, s.version, s.id, expectedVersion],
    );
    if (rowCount !== 1) throw new Error('OPTIMISTIC_LOCK_CONFLICT');
  }
}
