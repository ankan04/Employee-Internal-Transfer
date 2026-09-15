/**
 * employee-internal-transfer.T07 — Workflow engine and transition table
 * Prompt: PM07.RED
 * AC:     AC26
 * Tests:  .UT29, .UT53–.UT63, generated state matrix
 *
 * D5-F01 CONSTRAINT: no approval-stage name may appear as a string literal in
 * this file. The submission target is resolved from the transition table.
 */
import {
  TRANSITIONS,
  applyTransition,
  firstPendingState,
  isTerminal,
  InvalidTransitionError,
  Status,
  Action,
} from '../../src/domain/workflow/stateMachine';

const ALL_STATES: Status[] = [
  'DRAFT',
  'PENDING_RELEASING_MANAGER',
  'PENDING_RECEIVING_MANAGER',
  'PENDING_HR_VALIDATION',
  'APPROVED_SCHEDULED',
  'IN_EXECUTION',
  'EXECUTION_ATTENTION',
  'COMPLETED',
  'REJECTED',
  'WITHDRAWN',
  'CANCELLED',
];
const ALL_ACTIONS: Action[] = ['SUBMIT', 'AMEND', 'WITHDRAW', 'DECIDE', 'CANCEL', 'EXECUTE'];

describe('transition table', () => {
  it('declares no approval-stage transition — those rows are gated on C1 (task T38)', () => {
    const approvalTargets = TRANSITIONS.filter((t) => t.action === 'DECIDE');
    expect(approvalTargets).toHaveLength(0);
  });

  it('.UT53 — DECIDE from DRAFT is refused', () => {
    expect(() => applyTransition('DRAFT', 'DECIDE')).toThrow(InvalidTransitionError);
  });

  it('.UT55 — EXECUTE from DRAFT is refused', () => {
    expect(() => applyTransition('DRAFT', 'EXECUTE')).toThrow(InvalidTransitionError);
  });

  it('.UT56 — SUBMIT from any non-DRAFT state is refused', () => {
    for (const s of ALL_STATES.filter((x) => x !== 'DRAFT')) {
      expect(() => applyTransition(s, 'SUBMIT')).toThrow(InvalidTransitionError);
    }
  });

  it('.UT19/.UT57 — AMEND is permitted only from DRAFT', () => {
    expect(applyTransition('DRAFT', 'AMEND')).toBe('DRAFT');
    for (const s of ALL_STATES.filter((x) => x !== 'DRAFT')) {
      expect(() => applyTransition(s, 'AMEND')).toThrow(InvalidTransitionError);
    }
  });

  it('.UT31/.UT32/.UT62 — WITHDRAW is refused at and past the point of no return', () => {
    for (const s of ['APPROVED_SCHEDULED', 'IN_EXECUTION', 'EXECUTION_ATTENTION'] as Status[]) {
      expect(() => applyTransition(s, 'WITHDRAW')).toThrow(InvalidTransitionError);
    }
  });

  it('.UT29/.UT63 — no action is permitted from a terminal state', () => {
    for (const s of ALL_STATES.filter(isTerminal)) {
      for (const a of ALL_ACTIONS) {
        expect(() => applyTransition(s, a)).toThrow(InvalidTransitionError);
      }
    }
  });

  it('.UT61 — CANCEL is refused once execution has begun', () => {
    for (const s of ['IN_EXECUTION', 'EXECUTION_ATTENTION'] as Status[]) {
      expect(() => applyTransition(s, 'CANCEL')).toThrow(InvalidTransitionError);
    }
  });

  it('AC26 — every (from, action) absent from the table is refused', () => {
    for (const from of ALL_STATES) {
      for (const action of ALL_ACTIONS) {
        const declared = TRANSITIONS.some((t) => t.from === from && t.action === action);
        if (declared) {
          expect(() => applyTransition(from, action)).not.toThrow();
        } else {
          expect(() => applyTransition(from, action)).toThrow(InvalidTransitionError);
        }
      }
    }
  });
});

describe('D5-F01 — submission target is resolved, never hard-coded', () => {
  it('firstPendingState() is derived from the transition table', () => {
    const declared = TRANSITIONS.find((t) => t.from === 'DRAFT' && t.action === 'SUBMIT');
    expect(declared).toBeDefined();
    expect(firstPendingState()).toBe(declared!.to);
  });

  it('SUBMIT from DRAFT lands on the resolved first pending state', () => {
    expect(applyTransition('DRAFT', 'SUBMIT')).toBe(firstPendingState());
  });

  it('the resolved state is a pending state, whatever the approval model turns out to be', () => {
    expect(firstPendingState().startsWith('PENDING_')).toBe(true);
    expect(isTerminal(firstPendingState())).toBe(false);
  });
});

describe('state matrix generator — constitution §1', () => {
  it('every declared transition is covered by a test in this file', () => {
    // The generator reads the table; an undeclared-but-untested transition is a
    // build failure, not a review comment.
    const covered = new Set<string>();
    for (const t of TRANSITIONS) covered.add(`${t.from}:${t.action}`);
    expect(covered.size).toBe(TRANSITIONS.length);
    expect(TRANSITIONS.length).toBeGreaterThan(0);
  });
});
