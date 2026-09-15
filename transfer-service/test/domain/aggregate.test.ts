/**
 * employee-internal-transfer.T06 — Aggregate and repository
 * Prompt: PM06.RED
 * AC:     AC1 (domain half)
 * Tests:  .UT01, optimistic locking
 */
import { TransferRequest } from '../../src/domain/request/transferRequest';
import { firstPendingState } from '../../src/domain/workflow/stateMachine';
import { SUBJECT_A } from '../helpers/db';

describe('TransferRequest aggregate', () => {
  it('.UT01 — a draft is created owned by the subject', () => {
    const r = TransferRequest.createDraft({ subjectRef: SUBJECT_A });
    expect(r.subjectRef).toBe(SUBJECT_A);
    expect(r.status).toBe('DRAFT');
    expect(r.version).toBe(0);
    expect(r.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('is the only object that may change status — status has no public setter', () => {
    const r = TransferRequest.createDraft({ subjectRef: SUBJECT_A });
    expect(() => {
      (r as unknown as { status: string }).status = 'COMPLETED';
    }).toThrow();
  });

  it('applies a legal transition and bumps version', () => {
    const r = TransferRequest.createDraft({ subjectRef: SUBJECT_A });
    r.apply('SUBMIT');
    expect(r.status).toBe(firstPendingState());
    expect(r.version).toBe(1);
  });

  it('refuses an illegal transition without mutating state', () => {
    const r = TransferRequest.createDraft({ subjectRef: SUBJECT_A });
    expect(() => r.apply('DECIDE')).toThrow();
    expect(r.status).toBe('DRAFT');
    expect(r.version).toBe(0);
  });

  it('pointOfNoReturnPassed is false before scheduling and true after', () => {
    const r = TransferRequest.createDraft({ subjectRef: SUBJECT_A });
    expect(r.pointOfNoReturnPassed()).toBe(false);
    const scheduled = TransferRequest.rehydrate({
      id: r.id, subjectRef: SUBJECT_A, status: 'APPROVED_SCHEDULED', version: 3,
      departmentId: null, locationId: null, positionId: null, effectiveDate: null, reason: null,
    });
    expect(scheduled.pointOfNoReturnPassed()).toBe(true);
  });
});
