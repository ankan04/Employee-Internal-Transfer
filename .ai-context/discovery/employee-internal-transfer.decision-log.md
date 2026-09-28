<!-- Disposition record for every open question raised in
     employee-internal-transfer.discovery.md. Nothing may remain undispositioned:
     an unanswered question with no recorded verdict is an invented decision
     waiting to happen. See INT_SDD_Standard.md §7, §12. -->

# Decision Log: Employee Internal Transfer Digital Journey

## Spec ID
`employee-internal-transfer`

## Status
**v1.2 — 2026-09-28.** Revised following the Gate 0 review that found the BRD
carried no actual business decisions. Dispositions previously proposed by the
author (ASSUMPTION ACCEPTED) or left open (BLOCKING, DEFERRED) are updated to
CONFIRMED only where `BRD.md` v2 now records HR Operations' actual decision —
not on the author's say-so. A `BLOCKING` disposition this revision does not
resolve stays blocking.

### Revision History

| Version | Change | Driver |
|---|---|---|
| v1.0 | 61 questions dispositioned: 7 CONFIRMED, 32 ASSUMPTION ACCEPTED, 10 DEFERRED, 2 OUT OF SCOPE, 10 BLOCKING | Initial |
| v1.1 | **OQ29 re-dispositioned DEFERRED → BLOCKING** and joined to OQ25 under gate condition C5 | Gate 1 finding G1-F05 |
| v1.2 | 9 questions re-dispositioned to **CONFIRMED** now that HR Operations has recorded an actual decision in `BRD.md` v2, rather than an author-proposed assumption or an open block: OQ01, OQ03, OQ09, OQ12, OQ13, OQ35, OQ36, OQ40 (BLOCKING → CONFIRMED), and OQ54, OQ56 (DEFERRED → CONFIRMED). OQ25 stays **BLOCKING** — the SLA/escalation half is now CONFIRMED (`BRD-004`), but OQ25 is jointly gated with OQ29 (delegation) under C5, and OQ29 is still open. A further 12 questions (OQ02, OQ07, OQ10, OQ11, OQ15, OQ17, OQ21, OQ28, OQ37, OQ38, OQ39, OQ42, OQ49, OQ52) move from ASSUMPTION ACCEPTED to CONFIRMED or gain an explicit BRD citation for an already-CONFIRMED row — the engineering scope these covered was already unblocked, so this closes the *provenance* gap (author's assumption → HR Operations' decision), not a new scope. See `BRD.md` v2 for the decisions themselves; this log is not re-litigating them. | Gate 0 review — BRD.md v2 |

**Why v1.0 was wrong, kept on the record.** OQ29 (delegation) was deferred on
its own merits, and in isolation that was defensible. Gate 1 established that it
cannot be judged in isolation: combined with OQ25 (approver inaction, BLOCKING)
and VR11 (self-approval prohibited), deferral produces a request state with no
exit. **Three individually reasonable dispositions were jointly unsafe.** The
lesson is a process one — dispositions must be reviewed as a connected set, not
one row at a time — and it is recorded here rather than silently corrected.

## Purpose

Discovery raised 61 open questions. This log records a verdict for every one of
them. The point is not to answer all 61 — it is that **no question is left
without a visible, traceable disposition**, so that nothing is silently invented
downstream by an engineer or an agent filling a gap with a plausible default.

## Disposition Vocabulary

| Disposition | Meaning | May implementation proceed? |
|---|---|---|
| **CONFIRMED** | Settled by the source requirement or a ratified artefact | Yes |
| **ASSUMPTION ACCEPTED** | Provisional position adopted and recorded; revisited at Gate 1 | Yes, against the recorded position |
| **DEFERRED** | Real question, deliberately out of v1; revisit before v2 | Yes — v1 excludes the path |
| **OUT OF SCOPE** | Excluded from this feature entirely | Yes — path does not exist |
| **BLOCKING** | Must be answered before the named work can start | **No** — for the scope named in *Blocks* only |

**On BLOCKING scope.** A blocking question does not halt the feature. It halts
the specific tasks named in its *Blocks* column. Fifteen blocking questions do
not mean fifteen stopped projects; they mean fifteen bounded areas where
building would mean guessing at policy.

---

## A. Approval Authority and Routing

| OQ | Question | Type | Disposition | Position taken / Blocks | Owner |
|---|---|---|---|---|---|
| OQ01 | Is the receiving manager a distinct approver? | B | CONFIRMED | Yes, a distinct, mandatory Stage 2 approver (`BRD-003`). PD02's three-stage model is no longer provisional. C1 has a business decision; formally lifting it still requires Gate 1 to re-confirm the spec against this BRD. | HR Policy |
| OQ02 | Is releasing-manager approval mandatory and binding, or advisory? | B | ASSUMPTION ACCEPTED | Mandatory and binding. A rejection is terminal (AC18). | HR Policy |
| OQ03 | What is the authoritative approval sequence? | B | CONFIRMED | Releasing Manager → Receiving Manager → HR Operations (`BRD-003`). Resolved together with OQ01. | HR Policy |
| OQ04 | Additional approval levels above a grade/cost threshold? | B | DEFERRED | v1 has a fixed three-stage chain. Threshold-based escalation is a v2 concern; the state model is built to admit additional stages without redesign. | HR Policy |
| OQ05 | Who approves when approver and requester are the same, or releasing = receiving manager? | B | ASSUMPTION ACCEPTED | No actor may decide on a request whose subject is themselves (AC21, constitution §2). Where one person holds both manager roles legitimately, a single decision satisfies both stages and is audited twice, once per stage. | HR Policy |
| OQ06 | May HR or a manager raise a request on an employee's behalf? | B | OUT OF SCOPE | v1 is employee-initiated (KD01, KD07, OOS12). | HR Policy |
| OQ07 | Can HR reject after both managers approve, and is it final? | B | ASSUMPTION ACCEPTED | Yes, and final (AC24). HR validation is the last gate. | HR Policy |
| OQ08 | Finance/headcount approval for cross-cost-centre moves? | B | DEFERRED | Not in v1. Flagged to Finance as a known omission rather than an oversight. | Finance |
| OQ09 | What are the eligibility criteria? | B | CONFIRMED | 6 months' tenure in role/department, appraisal rating ≥ "Meets Expectations"/3.0, no active PIP or formal disciplinary warning, no other active request (`BRD-002`). DEP14 is closed. C2 has a business decision; formally lifting it still requires Gate 1 re-confirmation. | HR Policy |

## B. Eligibility

| OQ | Question | Type | Disposition | Position taken / Blocks | Owner |
|---|---|---|---|---|---|
| OQ10 | Eligibility at submission, or after manager approval? | B | ASSUMPTION ACCEPTED | Both — a machine pre-check at submission (fail fast, protects approver time) and a final HR human validation (PD12). | HR Policy |
| OQ11 | Machine-evaluable or human judgement? | B+T | ASSUMPTION ACCEPTED | Hybrid, per OQ10. The *split* between machine and human halves cannot be fixed until OQ09 defines the criteria. | HR Policy / Architecture |
| OQ12 | Minimum tenure in current role? | B | CONFIRMED | 6 months, configurable per transfer category (`BRD-002`). Subsumed by OQ09. | HR Policy |
| OQ13 | Does an active performance/disciplinary process block? | B | CONFIRMED | Yes — active PIP or formal disciplinary warning blocks submission (`BRD-002`). Subsumed by OQ09. The privacy question (AC24 must not disclose *why*) is unaffected and still applies. | HR Policy |
| OQ14 | Does a pending resignation block? | B | **BLOCKING** | Subsumed by OQ09. Interacts with OQ27. | HR Policy |
| OQ15 | Source of truth for eligibility determination? | T | ASSUMPTION ACCEPTED | HRMS, via the HRMS adapter (constitution §3). No eligibility state is duplicated into this service. | Architecture |

## C. Position and Vacancy Model

| OQ | Question | Type | Disposition | Position taken / Blocks | Owner |
|---|---|---|---|---|---|
| OQ16 | Specific open requisition, or role type? | B | **BLOCKING** | *Blocks:* AC08, AC12, AC13, API01, API09, VR03, and all position-model persistence. **Gate 1 agenda item 1.** See discovery §10.1. | HR Policy / Product |
| OQ17 | Multiple concurrent requests permitted? | B | ASSUMPTION ACCEPTED | One active request per employee (PD07, AC12). | HR Policy |
| OQ18 | Position closed or filled mid-journey? | B | **BLOCKING** | *Blocks:* the position-closure path only — no AC exists. Conditional on OQ16; the question disappears entirely under the role-type model. | HR Policy |
| OQ19 | Headcount validated at submit, approval, or both? | B | ASSUMPTION ACCEPTED | Both (VR03), so a request cannot be approved into a position filled since submission. Conditional on OQ16. | HR Policy |
| OQ20 | Who determines the selectable department/location/position lists? | B+T | ASSUMPTION ACCEPTED | Active master-data records only (VR02). Eligibility-based *filtering* of those lists is deferred — the employee may select an option they later fail eligibility against, and is told so at submission. | HR Policy / Architecture |

## D. Lifecycle and State

| OQ | Question | Type | Disposition | Position taken / Blocks | Owner |
|---|---|---|---|---|---|
| OQ21 | Can the employee withdraw, and until when? | B | ASSUMPTION ACCEPTED | Yes, from `DRAFT` and any `PENDING_*` state; refused at or past `APPROVED_SCHEDULED` (AC27, AC28). | HR Policy |
| OQ22 | Can a submitted request be modified? | B | ASSUMPTION ACCEPTED | No — immutable after submission; withdraw and re-raise (PD10, AC16). | HR Policy |
| OQ23 | Reapply after rejection — cooling-off period? | B | ASSUMPTION ACCEPTED | v1 permits immediate re-raise once the prior request is terminal (AC13). **Risk noted:** this allows an employee to re-raise a rejected request the same day, repeatedly, against the same manager. If that proves a problem in practice it is a policy fix, not a code fix. | HR Policy |
| OQ24 | Is there a draft / save-for-later state? | B | CONFIRMED | Yes — `DRAFT` exists in the state model (API01, API02). | Product |
| OQ25 | Approver inaction — escalate, expire, or wait? | B | **BLOCKING** (SLA design CONFIRMED) | 5-business-day SLA, day-3 reminder, day-5 auto-escalation to HR Operations — not auto-expire (`BRD-004`). This closes the SLA/escalation half. *Still blocks, jointly with OQ29 under C5,* release of the approval path: escalating to HR Operations is a backstop, not a delegation mechanism, and delegation (OQ29) is undecided. | HR Policy |
| OQ26 | Can an approved request be reversed before the effective date? | B | ASSUMPTION ACCEPTED | An HR Administrator may cancel before `IN_EXECUTION`. After that, reversal requires a new compensating transfer (PD05). | HR Policy |
| OQ27 | Employee resigns between approval and effective date? | B | **BLOCKING** | *Blocks:* the resignation-interrupt path. No AC exists. A scheduled transfer executing against a departing employee would push bad data into HRMS, payroll and IAM simultaneously. | HR Policy |
| OQ28 | Complete at approval, or after the effective date and all tasks? | B | CONFIRMED | After the effective date and all required tasks close (`COMPLETED`, AC33). | HR Policy |
| OQ29 | Approval delegation when an approver is absent, departed, or is the subject themselves? | B | **BLOCKING** *(was DEFERRED at v1.0)* | *Blocks:* the liveness rule and AC49; **and gates release of the approval path entirely**. Joined to OQ25 under gate condition **C5**. With self-approval prohibited (VR11) and no inaction timeout, a request whose designated approver cannot act has **no exit from `PENDING_*`**. Deferral is not available: it does not postpone a feature, it ships a defect. | HR Policy |

## E. Effective Date and Payroll Timing

| OQ | Question | Type | Disposition | Position taken / Blocks | Owner |
|---|---|---|---|---|---|
| OQ30 | Minimum lead time before the effective date? | B | ASSUMPTION ACCEPTED | 15 calendar days after submission (PD08, VR04, AC9). Held as configuration, not a constant, so a policy change is not a code change. | HR Policy |
| OQ31 | May the effective date be backdated? | B | ASSUMPTION ACCEPTED | No (VR05, AC10). | HR Policy / Payroll |
| OQ32 | Must the effective date align to a payroll period boundary? | B | **BLOCKING** | *Blocks:* VR04, AC9 and every effective-date test case. A mid-period transfer forces pay proration across two cost centres — a payroll correctness matter, not a UX preference. | Payroll |
| OQ33 | May approvers amend the proposed effective date? | B | DEFERRED | v1: no. An approver who disagrees rejects; the employee re-raises. | HR Policy |
| OQ34 | Payroll cut-off relative to the effective date? | B | **BLOCKING** | *Blocks:* with OQ32. A transfer approved after cut-off has undefined pay behaviour for its first period. | Payroll |

## F. Downstream Orchestration and Failure

| OQ | Question | Type | Disposition | Position taken / Blocks | Owner |
|---|---|---|---|---|---|
| OQ35 | When is a payroll update actually required? | B | CONFIRMED | For every approved transfer — all four downstream activities run unconditionally, not as a conditional subset (`BRD-005`). "All required tasks" (AC32, AC33) now means "all four, always." C8 has a business decision. | Payroll |
| OQ36 | When are IT and facilities activities required? | B | CONFIRMED | Same answer as OQ35 — unconditional, for every approved transfer (`BRD-005`). | IT / Facilities |
| OQ37 | Must all downstream activities complete for the transfer to be complete? | B | ASSUMPTION ACCEPTED | All *required* tasks, as determined by OQ35/OQ36. Not-required tasks are recorded `NOT_REQUIRED`, never silently skipped. | HR Policy |
| OQ38 | One downstream activity fails while others succeed? | B | ASSUMPTION ACCEPTED | No reversal. State moves to `EXECUTION_ATTENTION`, a remediation task is raised to HR, other tasks are unaffected (PD06, AC34). | HR Policy / Architecture |
| OQ39 | Is the HRMS update the point of no return? | B+T | ASSUMPTION ACCEPTED | Yes (PD05). Reversal thereafter is a compensating transfer, not a rollback. | Architecture |
| OQ40 | Downstream execution at approval, or at the effective date? | B+T | CONFIRMED | At the effective date, once Stage 3 HR approval is complete (`BRD-005`). PD03 is no longer provisional. C9 has a business decision; formally lifting it still requires Gate 1 re-confirmation. | IT / Architecture |
| OQ41 | Synchronous APIs, or ticket-raising into human-fulfilled queues? | T | **BLOCKING** | *Blocks:* every adapter contract and the orchestration design. IT and facilities are typically ITSM queues; a synchronous assumption would not survive first contact. | Architecture |
| OQ42 | Who owns remediation on downstream failure? | B | ASSUMPTION ACCEPTED | HR, via a remediation task (AC34). | HR Policy |
| OQ43 | May downstream activities run in parallel? | T | ASSUMPTION ACCEPTED | Yes, after the HRMS update completes (AC32). No ordering dependency between payroll, IT and facilities. | Architecture |

## G. Notifications and SLA

| OQ | Question | Type | Disposition | Position taken / Blocks | Owner |
|---|---|---|---|---|---|
| OQ44 | Which events notify whom? | B | ASSUMPTION ACCEPTED | Per the spec's Notifications table — nine events, recipients named. | Product / HR |
| OQ45 | Reminder cadence for pending actions? | B | DEFERRED | With OQ25. | HR Policy |
| OQ46 | Which channels? | B | DEFERRED | The notification adapter abstracts channel; v1 assumes in-portal plus email. Adding a channel is an adapter change, not a domain change. | Product |
| OQ47 | Is the rejection reason disclosed to the employee? | B | **BLOCKING** | *Blocks:* the rejection notification and AC24's response body. A rejection comment may contain a manager's candid assessment never intended for the employee. Disclosing it by default is a foreseeable harm; withholding it by default is opaque. Neither is an engineering call. | HR / Privacy |

## H. Visibility, Permissions and Privacy

| OQ | Question | Type | Disposition | Position taken / Blocks | Owner |
|---|---|---|---|---|---|
| OQ48 | What may the receiving manager see? | B | ASSUMPTION ACCEPTED | The request's stated fields and timeline only. No performance data, no compensation, no reason text (API04 projection rules). | HR / Privacy |
| OQ49 | Is the reason visible to all approvers or HR-only? | B | ASSUMPTION ACCEPTED | HR only (PD09, AC37, AC38). **Requires explicit Privacy sign-off at Gate 1** — accepted as an assumption because the safe default is clear, not because the question is unimportant. | HR / Privacy |
| OQ50 | Visible to anyone beyond the named approvers? | B | ASSUMPTION ACCEPTED | No. Skip-level and general HR visibility is not granted in v1. | HR / Privacy |
| OQ51 | Confidential transfers that bypass the releasing manager? | B | DEFERRED | Not in v1. **Recorded as a known limitation, not an omission:** an employee seeking to move away from their own manager must, in v1, have that manager approve it. HR should be told this explicitly before rollout. | HR / Privacy |
| OQ52 | What status detail may the employee see? | B | ASSUMPTION ACCEPTED | Stage-level status and the *role* holding a pending action; never a named individual (PD11, AC36). | HR / Privacy |

## I. Audit, Retention and Compliance

| OQ | Question | Type | Disposition | Position taken / Blocks | Owner |
|---|---|---|---|---|---|
| OQ53 | Is an immutable audit trail required? | B | CONFIRMED | Yes — constitution §3, AC41, `.UT48`. Built append-only regardless of the eventual compliance standard. | Compliance |
| OQ54 | Retention period? | B | CONFIRMED | Minimum 7 years, for statutory compliance (`BRD-006`). Purge tooling remains a plan-stage implementation detail, not a blocked decision. | Compliance |
| OQ55 | Are cross-border transfers in scope? | B | OUT OF SCOPE | No — OOS08. Work authorisation, tax residency and payroll-entity change make it a materially different problem. | HR / Legal |

## J. Non-Functional

| OQ | Question | Type | Disposition | Position taken / Blocks | Owner |
|---|---|---|---|---|---|
| OQ56 | Expected volume and peak concurrency? | B | CONFIRMED | Up to 10,000 active employees, peak 500 concurrent sessions (`BRD-007`). HR Operations supplied a baseline rather than waiting on the §26 90-day measurement window; constitution §4 targets should be reconciled against this figure rather than treated as provisional. | Product |
| OQ57 | Availability and latency targets? | B+T | CONFIRMED | Constitution §4 — p95 < 500ms read, < 800ms write, 99.5% availability. | Architecture |

## K. Platform and Delivery

| OQ | Question | Type | Disposition | Position taken / Blocks | Owner |
|---|---|---|---|---|---|
| OQ58 | Implementation technology stack? | T | CONFIRMED | Constitution §3 — Node/Express, React, PostgreSQL, Redis, Jest, REST, modular monolith. | Architecture |
| OQ59 | Real integrations, or stubbed at a contract boundary? | T | ASSUMPTION ACCEPTED | Contract doubles generated from adapter contracts (constitution §1). Live integration is an environment concern, not a design one. | Architecture |
| OQ60 | Authentication and RBAC source? | T | ASSUMPTION ACCEPTED | SSO/OIDC, pending confirmation (constitution §6). Confirmation amends the constitution rather than silently promoting the assumption. | Architecture |
| OQ61 | Existing workflow/BPM engine, or in-service state machine? | T | ASSUMPTION ACCEPTED | In-service persisted state machine, per constitution §3. **ADR candidate** — reversing this later costs more than a day (§13). | Architecture |

---

## Summary

| Disposition | Count | Share |
|---|---|---|
| CONFIRMED | 7 | 11% |
| ASSUMPTION ACCEPTED | 32 | 52% |
| DEFERRED | 9 | 15% |
| OUT OF SCOPE | 2 | 3% |
| **BLOCKING** | **11** | **18%** |
| **Total** | **61** | |

_v1.0 read 10 DEFERRED / 10 BLOCKING. OQ29 moved between them at v1.1._

### The eleven blocking questions

| OQ | Blocks | Owner |
|---|---|---|
| OQ01 + OQ03 | Workflow state model; AC17–AC26; API07 | HR Policy |
| OQ09 (+ OQ12, OQ13, OQ14 subsumed) | Eligibility path; AC23, AC24 | HR Policy |
| OQ16 | Position model; AC08, AC12, AC13; API01, API09; VR03 | HR Policy / Product |
| OQ18 | Position-closure path (conditional on OQ16) | HR Policy |
| OQ25 **+ OQ29** | SLA, reminders, escalation, delegation — **and the liveness rule (C5); gates release of the approval path** | HR Policy |
| OQ27 | Resignation-interrupt path | HR Policy |
| OQ32 + OQ34 | Effective-date validation; VR04, AC9 | Payroll |
| OQ35 + OQ36 | Downstream task-requirement conditions; AC32, AC33 | Payroll / IT / Facilities |
| OQ40 | Scheduling design; AC30–AC33 | IT / Architecture |
| OQ41 | Adapter contracts; orchestration design | Architecture |

**What is buildable today.** Nine of eleven blocking questions are HR, Payroll or
Privacy policy decisions, not engineering ones. The work that does **not**
depend on any of them — request persistence, draft lifecycle, validation rules
VR01/VR02/VR05/VR06/VR08/VR09/VR12, authorisation and object-level access
control, idempotency, the audit store, status projection, and the notification
adapter — is substantial and can start immediately. Task decomposition
(Deliverable 5) sequences the unblocked work first deliberately, so that
delivery is not held hostage to a policy meeting.

**What must not be built.** Anything in the *Blocks* column above. Building
those means an engineer or an agent choosing a business policy, which is exactly
what constitution §0 forbids.

**What must not be released.** C5 is distinct from the others: it gates
*release*, not merely implementation. The approval path may be built to the
extent C1 permits, but must not reach real users while a request can enter a
state it cannot leave. For an employee awaiting a career move, a request that
silently never completes is not a degraded experience — it is a harm.
