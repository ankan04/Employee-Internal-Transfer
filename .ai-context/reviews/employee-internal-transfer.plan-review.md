<!-- Plan Review — Gate 1 continuation, per INT_SDD_Standard.md §13.
     Reviews the technical plan against the approved spec and constitution.
     D5 must be generated from the REVIEWED plan, not the draft. -->

# Plan Review: Employee Internal Transfer Digital Journey

| Field | Value |
|---|---|
| **Plan under review** | `.ai-context/plans/employee-internal-transfer.plan.md` Draft v1.0 |
| **Against** | spec Approved v1.1, constitution v1.0, Gate 1 CONDITIONAL PASS |
| **Date** | 2026-08-30 |
| **Reviewer** | SDD Assessment Reviewer (AI-assisted, author-executed) |

## ⚠ Independence Disclosure

**Not independent of the author.** Same limitation as the Gate 1 review: §12.1's
reviewer-≠-author requirement is unmet (condition C12). This review applies §13's
criteria and the four verification tests objectively, but cannot supply a second
person's failure modes. Architecture sign-off (C11) remains unobtained, and this
plan touches constitution §3 (Architectural Constraints) throughout — meaning
§12.1's *"Security or Architecture sign-off is required, not optional"* applies
and is **not satisfied**.

---

# Verdict: CHANGES REQUESTED

Two blocking findings. **D5 may not be generated from this plan until they are
closed** — a task decomposition inheriting P-F01 would produce three
implementation tasks that satisfy no acceptance criterion.

Per §12.3 the outcome is binary: plan status stays **In Review**; it does not
advance to Reviewed until remediation and re-validation.

---

## 1. The Four Verification Tests

### Test 1 — Every technical component traces backward to an approved AC

**RESULT: FAIL** (finding P-F01)

Audited all 12 components in plan §3 and all 32 sequencing items in §18.

| Component / item | Traces to | Verdict |
|---|---|---|
| `TransferRequestAggregate`, `WorkflowEngine`, `ValidationEngine` | AC1–AC16 | ✓ |
| `SubmissionUseCase`, `WithdrawalUseCase` | AC14, AC15, AC27–AC29 | ✓ |
| `DecisionUseCase` | AC17–AC26 (gated C1) | ✓ |
| `QueryService` | AC36–AC40, AC43–AC48 | ✓ |
| `ExecutionEvaluator`, `TaskOrchestrator` | AC30–AC35 (gated) | ✓ |
| `AuditWriter` | AC41 | ✓ |
| `OutboxPublisher` | constitution §3 (no external call in request path) | ✓ derived, justified |
| `NotificationDispatcher` | spec Notifications section | ✓ |
| Idempotency middleware | AC15, VR12 | ✓ |
| Rate limiting | constitution §2, spec per-endpoint limits | ✓ |
| Allowlist logger | AC42 | ✓ |
| **Sequencing 21 — request form UI** | **nothing** | **✗** |
| **Sequencing 22 — status view UI** | **nothing** | **✗** |
| **Sequencing 23 — my-requests list UI** | **nothing** | **✗** |

No component exists merely because "it's normally needed" — `OutboxPublisher` is
the only non-AC-derived component and it traces to an explicit constitution rule.
**But three front-end items trace to nothing.** See P-F01.

### Test 2 — Every task traces forward to AC and test

**RESULT: CONDITIONAL** — deferred to D5, which does not yet exist. The plan's
sequencing carries AC references on 24 of 32 items. The 8 without are Phase 1
infrastructure and Phase 4 ports; each must acquire an AC or a justified derived
requirement in D5. Two AC mappings are wrong (P-F04).

### Test 3 — Blocked conditions are task-level, not project-level

**RESULT: PARTIAL FAIL** (finding P-F02)

Conditions C1–C10 each name the scope they block, and the plan's §1.2 maps every
gated capability to a seam. That is task-level, not vague.

**But sequencing item 25 blocks the entire approver inbox on C1**, when only its
*population and routing* is policy-dependent. The API contract, repository query,
authorisation predicate, empty/loading/error states and UI shell are all
unblocked. This is over-blocking — the mirror-image error of policy invention,
and just as costly.

### Test 4 — Sequencing yields independently executable increments

**RESULT: PARTIAL FAIL** (finding P-F03)

The 32 items are ordered but two dependencies invert: item 16 (`API09` reference
data) requires `MasterDataPort`, delivered at item 18. An engineer executing in
order would be blocked at 16.

---

## 2. Gate Taxonomy — Implementation Gate vs Release Gate

The plan uses "gated" for two materially different things. A D5 reader could
reasonably interpret both as "don't build", which is wrong for nine of ten
conditions. **This taxonomy is adopted and must be carried into D5 and every
task.**

| Gate type | Meaning | Applies to |
|---|---|---|
| **Implementation gate** | The *policy* is undecided, so the behaviour cannot be written. Seams, contracts, tests-that-can-be-written, and all surrounding infrastructure **may and should** be built. | C1, C2, C3, C4, C6, C7, C8, C9, C10 |
| **Release gate** | The behaviour *may* be implemented and validated, but the feature must not reach production users while the condition stands. | **C5** |
| **Process gate** | Neither implementation nor release may be considered complete until a named human action occurs. | C11 (Security/Architecture sign-off), C12 (independent peer review) |

### What C5 permits and forbids, explicitly

```text
C5 unresolved
      │
      ├── Approval infrastructure         → MAY be implemented
      ├── Transition table + engine       → MAY be implemented
      ├── Tests (incl. gated-path tests)  → MAY be written
      ├── Controlled-environment validation → MAY be performed
      │
      └── Production, user-facing approval workflow → MUST NOT be released
```

The distinction matters because a request that can enter a state it cannot leave
is harmless in a test environment and harmful to a real employee awaiting a
career move.

---

## 3. Findings

### P-F01 — BLOCKING — The specification has no front-end acceptance criteria

Sequencing items 21–23 build a request form, a status view and a my-requests
list. **The specification contains no acceptance criterion describing any user
interface.** All 49 AC are API- or domain-level.

This is a gap in the *specification* that the plan exposed. FR01 ("initiate a
request"), FR08 ("view current status") and FR11 ("consolidated view of
progress") are user-facing capabilities from the business requirement, and each
is satisfied at Gate 2 by an API test alone — which does not demonstrate that an
employee can actually do the thing the business asked for.

Concretely: an employee could be unable to reach the form at all, and every one
of the 118 test cases would still pass.

**Required:** spec → v1.2 adding front-end acceptance criteria covering form
presentation, client-side validation with server authority preserved, the
existing-active-request case, status display, empty states, and accessibility.
Test cases extended. Only then may items 21–23 be decomposed into tasks.

**Note:** this finding is a direct product of Verification Test 1. Without
"every component traces backward", three UI tasks would have been written,
implemented and passed at Gate 2 with nothing to verify them against.

### P-F02 — BLOCKING — Approver inbox is over-blocked on C1

Sequencing item 25 places the entire approver inbox behind C1. AC45 and AC46 are
**not gated** — they were added at spec v1.1 and describe stage-scoped inbox
semantics that hold under any approval model.

Only the *population* — which approver sees which request — depends on C1's
approval-model decision. Blocking the whole item defers unblocked work and
inflates the apparent cost of C1.

**Required:** split into an unblocked technical seam and a gated routing task:

```text
Approver Inbox
├── API08 contract, repository query, pagination     → UNBLOCKED (AC45, AC46)
├── canAccess authorisation for approver role        → UNBLOCKED (AC39)
├── Empty / loading / error states                   → UNBLOCKED
├── UI shell and navigation                          → UNBLOCKED
└── Approver population and routing rules            → GATED (C1)
```

The task must read: *implement the approver-inbox technical seam and non-policy
behaviour; do not implement approver-selection or routing rules until C1 lifts.*

This prevents both failure modes at once — **over-blocking** (waiting for C1
before doing anything) and **policy invention** (deciding in code who the
approver is).

### P-F03 — SHOULD-FIX — Sequencing dependency inversion

Item 16 (`API09` reference data, AC47/AC48) requires `MasterDataPort`, which is
delivered at item 18. Item 15 (`API04`/`API05`) has no such problem.

**Required:** move port interfaces and in-memory doubles from Phase 4 to
Phase 1, where they belong — a port is an interface the domain owns, and
defining it early is what allows domain tests to run without adapters.

### P-F04 — SHOULD-FIX — Two incorrect AC mappings in sequencing

- Item 15 is annotated *(AC43, AC44)* but `API04` retrieval satisfies AC36,
  AC37, AC38 and AC39; only `API05` satisfies AC43/AC44.
- Item 21 is annotated *(AC2–AC6)*, which are **server-side** validation
  criteria. A form does not satisfy them.

Wrong mappings are worse than absent ones: they make an orphan audit pass while
the underlying trace is false — the same class of defect as G1-F01.

### P-F05 — SHOULD-FIX — `canAccess` has no declared module home

Constitution §1 sets an 85% coverage floor on modules handling "state
transitions, approval decisions, **authorisation** or audit writes". The plan
gates `domain/` and `persistence/audit` at 85%, but §7.3's `canAccess` predicate
is not placed in the module map (§2.1). If it lands in `application/` or
`http/middleware/`, it falls under the 70% floor — below what the constitution
requires for the single most security-critical function in the design.

**Required:** place `canAccess` explicitly in `domain/authorization/` and add it
to the 85% coverage gate.

### P-F06 — NIT — ADR-0001 ordering

ADR-0001 (in-service state machine) is listed at Phase 1 item 5, but the
workflow engine it governs is needed at item 2. The ADR should precede the code
it justifies.

### P-F07 — NIT — The 14-day pending alert may be misread as an SLA

Plan §13's alert threshold is a monitoring decision within engineering's
authority, and the plan says so. But an operator seeing "pending > 14 days" will
reasonably infer 14 days is the SLA — which is precisely the policy C5 has not
decided.

**Suggested:** rename the metric to `pending_duration_days` with an alert
labelled *"exceeds observability threshold — no SLA defined, see C5"*.

---

## 4. Constitution Check Verification

Plan §15 claims all 32 applicable rules addressed. **Spot-verified 12,
including every rule the plan claims to satisfy structurally.**

| Rule | Claim | Verified |
|---|---|---|
| §0 no business decision in code | 3 gated seams declare and throw | ✓ `requiredTasks()` throws `NotYetSpecified` rather than returning a plausible default — the correct behaviour, and the strongest single line in the plan |
| §1 every transition tested incl. rejected | Matrix generated from the transition table | ✓ generation makes an untested transition fail the build |
| §2 no PII in logs | Allowlist logger | ✓ fails closed; denylist correctly rejected |
| §2 `404` not `403` | One `canAccess` | ✓ design correct — **but see P-F05 on coverage** |
| §2 idempotency | Middleware, not per-route | ✓ |
| §3 Redis never system of record | Queues, counters, cache only | ✓ all state in PostgreSQL |
| §3 append-only audit | `REVOKE UPDATE, DELETE` | ✓ database guarantee, not convention |
| §3 no external call in request path | Outbox → queue → worker | ✓ |
| §3 bounded retry, terminal destination | §14 | ✓ |
| §4 RPO 15m / RTO 2h | "infrastructure, verified at release" | **~ weak** — a compliance claim with no task and no owner. Acceptable at plan stage; must become a release-checklist item, not a sentence |
| §5 states are public contract | Enum change = breaking | ✓ |
| §5 forward-only migrations | §4 | ✓ |

**No constitution rule is violated and none is silent.** The RPO/RTO row is the
only soft claim.

---

## 5. What The Plan Gets Right

Recorded because a review that lists only defects misrepresents the artefact.

1. **Three invariants enforced by the database, not application code.** The
   partial unique index makes AC12 unfalsifiable under the exact concurrency race
   `.UT90` tests; a read-then-write would lose it. `UNIQUE (request_id, stage)`
   makes duplicate decisions structurally impossible. `REVOKE UPDATE, DELETE`
   turns `.UT48` into a test of a database guarantee rather than a convention a
   refactor could silently drop.
2. **Transition table as data.** C1 is the condition most likely to resolve
   against the current assumption, and under this design that resolution changes
   a data structure and its generated tests — not the engine, endpoint,
   aggregate or projection. This is the highest-leverage decision in the plan.
3. **Fail-closed gating.** `requiredTasks()` throwing rather than stubbing is the
   clean demonstration that technical design can *prepare for* an unresolved
   business decision without *making* it.
4. **Weakly-typed `position_id` until C3.** Refusing to add a foreign key that
   might have to be migrated away is restraint, not sloppiness, and the plan
   says why.

---

## 6. Required Actions Before D5

| # | Action | Finding | Artefacts |
|---|---|---|---|
| 1 | Add front-end acceptance criteria; extend test cases; update traceability | P-F01 | spec → v1.2, test_cases → v1.2, traceability |
| 2 | Split approver inbox into unblocked seam + C1-gated routing | P-F02 | plan → v1.1 |
| 3 | Move ports and doubles to Phase 1 | P-F03 | plan → v1.1 |
| 4 | Correct AC mappings on sequencing items 15 and 21 | P-F04 | plan → v1.1 |
| 5 | Place `canAccess` in `domain/authorization/`; add to the 85% gate | P-F05 | plan → v1.1 |
| 6 | Move ADR-0001 ahead of the workflow engine | P-F06 | plan → v1.1 |
| 7 | Relabel the pending-duration metric | P-F07 | plan → v1.1 |
| 8 | Adopt the gate taxonomy (§2) throughout | this review | plan → v1.1, and every D5 task |
| 9 | Make RPO/RTO a release-checklist item with an owner | §4 | plan → v1.1 |

**Actions 1–9 require no business decision.** All are author work.

## 7. Sign-Off

| Role | Name | Verdict | Date |
|---|---|---|---|
| Reviewer (author-executed) | SDD Assessment Reviewer | **CHANGES REQUESTED** | 2026-08-30 |
| Architecture sign-off | **NOT OBTAINED** — required per §12.1 (C11) | — | — |
| Independent peer reviewer | **NOT ASSIGNED** (C12) | — | — |

**Plan status: In Review.** Does not advance to Reviewed, and D5 may not be
generated, until actions 1–9 are complete and re-validated.


---

## 8. Re-Validation — v1.1 Remediation (2026-08-30)

All nine required actions closed.

| # | Action | Artefacts changed | Verified |
|---|---|---|---|
| 1 | Front-end acceptance criteria | spec → v1.2 (AC50–AC55); test_cases → v1.2 (UT119–UT136); traceability | ✓ Phase 6's five items now each cite an AC |
| 2 | Split approver inbox | plan §18 Phase 4 — items 21–24 unblocked, item 25 gated C1 | ✓ instruction wording carried verbatim into the phase note |
| 3 | Ports moved to Phase 1 | plan §18 item 2 | ✓ item 19 (`API09`) now follows its dependency |
| 4 | AC mappings corrected | plan §18 items 17, 29 | ✓ `API04` → AC36–AC39; form → AC50, AC51 |
| 5 | `canAccess` module home + coverage gate | plan §2.1, §15 | ✓ `domain/authorization/` inside the 85% gate |
| 6 | ADR-0001 resequenced | plan §18 item 1 | ✓ precedes the workflow engine at item 5 |
| 7 | Pending metric relabelled | plan §13 | ✓ `pending_duration_days`, alert states no SLA is defined |
| 8 | Gate taxonomy adopted | plan §1.3; all Phase 7 items typed | ✓ 9 implementation, 1 release, 2 process |
| 9 | RPO/RTO given an owner and a drill | plan §15, §18 release checklist | ✓ Platform, verified by restore drill |

### Re-run verification tests

| Test | v1.0 | v1.1 |
|---|---|---|
| 1 — components trace backward to an AC | **FAIL** (3 orphans) | **PASS** (0) |
| 2 — tasks trace forward | Conditional | Conditional — settles at D5 |
| 3 — blocks are task-level | **PARTIAL FAIL** | **PASS** — inbox split; every gated item typed |
| 4 — independently executable increments | **PARTIAL FAIL** | **PASS** — dependency inversion removed |

### Counts after remediation

| | before | after |
|---|---|---|
| Acceptance criteria | 49 | **55** |
| Test cases | 118 | **136** |
| Sequencing items | 32 | **43** |
| AC buildable with no policy decision | 20 | **28** |

**The remediation *increased* buildable scope.** Splitting the approver inbox
(P-F02) and adding front-end criteria (P-F01) moved eight acceptance criteria
from "blocked or unspecified" to "buildable now". Over-blocking had been costing
real delivery capacity, which is why it is worth treating as a defect rather
than as caution.

### Verdict after re-validation

**APPROVED.** Plan status advances to **Reviewed**. **D5 task decomposition is
authorised**, and must be generated from plan v1.1 against spec v1.2.

Conditions C11 (Security/Architecture sign-off) and C12 (independent peer
review) remain unmet and are unaffected by this remediation — they require named
humans, not further authoring.
