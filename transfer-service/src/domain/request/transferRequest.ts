/**
 * employee-internal-transfer.T06 — Aggregate. Implements AC1 (domain half).
 * The only object permitted to mutate request state.
 */
import { randomUUID } from 'crypto';
import { Action, Status, applyTransition } from '../workflow/stateMachine';

export interface TransferRequestState {
  id: string;
  subjectRef: string;
  status: Status;
  version: number;
  departmentId: string | null;
  locationId: string | null;
  positionId: string | null;
  effectiveDate: string | null;
  reason: string | null;
}

/** PD05: the point of no return sits between APPROVED_SCHEDULED and execution. */
const PAST_NO_RETURN: ReadonlySet<Status> = new Set<Status>([
  'APPROVED_SCHEDULED',
  'IN_EXECUTION',
  'EXECUTION_ATTENTION',
  'COMPLETED',
]);

export class TransferRequest {
  #s: TransferRequestState;

  private constructor(s: TransferRequestState) {
    this.#s = s;
  }

  static createDraft(input: { subjectRef: string }): TransferRequest {
    return new TransferRequest({
      id: randomUUID(),
      subjectRef: input.subjectRef,
      status: 'DRAFT',
      version: 0,
      departmentId: null,
      locationId: null,
      positionId: null,
      effectiveDate: null,
      reason: null,
    });
  }

  static rehydrate(s: TransferRequestState): TransferRequest {
    return new TransferRequest({ ...s });
  }

  get id(): string { return this.#s.id; }
  get subjectRef(): string { return this.#s.subjectRef; }
  get status(): Status { return this.#s.status; }
  get version(): number { return this.#s.version; }
  snapshot(): TransferRequestState { return { ...this.#s }; }

  // Field accessors and isTerminal() were removed rather than covered by tests
  // written for the number. Nothing in the slice reads them — callers use
  // snapshot(). They return with tasks T20 (projection) and T22 (retrieval),
  // which bring their own acceptance criteria and their own tests.
  // Constitution §1: "coverage is a floor, not a target to write to."

  pointOfNoReturnPassed(): boolean { return PAST_NO_RETURN.has(this.#s.status); }

  /** Validates against the declared table, then applies. Throws without mutating. */
  apply(action: Action): Status {
    const next = applyTransition(this.#s.status, action);
    this.#s.status = next;
    this.#s.version += 1;
    return next;
  }
}
