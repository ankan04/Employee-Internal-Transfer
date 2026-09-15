<!-- The connected spine. Every artefact ID in the project appears here with its
     upstream source and its downstream consumers. An ID that appears in only
     one column is an orphan and is a defect. Maintained on every artefact
     change; verified at Gate 1 and again at Gate 2. -->

# Traceability Matrix — Project TRANSFER360

_Last updated: 2026-08-30 — chain complete through Deliverable 9 (Gate 1) and
the v1.1 remediation. **Orphan audit: clean, verified after correction.**_

## Revision History

| Version | Orphan audit result | Change |
|---|---|---|
| v1.0 | Self-reported **0** — **false** | Initial matrix |
| v1.1 | **3**, then **0** after spec v1.1 | Gate 1 finding G1-F01 established the true count was 3 (API05, API08, API09). Spec v1.1 added AC43–AC48; the audit now genuinely passes. |
| v1.2 | **0**, plus a new check | Plan-review finding P-F01 found three planned front-end components tracing to **no AC at all**. Added the check *"plan components with no AC"* — which the v1.1 matrix did not have, and so could not have caught. Spec v1.2 added AC50–AC55. |

**This history is retained deliberately.** The matrix asserted a clean audit
before anyone had checked it, and the assertion was wrong. A traceability
document that has never been wrong has usually never been verified.

## The Chain

```text
BRD-001                       business requirement, .ai-context/BRD.md
   ↓
KD## / OQ## / AS## / BR##      discovery + decision log
   ↓
FR01–FR11                      functional capabilities
   ↓
employee-internal-transfer.AC1–AC42        acceptance criteria (spec)
   ↓ ↘
   ↓  employee-internal-transfer.API01–API09   API contract (spec)
   ↓
employee-internal-transfer.UT01–UT96        test cases (spec + QA-expanded)
   ↓
employee-internal-transfer.T##              tasks            — pending D5
   ↓
employee-internal-transfer.P##              AI prompts       — pending D7
   ↓
RED → implementation → GREEN                                 — pending D6/D8
   ↓
Gate 2 evidence                                              — pending D10
```

**Invariant:** no artefact may exist without a named upstream source, and no
upstream artefact may exist without at least one downstream consumer or an
explicit recorded reason for having none.

---

## 1. BRD → Functional Requirements

| BRD | Source statement | FR |
|---|---|---|
| BRD-001 | "initiate an Internal Transfer Request from the One-Point Employee Portal" | FR01 |
| BRD-001 | "Select the proposed new department/business unit" | FR02 |
| BRD-001 | "Select the proposed new location" | FR03 |
| BRD-001 | "Select the proposed role/job position" | FR04 |
| BRD-001 | "Provide an effective date" | FR05 |
| BRD-001 | "Provide an optional reason for the transfer" | FR06 |
| BRD-001 | "Submit the request" | FR07 |
| BRD-001 | "View the current status of the request" | FR08 |
| BRD-001 | "View actions that are pending with other stakeholders" | FR09 |
| BRD-001 | "the portal to orchestrate the downstream activities" | FR10 |
| BRD-001 | "provide the employee with a single view of progress" | FR11 |

Every FR traces to a quoted sentence of the source requirement. No FR was
invented.

## 2. Functional Requirements → Acceptance Criteria → API

| FR | AC | API |
|---|---|---|
| FR01 | AC1, AC7, AC12, AC13, AC50, AC51, AC52 | API01 |
| FR02 | AC2, AC8, AC47 | API01, API02, API09 |
| FR03 | AC3, AC8, AC47 | API01, API02, API09 |
| FR04 | AC4, AC8, AC11, AC47, AC48 | API01, API02, API09 |
| FR05 | AC5, AC9, AC10 | API01, API02 |
| FR06 | AC6, AC37, AC38 | API01, API04 |
| FR07 | AC14, AC15, AC16 | API03 |
| FR08 | AC36, AC39, AC43, AC44, AC53, AC54 | API04, API05 |
| FR09 | AC36, AC40, AC45, AC46 | API04, API08 |
| FR10 | AC30, AC31, AC32, AC33, AC34, AC35 | — internal orchestration |
| FR11 | AC33, AC36, AC53 | API04, API05 |

### Acceptance criteria with no FR parent

These derive from the constitution or from discovery findings rather than from
a stated capability. Recorded here so they are not mistaken for scope creep.

| AC | Source | Justification |
|---|---|---|
| AC17–AC26 | KD11, KD12; PD02 | Approval workflow — stated in the business context's journey, not in the requirement's employee-facing bullet list |
| AC27, AC28, AC29 | AS06, PD05; OQ21 | Withdrawal — absent from the requirement entirely; a lifecycle necessity |
| AC41 | constitution §3; discovery §1 | Audit — an obligation the requirement did not state but which follows from mutating org, pay and access data |
| AC42 | constitution §2 | PII containment |
| AC49 | Gate 1 G1-F05; spec Liveness Invariant | Liveness — no non-terminal state may lack an exit. Gated on C5, unimplementable, recorded so the gap cannot be forgotten. |
| AC55 | constitution-adjacent; plan review P-F01 | Accessibility — not stated in the business requirement, and the journey is unusable without it for keyboard and screen-reader users |

## 3. Acceptance Criteria → Test Cases

Owned by `.ai-context/test_cases/employee-internal-transfer.test_cases.md` §9
and not duplicated here.

Verified property: **55 AC, 54 covered by at least one of 136 test cases.** The
single uncovered criterion is **AC49**, gated on C5 and unimplementable — no
test can assert behaviour that policy has not defined. It is recorded as blocked
in test_cases §8, not counted as covered.

## 4. Discovery → Provisional Decisions → Contingent Artefacts

The blast radius of each unresolved decision, computed in advance.

| PD | Discovery source | Disposition | AC at risk | API at risk | Test cases at risk |
|---|---|---|---|---|---|
| PD01 | OQ16 | **BLOCKING** | AC8, AC12, AC13 | API01, API09 | UT08, UT13, UT14, UT15, UT70, UT71 |
| PD02 | OQ01, OQ03 | **BLOCKING** | AC17–AC26 | API07 | UT20–UT29, UT85, UT86, UT91 |
| PD03 | OQ40 | **BLOCKING** | AC30–AC33 | — | UT34–UT37 |
| PD04 | OQ41 | **BLOCKING** | AC32–AC35 | — | UT36, UT40, UT92–UT94 |
| PD05 | OQ39 | ASSUMPTION | AC28, AC34 | API06 | UT31, UT32, UT38 |
| PD06 | OQ38 | ASSUMPTION | AC34 | — | UT38, UT94 |
| PD07 | OQ17 | ASSUMPTION | AC12, AC13 | API03 | UT13, UT90 |
| PD08 | OQ30, OQ31 | ASSUMPTION | AC9, AC10 | API03 | UT09, UT10, UT65, UT66 |
| PD09 | OQ49 | ASSUMPTION | AC37, AC38 | API04 | UT42, UT43, UT80, UT81, UT82 |
| PD10 | OQ22 | ASSUMPTION | AC16 | API02 | UT19, UT51 |
| PD11 | OQ52 | ASSUMPTION | AC36 | API04 | UT41, UT84 |
| PD12 | OQ10, OQ11 | ASSUMPTION (criteria BLOCKING via OQ09) | AC23, AC24 | API03 | UT26, UT27, UT87 |

**Reading this table is how Gate 1 prices each decision.** Resolving OQ16
against the requisition model costs three AC, two endpoints and six test cases.
Resolving OQ01 against a one-manager chain costs ten AC and thirteen test cases.
Neither is a surprise discovered at Gate 2.

## 5. Constitution → Enforced By

| Constitution rule | Enforced in | Verified by |
|---|---|---|
| §0 business authority from spec, not assumption | Provisional Decisions block; decision log BLOCKING items | Gate 1 |
| §1 test-first, Red before Green | test_cases v1.0 written pre-implementation | Gate 2 evidence |
| §1 every state transition tested incl. rejected | test_cases §2 state matrix | UT51–UT63 |
| §2 no PII in logs at any level | AC42 | UT49, UT50, UT96, INT08 |
| §2 actor identity from session | AC7 | UT07, UT78, UT79 |
| §2 object-level authorisation; 404 not 403 | AC39 | UT45, UT76, UT77 |
| §2 explicit rate-limit decision per endpoint | spec API01–API09, each with a stated limit and rationale | Gate 2 |
| §2 idempotency on state-changing endpoints | AC15; VR12 | UT17, UT18, UT88, UT89 |
| §3 audit append-only | AC41 | UT47, UT48, INT07 |
| §3 bounded retry with terminal destination | AC35 | UT40, UT92, UT93 |
| §3 no external call in request path | spec NFR section | INT06 |
| §4 correlation id propagated | spec NFR section | INT10 |

## 6. Orphan Audit

Run against every ID in the project. An orphan is a defect.

| Check | Result |
|---|---|
| FRs with no AC | **0** |
| ACs with no FR parent or recorded justification | **0** — 15 have recorded non-FR sources (§2) |
| ACs with no test case | **0 unaccounted** — 48/49 covered; AC49 is gated on C5 and recorded as blocked, not orphaned |
| Test cases naming no AC | **0** — QA-owned coverage in test_cases §7 is separated deliberately and marked as such |
| API endpoints with no AC exercising them | **0** — was 3 at v1.0 (API05, API08, API09); closed by spec v1.1 AC43–AC48. **This row was self-reported 0 before it was checked; see Revision History.** |
| API endpoints with no rate-limit decision | **0** |
| Discovery OQs with no disposition | **0** — all 61 dispositioned in the decision log |
| Assumptions with no linked OQ | **0** |
| BLOCKING items with no named *Blocks* scope | **0** |
| Constitution rules with no enforcement point | **0** |
| **Constitution controls with no task, no implementation location and no verification method** | **2 — SEC-01, SEC-02.** Standing invariant added at Gate 2 (§G). It did not exist before, which is exactly why the chain carried both requirements to the plan and dropped them at the task boundary |
| **Plan components / sequencing items with no AC** | **0** — was 3 at plan v1.0 (form, status view, list). **This check did not exist before P-F01**; a matrix cannot catch a class of orphan it does not look for. |
| Gated items with no gate *type* (implementation / release / process) | **0** — taxonomy applied across all 10 Phase 7 items |

## 6a. Gate 1 Outcome

Gate 1 (`.ai-context/reviews/employee-internal-transfer.gate1.md`) returned
**CONDITIONAL PASS**. Spec status `Approved v1.0`; implementation authorised for
20 of 42 AC; 12 gate conditions (C1–C12) control the remainder.

| Finding | Severity | Resolution | Status |
|---|---|---|---|
| G1-F01 | Blocking | Spec v1.1 adds AC43–AC48 for API05/API08/API09; test cases UT97–UT118; orphan audit re-run and now genuinely clean | **CLOSED** |
| G1-F02 | Blocking | API03's `NOT_ELIGIBLE` marked ⛔ GATED on C2/OQ09 — shape specified, trigger explicitly not | **CLOSED** |
| G1-F03 | Should-fix | AC30/AC31 given an observable guarantee: daily evaluation, execution within 24h of the effective date; mechanism left to the plan | **CLOSED** |
| G1-F04 | Should-fix | `hasReason` removed; presence-by-omission is the single convention across all endpoints | **CLOSED** |
| G1-F05 | Blocking | Decision log v1.1 re-dispositions OQ29 DEFERRED → BLOCKING, joined to OQ25 under C5; spec gains a Liveness Invariant section and gated AC49 | **CLOSED** |
| G1-F06 | Nit | `409 IDEMPOTENCY_KEY_MISMATCH` added to API03; UT18 corrected | **CLOSED** |

### Execution outcome (D6 — vertical slice)

14 tasks implemented test-first against real PostgreSQL 16. **67 tests GREEN**,
per-module coverage floors met. Three findings:

| Finding | Issue | Status |
|---|---|---|
| EX-01 | Coverage threshold aggregated across `src/domain/`, so a module at 73.91% passed behind higher-covered siblings while the constitution sets the floor per module | Closed — per-module keys; shortfall closed by **removing** unused accessors, not by writing tests for the number |
| EX-02 | T16 declared 4 of its 7 real dependencies; T05/T08/T09 were missing, all reachable from one clause of AC14 | Closed — tasks v1.1 |
| EX-03 | Branch coverage lags line coverage (workflow 71% vs 100%); constitution sets a line floor only | Open — constitution amendment candidate |

**D5-F01 verified in code:** no approval-stage literal exists outside the
transition table; if C1 resolves to a one-manager chain, one table row changes
and all 67 tests still pass.

### Gate 2 outcome (D10) — CHANGES REQUESTED, RELEASE BLOCKED

Build evidence independently re-verified at review time from a clean container
(67 tests, 6 suites, coverage gate exit 0). SEC-01 **demonstrated** against the
running system rather than asserted: `UPDATE 1`, `DELETE 1` succeeded on
`transfer_audit` as `current_user=postgres, usesuper=t`.

| Axis | Verdict |
|---|---|
| A Build evidence | PASS |
| B RED → GREEN | PASS |
| C Task traceability | PASS — 0 attribution occurrences, no fabricated history |
| D Acceptance criteria | 14 SATISFIED / 1 PARTIAL / **1 NOT SATISFIED** / 18 GATED / 21 NOT IMPLEMENTED = 55 |
| E Security | **FAIL** — SEC-01, SEC-02 release-blocking |
| F Scope | Slice evidenced; feature **not** approved for production |

**The systemic finding.** The chain
`Requirement → FR → AC → Test → Plan → Task → Prompt → Code` was verified at
every gate and held. A second, cross-cutting chain —
`Constitution → Plan → Task → Prompt → Code → Test` — **was checked by no gate,
and broke twice in the same place.** Both HIGH findings were lost at the
plan→task boundary. The new invariant above closes it.

### Security assessment outcome (D8)

Scoped to the implemented slice, **not** the application — 14 of 49 tasks. Five
findings; two HIGH.

| Finding | Severity | Effect on this matrix |
|---|---|---|
| SEC-01 | HIGH | **AC41 downgraded from SATISFIED to NOT SATISFIED.** Audit `REVOKE` is inert against a superuser connection and `.UT48` was never written |
| SEC-02 | HIGH | Reason stored plaintext against plan §4.1/§12.3; no AC covers storage-at-rest |
| SEC-03 | MEDIUM | `canAccess` grants FULFILLER visibility unconditionally |
| SEC-04 | MEDIUM | JWT verified without issuer/audience |
| SEC-05 | LOW | Express default error handler leaks stack traces |

**Root cause shared by both HIGH findings:** a control specified in the
constitution and carried into the plan was **not restated in any task contract,
and no acceptance criterion covered it**. The chain dropped it at the task
boundary — a class of defect no earlier gate was shaped to catch.

**New orphan check added:** *constitution §2 controls named in the plan but
absent from every task's Scope and Definition of Done* — currently **2**
(SEC-01 least-privilege, SEC-02 encryption at rest).

### AC Status Model — binary status is not sufficient

D5-F02 established that an acceptance criterion can be **half implemented** when
one part of it sits behind a gate. A binary satisfied/unsatisfied status hides
that, and would let Gate 2 record a criterion as met when half its behaviour does
not exist. The status model is therefore three-valued:

| Status | Meaning | Gate 2 treatment |
|---|---|---|
| **SATISFIED** | Every constituent task complete and GREEN | Verify by AC |
| **PARTIAL** | At least one constituent task complete, at least one gated | **Verify by task, never by AC.** May not be reported as met. |
| **NOT STARTED** | No constituent task complete | — |

#### Currently PARTIAL

```text
AC25 — decision uniqueness
├── DB uniqueness constraint ......... T04  ✅ unblocked
└── decision sequencing .............. T38  ⛔ C1

AC33 — completion and confirmation
├── confirmation notification ........ T31  ✅ unblocked
└── all-required-tasks-complete ...... T43  ⛔ C8
```

Also partial by construction, and tracked the same way: AC1 (T06 + T13),
AC12 (T03 + T16), AC40 (T04 + T20 + T22), AC41 (T05 + T08), AC55 (T28 + T33 +
T37). Those five resolve to SATISFIED once their unblocked tasks are all GREEN;
**AC25 and AC33 cannot, while C1 and C8 stand.**

### Task decomposition outcome (D5)

49 tasks from 43 plan items — 5 items split, 3 merged, 27 direct. Bidirectional
audit clean in both directions. Two new findings surfaced by decomposition:

| Finding | Issue | Required |
|---|---|---|
| D5-F01 | AC14 and the status projection table embed the C1 approval model with no contingency tag — an unblocked task would have hard-coded the approval model | spec v1.3 tag; already constrained in T07/T16 |
| D5-F02 | AC25 and AC33 are each satisfied jointly by a gated and an ungated task | spec v1.3 partial-contingency marks; **Gate 2 must verify these two by task, not by AC** |

**37 of 49 tasks unblocked, covering 28 of 55 AC with no business decision
required of any implementer.**

### Plan review outcome

CHANGES REQUESTED, 2026-08-30. Seven findings (P-F01 – P-F07), two blocking.
All closed at plan v1.1 / spec v1.2. **P-F01 was found only because the plan
review asked what AC each planned component satisfied** — the defect was
invisible from inside the specification.

**All six Gate 1 findings closed. Five of six required changes to more than one
artefact** — which is the argument for maintaining the chain as a connected set
rather than as ten documents that happen to sit in one folder.

## 7. Pending Columns

Deliberately empty, not overlooked. Each fills at its deliverable.

| Column | Fills at | Will map |
|---|---|---|
| ~~RED evidence~~ | **D6 — DONE** | 6 suites RED for the right reason; `evidence/red-run.txt` |
| ~~Implementation~~ | **DONE (slice)** | 14 tasks; `transfer-service/` |
| ~~GREEN evidence~~ | **D6 — DONE** | 67 tests, 6 suites; `evidence/green-run.txt` |
| ~~`T##` tasks~~ | **D5 — DONE** | 49 tasks, bidirectional audit clean; see `tasks/employee-internal-transfer.tasks.md` §4 |
| ~~`PM##` prompts~~ | **D7 — DONE** | 84 prompts across 49 tasks; registry audit clean; see `prompts/employee-internal-transfer.prompts.md` §5 |
| RED evidence | D6 | Test run showing failure for the right reason |
| Implementation | D8 | Commit → `Implements employee-internal-transfer.T##` |
| GREEN evidence | D8 | Test run showing pass |
| Security result | D8 | Security checklist item → AC → evidence |
| Gate 2 evidence | D10 | AC → test → task → commit → result, verified individually by ID |

---

## Maintenance Rule

This file is updated **in the same change** as the artefact that alters it — not
afterwards. A traceability matrix reconstructed at the end of a project is a
narrative; one maintained alongside the work is evidence. §28 lists a stale
`architecture.md` as an anti-pattern for the same reason: a document that is
trusted and wrong is worse than one that is absent.
