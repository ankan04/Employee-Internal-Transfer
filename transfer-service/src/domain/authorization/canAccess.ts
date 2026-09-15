/**
 * employee-internal-transfer.T19 — object-level authorisation.
 * Implements AC39. Constitution §2: one predicate, every caller.
 *
 * C1 boundary: the resolved approver assignment arrives as INPUT on the actor.
 * This predicate never derives it. Deriving who approves a transfer is task
 * T29, gated on C1 — doing it here would settle a business decision in code.
 *
 * The function performs no I/O so its cost cannot differ between an existing
 * and an absent record (.UT76).
 */
export type Visibility = 'SUBJECT' | 'HR' | 'APPROVER' | 'FULFILLER' | 'NONE';

export interface Actor {
  subjectRef: string;
  roles: string[];
  approverForRequestIds: string[];
}

export interface AccessTarget {
  id: string;
  subjectRef: string;
}

export function canAccess(actor: Actor, target: AccessTarget): Visibility {
  if (actor.subjectRef === target.subjectRef) return 'SUBJECT';
  if (actor.roles.includes('HR') || actor.roles.includes('HR_ADMIN')) return 'HR';
  if (actor.approverForRequestIds.includes(target.id)) return 'APPROVER';
  if (actor.roles.includes('FULFILLER')) return 'FULFILLER';
  return 'NONE';
}
