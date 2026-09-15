/**
 * employee-internal-transfer.T11 — Validation engine.
 * Returns EVERY failure, never the first (.UT73).
 */
import { MasterData } from '../../ports/masterDataPort';

export interface Candidate {
  subjectRef: string;
  currentPositionId: string | null;
  departmentId: string | null;
  locationId: string | null;
  positionId: string | null;
  effectiveDate: string | null;
  reason: string | null;
}

export interface Failure { field: string; rule: string }

export interface Rule {
  id: string;
  field: string;
  /** true = passes. A rule that does not apply must return true, not fail. */
  check(c: Candidate, m: MasterData): boolean;
}

export interface Result { ok: boolean; failures: Failure[]; normalised: Candidate }

export function normalise(c: Candidate): Candidate {
  const reason = c.reason === null || c.reason.trim() === '' ? null : c.reason;
  return { ...c, reason };
}

export class ValidationEngine {
  constructor(private readonly rules: readonly Rule[], private readonly master: MasterData) {}

  run(c: Candidate): Result {
    const normalised = normalise(c);
    const failures: Failure[] = [];
    for (const r of this.rules) {
      if (!r.check(normalised, this.master)) failures.push({ field: r.field, rule: r.id });
    }
    return { ok: failures.length === 0, failures, normalised };
  }
}
