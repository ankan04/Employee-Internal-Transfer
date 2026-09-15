/**
 * employee-internal-transfer.T19 — canAccess authorisation predicate
 * Prompt: PM19.RED
 * AC:     AC39
 * Tests:  .UT45, .UT76, .UT77
 */
import { canAccess, Visibility } from '../../src/domain/authorization/canAccess';
import { TransferRequest } from '../../src/domain/request/transferRequest';
import { SUBJECT_A, SUBJECT_B } from '../helpers/db';

const req = () => TransferRequest.createDraft({ subjectRef: SUBJECT_A });

const actor = (ref: string, roles: string[] = [], approverFor: string[] = []) => ({
  subjectRef: ref,
  roles,
  // C1: the resolved approver assignment is an INPUT. This predicate never
  // computes it — approver resolution is task T29, gated on C1.
  approverForRequestIds: approverFor,
});

describe('canAccess (AC39)', () => {
  it('the subject sees their own request', () => {
    const r = req();
    expect(canAccess(actor(SUBJECT_A), r)).toBe<Visibility>('SUBJECT');
  });

  it('.UT45 — an unrelated employee gets NONE, which the HTTP layer renders as 404', () => {
    expect(canAccess(actor(SUBJECT_B), req())).toBe<Visibility>('NONE');
  });

  it('.UT77 — a manager who is not a resolved approver for this request gets NONE', () => {
    expect(canAccess(actor(SUBJECT_B, ['MANAGER']), req())).toBe<Visibility>('NONE');
  });

  it('a manager who IS a resolved approver for this request gets APPROVER', () => {
    const r = req();
    expect(canAccess(actor(SUBJECT_B, ['MANAGER'], [r.id]), r)).toBe<Visibility>('APPROVER');
  });

  it('HR sees every request', () => {
    expect(canAccess(actor(SUBJECT_B, ['HR']), req())).toBe<Visibility>('HR');
  });

  it('no actor is ever an approver on their own request — VR11 / AC21', () => {
    const r = req();
    expect(canAccess(actor(SUBJECT_A, ['MANAGER'], [r.id]), r)).toBe<Visibility>('SUBJECT');
  });

  it('.UT76 — decision is constant-time with respect to record existence', () => {
    // The predicate must not branch on data lookups that differ in cost between
    // a real and an absent record. It receives the record; it performs no I/O.
    expect(canAccess.length).toBe(2);
    const src = canAccess.toString();
    expect(src).not.toMatch(/await|query|fetch/);
  });

  it('C1 — the predicate never resolves approver identity itself', () => {
    const src = canAccess.toString();
    expect(src).not.toMatch(/hierarchy|manager_of|reportsTo|orgChart/i);
  });
});
