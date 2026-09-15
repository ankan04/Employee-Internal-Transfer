/**
 * employee-internal-transfer.T07 — Workflow engine and transition table.
 * Implements employee-internal-transfer.AC26.
 *
 * D5-F01: approval-stage transitions are NOT declared here. Adding them IS the
 * C1 decision (task T38). Callers resolve the submission target through
 * firstPendingState() rather than naming a stage, so this module remains
 * correct under any approval model C1 resolves to.
 */
export type Status =
  | 'DRAFT'
  | 'PENDING_RELEASING_MANAGER'
  | 'PENDING_RECEIVING_MANAGER'
  | 'PENDING_HR_VALIDATION'
  | 'APPROVED_SCHEDULED'
  | 'IN_EXECUTION'
  | 'EXECUTION_ATTENTION'
  | 'COMPLETED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'CANCELLED';

export type Action = 'SUBMIT' | 'AMEND' | 'WITHDRAW' | 'DECIDE' | 'CANCEL' | 'EXECUTE';

export interface Transition {
  from: Status;
  action: Action;
  to: Status;
}

const TERMINAL: ReadonlySet<Status> = new Set<Status>([
  'COMPLETED',
  'REJECTED',
  'WITHDRAWN',
  'CANCELLED',
]);

const PENDING: readonly Status[] = [
  'PENDING_RELEASING_MANAGER',
  'PENDING_RECEIVING_MANAGER',
  'PENDING_HR_VALIDATION',
];

export const TRANSITIONS: readonly Transition[] = [
  { from: 'DRAFT', action: 'SUBMIT', to: PENDING[0] },
  { from: 'DRAFT', action: 'AMEND', to: 'DRAFT' },
  { from: 'DRAFT', action: 'WITHDRAW', to: 'WITHDRAWN' },
  { from: 'DRAFT', action: 'CANCEL', to: 'CANCELLED' },
  ...PENDING.flatMap((p): Transition[] => [
    { from: p, action: 'WITHDRAW', to: 'WITHDRAWN' },
    { from: p, action: 'CANCEL', to: 'CANCELLED' },
  ]),
  { from: 'APPROVED_SCHEDULED', action: 'CANCEL', to: 'CANCELLED' },
  // ⛔ DECIDE transitions: gated on C1, task T38.
  // ⛔ EXECUTE transitions: gated on C9, task T44.
];

export class InvalidTransitionError extends Error {
  readonly code = 'INVALID_STATE_TRANSITION';
  constructor(from: Status, action: Action) {
    super(`No declared transition for (${from}, ${action})`);
  }
}

export function isTerminal(s: Status): boolean {
  return TERMINAL.has(s);
}

export function applyTransition(from: Status, action: Action): Status {
  const t = TRANSITIONS.find((x) => x.from === from && x.action === action);
  if (!t) throw new InvalidTransitionError(from, action);
  return t.to;
}

/** D5-F01: the submission target, resolved from the table — never a literal. */
export function firstPendingState(): Status {
  const t = TRANSITIONS.find((x) => x.from === 'DRAFT' && x.action === 'SUBMIT');
  if (!t) throw new Error('Transition table declares no submission transition');
  return t.to;
}

/** Employee-visible role holding the pending action, derived from the table. */
export function pendingRoleFor(s: Status): string | null {
  if (!s.startsWith('PENDING_')) return null;
  return s.replace(/^PENDING_/, '');
}
