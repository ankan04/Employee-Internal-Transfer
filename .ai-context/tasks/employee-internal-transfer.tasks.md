<!-- Deliverable 5 — Task Decomposition. Generated from the REVIEWED plan
     (v1.1) against spec v1.2, per §10 and §16. One task = one prompt. -->

# Tasks: Employee Internal Transfer Digital Journey

## Derived From
- `.ai-context/plans/employee-internal-transfer.plan.md` — **Reviewed v1.1**
- `.ai-context/specs/employee-internal-transfer.spec.md` — **Approved v1.2**
- `.ai-context/reviews/employee-internal-transfer.plan-review.md` — APPROVED

## Status
**v1.1 — 2026-08-30.** T16's dependency list corrected per execution finding
EX-02: three of its four real dependencies were undeclared, all reachable from a
single clause of AC14 ("and an audit record of the transition is written").
Decomposition must map **every clause** of a cited AC to a declared dependency,
not only the clause that names the task's headline behaviour. **49 tasks from 43 sequencing items.** Items were merged
where they shared one testable outcome and split where they crossed
independently testable boundaries; the mapping is in §5.

---

## 1. The Task Contract

Every task below is a contract, not a work item. A developer or agent reading
one must be able to answer **"can I implement this without deciding business
policy?"** — and if the answer is no, the task is either under-specified (a
defect) or correctly gated (by design).

| Field | Meaning |
|---|---|
| **Objective** | What the task accomplishes, in one sentence |
| **Scope** | Exactly what changes; the boundary is binding |
| **AC** | The acceptance criteria this task satisfies |
| **Tests** | The test cases that prove it |
| **Depends** | Tasks that must complete first |
| **Gate** | Implementation / Release / Process / — |
| **Condition** | The `C#` if gated |
| **Must not decide** | Business decisions the implementer must escalate, never invent |
| **Surface** | Expected files and components |
| **Done when** | Independently verifiable completion |

## 2. Gate Types

| Type | Meaning for the implementer |
|---|---|
| **IMPLEMENTATION** | The policy is undecided. Build the seam, contract and surrounding infrastructure; do **not** write the policy-dependent behaviour. |
| **RELEASE** | Build it, test it, validate it in a controlled environment. Do **not** expose it to production users. |
| **PROCESS** | No engineering work resolves this. A named human must act. |
| **—** | Ungated. Fully specified; implement completely. |

**Every task carries a `Must not decide` field, including ungated ones.** An
ungated task with a genuine policy hole is the defect this field exists to catch.

---

## 3. Tasks

### Phase 1 — Foundation and ports *(unblocked)*

**`employee-internal-transfer.T01` — Foundational ADRs**
- **Objective:** Record the three architectural decisions that govern the code written in T02–T10, before that code exists.
- **Scope:** ADR-0001 (in-service state machine over BPM engine), ADR-0002 (transactional outbox), ADR-0005 (allowlist logging over denylist redaction).
- **AC:** — *(derived: constitution §3, §2; plan §16)* · **Tests:** — · **Depends:** — · **Gate:** —
- **Must not decide:** nothing — these are technical decisions within engineering's authority. ADR-0006 (downstream integration style) must **not** be written; it is C10-gated.
- **Surface:** `.ai-context/decisions/ADR-0001-*.md`, `-0002-*.md`, `-0005-*.md`
- **Done when:** three ADRs exist with Context / Decision / Consequences, each naming what it does not solve; `architecture.md` links them.

**`employee-internal-transfer.T02` — Port interfaces and in-memory doubles**
- **Objective:** Define the eight interfaces the domain owns, plus doubles and contract tests, so every later domain test runs without a database or network.
- **Scope:** `HrmsPort`, `PayrollPort`, `AccessPort`, `FacilitiesPort`, `EligibilityPort`, `NotificationPort`, `MasterDataPort`, `ClockPort`. Interfaces and in-memory implementations only.
- **AC:** — *(derived: constitution §1 contract doubles, §3 adapter-mediated)* · **Tests:** contract tests per port · **Depends:** — · **Gate:** —
- **Must not decide:** the shape of any external vendor's API. Ports are defined by what the domain needs. `EligibilityPort` returns codes, never criteria — defining the criteria is C2.
- **Surface:** `src/ports/*.ts`, `test/doubles/*.ts`
- **Done when:** eight interfaces compile; doubles satisfy contract tests; no npm client library is imported anywhere under `src/domain/`.

**`employee-internal-transfer.T03` — Migration: transfer_request**
- **Objective:** Persist the request aggregate with the one-active-request invariant enforced by the database.
- **Scope:** `transfer_status` enum, `transfer_request` table, `one_active_request_per_subject` partial unique index.
- **AC:** AC12 *(partially — DB half)* · **Tests:** `.UT13`, `.UT90` · **Depends:** — · **Gate:** —
- **Must not decide:** the position model. `position_id` stays `text` with no foreign key until C3 (plan §4.3).
- **Surface:** `migrations/001_transfer_request.sql`
- **Done when:** migration applies and reverts; two concurrent inserts for one subject produce exactly one row; `.UT90` fails only because the API does not exist yet.

**`employee-internal-transfer.T04` — Migration: decision and execution-task tables**
- **Objective:** Create the structural tables approvals and execution will populate, with their uniqueness invariants.
- **Scope:** `transfer_decision` with `UNIQUE (request_id, stage)`; `transfer_execution_task` with `UNIQUE (request_id, function)`. Schema only.
- **AC:** AC25 *(DB half)*, AC40 *(structural prerequisite)* · **Tests:** `.UT28`, `.UT91` · **Depends:** T03 · **Gate:** —
- **Must not decide:** which stages exist (C1) or which functions are required (C8). The `stage` and `function` columns are `text`, not enums, precisely so neither policy is encoded in the schema.
- **Surface:** `migrations/002_decision_execution.sql`
- **Done when:** both constraints reject duplicates at the database level.

**`employee-internal-transfer.T05` — Migration: append-only audit**
- **Objective:** Create the audit store with immutability enforced by grant, not convention.
- **Scope:** `transfer_audit` table; `REVOKE UPDATE, DELETE ... FROM app_user`.
- **AC:** AC41 *(storage half)* · **Tests:** `.UT48` · **Depends:** — · **Gate:** —
- **Must not decide:** the retention period (OQ54, DEFERRED). Build append-only so any later answer is satisfiable; write no purge tooling.
- **Surface:** `migrations/003_audit.sql`
- **Done when:** an `UPDATE` or `DELETE` as `app_user` is rejected by the database; `.UT48` proves it.

**`employee-internal-transfer.T06` — Aggregate and repository**
- **Objective:** The only object permitted to mutate request state, with optimistic locking.
- **Scope:** `TransferRequestAggregate`, repository, `version` concurrency handling and single retry.
- **AC:** AC1 *(domain half)* · **Tests:** `.UT01`, `.UT88`, `.UT89` · **Depends:** T03 · **Gate:** —
- **Must not decide:** any transition legality — that is T07's table.
- **Surface:** `src/domain/request/`, `src/persistence/transferRequestRepository.ts`
- **Done when:** aggregate has no I/O and no framework import; a lost update is impossible under `.UT88`; lint boundary rule passes.

**`employee-internal-transfer.T07` — Workflow engine and transition table**
- **Objective:** A declared transition table plus an engine that refuses anything absent from it.
- **Scope:** Engine, guard mechanism, and the **non-approval** transitions: draft creation, submission into the first pending state, withdrawal, cancellation, and every terminal transition. Test-matrix generator.
- **AC:** AC26 · **Tests:** `.UT29`, `.UT53`–`.UT63`, state matrix · **Depends:** T01, T06 · **Gate:** —
- **Must not decide:** ⚠ **the approval stages themselves (C1).** The submission transition targets *the first pending state declared in the table*, resolved by lookup — **never a hard-coded `PENDING_RELEASING_MANAGER` literal**. See finding D5-F01.
- **Surface:** `src/domain/workflow/`
- **Done when:** every `(from, action)` outside the table returns `INVALID_STATE_TRANSITION`; the matrix generator fails the build if a declared transition has no test; no approval stage name appears outside the table.

**`employee-internal-transfer.T08` — AuditWriter**
- **Objective:** Write an audit row inside the same transaction as every state change.
- **Scope:** `AuditWriter`; wired into the transition path.
- **AC:** AC41 · **Tests:** `.UT47`, `.UT48` · **Depends:** T05, T07 · **Gate:** —
- **Must not decide:** what counts as auditable — every transition is, per constitution §3.
- **Surface:** `src/persistence/audit/`
- **Done when:** a rolled-back transition leaves no audit row; a committed one always leaves exactly one; `metadata` carries no PII.

**`employee-internal-transfer.T09` — Correlation-id middleware**
- **Objective:** One correlation identifier per request, propagated everywhere.
- **Scope:** Accept or generate `X-Correlation-Id`; propagate through async context to every module, port call and audit row.
- **AC:** — *(derived: constitution §4)* · **Tests:** `INT10` · **Depends:** — · **Gate:** —
- **Must not decide:** nothing.
- **Surface:** `src/http/middleware/correlation.ts`, `src/observability/context.ts`
- **Done when:** a single request's id appears at every hop including audit rows.

**`employee-internal-transfer.T10` — Allowlist logger and PII redaction**
- **Objective:** A logger that cannot leak a field nobody thought to forbid.
- **Scope:** Structured logger with an explicit field **allowlist**; adapter-boundary stripping of downstream PII.
- **AC:** AC42 · **Tests:** `.UT49`, `.UT50`, `.UT96`, `INT08` · **Depends:** T09 · **Gate:** —
- **Must not decide:** nothing. A denylist is explicitly rejected (ADR-0005) — it fails open.
- **Surface:** `src/observability/logger.ts`
- **Done when:** a newly added object field is absent from log output until allowlisted; `.UT96` passes with a PII-bearing downstream error.

### Phase 2 — Request lifecycle *(unblocked)*

**`employee-internal-transfer.T11` — Validation engine**
- **Objective:** A rule registry that runs every applicable rule and returns **all** failures.
- **Scope:** Engine, rule interface, registration, `details[]` assembly. No rules.
- **AC:** — *(framework for AC2–AC11)* · **Tests:** `.UT73` · **Depends:** T02 · **Gate:** —
- **Must not decide:** any rule's content.
- **Surface:** `src/domain/validation/engine.ts`
- **Done when:** four simultaneous failures return four `details[]` entries, not one; a rule may be registered without editing the engine.

**`employee-internal-transfer.T12` — Validation rules VR01, VR02, VR05, VR06, VR08, VR09**
- **Objective:** The six validation rules that require no unresolved policy.
- **Scope:** Mandatory fields; active master-data reference; no past date; reason ≤ 2000 chars; target ≠ current position; acting subject = request subject.
- **AC:** AC2, AC3, AC4, AC5, AC6, AC10, AC11 · **Tests:** `.UT02`–`.UT06`, `.UT11`, `.UT12`, `.UT64`, `.UT66`–`.UT72`, `.UT115` · **Depends:** T11, T02 · **Gate:** —
- **Must not decide:** ⚠ **VR03** (open headcount — C3) and **VR04** (effective-date lead time — C7 for payroll alignment). Neither is in scope. VR04's 15-day rule is PD08-provisional and is implemented in T16 as a **registered, replaceable** validator.
- **Surface:** `src/domain/validation/rules/`
- **Done when:** each rule is a pure function unit-tested in isolation; whitespace-only reason is treated as absent (`.UT69`).

**`employee-internal-transfer.T13` — API01 create draft**
- **Objective:** Create a draft owned by the authenticated subject.
- **Scope:** `POST /api/v1/transfer-requests`; Zod schema; `201`; presence-by-omission for `reason`.
- **AC:** AC1 · **Tests:** `.UT01`, `.UT51` · **Depends:** T06, T18 · **Gate:** —
- **Must not decide:** nothing. `hasReason` must **not** reappear (G1-F04).
- **Surface:** `src/http/routes/transferRequests.ts`, `src/application/createDraft.ts`
- **Done when:** subject comes only from the session; `409 ACTIVE_REQUEST_EXISTS` returns the existing id.

**`employee-internal-transfer.T14` — API02 amend draft**
- **Objective:** Amend a draft; refuse amendment after submission.
- **Scope:** `PATCH /api/v1/transfer-requests/{id}`; `DRAFT` only.
- **AC:** AC16 · **Tests:** `.UT19`, `.UT51` · **Depends:** T13 · **Gate:** —
- **Must not decide:** whether submitted requests are amendable — PD10 settles it as no.
- **Surface:** as T13
- **Done when:** a PATCH on any non-`DRAFT` state returns `409 IMMUTABLE_AFTER_SUBMISSION`.

**`employee-internal-transfer.T15` — Idempotency middleware**
- **Objective:** Make every state-changing endpoint safe under client retry.
- **Scope:** `idempotency_record` migration; middleware; replay on key+hash match; `409 IDEMPOTENCY_KEY_MISMATCH` on key reuse with a different body.
- **AC:** AC15 · **Tests:** `.UT17`, `.UT18`, `.UT88`, `.UT89`, `.UT108` · **Depends:** T03 · **Gate:** —
- **Must not decide:** nothing — constitution §2 states duplicate suppression is an engineering obligation and is **never** escalated as a business question.
- **Surface:** `migrations/004_idempotency.sql`, `src/http/middleware/idempotency.ts`
- **Done when:** the record and the state change commit in one transaction; a crash between them is impossible.

**`employee-internal-transfer.T16` — API03 submission**
- **Objective:** Validate and submit a draft into the first pending state.
- **Scope:** `POST .../submission`; VR01–VR09 execution; VR07 concurrency; VR04 as a **registered, replaceable** lead-time validator; transition; audit; outbox event.
- **AC:** AC12, AC13, AC14 · **Tests:** `.UT13`–`.UT18`, `.UT65`, `.UT73`, `.UT90` · **Depends:** T02, T05, T06, T07, T08, T09, T11, T12, T15 *(corrected at v1.1 per EX-02 — T05/T08/T09 were missing; AC14's audit clause requires all three)* · **Gate:** —
- **Must not decide:** ⚠ **the target state name.** Resolve the first pending state from the transition table (T07), never a literal — see D5-F01. Do **not** implement the eligibility pre-check (C2) or payroll-aligned dates (C7).
- **Surface:** `src/application/submitRequest.ts`
- **Done when:** `.UT90` passes under true concurrency; no approval stage name is hard-coded outside T07's table.

**`employee-internal-transfer.T17` — API06 withdrawal**
- **Objective:** Let the subject withdraw before the point of no return.
- **Scope:** `POST .../withdrawal`; point-of-no-return predicate on the aggregate, shared with the state machine.
- **AC:** AC27, AC28, AC29 · **Tests:** `.UT30`–`.UT33`, `.UT52`, `.UT62` · **Depends:** T07, T19 · **Gate:** —
- **Must not decide:** where the point of no return sits — PD05 places it at `APPROVED_SCHEDULED` → `IN_EXECUTION`.
- **Surface:** `src/application/withdrawRequest.ts`
- **Done when:** withdrawal from every `PENDING_*` succeeds and from `APPROVED_SCHEDULED` onward returns `409 PAST_POINT_OF_NO_RETURN`; another subject's request returns `404`.

### Phase 3 — Access and read paths *(unblocked)*

**`employee-internal-transfer.T18` — OIDC and subject derivation**
- **Objective:** Authenticate and derive the acting subject from the token only.
- **Scope:** JWKS validation; subject extraction; ignore any caller-supplied subject.
- **AC:** AC7 · **Tests:** `.UT07`, `.UT78`, `.UT79` · **Depends:** — · **Gate:** —
- **Must not decide:** nothing. If the IdP differs from the OIDC assumption (OQ60), the constitution is amended — the change stays inside this middleware.
- **Surface:** `src/http/middleware/auth.ts`
- **Done when:** body, query and header subject values are **ignored, not rejected** — rejecting leaks that the field is meaningful.

**`employee-internal-transfer.T19` — canAccess authorisation predicate**
- **Objective:** One object-level authorisation function with every read and write path as its caller.
- **Scope:** `domain/authorization/canAccess(actor, request) → visibility | none`; `none` → `404`; constant-time behaviour.
- **AC:** AC39 · **Tests:** `.UT45`, `.UT76`, `.UT77` · **Depends:** T06 · **Gate:** —
- **Must not decide:** ⚠ **who the approvers are (C1).** The predicate accepts a role-resolution input; it does not compute approver identity. Subject-ownership and HR visibility are fully specified and in scope.
- **Surface:** `src/domain/authorization/`
- **Done when:** ≥85% coverage (constitution §1); no endpoint re-derives authorisation; `.UT76` shows no timing distinction between absent and forbidden.

**`employee-internal-transfer.T20` — Field-level projection**
- **Objective:** Project the reason field and execution tasks by caller role, including nested structures.
- **Scope:** Reason decrypt-on-entitlement; key omitted otherwise; nested `timeline[].comment` scrubbing; fulfiller task scoping.
- **AC:** AC37, AC38, AC40 · **Tests:** `.UT42`–`.UT44`, `.UT46`, `.UT80`–`.UT83` · **Depends:** T19 · **Gate:** —
- **Must not decide:** ⚠ **reason visibility (OQ49).** PD09 provisionally sets HR-only; implement PD09 and mark the code with the decision reference so a Gate 1 reversal is a one-line change.
- **Surface:** `src/application/projection/`
- **Done when:** `.UT81` finds no reason text anywhere in a manager's **entire** payload; plaintext is read on exactly one code path.

**`employee-internal-transfer.T21` — Status projection**
- **Objective:** Map internal state to the employee-visible vocabulary and a pending **role**.
- **Scope:** Pure projection function over the aggregate.
- **AC:** AC36 · **Tests:** `.UT41`, `.UT84` · **Depends:** T06 · **Gate:** —
- **Must not decide:** ⚠ the display label for approval stages depends on C1's stage set; derive labels from the transition table, not a hard-coded map.
- **Surface:** `src/application/projection/status.ts`
- **Done when:** no name, email or employee number appears in any projected field.

**`employee-internal-transfer.T22` — API04 retrieval**
- **Objective:** Return one request, projected to the caller.
- **Scope:** `GET .../{id}`; composes T19, T20, T21.
- **AC:** AC36, AC37, AC38, AC39, AC40 · **Tests:** `.UT41`–`.UT46`, `.UT77`, `.UT80`–`.UT84` · **Depends:** T19, T20, T21 · **Gate:** —
- **Must not decide:** nothing.
- **Surface:** `src/http/routes/transferRequests.ts`
- **Done when:** an unrelated caller receives `404`, never `403`.

**`employee-internal-transfer.T23` — API05 listing**
- **Objective:** List the caller's own requests with stable pagination.
- **Scope:** `GET /transfer-requests`; filters; ordering by `(created_at, id)`; `pageSize` clamped to 50.
- **AC:** AC43, AC44 · **Tests:** `.UT97`–`.UT99`, `.UT109`–`.UT111`, `.UT118` · **Depends:** T22 · **Gate:** —
- **Must not decide:** nothing.
- **Surface:** as T22
- **Done when:** the same projection applies as `API04` (`.UT80`); no filter widens visibility (`.UT99`); an empty result is `200`, not `404`.

**`employee-internal-transfer.T24` — API09 reference data**
- **Objective:** Serve active master data for selection.
- **Scope:** `GET /reference/{departments|locations|positions}` via `MasterDataPort`; search, filter, pagination.
- **AC:** AC47, AC48 · **Tests:** `.UT104`–`.UT107`, `.UT116`, `.UT117` · **Depends:** T02 · **Gate:** —
- **Must not decide:** ⚠ **`available` on positions is C3-gated** — omit the field entirely rather than defaulting it. Eligibility-based filtering of lists is DEFERRED (OQ20) and out of scope.
- **Surface:** `src/http/routes/reference.ts`
- **Done when:** deactivated records are absent; an empty filtered result is `200` with `total: 0`.

**`employee-internal-transfer.T25` — Rate limiting**
- **Objective:** Apply the spec's per-endpoint limits.
- **Scope:** Redis token bucket keyed by subject + endpoint; all nine endpoints; `429`.
- **AC:** — *(derived: constitution §2; spec API01–API09)* · **Tests:** contract tests per endpoint · **Depends:** T13 · **Gate:** —
- **Must not decide:** the limits — the spec sets all nine.
- **Surface:** `src/http/middleware/rateLimit.ts`
- **Done when:** each endpoint enforces its documented limit; Redis holds counters only, never state.

### Phase 4 — Approver inbox *(seam unblocked, population gated)*

**`employee-internal-transfer.T26` — API08 contract and stage-scoped query**
- **Objective:** The inbox endpoint and repository query, with stage-scoped semantics that hold under any approval model.
- **Scope:** `GET /transfer-requests/pending-decisions`; query returns requests whose **current state awaits the caller's role**; pagination; projection.
- **AC:** AC45, AC46 · **Tests:** `.UT100`–`.UT103`, `.UT112`–`.UT114`, `.UT118` · **Depends:** T22 · **Gate:** —
- **Must not decide:** ⚠ **which approver is assigned to which request (C1).** The query takes a resolved role as input; it does not resolve it. AC45/AC46 hold under a one-manager or a two-manager model alike.
- **Surface:** `src/http/routes/pendingDecisions.ts`, `src/persistence/inboxQuery.ts`
- **Done when:** a request appears in exactly one role's inbox at any instant (`.UT112`); a decided request disappears (`.UT114`); an approver never sees their own request (`.UT113`).

**`employee-internal-transfer.T27` — Approver-role authorisation**
- **Objective:** Extend `canAccess` to the approver visibility case.
- **Scope:** Approver branch of the predicate; non-report / wrong-stage returns `404`.
- **AC:** AC39, AC45 · **Tests:** `.UT77`, `.UT86` · **Depends:** T19, T26 · **Gate:** —
- **Must not decide:** ⚠ **the approver-resolution rule (C1).** Consume a resolution result; do not compute one.
- **Surface:** `src/domain/authorization/`
- **Done when:** a manager retrieving a non-report's request receives `404`; ≥85% coverage.

**`employee-internal-transfer.T28` — Inbox UI shell and states**
- **Objective:** The approver-facing shell with empty, loading and error states.
- **Scope:** Navigation entry, list layout, three states, accessible markup. No routing logic.
- **AC:** AC55 *(inbox screens)* · **Tests:** `.UT126`, `.UT127` · **Depends:** T26 · **Gate:** —
- **Must not decide:** nothing — the shell is policy-free.
- **Surface:** `apps/portal-web/src/features/approvals/`
- **Done when:** all three states render; keyboard-operable; renders correctly against an empty inbox, which is the expected state until C1 lifts.

**`employee-internal-transfer.T29` — ⛔ Approver population and routing**
- **Objective:** Resolve which approver holds a request at each stage.
- **Scope:** *Not implementable.* Requires the approval model.
- **AC:** — *(enables AC45/AC46 to return data)* · **Tests:** — · **Depends:** T26, T38 · **Gate:** **IMPLEMENTATION** · **Condition:** **C1**
- **Must not decide:** **everything about this task is the decision.** Do not infer the releasing manager from the org hierarchy, do not derive the receiving manager from the position, do not assume a two-manager chain. Any of these would settle C1 in code.
- **Surface:** `src/domain/workflow/approverResolution.ts` — **file must not be created**
- **Done when:** C1 lifts. Until then this task is not started.

### Phase 5 — Infrastructure *(unblocked)*

**`employee-internal-transfer.T30` — Transactional outbox**
- **Objective:** Publish domain events without an external call in the request path.
- **Scope:** `outbox` migration; publisher draining to Redis; at-least-once; idempotent consumers.
- **AC:** — *(derived: constitution §3)* · **Tests:** `INT06` · **Depends:** T01, T03 · **Gate:** —
- **Must not decide:** nothing.
- **Surface:** `migrations/005_outbox.sql`, `src/persistence/outbox/`
- **Done when:** an event row and its state change commit atomically; a publisher crash loses nothing.

**`employee-internal-transfer.T31` — Notification dispatcher**
- **Objective:** Dispatch the spec's nine notification events via `NotificationPort`.
- **Scope:** Outbox consumer; templates; recipient resolution by role.
- **AC:** AC33 *(confirmation half)* · **Tests:** `.UT37`, `.UT95`, `INT08` · **Depends:** T30, T02 · **Gate:** —
- **Must not decide:** ⚠ **channels (OQ46, DEFERRED)** — dispatch through the port, which abstracts channel. ⚠ **whether a rejection notification carries the reason (OQ47, BLOCKING)** — send the rejection notification **without** the comment; carrying it would settle C-OQ47 in code.
- **Surface:** `src/application/notifications/`
- **Done when:** exactly one completion notification per journey (`.UT95`); no notification carries the reason text to a manager.

**`employee-internal-transfer.T32` — Observability**
- **Objective:** Metrics, traces and the C5 compensating control.
- **Scope:** Endpoint and transition metrics; `pending_duration_days` histogram; spans per request and port call; alert labelled *"exceeds observability threshold; no SLA is defined, see C5"*.
- **AC:** — *(derived: constitution §4; plan §13)* · **Tests:** `INT10` · **Depends:** T09 · **Gate:** —
- **Must not decide:** ⚠ **the approval SLA (C5).** The 14-day threshold is a monitoring choice and must be labelled so no operator reads it as policy.
- **Surface:** `src/observability/`
- **Done when:** the alert text names C5; correlation ids appear on every span.

### Phase 6 — Portal journey *(unblocked)*

**`employee-internal-transfer.T33` — Request form**
- **Objective:** The five-field form with master-data selection and client-side validation.
- **Scope:** Form, selection components against `API09`, field-level messages, degraded list state on reference failure.
- **AC:** AC50, AC51 · **Tests:** `.UT119`–`.UT121`, `.UT129`, `.UT130`, `.UT135`, `.UT136` · **Depends:** T24, T13 · **Gate:** —
- **Must not decide:** ⚠ nothing new — but client-side rules must **mirror** the server's, never replace them. `.UT121` asserts a bypass still fails server-side.
- **Surface:** `apps/portal-web/src/features/transfer/RequestForm.tsx`
- **Done when:** every field labelled programmatically; reference-service failure shows an explicit error, not an empty dropdown.

**`employee-internal-transfer.T34` — Active-request redirect**
- **Objective:** Show an existing active request instead of a blank form.
- **Scope:** Entry-point check; existing-request view; no route to a second request.
- **AC:** AC52 · **Tests:** `.UT122`, `.UT123`, `.UT131` · **Depends:** T33, T23 · **Gate:** —
- **Must not decide:** ⚠ one-active-request is PD07; terminal states do not block a new request (`.UT123`).
- **Surface:** `apps/portal-web/src/features/transfer/`
- **Done when:** `EXECUTION_ATTENTION` still blocks a second request; `WITHDRAWN` does not.

**`employee-internal-transfer.T35` — Status view**
- **Objective:** Show the stage and the role holding the pending action.
- **Scope:** Status display, timeline as structured content, `EXECUTION_ATTENTION` messaging.
- **AC:** AC53 · **Tests:** `.UT124`, `.UT132`, `.UT134`, `.UT136` · **Depends:** T22, T21 · **Gate:** —
- **Must not decide:** ⚠ **disclosure granularity (PD11)** — role, never a name; no downstream system or fulfiller name in the attention state.
- **Surface:** `apps/portal-web/src/features/transfer/StatusView.tsx`
- **Done when:** no personal name renders in any state; timeline is text, not an image.

**`employee-internal-transfer.T36` — My Requests list**
- **Objective:** The employee's request history with a real empty state.
- **Scope:** List, pagination, empty state with guidance.
- **AC:** AC54 · **Tests:** `.UT125`, `.UT133` · **Depends:** T23 · **Gate:** —
- **Must not decide:** nothing.
- **Surface:** `apps/portal-web/src/features/transfer/MyRequests.tsx`
- **Done when:** zero requests shows guidance, not an error or a bare empty table; all-terminal requests still render as a list.

**`employee-internal-transfer.T37` — Accessibility conformance**
- **Objective:** Keyboard and assistive-technology conformance across the journey.
- **Scope:** Focus order, labels, error announcement, colour independence, 320px viewport — across T28, T33–T36.
- **AC:** AC55 · **Tests:** `.UT126`–`.UT128`, `.UT134`–`.UT136` · **Depends:** T28, T33, T34, T35, T36 · **Gate:** —
- **Must not decide:** nothing.
- **Surface:** all portal-web feature directories
- **Done when:** the journey completes keyboard-only; two simultaneous errors are both announced; greyscale rendering preserves status meaning.

### Phase 7 — Gated

**`employee-internal-transfer.T38` — ⛔ Approval transitions and API07**
- **AC:** AC17–AC26 · **Tests:** `.UT20`–`.UT29`, `.UT85`, `.UT86`, `.UT91` · **Depends:** T07, T19 · **Gate:** **IMPLEMENTATION** · **Condition:** **C1**
- **Must not decide:** the stage set, their order, whether each rejection is terminal, or whether HR may override a manager approval. Adding approval rows to T07's transition table **is** the C1 decision.
- **Done when:** C1 lifts; then the stages become table rows and their tests are generated.

**`employee-internal-transfer.T39` — ⛔ Eligibility adapter** · **AC:** AC23, AC24 · **Gate:** IMPLEMENTATION · **Condition:** **C2**
- **Must not decide:** any criterion — tenure, probation, performance, disciplinary or notice status. There is no engineering default (DEP14).

**`employee-internal-transfer.T40` — ⛔ Requisition model and VR03** · **AC:** AC8 · **Gate:** IMPLEMENTATION · **Condition:** **C3**
- **Must not decide:** whether a position is a requisition or a role type; do not add a foreign key to `position_id`.

**`employee-internal-transfer.T41` — ⛔ Position-closure handling** · **AC:** — · **Gate:** IMPLEMENTATION · **Condition:** **C4** *(conditional on C3)*

**`employee-internal-transfer.T42` — ⛔ Payroll-aligned date validator** · **AC:** AC9 · **Gate:** IMPLEMENTATION · **Condition:** **C7**
- **Must not decide:** period alignment or cut-off behaviour. Registers as an additional validator; the 15-day rule from T16 is not modified.

**`employee-internal-transfer.T43` — ⛔ requiredTasks policy** · **AC:** AC32, AC33 · **Gate:** IMPLEMENTATION · **Condition:** **C8**
- **Must not decide:** which downstream functions are required. **A stub returning all four must not be written** — the declared function throws `NotYetSpecified` and stays that way.

**`employee-internal-transfer.T44` — ⛔ Execution evaluator** · **AC:** AC30, AC31 · **Gate:** IMPLEMENTATION · **Condition:** **C9**
- **Must not decide:** whether execution fires at approval or at the effective date.

**`employee-internal-transfer.T45` — ⛔ Downstream adapters and ADR-0006** · **AC:** AC34, AC35 · **Gate:** IMPLEMENTATION · **Condition:** **C10**
- **Must not decide:** synchronous API versus ticket queue. Ports from T02 are stable under either.

**`employee-internal-transfer.T46` — ⛔ Resignation interrupt** · **AC:** — · **Gate:** IMPLEMENTATION · **Condition:** **C6**

**`employee-internal-transfer.T47` — ⛔ Liveness sweep** · **AC:** AC49 · **Gate:** **RELEASE** · **Condition:** **C5**
- **Status:** may be implemented and validated in a controlled environment; **production activation of the approval workflow is prohibited while C5 stands.**
- **Must not decide:** escalation versus expiry versus reassignment versus auto-approval. All four are defensible; choosing is policy.

**`employee-internal-transfer.T48` — ⛔ Security and Architecture sign-off** · **Gate:** **PROCESS** · **Condition:** **C11**
- **Status:** no engineering work resolves this. §12.1 requires it because the feature touches constitution §2 and §3. Blocks Gate 2 entry.

**`employee-internal-transfer.T49` — ⛔ Independent peer review** · **Gate:** **PROCESS** · **Condition:** **C12**
- **Status:** a named non-author must complete Gate 1. Blocks production implementation.

---

## 4. Bidirectional Traceability Audit

One-directional traceability is what let G1-F01 and P-F01 survive earlier gates.
Both directions are audited here.

### Forward: Task → AC → Test → Plan component → Gate

| Check | Result |
|---|---|
| Tasks with no AC and no derived justification | **0** — 10 tasks are AC-free; each cites a constitution rule or plan section |
| Tasks with an AC but no test | **0** |
| Tasks with no plan component | **0** — all 49 map to plan §18 (§5 below) |
| Gated tasks with no gate **type** | **0** — 9 IMPLEMENTATION, 1 RELEASE, 2 PROCESS |
| Gated tasks with no `Must not decide` content | **0** |

### Inverse: AC → Task, Test → Task, Plan → Task

| Check | Result |
|---|---|
| AC with no task | **0** — all 55 assigned |
| Test cases with no task | **0** for the 136 written; the 12 blocked areas map to gated tasks |
| Plan sequencing items with no task | **0** — all 43 mapped |
| **Gated AC with an ungated implementation task** | **0 outright — but 2 partial, see D5-F02** |
| **Release-gated AC accidentally deployable** | **0** — AC49 sits only in T47, typed RELEASE; the release checklist names it |
| **Task requiring an unresolved business decision without a gate** | **0 — after D5-F01 was corrected in T07 and T16** |
| Ungated task whose `Must not decide` names a live condition | **9** — T07, T12, T16, T19, T20, T21, T24, T31, T32. **This is correct, not a defect:** an unblocked task adjacent to a gated decision must say so explicitly, or an implementer fills the gap helpfully. |

### AC → Task index

| AC | Task | AC | Task | AC | Task |
|---|---|---|---|---|---|
| AC1 | T06, T13 | AC20 | ⛔T38 | AC39 | T19, T22, T27 |
| AC2–AC6 | T12 | AC21 | ⛔T38 | AC40 | T04, T20, T22 |
| AC7 | T18 | AC22 | ⛔T38 | AC41 | T05, T08 |
| AC8 | ⛔T40 | AC23 | ⛔T39 | AC42 | T10 |
| AC9 | ⛔T42 | AC24 | ⛔T39 | AC43 | T23 |
| AC10, AC11 | T12 | AC25 | T04 + ⛔T38 | AC44 | T23 |
| AC12 | T03, T16 | AC26 | T07 | AC45 | T26, T27 |
| AC13 | T16 | AC27–AC29 | T17 | AC46 | T26 |
| AC14 | T16 | AC30, AC31 | ⛔T44 | AC47, AC48 | T24 |
| AC15 | T15 | AC32 | ⛔T43 | AC49 | ⛔T47 |
| AC16 | T14 | AC33 | T31 + ⛔T43 | AC50, AC51 | T33 |
| AC17–AC19 | ⛔T38 | AC34, AC35 | ⛔T45 | AC52 | T34 |
| | | AC36 | T21, T22 | AC53 | T35 |
| | | AC37, AC38 | T20, T22 | AC54 | T36 |
| | | | | AC55 | T28, T33, T37 |

---

## 5. Plan Sequencing → Task Mapping

43 sequencing items became 49 tasks. Neither a copy nor an expansion — each
change is justified.

### Split (one item → several tasks)

| Plan item | Tasks | Why |
|---|---|---|
| 3 — migrations | T03, T04, T05 | Three independently testable schema concerns with different invariants; `.UT48` (audit immutability) must fail independently of `.UT90` (concurrency) |
| 8 — validation | T11, T12 | The engine and the rules are independently testable; `.UT73` tests the engine's all-failures behaviour, not any rule |
| 9 — `API01`, `API02` | T13, T14 | Create and amend have different state preconditions |
| 21–24 — inbox seam | T26, T27, T28 | Contract/query, authorisation and UI are three testable boundaries — the split P-F02 required |
| 29–33 — portal | T33–T37 | Five screens, five AC, five independently verifiable outcomes |

### Merged (several items → one task)

| Plan items | Task | Why |
|---|---|---|
| 1 — three ADRs | T01 | One reviewable documentation outcome; no tests to separate |
| 2 — eight ports + doubles + contract tests | T02 | One deliverable: interfaces are meaningless without their doubles |
| 26 — outbox table + publisher + wiring | T30 | Atomicity is the point; splitting would leave an untestable half |

### Direct (one item → one task)

The remaining 27 items map 1:1.

---

## 6. Findings From Decomposition

Decomposition is itself a check. Two defects surfaced that neither Gate 1 nor
the plan review caught.

### D5-F01 — SHOULD-FIX — AC14 embeds the C1 approval model without a contingency tag

`AC14` reads: *"the request moves to `PENDING_RELEASING_MANAGER`."* Under a
one-manager approval model — a live possibility until C1 resolves — that state
does not exist. AC17–AC26 are all tagged *(contingent on PD02)*; **AC14 is not**,
and neither is the spec's employee-visible status projection table, which names
all three pending states.

The consequence is subtle: T16 (submission) is an **unblocked** task whose
acceptance criterion names a **C1-dependent** state. An implementer following
AC14 literally would hard-code the approval model into the submission path —
settling C1 in code from a task that looks entirely policy-free.

**Handled in the tasks:** T07 and T16 both require the target state to be
resolved from the transition table rather than written as a literal, and both
carry it in `Must not decide`.

**Required:** spec → v1.3 tagging AC14 and the status projection table as
contingent on PD02, so the constraint lives in the specification rather than
only in a task instruction.

### D5-F02 — SHOULD-FIX — Two AC are satisfied jointly by a gated and an ungated task

- **AC25** — the DB uniqueness half is T04 (ungated); the decision-sequencing half is T38 (C1).
- **AC33** — the confirmation-notification half is T31 (ungated); the all-required-tasks-complete half is T43 (C8).

Neither is marked partially contingent in the spec. **The Gate 2 risk is
concrete:** an AC-by-AC verification could mark AC25 and AC33 "verified" on the
strength of the ungated half alone, and record a criterion as met when half its
behaviour does not exist.

**Required:** spec → v1.3 marking both as partially contingent; **Gate 2 (D10)
must verify these two by task, not by AC.**

### Neither finding blocks D7

Both are recorded and both are handled in the task contracts. Spec v1.3 should
be issued before Gate 2, not before implementation.

---

## 7. Execution Order and Capacity

| Phase | Tasks | Gate | AC covered |
|---|---|---|---|
| 1 — Foundation and ports | T01–T10 | — | AC12ᵖ, AC26, AC41, AC42 |
| 2 — Request lifecycle | T11–T17 | — | AC1–AC6, AC10–AC16, AC27–AC29 |
| 3 — Access and read paths | T18–T25 | — | AC7, AC36–AC40, AC43, AC44, AC47, AC48 |
| 4 — Inbox seam | T26–T28 | — *(T29 gated C1)* | AC45, AC46, AC55ᵖ |
| 5 — Infrastructure | T30–T32 | — | AC33ᵖ |
| 6 — Portal journey | T33–T37 | — | AC50–AC55 |
| 7 — Gated | T38–T49 | 9 IMPL / 1 RELEASE / 2 PROCESS | AC8, AC9, AC17–AC26, AC30–AC35, AC49 |

ᵖ = partially covered in that phase.

**37 of 49 tasks are unblocked, covering 28 of 55 acceptance criteria with no
business decision required of any implementer.** The 12 gated tasks are
concentrated in one phase so that a policy meeting unblocking C1 or C2 releases
a contiguous block of work rather than scattering across the plan.

**Ordering constraint:** T18 (OIDC) must precede T13, and T19 (`canAccess`)
must precede every read path. Both are early by design — retrofitting
authorisation is how BOLA defects are born.
