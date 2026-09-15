<!-- Deliverable 7 — AI Prompts. Generated from D5 tasks v1.0, per §16.
     A prompt instructs execution of bounded work. It is NEVER a specification. -->

# AI Prompts: Employee Internal Transfer Digital Journey

## Derived From
- `.ai-context/tasks/employee-internal-transfer.tasks.md` v1.0
- `.ai-context/specs/employee-internal-transfer.spec.md` Approved v1.2
- `.agent/workflows/generate-tests.md`, `.agent/workflows/code-review.md`

## Status
v1.0 — 2026-08-30

---

## 1. The Authority Hierarchy

```text
Specification   — authoritative. Defines what correct means.
      ↓
Plan            — explains the implementation approach.
      ↓
Task            — defines one bounded unit of work.
      ↓
Prompt          — instructs an agent to execute that bounded work.
```

**A prompt that contains business behaviour absent from its task and spec is a
prompt defect, not a useful addition.** The audit in §5 checks for exactly this.
Prompts may restate constraints for the agent's benefit; they may not originate
them.

## 2. Why Every Task Has *Two* Prompts

`.agent/workflows/generate-tests.md` step 4 states: *"Do not write
implementation code in this step."* A single prompt asking an agent to write
tests and then satisfy them would violate the workflow, and would destroy the
evidence the assessment asks for — an agent that writes both in one pass cannot
demonstrate **RED**.

Each task therefore carries a pair:

| Prompt | Purpose | Must not |
|---|---|---|
| `PM##.RED` | Write the failing tests | Write any implementation |
| `PM##.GREEN` | Make them pass | Modify the tests to fit the implementation |

`PM##.GREEN` is issued **only after** `PM##.RED` has been run and the failure
confirmed to be for the right reason (feature absent, not broken test).

### Prompts that do not exist, and why

| Task | Prompt | Reason |
|---|---|---|
| T01 | `PM01` only — no `.RED` | ADRs have no tests. A documentation task with a fabricated test prompt would be process theatre. |
| T29, T38–T47 | `PM##.GATED` only | The behaviour is undecided. Neither a test nor an implementation can be written without inventing policy — including the tests, which would encode the invented policy as an assertion. |
| **T48, T49** | **none at all** | PROCESS gates. No prompt exists because **no engineering work resolves them** — a named human must act. Generating a prompt here would imply otherwise. |

---

## 3. Prompt Template

```text
PROMPT       employee-internal-transfer.PM##.RED | .GREEN | .GATED
SOURCE TASK  employee-internal-transfer.T##
AC           the acceptance criteria in scope — by ID
TESTS        the test case IDs this prompt owns
DEPENDENCIES tasks that must already be merged
GATE         NONE | IMPLEMENTATION C# | RELEASE C# | PROCESS C#
CONTEXT      the files to load — and no others
MUST NOT DECIDE   business decisions to escalate, never infer
EXPECTED OUTPUT   what the agent produces
DEFINITION OF DONE  independently verifiable
STOP AND ESCALATE IF  conditions that end the task rather than continue it
```

Every prompt ends with the same escalation clause, because §16's *"don't
iterate-and-hope"* rule needs a mechanism, not an aspiration.

---

## 4. Worked Prompts

Fourteen prompts covering every archetype in the task set. The complete 49-task
mapping is §5; prompts not written out below are generated from this template
against their task contract without variation.

### 4.1 `PM01` — Foundational ADRs *(documentation archetype)*

```text
PROMPT       employee-internal-transfer.PM01
SOURCE TASK  employee-internal-transfer.T01
AC           none — derived from constitution §2, §3 and plan §16
TESTS        none — documentation task
DEPENDENCIES none
GATE         NONE
CONTEXT      .ai-context/constitution.md
             .ai-context/plans/employee-internal-transfer.plan.md (§2, §8.1, §12.4, §16)
             .ai-context/decisions/_TEMPLATE-ADR.md

Write three ADRs recording decisions already made in the reviewed plan. You are
recording decisions, not making them.

  ADR-0001  In-service persisted state machine rather than a BPM engine
  ADR-0002  Transactional outbox for downstream dispatch
  ADR-0005  Allowlist logging rather than denylist redaction

Each follows the template: Context / Decision / Consequences. Consequences must
state what the decision does NOT solve.

MUST NOT DECIDE
  Do not write ADR-0006 (downstream integration style). It is gated on C10 and
  the decision has not been made. If you find yourself drafting it, stop.

EXPECTED OUTPUT
  Three files in .ai-context/decisions/, plus a Decisions In Force entry in
  .ai-context/architecture.md linking each.

DEFINITION OF DONE
  Three ADRs exist with all three sections populated; each names what it does
  not solve; architecture.md links them; no ADR-0006 file exists.

STOP AND ESCALATE IF
  A decision you are asked to record is not actually present in the reviewed
  plan. Recording a decision nobody made is how a plan acquires authority it
  was never granted.
```

### 4.2 `PM03.RED` / `PM03.GREEN` — Migration *(schema archetype)*

```text
PROMPT       employee-internal-transfer.PM03.RED
SOURCE TASK  employee-internal-transfer.T03
AC           employee-internal-transfer.AC12 (database half)
TESTS        .UT13, .UT90
DEPENDENCIES none
GATE         NONE
CONTEXT      .ai-context/plans/employee-internal-transfer.plan.md §4.1, §4.2, §4.3
             .ai-context/test_cases/employee-internal-transfer.test_cases.md

Write failing integration tests for the transfer_request schema. Do NOT write
the migration.

  .UT13  a second non-terminal request for the same subject is rejected
  .UT90  two concurrent inserts for one subject produce exactly one row

.UT90 must exercise genuine concurrency — two connections committing in
parallel — not two sequential inserts. A sequential test would pass against a
naive application-level check and prove nothing.

MUST NOT DECIDE
  Do not assert anything about position_id's type or constraints. The position
  model is gated on C3 and the column is deliberately weakly typed.

EXPECTED OUTPUT
  test/persistence/transferRequest.schema.test.ts

DEFINITION OF DONE
  Tests run and FAIL because the table does not exist. Confirm the failure
  reason is the missing relation, not a broken test.

STOP AND ESCALATE IF
  You cannot write a test for an acceptance criterion as stated. Per
  generate-tests.md step 5, the specification needs revision — do not guess.
```

```text
PROMPT       employee-internal-transfer.PM03.GREEN
SOURCE TASK  employee-internal-transfer.T03
AC           employee-internal-transfer.AC12 (database half)
TESTS        .UT13, .UT90 — already RED
DEPENDENCIES PM03.RED confirmed RED
GATE         NONE
CONTEXT      as PM03.RED, plus the failing test file

Write migrations/001_transfer_request.sql so the RED tests pass:
  - transfer_status enum, 11 values exactly as the spec's state model
  - transfer_request table per plan §4.1
  - one_active_request_per_subject PARTIAL UNIQUE INDEX

The invariant belongs in the database. An application-level check alone loses
the .UT90 race.

MUST NOT DECIDE
  No foreign key on position_id (C3). No enum for stage or function (C1, C8).

DEFINITION OF DONE
  Both tests GREEN. Migration applies and reverts cleanly. No test was modified.

STOP AND ESCALATE IF
  A test can only be made to pass by changing the test.
```

### 4.3 `PM07.RED` / `PM07.GREEN` — Workflow engine *(highest-risk domain archetype)*

```text
PROMPT       employee-internal-transfer.PM07.RED
SOURCE TASK  employee-internal-transfer.T07
AC           employee-internal-transfer.AC26
TESTS        .UT29, .UT53–.UT63, plus the generated state matrix
DEPENDENCIES T01, T06 merged
GATE         NONE — but read MUST NOT DECIDE carefully
CONTEXT      .ai-context/specs/employee-internal-transfer.spec.md (State Model)
             .ai-context/test_cases/... §2 state-transition matrix
             .ai-context/plans/... §8

Write failing tests for the workflow engine covering NON-APPROVAL transitions
only: draft creation, submission, withdrawal, cancellation, terminal states.

Also write the matrix generator: it reads the declared transition table and
fails the build if any declared transition has no corresponding test.

MUST NOT DECIDE  ⚠ THIS IS THE CRITICAL CONSTRAINT
  Do NOT write tests naming PENDING_RELEASING_MANAGER, PENDING_RECEIVING_MANAGER
  or PENDING_HR_VALIDATION as literals. Those three stages exist only under the
  provisional two-manager model (PD02), which is gated on C1 and may not survive
  Gate 1. See finding D5-F01.

  The submission test asserts that the request moves to THE FIRST PENDING STATE
  DECLARED IN THE TRANSITION TABLE, resolved by lookup. If C1 resolves to a
  one-manager chain, this test must still pass without edit.

EXPECTED OUTPUT
  test/domain/workflow/*.test.ts and the matrix generator.

DEFINITION OF DONE
  All tests RED for the right reason. Grep the test files: no approval stage
  name appears as a string literal anywhere.

STOP AND ESCALATE IF
  An acceptance criterion you are testing names a specific approval stage.
  AC14 does — that is D5-F01, already recorded. Resolve through the table and
  note it; do not hard-code.
```

```text
PROMPT       employee-internal-transfer.PM07.GREEN
SOURCE TASK  employee-internal-transfer.T07
TESTS        as above — already RED
DEPENDENCIES PM07.RED confirmed RED
GATE         NONE
CONTEXT      as PM07.RED, plus the failing tests

Implement src/domain/workflow/: a declared transition table plus an engine that
refuses any (from, action) absent from it with INVALID_STATE_TRANSITION.

Populate the table with non-approval transitions ONLY.

MUST NOT DECIDE
  Do not add approval-stage rows. Adding them IS the C1 decision (task T38).
  Leave the approval region of the table empty and commented with its condition.

DEFINITION OF DONE
  Tests GREEN. domain/workflow imports no I/O and no framework. Lint boundary
  rule passes. No approval stage name outside the table.
```

### 4.4 `PM10.RED` / `PM10.GREEN` — Allowlist logger *(security cross-cutting archetype)*

```text
PROMPT       employee-internal-transfer.PM10.RED
SOURCE TASK  employee-internal-transfer.T10
AC           employee-internal-transfer.AC42
TESTS        .UT49, .UT50, .UT96, INT08
DEPENDENCIES T09 merged
GATE         NONE
CONTEXT      .ai-context/constitution.md §2 (PII definition — read the full list)
             .ai-context/plans/... §12.4
             ADR-0005

Write failing tests proving no PII reaches logs at any level.

  .UT49  full journey executed, logs captured — no name, employee number,
         email, phone, compensation figure, rating or reason text at ANY level
  .UT50  validation failure on a reason-bearing request — error body and logs
         carry no reason text
  .UT96  downstream adapter returns an error body containing PII — stripped
         before logging
  INT08  end to end, including notification payloads

Include a test that a NEWLY ADDED object field is absent from output until it is
explicitly allowlisted. That test is what makes this an allowlist rather than a
denylist, and it is the point of the whole task.

MUST NOT DECIDE
  The PII definition is fixed by constitution §2. Do not narrow it because a
  field seems harmless.

DEFINITION OF DONE
  All RED. The new-field test fails in the direction that proves fail-closed.
```

### 4.5 `PM12.RED` — Validation rules *(pure domain archetype)*

```text
PROMPT       employee-internal-transfer.PM12.RED
SOURCE TASK  employee-internal-transfer.T12
AC           AC2, AC3, AC4, AC5, AC6, AC10, AC11
TESTS        .UT02–.UT06, .UT11, .UT12, .UT64, .UT66–.UT72, .UT115
DEPENDENCIES T11, T02 merged
GATE         NONE
CONTEXT      spec §Validation Rules (VR01, VR02, VR05, VR06, VR08, VR09 only)
             test_cases §4

Write failing unit tests for six validation rules. Each rule is a pure function;
test it in isolation, not through an endpoint.

Boundary cases are mandatory, not optional:
  .UT67 reason exactly 2000 chars  → accepted
  .UT68 reason 2001 chars          → rejected
  .UT69 whitespace-only reason     → treated as absent
  .UT64 malformed date             → 400 schema, NOT 422 business-rule
  .UT66 effectiveDate = today      → rejected

MUST NOT DECIDE
  ⚠ Do not write tests for VR03 (open headcount — gated C3) or for payroll
  alignment of the effective date (gated C7). VR04's 15-day lead time is
  PD08-provisional and belongs to T16, not here.

DEFINITION OF DONE
  All RED. No test reaches a database or an HTTP layer.
```

### 4.6 `PM16.GREEN` — Submission *(orchestration archetype; D5-F01 exposure)*

```text
PROMPT       employee-internal-transfer.PM16.GREEN
SOURCE TASK  employee-internal-transfer.T16
AC           AC12, AC13, AC14
TESTS        .UT13–.UT18, .UT65, .UT73, .UT90 — already RED
DEPENDENCIES T07, T11, T12, T15 merged; PM16.RED confirmed RED
GATE         NONE — but read MUST NOT DECIDE
CONTEXT      spec API03 + AC12–AC14; plan §6.2, §6.4; T07's transition table

Implement src/application/submitRequest.ts: validate → transition → audit →
outbox, inside one transaction.

Register VR04 (effective date ≥ 15 days after submission) as a REPLACEABLE
validator in the registry, not as an inline check. When C7 lifts, a payroll
validator is added alongside it without touching this file.

MUST NOT DECIDE  ⚠
  1. The target state. Resolve the first pending state from T07's transition
     table. Do NOT write PENDING_RELEASING_MANAGER as a literal, even though
     AC14 names it — AC14 is untagged and that is recorded defect D5-F01. A
     literal here would settle C1 in code from an unblocked task.
  2. Eligibility. Do not call EligibilityPort. The pre-check is gated on C2 and
     API03's NOT_ELIGIBLE exception is marked ⛔ GATED in the spec.
  3. Payroll alignment of the effective date. Gated on C7.

DEFINITION OF DONE
  All tests GREEN including .UT90 under true concurrency. Grep the file: no
  approval stage literal. No EligibilityPort import.

STOP AND ESCALATE IF
  Making a test pass appears to require choosing an approval stage name.
```

### 4.7 `PM19.RED` — Authorisation *(highest security-risk archetype)*

```text
PROMPT       employee-internal-transfer.PM19.RED
SOURCE TASK  employee-internal-transfer.T19
AC           employee-internal-transfer.AC39
TESTS        .UT45, .UT76, .UT77
DEPENDENCIES T06 merged
GATE         NONE — but read MUST NOT DECIDE
CONTEXT      constitution §2 (object-level authorisation, 404-not-403)
             spec §Roles and Permissions; plan §7.3

Write failing tests for a single canAccess(actor, request) predicate in
domain/authorization/.

  .UT45  unrelated caller retrieving by id → 404, never 403
  .UT76  enumerating guessed ids → 404 for every one, AND no timing difference
         distinguishing an existing request from an absent one
  .UT77  manager retrieving a non-direct-report's request → 404

The timing assertion in .UT76 is not optional. A 404 that takes measurably
longer for a real record discloses existence just as effectively as a 403.

MUST NOT DECIDE  ⚠
  Who the approvers are. That is C1. This predicate CONSUMES a resolved role;
  it does not compute one. Do not test approver-resolution logic — test only
  that a resolved approver role is honoured and everything else returns 404.

DEFINITION OF DONE
  All RED. This module carries an 85% coverage floor per constitution §1 — it
  handles authorisation and is the most security-critical function in the
  design. Write enough tests to reach it honestly.
```

### 4.8 `PM20.GREEN` — Field projection *(privacy archetype)*

```text
PROMPT       employee-internal-transfer.PM20.GREEN
SOURCE TASK  employee-internal-transfer.T20
AC           AC37, AC38, AC40
TESTS        .UT42–.UT44, .UT46, .UT80–.UT83 — already RED
DEPENDENCIES T19 merged; PM20.RED confirmed RED
GATE         NONE — but read MUST NOT DECIDE
CONTEXT      spec API04 projection rules; plan §7.4; constitution §2

Implement projection so the reason field is decrypted and included ONLY for HR
roles, and the key is OMITTED — not null — for everyone else.

.UT81 asserts the reason appears nowhere in a manager's ENTIRE payload,
including timeline[].comment. Apply the projection to nested structures, not
only the top level. A top-level-only implementation passes .UT42 and fails .UT81
— that is the test doing its job.

MUST NOT DECIDE  ⚠
  Reason visibility is PD09 (HR-only), provisional on OQ49 and awaiting Privacy
  sign-off. Implement PD09 and mark the decision point in code with a reference
  to PD09, so a Gate 1 reversal is a one-line change rather than an audit.

DEFINITION OF DONE
  Tests GREEN. Plaintext is read on exactly one code path — grep to confirm.
```

### 4.9 `PM24.GREEN` — Reference data *(gated-field-omission archetype)*

```text
PROMPT       employee-internal-transfer.PM24.GREEN
SOURCE TASK  employee-internal-transfer.T24
AC           AC47, AC48
TESTS        .UT104–.UT107, .UT116, .UT117 — already RED
DEPENDENCIES T02 merged; PM24.RED confirmed RED
GATE         NONE — but read MUST NOT DECIDE
CONTEXT      spec API09 including its contingency note; plan §9.1

Implement GET /api/v1/reference/{departments|locations|positions} through
MasterDataPort. Only ACTIVE records. Empty filtered result is 200 with total 0,
never 404.

MUST NOT DECIDE  ⚠
  The spec's API09 shows an `available` field on positions, marked contingent on
  the requisition model (C3). OMIT the field entirely. Do not include it set to
  true, and do not include it set to null — either would imply a vacancy concept
  that has not been decided. Omission is the honest representation of "we do not
  yet know whether this concept exists."

DEFINITION OF DONE
  Tests GREEN. No `available` key in any positions response.
```

### 4.10 `PM26.GREEN` — Inbox seam *(P-F02 boundary archetype)*

```text
PROMPT       employee-internal-transfer.PM26.GREEN
SOURCE TASK  employee-internal-transfer.T26
AC           AC45, AC46
TESTS        .UT100–.UT103, .UT112–.UT114, .UT118 — already RED
DEPENDENCIES T22 merged; PM26.RED confirmed RED
GATE         NONE — the seam is unblocked; population is C1-gated
CONTEXT      spec API08, AC45, AC46; plan §18 Phase 4 and its P-F02 note

Implement GET /transfer-requests/pending-decisions: the endpoint, the
stage-scoped repository query, pagination, and projection.

The query returns requests whose CURRENT STATE AWAITS THE CALLER'S ROLE. It
takes a resolved role as INPUT. AC45 and AC46 hold under a one-manager model and
a two-manager model alike — that is why this task is unblocked.

MUST NOT DECIDE  ⚠
  Which approver is assigned to which request. Do not query the org hierarchy.
  Do not derive a receiving manager from a position. Do not assume how many
  approval stages exist. All of that is C1 and belongs to T29, which is gated.

DEFINITION OF DONE
  Tests GREEN. The endpoint returns an EMPTY list in every environment, because
  nothing populates approver assignment yet. That empty result is correct, not a
  bug — .UT112 and .UT114 verify the query's semantics against seeded state.
```

### 4.11 `PM31.GREEN` — Notifications *(gated-content archetype)*

```text
PROMPT       employee-internal-transfer.PM31.GREEN
SOURCE TASK  employee-internal-transfer.T31
AC           AC33 (notification half only — see D5-F02)
TESTS        .UT37, .UT95, INT08 — already RED
DEPENDENCIES T30, T02 merged; PM31.RED confirmed RED
GATE         NONE — but read MUST NOT DECIDE
CONTEXT      spec §Notifications (all nine events); plan §3; constitution §2

Implement the outbox consumer dispatching the spec's nine notification events
through NotificationPort.

MUST NOT DECIDE  ⚠
  1. Channels. OQ46 is DEFERRED. Dispatch through the port, which abstracts
     channel. Do not add email or SMS clients.
  2. ⚠ Whether a rejection notification carries the rejection comment. OQ47 is
     BLOCKING. Send the rejection notification WITHOUT the comment. Including it
     would settle a live privacy question in code — a manager's candid
     assessment may never have been intended for the employee.
  3. This task satisfies only HALF of AC33 (see D5-F02). The all-required-tasks-
     complete half is T43, gated on C8. Do not implement completion evaluation.

DEFINITION OF DONE
  Tests GREEN. Exactly one completion notification per journey (.UT95). No
  notification carries reason text to a manager. No channel client imported.
```

### 4.12 `PM33.RED` — Request form *(UI archetype)*

```text
PROMPT       employee-internal-transfer.PM33.RED
SOURCE TASK  employee-internal-transfer.T33
AC           AC50, AC51
TESTS        .UT119–.UT121, .UT129, .UT130, .UT135, .UT136
DEPENDENCIES T24, T13 merged
GATE         NONE
CONTEXT      spec AC50, AC51 and the group J preamble; constitution §1 (RTL)

Write failing React Testing Library tests for the request form.

  .UT119  form renders with all five fields; reason marked optional
  .UT120  submit with effectiveDate empty → field message, NO network call
  .UT121  client validation bypassed, request sent directly → server 422
  .UT129  master-data service unavailable → explicit error state, not an empty
          dropdown
  .UT135  two fields invalid → BOTH announced to assistive technology
  .UT136  320px viewport → all fields reachable, no horizontal page scroll

.UT121 is the important one: it proves client-side validation is an affordance
and the server remains the control. Constitution §2 — a UI that hides a control
is not access control, and the same logic applies to validation.

MUST NOT DECIDE
  Nothing new. Client rules MIRROR the server's; they never replace or extend
  them. If a rule seems missing client-side, it is missing server-side too and
  that is a spec question.

DEFINITION OF DONE
  All RED. No snapshot-only test for anything carrying logic (constitution §1).
```

### 4.13 `PM37.RED` — Accessibility *(cross-cutting verification archetype)*

```text
PROMPT       employee-internal-transfer.PM37.RED
SOURCE TASK  employee-internal-transfer.T37
AC           employee-internal-transfer.AC55
TESTS        .UT126–.UT128, .UT134–.UT136
DEPENDENCIES T28, T33, T34, T35, T36 merged
GATE         NONE
CONTEXT      spec AC55; test_cases §7 (QA-owned accessibility scope)

Write failing accessibility tests across the whole journey — form, status view,
my-requests, inbox shell.

  .UT126  complete the journey keyboard-only; focus order follows visual order
  .UT127  every field has a programmatically associated label
  .UT128  status view in greyscale — status still distinguishable
  .UT134  screen reader announces stage and pending role; timeline is structured
          content, not an image
  .UT135  two simultaneous errors both announced
  .UT136  320px viewport

MUST NOT DECIDE
  Nothing. AC55 was added at spec v1.2 because the specification had no
  front-end criteria at all (finding P-F01). It is now specified; implement to
  it.

DEFINITION OF DONE
  All RED. Automated checks are a floor, not the test — .UT126 and .UT134 need
  real keyboard and screen-reader assertions, not only an axe scan.
```

### 4.14 `PM29.GATED` — Approver routing *(the refusal archetype)*

**This prompt is designed to produce no implementation, and its output is
verifiable.** It is included because an agent that correctly declines to build
something is stronger evidence of a governed process than another agent that
builds something.

```text
PROMPT       employee-internal-transfer.PM29.GATED
SOURCE TASK  employee-internal-transfer.T29
AC           none directly — enables AC45/AC46 to return data
TESTS        none writable
DEPENDENCIES T26 merged
GATE         IMPLEMENTATION — condition C1
CONTEXT      .ai-context/discovery/employee-internal-transfer.decision-log.md
               (OQ01, OQ03 and the C1 entry)
             .ai-context/reviews/employee-internal-transfer.gate1.md §5 B1
             .ai-context/tasks/employee-internal-transfer.tasks.md (T29)
             .ai-context/constitution.md §0

Task T29 is approver population and routing: resolving which approver holds a
transfer request at each approval stage.

DO NOT IMPLEMENT IT.

This task is gated on condition C1. Produce an analysis, not code:

  1. Name the unresolved decision precisely, and say who owns it.
  2. Name the specification scope it affects — AC and API by ID.
  3. Explain why implementing it would constitute policy invention rather than
     engineering. Be specific: name the plausible implementations you would
     otherwise have chosen between, and show that choosing among them IS the
     business decision.
  4. Confirm the technical seam at the boundary the plan defines, and state
     what already exists on the unblocked side of it.
  5. State the condition under which this task becomes implementable.

MUST NOT DECIDE  ⚠ EVERYTHING ABOUT THIS TASK IS THE DECISION
  Do not infer the releasing manager from the organisational hierarchy.
  Do not derive the receiving manager from the target position.
  Do not assume a two-manager chain, or a one-manager chain.
  Do not create src/domain/workflow/approverResolution.ts.
  Do not write tests — tests would encode the invented model as assertions,
  which is the same defect wearing a different hat.

  "Reasonable default", "obvious behaviour" and "we can change it later" are all
  ways of making this decision. Constitution §0 forbids all three.

EXPECTED OUTPUT
  A written analysis. Zero files under src/. Zero files under test/.

DEFINITION OF DONE — verifiable, not asserted
  1. `git status` shows no new or modified file under src/ or test/.
  2. The analysis names C1, its owner (HR Policy), and the AC affected
     (AC17–AC26, AC45, AC46 population).
  3. It names at least two plausible implementations and explains that choosing
     between them is the business decision.
  4. It confirms T26's seam is complete and requires no change.

STOP AND ESCALATE IF
  You believe you can determine the approver from data already available. That
  belief is the failure mode this gate exists to catch — the data may well
  support an inference, and the inference would still be a policy choice nobody
  authorised.
```

**What this prompt demonstrates.** A conventional prompt proves an agent can
generate code from a specification. This one proves the specification can
*prevent* generation — that the boundary between engineering authority and
business authority is enforceable at the point where an agent would otherwise be
most helpful, and that the refusal produces auditable evidence rather than a
declined request.

---

## 5. Prompt Registry — All 49 Tasks

| Task | Prompts | Gate | AC | Must-not-decide summary |
|---|---|---|---|---|
| T01 | `PM01` | — | — | Not ADR-0006 (C10) |
| T02 | `PM02.RED/.GREEN` | — | — | No vendor shapes; EligibilityPort returns codes not criteria |
| T03 | `PM03.RED/.GREEN` | — | AC12ᵖ | No FK on `position_id` (C3) |
| T04 | `PM04.RED/.GREEN` | — | AC25ᵖ, AC40ᵖ | `stage`/`function` stay text — no C1/C8 enum |
| T05 | `PM05.RED/.GREEN` | — | AC41ᵖ | No retention/purge (OQ54) |
| T06 | `PM06.RED/.GREEN` | — | AC1ᵖ | No transition legality — that is T07 |
| T07 | `PM07.RED/.GREEN` | — | AC26 | ⚠ No approval-stage literals (D5-F01) |
| T08 | `PM08.RED/.GREEN` | — | AC41 | What is auditable is fixed |
| T09 | `PM09.RED/.GREEN` | — | — | — |
| T10 | `PM10.RED/.GREEN` | — | AC42 | PII list fixed by constitution §2 |
| T11 | `PM11.RED/.GREEN` | — | — | No rule content |
| T12 | `PM12.RED/.GREEN` | — | AC2–AC6, AC10, AC11 | ⚠ Not VR03 (C3), not payroll alignment (C7) |
| T13 | `PM13.RED/.GREEN` | — | AC1 | No `hasReason` (G1-F04) |
| T14 | `PM14.RED/.GREEN` | — | AC16 | Immutability is PD10 |
| T15 | `PM15.RED/.GREEN` | — | AC15 | Never escalate idempotency as a business question |
| T16 | `PM16.RED/.GREEN` | — | AC12–AC14 | ⚠ No stage literal; no eligibility (C2); no payroll date (C7) |
| T17 | `PM17.RED/.GREEN` | — | AC27–AC29 | Point of no return is PD05 |
| T18 | `PM18.RED/.GREEN` | — | AC7 | Ignore, do not reject, caller-supplied subject |
| T19 | `PM19.RED/.GREEN` | — | AC39 | ⚠ Consume a resolved role; never compute one (C1) |
| T20 | `PM20.RED/.GREEN` | — | AC37, AC38, AC40 | ⚠ Reason visibility is PD09, mark the decision point |
| T21 | `PM21.RED/.GREEN` | — | AC36 | ⚠ Derive stage labels from the table, not a map (C1) |
| T22 | `PM22.RED/.GREEN` | — | AC36–AC40 | — |
| T23 | `PM23.RED/.GREEN` | — | AC43, AC44 | — |
| T24 | `PM24.RED/.GREEN` | — | AC47, AC48 | ⚠ Omit `available` entirely (C3) |
| T25 | `PM25.RED/.GREEN` | — | — | Limits are fixed by the spec |
| T26 | `PM26.RED/.GREEN` | — | AC45, AC46 | ⚠ No approver assignment (C1) |
| T27 | `PM27.RED/.GREEN` | — | AC39, AC45 | ⚠ Consume resolution, do not compute (C1) |
| T28 | `PM28.RED/.GREEN` | — | AC55ᵖ | — |
| **T29** | **`PM29.GATED`** | **IMPL C1** | — | ⚠ Everything about the task is the decision |
| T30 | `PM30.RED/.GREEN` | — | — | — |
| T31 | `PM31.RED/.GREEN` | — | AC33ᵖ | ⚠ No channels (OQ46); no rejection comment (OQ47) |
| T32 | `PM32.RED/.GREEN` | — | — | ⚠ 14 days is not an SLA (C5) |
| T33 | `PM33.RED/.GREEN` | — | AC50, AC51 | Client rules mirror, never replace |
| T34 | `PM34.RED/.GREEN` | — | AC52 | One-active-request is PD07 |
| T35 | `PM35.RED/.GREEN` | — | AC53 | ⚠ Role never name (PD11) |
| T36 | `PM36.RED/.GREEN` | — | AC54 | — |
| T37 | `PM37.RED/.GREEN` | — | AC55 | — |
| T38 | `PM38.GATED` | IMPL C1 | AC17–AC26 | Stage set, order, terminality, HR override |
| T39 | `PM39.GATED` | IMPL C2 | AC23, AC24 | Any eligibility criterion |
| T40 | `PM40.GATED` | IMPL C3 | AC8 | Requisition vs role type |
| T41 | `PM41.GATED` | IMPL C4 | — | Closure behaviour |
| T42 | `PM42.GATED` | IMPL C7 | AC9 | Period alignment, cut-off |
| T43 | `PM43.GATED` | IMPL C8 | AC32, AC33ᵖ | ⚠ No stub returning all four |
| T44 | `PM44.GATED` | IMPL C9 | AC30, AC31 | Trigger timing |
| T45 | `PM45.GATED` | IMPL C10 | AC34, AC35 | API vs ticket queue |
| T46 | `PM46.GATED` | IMPL C6 | — | Resignation behaviour |
| T47 | `PM47.GATED` | **RELEASE C5** | AC49 | Escalation vs expiry vs reassignment vs auto-approval |
| **T48** | **none** | **PROCESS C11** | — | No prompt exists — a named human must sign off |
| **T49** | **none** | **PROCESS C12** | — | No prompt exists — a named non-author must review |

ᵖ = partial; the AC is jointly satisfied with another task (D5-F02).

### Registry audit

| Check | Result |
|---|---|
| Tasks with no prompt | **2 — T48, T49, by design.** Both are PROCESS gates; generating a prompt would imply engineering can resolve them |
| Prompts with no task | **0** |
| Unblocked tasks without a `.RED`/`.GREEN` pair | **1 — T01**, documentation, no tests |
| Gated tasks with an implementation prompt | **0** — all 11 are `.GATED` |
| Prompts introducing behaviour absent from spec and task | **0** — verified by comparing every MUST NOT DECIDE clause to its decision-log entry |
| `.GREEN` prompts issued before `.RED` confirmed | **0** — every `.GREEN` names its RED precondition in DEPENDENCIES |
| Prompts without a STOP AND ESCALATE clause | **0** |

**Totals: 49 tasks → 84 prompts.** 36 RED/GREEN pairs, 1 documentation prompt,
11 gated refusal prompts, 2 tasks with no prompt at all.
