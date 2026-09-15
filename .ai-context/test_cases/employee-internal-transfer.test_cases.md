<!-- QA-expanded from the spec's own Unit Test Cases table, per §19.1.
     Same ID space as the spec: UT01–UT50 are the spec-derived acceptance-level
     cases, reproduced here by reference; UT51+ are QA-added coverage.
     Every case traces to an AC. A case that traces to no AC is a defect in
     this file, not extra diligence. -->

# Test Cases: Employee Internal Transfer Digital Journey

## Derived From
- `.ai-context/specs/employee-internal-transfer.spec.md` (Draft v1.0)
- `.ai-context/discovery/employee-internal-transfer.decision-log.md` (v1.0)

## Status
**v1.2 — not yet executable.** Written before implementation, per constitution
§1 and `.agent/workflows/generate-tests.md`. Every case here is expected to be
**Red** at first run.

### Revision History

| Version | Change | Driver |
|---|---|---|
| v1.0 | 96 cases: 50 spec-derived, 46 QA-expanded | Initial |
| v1.1 | Spec-derived set extended to 62 (`UT97`–`UT108`) for AC43–AC48 and the `IDEMPOTENCY_KEY_MISMATCH` code; QA-expanded set extended by `UT109`–`UT118`; `UT18` corrected | Gate 1 findings G1-F01, G1-F06 |
| v1.2 | Spec-derived set extended to 72 (`UT119`–`UT128`) for the new front-end AC50–AC55; QA-expanded set extended by `UT129`–`UT136` | Plan-review finding P-F01 |

**On ID ordering.** `UT97`+ are spec-derived cases numbered above the
QA-expanded `UT51`–`UT96` block, because §9 forbids reusing or renumbering an
identifier once issued. Non-contiguous ranges are the correct cost of stable
IDs; renumbering to look tidy would break every reference in the spec, the
traceability matrix and the Gate 1 review.

---

## 1. Coverage Model

| Layer | Cases | Ownership |
|---|---|---|
| Spec-derived acceptance cases (`UT01`–`UT50`, `UT97`–`UT128`) | 72 | Engineer, from the spec's own table |
| QA-expanded coverage (`UT51`–`UT96`, `UT109`–`UT118`, `UT129`–`UT136`) | 64 | QA |
| Cross-feature / system journeys | see `_integration.md` | QA |
| **Blocked — not writable yet** | 12 identified | see §8 |
| **Total written** | **136** | |

**Traceability rule applied throughout:** every case names the AC it verifies.
The spec's 55 acceptance criteria are covered by at least one case each, with
the single deliberate exception of **AC49, which is gated on C5 and
unimplementable** — no test can assert behaviour that policy has not defined.
The map is in §9.

---

## 2. State-Transition Matrix

Constitution §1 requires an explicit test for **every** transition, including
every rejected one. Rows are source states, columns are attempted transitions.
`✓` = permitted and tested; `✗` = must be refused and tested as refused.

| From \ Attempt | submit | amend | withdraw | decide | cancel (HR) | execute |
|---|---|---|---|---|---|---|
| `DRAFT` | ✓ UT16 | ✓ UT51 | ✓ UT52 | ✗ UT53 | ✓ UT54 | ✗ UT55 |
| `PENDING_RELEASING_MANAGER` | ✗ UT56 | ✗ UT19 | ✓ UT30 | ✓ UT20 | ✓ UT57 | ✗ UT58 |
| `PENDING_RECEIVING_MANAGER` | ✗ UT56 | ✗ UT19 | ✓ UT30 | ✓ UT25 | ✓ UT57 | ✗ UT58 |
| `PENDING_HR_VALIDATION` | ✗ UT56 | ✗ UT19 | ✓ UT30 | ✓ UT26 | ✓ UT57 | ✗ UT58 |
| `APPROVED_SCHEDULED` | ✗ UT56 | ✗ UT19 | ✗ UT31 | ✗ UT59 | ✓ UT60 | ✓ UT35 |
| `IN_EXECUTION` | ✗ UT56 | ✗ UT19 | ✗ UT32 | ✗ UT59 | ✗ UT61 | — |
| `EXECUTION_ATTENTION` | ✗ UT56 | ✗ UT19 | ✗ UT32 | ✗ UT59 | ✗ UT61 | ✓ UT39 |
| `COMPLETED` | ✗ UT56 | ✗ UT19 | ✗ UT62 | ✗ UT29 | ✗ UT61 | ✗ UT63 |
| `REJECTED` | ✗ UT56 | ✗ UT19 | ✗ UT62 | ✗ UT29 | ✗ UT61 | ✗ UT63 |
| `WITHDRAWN` | ✗ UT56 | ✗ UT19 | ✗ UT62 | ✗ UT29 | ✗ UT61 | ✗ UT63 |
| `CANCELLED` | ✗ UT56 | ✗ UT19 | ✗ UT62 | ✗ UT29 | ✗ UT61 | ✗ UT63 |

The matrix is the argument that the state machine is tested rather than
asserted. Eleven states × six attempted transitions = 66 cells; the collapsed
cases above cover all of them.

---

## 3. Spec-Derived Cases (`UT01`–`UT50`)

Reproduced by reference from
`.ai-context/specs/employee-internal-transfer.spec.md`, §"Unit Test Cases
(spec-derived)". Not duplicated here, per §11.3 — the spec owns them, this file
extends them. Duplication would create two versions that drift.

Coverage of those 50: AC1–AC42, at least one case each.

---

## 4. QA-Expanded — Validation and Boundary

| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| `.UT51` | AC1, AC16 | Amend a draft's every field, then re-amend | `200` each time; last write wins; still `DRAFT` |
| `.UT52` | AC27 | Withdraw from `DRAFT` | `200`, state `WITHDRAWN` |
| `.UT64` | AC5, AC10 | `effectiveDate` supplied as `"not-a-date"` | `400` schema violation, not `422` — malformed vs business-rule distinction holds |
| `.UT65` | AC9 | `effectiveDate` = today + 16 days | `200` — above-boundary accepted |
| `.UT66` | AC10 | `effectiveDate` = today | `422` citing `VR05` |
| `.UT67` | AC6 | `reason` exactly 2000 characters | `200` — boundary accepted (VR06) |
| `.UT68` | AC6 | `reason` 2001 characters | `422` citing `VR06` |
| `.UT69` | AC6 | `reason` containing only whitespace | Treated as absent; `hasReason` false |
| `.UT70` | AC8 | `positionId` well-formed but unknown to master data | `422 INVALID_REFERENCE_DATA` (VR02) |
| `.UT71` | AC8 | `departmentId` refers to a *deactivated* master record | `422` citing `VR02` — active-only, not merely existing |
| `.UT72` | AC11 | `positionId` = current position, submitted twice | `422` both times; no state change either time |
| `.UT73` | AC2–AC5 | Submit an entirely empty draft | `422` with **four** `details[]` entries, not one — all failures reported together |
| `.UT74` | AC14 | `effectiveDate` on a leap day, 29 Feb | Accepted; scheduling fires on that date |
| `.UT75` | AC14 | Submission at 23:59 local with a date-boundary effective date | Date arithmetic uses a single declared timezone; no off-by-one |

## 5. QA-Expanded — Authorization, IDOR and Privacy

| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| `.UT76` | AC39 | Enumerate sequential/guessed `requestId` values as an unrelated employee | `404` for every one; no timing difference that distinguishes existing from absent |
| `.UT77` | AC39 | Releasing manager retrieves a request belonging to a *non*-direct report | `404`, not `403` |
| `.UT78` | AC7 | Submit with `X-On-Behalf-Of` header naming another employee | Header ignored; session subject used |
| `.UT79` | AC7 | Submit with `subjectRef` in the JSON body | Field ignored; session subject persisted |
| `.UT80` | AC37 | Releasing manager retrieves via the list endpoint (API05) as well as by id | `reason` key absent in **both** paths — projection is not endpoint-specific |
| `.UT81` | AC37 | Reason text searched for in the manager's full API04 response, including `timeline[].comment` | Absent everywhere in the payload, not merely from the top-level key |
| `.UT82` | AC38 | HR Business Partner retrieves the request | `reason` present |
| `.UT83` | AC40 | IT fulfiller attempts to read the payroll task | `404` — task-level, not request-level, scoping |
| `.UT84` | AC36 | Employee response inspected for any approver name, email or employee number | None present in any field |
| `.UT85` | AC21 | Employee who is their own releasing manager (data anomaly) attempts a decision | `403 SELF_APPROVAL_FORBIDDEN` — the check is on subject identity, not on role absence |
| `.UT86` | AC20 | Former approver decides after the request has moved past their stage | `403 NOT_YOUR_DECISION` |
| `.UT87` | AC24 | Ineligible response inspected for the underlying reason | Reason codes only; no tenure figure, rating, or disciplinary detail |

## 6. QA-Expanded — Idempotency, Concurrency and Integration Failure

| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| `.UT88` | AC15 | Two concurrent submissions of the same draft with the same key | Exactly one submission recorded; both callers receive the same body |
| `.UT89` | AC15 | Two concurrent submissions with *different* keys | One succeeds; the other `409` — no double submission |
| `.UT90` | AC12 | Two concurrent first-submissions by the same employee on two drafts | Exactly one reaches `PENDING_RELEASING_MANAGER`; the other `409 ACTIVE_REQUEST_EXISTS` |
| `.UT91` | AC17, AC22 | Two approvers decide concurrently on adjacent stages | Second decision refused as out-of-sequence; no state skipped |
| `.UT92` | AC35 | HRMS adapter returns `500` on attempt 1, succeeds on attempt 2 | Retry succeeds; exactly one HRMS mutation performed (adapter idempotency) |
| `.UT93` | AC35 | HRMS adapter times out then the original call succeeds downstream | No duplicate org update; correlation id reconciles the two |
| `.UT94` | AC34 | Facilities task fails while IT and payroll are still open | `EXECUTION_ATTENTION`; IT and payroll continue to completion independently |
| `.UT95` | AC33, AC34 | Remediation closes the failed task after the others completed | `IN_EXECUTION` → `COMPLETED`; exactly one confirmation notification total |
| `.UT96` | AC42 | Downstream adapter returns an error body containing employee PII | PII is stripped before logging; no PII reaches application logs or the error response |

## 6a. QA-Expanded — Listing, Inbox and Reference Data (v1.1, from G1-F01)

| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| `.UT109` | AC43 | Employee with 60 historical requests lists page 2 at `pageSize` 25 | Correct slice, stable ordering across pages, no duplicates or omissions |
| `.UT110` | AC43 | Employee with zero requests lists | `200`, empty `items`, `total` 0 — not `404` |
| `.UT111` | AC44 | Two employees with requests created in the same millisecond | Each sees exactly their own; ordering is deterministic under a tie |
| `.UT112` | AC45 | Approver inbox while the same request advances stage concurrently | Request appears in exactly one approver's inbox at any instant, never two |
| `.UT113` | AC45 | Manager who is an approver on one request and the subject of another | Inbox contains the first, never their own request |
| `.UT114` | AC46 | Approver rejects, then retrieves inbox | Request absent; rejection is a decision |
| `.UT115` | AC47 | Master record deactivated *after* an employee selected it in a draft | Draft retains the value; submission fails `VR02` — deactivation is not retroactive to drafts but is enforced at submission |
| `.UT116` | AC48 | Positions filtered with `departmentId` only | Filter applied on the supplied dimension; unsupplied dimension unconstrained |
| `.UT117` | AC47, AC48 | Reference collection of 5,000+ records with `search` | Paginates within latency budget; `total` reflects the filtered set, not the collection |
| `.UT118` | AC43, AC45 | Reference and list endpoints called with `pageSize` above the documented max of 50 | Clamped to 50, `200` — not `400`; documented behaviour, not silent truncation |

## 6b. QA-Expanded — Portal Journey (v1.2, from P-F01)

| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| `.UT129` | AC50 | Master-data service unavailable when the form loads | Form renders; selection lists show an explicit error state, not an empty dropdown |
| `.UT130` | AC51 | `effectiveDate` 14 days out entered client-side | Client indicates the rule; server `422` on bypass — the two agree on the rule and disagree on authority |
| `.UT131` | AC52 | Active request in `EXECUTION_ATTENTION` | Existing request shown; still no route to a second request |
| `.UT132` | AC53 | Request in `EXECUTION_ATTENTION` viewed by the employee | "In progress — one step needs attention" shown; no downstream system name, no fulfiller name |
| `.UT133` | AC54 | My Requests where all requests are terminal | List renders with terminal states; not treated as empty |
| `.UT134` | AC55 | Screen reader traverses the status view | Stage and pending role announced; timeline conveyed as structured content, not as an image |
| `.UT135` | AC55 | Form submitted with two fields invalid | Both errors announced to assistive technology, not only the first |
| `.UT136` | AC50, AC53 | Journey at 320px viewport width | All fields and status content reachable; no horizontal scrolling of the page body |

## 7. QA-Owned Coverage Not Traceable to a Single AC

Per §19.2, QA owns judgement calls the spec does not resolve. These are
recorded as QA scope rather than acceptance criteria.

| Area | Scope |
|---|---|
| Browser / device matrix | Portal journey on the organisation's supported browser set and on mobile viewport widths |
| Accessibility | Keyboard-only completion of the request form; screen-reader labelling of status and pending-action content; colour is never the sole status carrier |
| Data volume | Employee with 50+ historical requests paginates correctly; master-data lists of 5,000+ positions search and page within latency budget |
| Localisation | Date rendering and effective-date entry under differing locale date formats |
| Resilience | Portal behaviour when the master-data service is unavailable at draft time; when the eligibility service is unavailable at submission |

---

## 8. Cases That Cannot Be Written Yet

`.agent/workflows/generate-tests.md` step 5 requires stopping and flagging when
an acceptance criterion is not testable as written, rather than guessing. The
following coverage is **deliberately absent**, blocked on the decision log's
BLOCKING items. Each will be written the day its question closes.

| Blocked coverage | Blocked by | Why no test can be written |
|---|---|---|
| Eligibility rule evaluation — every accept and reject path | OQ09 | The criteria do not exist. A test would assert an invented policy. |
| Minimum-tenure boundary cases | OQ12 | Subsumed by OQ09 |
| Disciplinary / PIP exclusion cases | OQ13 | Subsumed by OQ09 |
| Notice-period exclusion cases | OQ14 | Subsumed by OQ09 |
| Approval-sequence tests, if the sequence changes | OQ01, OQ03 | UT20–UT29 encode PD02's three-stage chain. If Gate 1 rules otherwise they are rewritten, not extended. |
| Position-closure-mid-journey behaviour | OQ18 | No defined behaviour to assert |
| Approver-inaction, SLA breach and escalation | OQ25 | No SLA exists |
| Resignation-during-journey interrupt | OQ27 | No defined behaviour to assert |
| Payroll-boundary effective-date validation | OQ32, OQ34 | VR04 may change shape entirely |
| Downstream task-requirement conditions | OQ35, OQ36 | "Required" is undefined, so `NOT_REQUIRED` cannot be asserted |
| Rejection-reason disclosure in notifications | OQ47 | Disclosing and withholding are both currently defensible |
| **Liveness — AC49, approver cannot or does not act** | **OQ25 + OQ29 (C5)** | **No policy exists.** Escalation, expiry, reassignment and auto-approval all produce different observable outcomes; asserting any one would encode an invented policy as a passing test. Added at v1.1 per G1-F05. |

**Twelve blocked areas against 136 written cases.** Recording them here is the
point: at Gate 2 the question "why is there no eligibility test?" has a
documented answer that predates the code, rather than looking like an omission.

---

## 9. AC → Test Case Coverage Map

| AC | Cases | AC | Cases |
|---|---|---|---|
| AC1 | UT01, UT51 | AC22 | UT25, UT91 |
| AC2 | UT02, UT73 | AC23 | UT26 |
| AC3 | UT03, UT73 | AC24 | UT27, UT87 |
| AC4 | UT04, UT73 | AC25 | UT28 |
| AC5 | UT05, UT64, UT73 | AC26 | UT29 |
| AC6 | UT06, UT67, UT68, UT69 | AC27 | UT30, UT52 |
| AC7 | UT07, UT78, UT79 | AC28 | UT31, UT32 |
| AC8 | UT08, UT70, UT71 | AC29 | UT33 |
| AC9 | UT09, UT10, UT65 | AC30 | UT34 |
| AC10 | UT11, UT66 | AC31 | UT35 |
| AC11 | UT12, UT72 | AC32 | UT36 |
| AC12 | UT13, UT90 | AC33 | UT37, UT95 |
| AC13 | UT14, UT15 | AC34 | UT38, UT39, UT94, UT95 |
| AC14 | UT16, UT74, UT75 | AC35 | UT40, UT92, UT93 |
| AC15 | UT17, UT18, UT88, UT89 | AC36 | UT41, UT84 |
| AC16 | UT19, UT51 | AC37 | UT42, UT43, UT80, UT81 |
| AC17 | UT20, UT91 | AC38 | UT44, UT82 |
| AC18 | UT21 | AC39 | UT45, UT76, UT77 |
| AC19 | UT22 | AC40 | UT46, UT83 |
| AC20 | UT23, UT86 | AC41 | UT47, UT48 |
| AC21 | UT24, UT85 | AC42 | UT49, UT50, UT96 |
| AC43 | UT97, UT109, UT110, UT111, UT118 | AC46 | UT102, UT114 |
| AC44 | UT98, UT99, UT111 | AC47 | UT104, UT105, UT115, UT117 |
| AC45 | UT100, UT101, UT103, UT112, UT113, UT118 | AC48 | UT106, UT107, UT116, UT117 |
| AC15 | + UT108 | AC49 | **none — gated on C5, see §8** |
| AC50 | UT119, UT129, UT136 | AC53 | UT124, UT132, UT134, UT136 |
| AC51 | UT120, UT121, UT130, UT135 | AC54 | UT125, UT133 |
| AC52 | UT122, UT123, UT131 | AC55 | UT126, UT127, UT128, UT134, UT135 |

**54 of the spec's 55 acceptance criteria have at least one test case, and no
test case exists that does not name an AC.** The one exception, AC49, is gated
on C5 and unimplementable by design — recorded in §8 rather than papered over
with a test that would assert invented policy.

That property, not the case count, is what makes this file evidence at Gate 2.
