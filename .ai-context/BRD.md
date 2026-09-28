# Business Requirements Document

<!-- Numbered entries, one per requirement. This is the source spec authoring
     pulls from — a spec should never be the first place a requirement is
     written down. See INT_SDD_Standard.md §7. -->

**Revision note (v2):** v1 stated only BRD-001 and left 44 business-policy
questions open in discovery instead of settling them here, which is the
defect the Gate 0 review raised. BRD-002 through BRD-007 below restate those
of the 61 discovery questions (`OQ01`–`OQ61`) that HR Operations has now
actually decided, each traced to the question it closes. Items not listed as
closed remain open — this revision does not claim more is settled than is.
`decisions/employee-internal-transfer.decision-log.md` still shows several of
these as ASSUMPTION ACCEPTED rather than CONFIRMED; that log needs to be
reconciled against this revision next, as a separate pass.

### BRD-001: Digitise the employee internal transfer journey
**Raised by:** HR Operations, via the One-Point Employee Portal product team
**Business need:** An employee requesting an internal transfer must today
coordinate separately with their manager, HR, payroll, IT and facilities across
multiple systems, with no consolidated view of where the request stands. The
organisation wants a single digital journey through the One-Point Employee
Portal: one request, one orchestrated workflow, one progress view.
**Sponsor:** HR Operations (process owner); One-Point Employee Portal Product Owner
**Priority:** High — HR Operations wants this live within the current planning
cycle; no fixed regulatory deadline.
**Decided:** Employee-initiated from the portal; employee supplies proposed
department/business unit, location, role/position and effective date, with an
optional reason; employee can submit, view status, and see actions pending with
other stakeholders; the portal orchestrates downstream activity rather than the
employee coordinating it; employee receives confirmation on completion.
In scope for v1 are four transfer categories, each raised through the same
request but carrying category-specific checks (full detail in BRD-002–BRD-005):
Departmental/cross-functional transfers, location/relocation shifts, lateral
role-based moves against an open requisition, and project-driven/operational
reallocations. An employee may hold at most one active (non-terminal) request
at a time (closes `OQ17`, matches BR02). Full discovery list: KD01–KD14.
**Open at BRD stage:** Whether HR or a manager may raise a request on an
employee's behalf (`OQ06`); additional approval levels above a grade/cost/
cross-BU threshold, e.g. skip-level (`OQ04`); who approves when the releasing
and receiving manager are the same person (`OQ05` — note BR10 already asserts
no self-approval, but the tie-break case is unresolved); who determines the
selectable set of departments/locations/positions an employee may choose from
(`OQ20`); whether an employee may modify a submitted request or must withdraw
and re-raise (`OQ22`); whether a draft/save-for-later state exists pre-submission
(`OQ24`). These remain genuine open items, not settled by this revision.
**Notes:** Scope boundaries from discovery hold: excludes external
recruitment, position creation, payroll calculation itself, compensation
revision, cross-border transfers, secondments, contractor moves, and
manager/HR-initiated transfers. Full list: discovery OOS01–OOS13. Cross-border
exclusion also closes `OQ55`.
**Discovery analysis:** .ai-context/discovery/employee-internal-transfer.discovery.md
**Feature slug:** employee-internal-transfer

---

### BRD-002: Automated policy-based eligibility gate
**Raised by:** HR Operations
**Business need:** Requests that cannot succeed under HR policy should never
reach an approver's queue — every hour a manager spends on an ineligible
request is time the current process already wastes today.
**Sponsor:** HR Operations
**Priority:** High — blocks spec finalisation of the submission path.
**Decided:** Eligibility is evaluated automatically at submission, not after
manager approval (closes `OQ10`), against machine-evaluable HRMS/appraisal
data rather than a human judgement call (closes `OQ11`, source systems named
in dependencies below — closes `OQ15`). The gate checks: minimum 6 months'
continuous service in the current role and department, configurable per
transfer category (closes `OQ12`); latest appraisal rating at or above "Meets
Expectations" / 3.0 out of 5.0; no active Performance Improvement Plan or
formal disciplinary warning on record (closes `OQ13`); and zero other active
transfer requests. A failed pre-check blocks submission and returns
explanatory policy feedback to the employee rather than a silent rejection.
**Open at BRD stage:** Whether a pending resignation or active notice period
also blocks a transfer (`OQ14`) — HR Operations has not yet ruled on this.
**Notes:** Source-of-truth dependency: HRMS Core API (tenure, manager
hierarchy) and the Appraisal & Performance System (rating, PIP/disciplinary
status).
**Discovery analysis:** .ai-context/discovery/employee-internal-transfer.discovery.md
**Feature slug:** employee-internal-transfer

---

### BRD-003: Three-stage sequential approval workflow
**Raised by:** HR Operations
**Business need:** The source requirement names a single "manager" where an
internal transfer structurally has two — the manager losing the employee and
the manager gaining them — and did not state whether HR sits before, after, or
alongside them. Building a workflow model without settling this reshapes the
entire state machine later, which discovery flagged as the single most
expensive open item.
**Sponsor:** HR Operations
**Priority:** High — this is the workflow's core state model; nothing in the
approval, SLA or notification design can proceed without it.
**Decided:** The receiving manager is a distinct, mandatory approval stage
from the releasing manager (closes `OQ01`); both manager approvals are
mandatory and binding, not advisory (closes `OQ02`). The authoritative
sequence is strictly ordered: Stage 1 Releasing Manager (team impact, release
timeline, knowledge transfer) → Stage 2 Receiving Manager (role fit, team
capacity, headcount) → Stage 3 HR Operations (compensation grade, statutory
compliance, benefits, final approval) (closes `OQ03`). Rejection at any stage
is final, terminates the workflow, and is recorded with a structured reason
(closes `OQ07` — HR's Stage 3 rejection stands even after both managers
approved, and it is final). The employee may withdraw at any point before
Stage 3 HR approval, which is the point of no return for this workflow
(closes `OQ21`, matches BR14).
**Open at BRD stage:** Whether Finance/headcount-budget sign-off is separately
required when a transfer moves cost between cost centres (`OQ08`); whether
HR or a manager may raise a request on an employee's behalf (`OQ06`,
duplicated from BRD-001 for visibility); skip-level/threshold-based additional
approvals (`OQ04`).
**Notes:** This closes the workflow-model risk discovery flagged against AS01
(reworks the entire state model if wrong) — HR Operations has now confirmed
AS01's shape rather than leaving it an assumption.
**Discovery analysis:** .ai-context/discovery/employee-internal-transfer.discovery.md
**Feature slug:** employee-internal-transfer

---

### BRD-004: SLA management and automated escalation
**Raised by:** HR Operations
**Business need:** Without a defined SLA and escalation path, a request can
sit indefinitely with an inactive approver, which is one of the current
process's known failure modes.
**Sponsor:** HR Operations
**Priority:** High — required before the workflow's liveness can be verified.
**Decided:** Each approval stage carries a 5-business-day review SLA. An
automated reminder fires to the pending action holder at day 3 of inactivity
(closes part of `OQ45` — cadence is day 3). On day 5 without a decision, an
automated escalation alert is sent to HR Operations for administrative
intervention or delegation — inaction does not auto-expire or auto-approve
the request, it escalates to a human (closes `OQ25`).
**Open at BRD stage:** Approval delegation while an approver is on leave
(`OQ29`) is not decided by this SLA design — day-5 escalation to HR Operations
is a backstop, not a delegation mechanism, and discovery/Gate 1 already flagged
`OQ29` combined with `OQ25` as a state that can otherwise have no exit. HR
Operations still needs to rule on delegation directly.
**Notes:** This is a release-relevant decision, not just an implementation
detail — the prior spec round (Gate 1, finding G1-F05) found that leaving
`OQ29` deferred while `OQ25` resolves to auto-escalate can still trap a
request with no reachable exit if the escalation target is also unavailable.
This BRD entry resolves the SLA half; delegation must close before that gap
is safe to ship.
**Discovery analysis:** .ai-context/discovery/employee-internal-transfer.discovery.md
**Feature slug:** employee-internal-transfer

---

### BRD-005: Downstream handover and transition orchestration
**Raised by:** HR Operations
**Business need:** Today, HRMS, payroll, IT access and facilities are updated
manually and independently after a transfer is agreed, with no single system
tracking whether all four actually completed. There is no distributed
transaction across these systems, so partial failure has to be a designed
outcome, not an incident.
**Sponsor:** HR Operations; IT Service Management; Facilities
**Priority:** High — this is the largest unresolved risk area from discovery
(`OQ35`–`OQ43`).
**Decided:** Downstream actions execute at the effective date, once Stage 3
HR approval is complete and the scheduled date is reached — not at approval
time, so a still-working employee's access is not cut off early (closes
`OQ40`). For every approved transfer, all four downstream activities run —
HRMS record update, payroll/cost-centre alignment (at the start of the next
pay cycle, aligned to payroll boundaries), IT identity & access adjustment,
and facilities/seat/badge reallocation — rather than a conditional subset
(closes `OQ35`–`OQ37`). The HRMS record update is the point of no return;
after it starts, reversal requires a compensating transfer, not a rollback
(closes `OQ39`). If any one downstream task fails, the transfer is not
aborted and is not silently left incomplete: an exception ticket is raised to
HR Operations with full diagnostic context, who own remediation (closes
`OQ38` and `OQ42`). A request is not considered complete at HR approval alone
— it is complete once the effective date has passed and all downstream tasks
have closed (closes `OQ28`).
**Open at BRD stage:** What happens if the target position is closed or
filled while a request is in flight (`OQ18`); what happens if the employee
resigns between approval and the effective date (`OQ27`); whether downstream
activities may run in parallel or have an ordering dependency (`OQ43` — this
is architecture-tagged, not a business decision, and belongs in the plan);
whether downstream systems integrate as synchronous APIs or ticket-raising
queues (`OQ41` — also architecture-tagged, plan-stage).
**Notes:** HR Admins may cancel a request before HRMS execution begins;
employees may not withdraw past Stage 3 approval (see BRD-003).
**Discovery analysis:** .ai-context/discovery/employee-internal-transfer.discovery.md
**Feature slug:** employee-internal-transfer

---

### BRD-006: Transparency, confidentiality and audit
**Raised by:** HR Operations; Privacy
**Business need:** Employees and managers need visibility into where a
request stands, but not all information behind a request is safe to expose
to everyone who can see it, and the organisation needs a durable record of
who decided what.
**Sponsor:** HR Operations; Privacy; Compliance
**Priority:** Medium — required before the dashboard and audit log can be
specified, not blocking submission-path work.
**Decided:** The transfer reason/statement of interest is classified sensitive
data, visible exclusively to HR Operations — not to the releasing or
receiving manager (closes `OQ49`, consistent with the existing sensitive-data
note on BRD-001). The employee-facing dashboard shows current status,
completed steps, and which **role** currently holds the pending action, not
the named individual, preserving manager confidentiality (closes `OQ52`).
Every state transition, approver decision, withdrawal and downstream trigger
writes an append-only audit log entry (actor, source state, target state,
timestamp, correlation ID), retained for a minimum of 7 years for statutory
compliance (closes `OQ53` and `OQ54`).
**Open at BRD stage:** What information the receiving manager is permitted to
see beyond role fit — performance data, current compensation (`OQ48`);
whether a request is visible to anyone beyond the named approvers, e.g.
skip-level managers or HR at large (`OQ50`); whether a confidential-transfer
path is required that bypasses the releasing manager, e.g. a grievance-driven
move (`OQ51`) — this is a sensitive policy question HR Operations has
explicitly deferred rather than answered; which events trigger a notification
and to whom, beyond the SLA reminder/escalation already decided in BRD-004
(`OQ44`); which notification channels are in scope — portal, email, SMS,
push (`OQ46`).
**Notes:** `OQ51` in particular should not be treated as low-risk just
because it is unresolved — an employee needing to transfer away from a
manager for grievance reasons is exactly the case a purely sequential,
releasing-manager-first workflow (BRD-003) handles worst.
**Discovery analysis:** .ai-context/discovery/employee-internal-transfer.discovery.md
**Feature slug:** employee-internal-transfer

---

### BRD-007: Non-functional baselines — performance, security and availability
**Raised by:** HR Operations; Platform Engineering
**Business need:** The portal replaces a manual process for the whole
employee base; it needs a stated performance, security and availability bar
so it isn't specified only in functional terms and then found wanting at
scale.
**Sponsor:** Platform Engineering; Security
**Priority:** Medium — informs the plan's architecture and constitution
checks, not the spec's business logic.
**Decided:** 95% of API requests complete in under 500ms under normal load;
the dashboard renders in under 1.5s; scheduled SLA/downstream jobs complete
within 15 minutes of trigger. Architecture supports up to 10,000 active
employees at a peak of 500 concurrent sessions, at 99.9% uptime during core
business hours (closes `OQ56` and `OQ57`). RBAC is enforced across Employee,
Releasing Manager, Receiving Manager, HR BP, HR Admin and Downstream Fulfiller
roles. Application logs must never contain employee names, email addresses,
salary data, performance ratings or reason text. Data in transit uses TLS 1.3;
data at rest uses AES-256. Downstream adapter failures must not corrupt
request state or crash the workflow, and state-changing endpoints require an
`Idempotency-Key` header.
**Open at BRD stage:** None at the business-decision level — the remaining
unknowns in this area (`OQ58` stack, `OQ59` real vs. stubbed integrations,
`OQ60` auth/RBAC provider, `OQ61` BPM engine reuse) are architecture-tagged in
discovery, not business policy, and belong to `constitution.md` and the plan,
not this BRD.
**Discovery analysis:** .ai-context/discovery/employee-internal-transfer.discovery.md
**Feature slug:** employee-internal-transfer
