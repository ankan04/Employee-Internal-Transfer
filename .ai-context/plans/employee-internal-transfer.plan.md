# Plan: Employee Internal Transfer Digital Journey

## Derived From
- `.ai-context/specs/employee-internal-transfer.spec.md` — **v0.3, Gate 1 APPROVED 2026-10-11** (`.ai-context/pr_reviews/GATE1-employee-internal-transfer-20261011-201710.md`)
- `.ai-context/BRD.md` — **v3, Gate 0 APPROVED 2026-10-11** (`.ai-context/pr_reviews/BRD-20261011-201241.md`)
- `.ai-context/change_requests/CR-20261011-payroll-before-receiving-manager.md`
- `.ai-context/constitution.md` v1.0
- `.ai-context/architecture.md`

## Status
**Draft v2.0 (2026-10-12)** — pending the Architecture Check, then tasks.

**Supersedes** plan v1.x (spec v1.3 lineage), which is preserved in git history at commit `42dee74`. That plan was derived from a spec that no longer exists; none of its gate taxonomy (C1–C12, PD-xx, VR-xx) carries over. Its matching `tasks.md` and `test_cases.md` are stale and will be regenerated from this plan.

---

## 0. Authority Statement

This plan defines **no business behaviour**. Every behaviour below traces to one of the **25 Gate 1-approved acceptance criteria**. For the **13 🔒 ACs**, the plan designs a *seam* (a port, a declared-but-empty transition slot, or a configuration point) and stops. It does not choose an answer (constitution §0.1–§0.2).

Where the plan has to make a choice that an approved AC needs but that borders on policy, the choice is listed in **§12 Plan decisions needing confirmation**. Those choices are not made silently.

---

## 1. Scope Inherited from Gate 1

### 1.1 Built now — 25 approved ACs

| Area | ACs |
|---|---|
| Creation and submission | AC-001, AC-002, AC-003, AC-004, AC-005, AC-006 |
| Tracking and visibility | AC-010, AC-011, AC-012 |
| Sequential workflow (KD-012 v3 order) | AC-020, AC-021, AC-022, AC-023, AC-024 |
| Cancellation | AC-033, AC-034, AC-035 |
| Decisions, escalation, completion | AC-040, AC-041, AC-043, AC-045, AC-046, AC-048 |
| Administration | AC-050, AC-051 |

### 1.2 Seams only — 13 🔒 ACs (not implemented)

| AC | Blocked on | Seam provided |
|---|---|---|
| AC-007 | OQ-B05 date rules | Rule slot in `SUBMISSION_RULES`; no date-policy rule registered |
| AC-008 | OQ-B06 valid combinations | Rule slot; `MasterDataPort` can carry a combination source later |
| AC-009 | OQ-B04 eligibility | `EligibilityPort` interface only; never called |
| AC-013 | OQ-B14 pending-detail visibility | Status projection exposes **role only** (the AC-011 minimum) |
| AC-025 | OQ-B17 Payroll reversal | Stage-5 reject/return sets a visible `payrollReversal: UNDECIDED` marker; no reversal job (§12 D3) |
| AC-030/031/032 | OQ-B07 edit/withdraw cutoff | No AMEND/WITHDRAW transitions after `SUBMITTED`; no `WITHDRAWN` status yet |
| AC-036 | OQ-B08 in-flight cancellation | No cancellation transition from stage 4 (Payroll) onward (§12 D2) |
| AC-042 | OQ-B10 reject/return resume | `REJECTED` and `RETURNED_FOR_INFORMATION` declare no outbound decision transitions |
| AC-044 | OQ-B01/B02 L1–L3 mapping and SLAs | `EscalationPolicyPort`; no thresholds hard-coded (FR-062) |
| AC-047 | OQ-B12 success evidence | Confirmation carries an opaque `evidenceRef`; no evidence rule enforced |
| AC-052 | OQ-B16 Super Admin extras | Admin API limited to role assignment and escalation settings |

---

## 2. Impact Analysis — Existing Code (`transfer-service/`)

`.ai-context/codegraph.sqlite` does not exist, so the analysis was done by reading every file under `transfer-service/src`, `migrations` and `test`.

| File | Verdict | Reason |
|---|---|---|
| `src/http/middleware/correlation.ts` | **Keep** | Constitution §4; unchanged |
| `src/http/middleware/auth.ts` | **Keep, extend** | Session-derived actor is correct; add role-assignment lookup (AC-050/051) |
| `src/http/middleware/idempotency.ts` | **Rework** | `UNIQUE (endpoint, resource_id)` only allows one call per resource per endpoint, which breaks draft amends and per-stage decisions. Re-key to `(subject_ref, key)` |
| `src/domain/validation/engine.ts` | **Keep** | Rule-registry engine fits; reports every failure (AC-004) |
| `src/domain/validation/rules.ts` | **Cut down** | Keep VR01 (mandatory, AC-004) and VR02 (governed active values, FR-015). **Remove** VR04 (15-day lead), VR05 (not in past), VR06 (2000-char reason), VR08 (not current position): all are OPEN business rules (OQ-B05, BRD §5.2) |
| `src/domain/workflow/stateMachine.ts` | **Rewrite** | Old status set, no approval transitions, and WITHDRAW/CANCEL from pending (both now OPEN or approval-gated) |
| `src/domain/request/transferRequest.ts` | **Rewrite** | `PAST_NO_RETURN` encodes an old policy; add requester and stages |
| `src/domain/authorization/canAccess.ts` | **Rework** | Roles `HR`/`FULFILLER` are not in the v0.3 actor set. New visibilities: SUBJECT, REQUESTER, ASSIGNEE |
| `src/application/submitRequest.ts` | **Rework** | Submit now lands on `SUBMITTED`; activation of stage 1 is a separate router step |
| `src/persistence/*` | **Extend** | Requester, stages, encrypted reason, audit trigger |
| `migrations/001–003` | **Superseded by 004+** | Forward-only (constitution §5). Drop `one_active_request_per_subject` (concurrent-request policy is OPEN, FR-019); fix SEC-01 and SEC-02 |
| `test/**` | **Regenerate** | Tests cite old AC IDs (AC1–AC55) and assert removed rules |

**Known defects carried from the old Gate 2 (constitution-driven, not business):**
- **SEC-01:** `REVOKE UPDATE, DELETE … FROM PUBLIC` does not stop the table owner. Fix: a `BEFORE UPDATE OR DELETE` trigger that raises, plus an app DB role without those grants.
- **SEC-02:** the reason is stored as plaintext. Fix: AES-256-GCM with Node `crypto`, key from the runtime secret store, `reason_key_id` for rotation.

---

## 3. Architecture Approach

A modular monolith with hexagonal layering, as today (ADR-001). New modules sit inside `transfer-service/src`:

| Module | Responsibility | ACs |
|---|---|---|
| `domain/status` | One vocabulary for statuses and stage codes; the single place to rename when OQ-B09 is decided | AC-010, AC-023 |
| `domain/workflow` | Declared transition table (KD-012 v3 order) and stage sequencing | AC-020–024 |
| `domain/request` | Aggregate: request, requester/subject, stages, cancellation | AC-001–006, AC-033–035 |
| `domain/authorization` | `canAccess`, `mayInitiateFor`, `mayAdminister` | AC-002, AC-012, AC-050/051 |
| `application/*` | Use cases: create, amend draft, submit, activate, decide, confirm update, request/decide cancellation, escalate, admin | All built ACs |
| `workers/router` | Polls the outbox; activates the next stage; dispatches downstream jobs | AC-020–022, AC-045/046 |
| `workers/downstream` | Calls the Payroll/IT adapters with timeout, retry and backoff; records terminal failure | AC-048 |
| `workers/escalation` | Periodic sweep; reassigns per `EscalationPolicyPort`; never decides | AC-043 |
| `ports/*` | `MasterDataPort` (exists), `OrgDirectoryPort`, `DownstreamUpdatePort`, `EscalationPolicyPort`, `EligibilityPort` (seam), `ClockPort` | — |
| `adapters/*` | Contract doubles for every port; real adapters wait on OQ-T02–T04 | — |
| `http/*` | REST `/api/v1`, plus admin routes under `/api/v1/admin` | — |

**Front end:** `portal-journey/` (new), a React module delivered **into** the One-Point Employee Portal. Building the portal itself is out of scope (§1.3).

**Module boundaries** are enforced by an import-rule test that walks `src/` with Node's `fs` and fails on forbidden edges (domain → adapters/http/persistence). No new dependency is needed (constitution §3).

---

## 4. Workflow Design

### 4.1 Stage order — KD-012 v3

| Seq | Stage code | Kind | Completes by |
|---|---|---|---|
| 1 | `RELEASING_MANAGER` | Approval | APPROVE |
| 2 | `RELEASING_HRBP` | Approval | APPROVE |
| 3 | `RECEIVING_HRBP` | Approval | APPROVE |
| 4 | `PAYROLL` | Action | CONFIRM_UPDATE |
| 5 | `RECEIVING_MANAGER` | Approval | APPROVE |
| 6 | `IT` | Action | CONFIRM_UPDATE |

The order is defined **once** in `domain/workflow/stages.ts`. The transition table, the status projection and AC-023's test all read from it.

### 4.2 Statuses (spec §6.1, still PROPOSED under OQ-B09)

`DRAFT`, `SUBMITTED`, `PENDING_RELEASING_MANAGER`, `PENDING_RELEASING_HRBP`, `PENDING_RECEIVING_HRBP`, `PENDING_PAYROLL`, `PENDING_RECEIVING_MANAGER`, `PENDING_IT`, `RETURNED_FOR_INFORMATION`, `REJECTED`, `CANCELLATION_REQUESTED`, `CANCELLED`, `COMPLETED`.

`WITHDRAWN` is **not** declared until OQ-B07 is decided; adding it later is an additive change.

### 4.3 Declared transitions

| From | Action | To | Actor | AC |
|---|---|---|---|---|
| DRAFT | AMEND | DRAFT | Requester | (pre-submission form edit) |
| DRAFT | SUBMIT | SUBMITTED | Requester | AC-003–006 |
| SUBMITTED | ACTIVATE | PENDING_RELEASING_MANAGER | System (router) | AC-020 |
| PENDING_{approval stage n} | APPROVE | PENDING_{stage n+1} | Assigned approver | AC-022 |
| PENDING_PAYROLL | CONFIRM_UPDATE | PENDING_RECEIVING_MANAGER | Payroll owner / adapter | AC-022 |
| PENDING_IT | CONFIRM_UPDATE | COMPLETED (only if the Payroll confirmation is also recorded) | IT owner / adapter | AC-045, AC-046 |
| PENDING_{approval stage} | REJECT | REJECTED | Assigned approver | AC-040 |
| PENDING_{approval stage} | RETURN | RETURNED_FOR_INFORMATION | Assigned approver | AC-041 |
| SUBMITTED, PENDING_{stages 1–3}, RETURNED_FOR_INFORMATION | REQUEST_CANCEL | CANCELLATION_REQUESTED | Subject | AC-033 |
| CANCELLATION_REQUESTED | APPROVE_CANCEL | CANCELLED | Cancellation approver | AC-034 |
| CANCELLATION_REQUESTED | DECLINE_CANCEL | *prior status* (stored) | Cancellation approver | AC-035 |

All other `(status, action)` pairs are refused with `409 INVALID_STATE_TRANSITION`. A generated matrix test covers every refused pair (constitution §1).

**Not declared, on purpose:** any transition out of `REJECTED` or `RETURNED_FOR_INFORMATION` other than cancellation (OQ-B10); AMEND/WITHDRAW after submission (OQ-B07); REQUEST_CANCEL from stage 4 onward (OQ-B08, §12 D2).

### 4.4 Stage records and technical failure (AC-048)

Each stage row has `state ∈ {NOT_STARTED, ACTIVE, COMPLETED, FAILED}`. A downstream technical failure sets the stage to `FAILED`. The request **status stays `PENDING_PAYROLL` or `PENDING_IT`**: never `REJECTED`, never `COMPLETED`. The failure emits a PII-free `downstream.failed` event and metric for operators.

### 4.5 Escalation (AC-043)

The sweep reads the SLA thresholds and L1/L2/L3/Super Admin targets from `EscalationPolicyPort`. With no policy configured (the production default until OQ-B01/B02), **the sweep does nothing**. Escalating changes only the stage's `assignee_ref` and `escalation_level` (audited). It never applies APPROVE.

---

## 5. Data Model

Forward-only migrations `004`–`010`. There is no release, so no production data needs migrating; the old enum is replaced through a new type.

| Migration | Change |
|---|---|
| 004 `status_v2` | New enum `transfer_status_v2` (§4.2); move `transfer_request.status` and the audit columns to it; drop the old type |
| 005 `request_v2` | Add `requester_ref` (AS-002) and `prior_status` (for a declined cancellation). Drop `one_active_request_per_subject`. Replace `reason text` with `reason_ciphertext bytea`, `reason_iv`, `reason_key_id` (SEC-02) |
| 006 `transfer_stage` | `request_id, seq, stage, state, assignee_ref, escalation_level, activated_at, completed_at, outcome, actor_ref, decision_note_ciphertext, required_information_ciphertext, responder_role, evidence_ref, payroll_reversal` |
| 007 `cancellation_request` | `id, request_id, requested_by, approver_ref, decision, decided_by, requested_at, decided_at` |
| 008 `outbox_job` | Durable jobs: `kind (ACTIVATE_NEXT, DOWNSTREAM_UPDATE), request_id, stage, attempt, next_attempt_at, state, last_error_code, correlation_id`; polled with `FOR UPDATE SKIP LOCKED` |
| 009 `audit_v2` | Add `on_behalf_of` and non-PII `before`/`after` jsonb. **Trigger** that raises on UPDATE/DELETE (SEC-01) |
| 010 `admin` | `role_assignment (subject_ref, role, granted_by, granted_at, revoked_at)`; `admin_setting (key, value jsonb, version, updated_by)`. Re-key `idempotency_record` to `PRIMARY KEY (subject_ref, key)` |

PostgreSQL stays the only system of record (ADR-002). Durable jobs live in PostgreSQL, not Redis, because constitution §4 forbids losing an accepted request.

---

## 6. API Design (`/api/v1`)

Every state-changing endpoint requires `Idempotency-Key` and carries a rate-limit decision. Errors use the existing `{ error: { code, message, details, correlationId } }` shape. A request the caller can't see returns **404**, never 403.

| Method & path | Purpose | AC | Rate limit |
|---|---|---|---|
| POST `/transfer-requests` | Create a draft for self, or on behalf (`subjectRef` in the body, authorised by `mayInitiateFor`) | AC-001, AC-002 | 20/min per actor |
| PATCH `/transfer-requests/:id` | Amend a **draft** | AC-003 | 60/min per actor |
| POST `/transfer-requests/:id/submission` | Submit | AC-003–006 | 20/min per actor |
| GET `/transfer-requests/:id` | Status, all six stages (done/current/upcoming), pending **role** | AC-006, AC-010, AC-011, AC-012 | Read: none (gateway default) |
| GET `/transfer-requests` | The caller's own requests (subject or requester) | AC-010 | Read: none |
| GET `/tasks` | The caller's active stage and cancellation tasks | AC-021 | Read: none |
| POST `/transfer-requests/:id/stages/:stage/decision` | `APPROVE` / `REJECT` / `RETURN` (+ note; for RETURN, `requiredInformation` and `responderRole`) | AC-021, AC-022, AC-040, AC-041 | 60/min per actor |
| POST `/transfer-requests/:id/stages/:stage/confirmation` | Payroll/IT update confirmed (`evidenceRef` opaque) | AC-045, AC-046 | 60/min per actor |
| POST `/transfer-requests/:id/cancellation` | Request cancellation | AC-033 | 10/min per actor |
| POST `/transfer-requests/:id/cancellation/decision` | `APPROVE` / `DECLINE` | AC-034, AC-035 | 60/min per actor |
| GET/PUT `/admin/role-assignments` | Super Admin only | AC-050, AC-051 | 30/min per actor |
| GET/PUT `/admin/settings/escalation` | Super Admin only; stores policy for `EscalationPolicyPort` | AC-050, AC-043 | 30/min per actor |

Rate limits are **technical** abuse controls, counted in Redis (caching use only, ADR-003) with the official `redis` client. If Redis is unavailable, limits fail open and log a warning; Redis is never on the correctness path.

---

## 7. Authentication & Authorisation

- **Actor** = token `sub` only (existing `auth.ts`). On-behalf creation adds a **subject** from the body. The subject is never the actor, and the request records `requester_ref = actor` (AC-002). This keeps the constitution §2 rule: the *acting* identity is never caller-supplied.
- `mayInitiateFor(actor, subjectRef)` asks `OrgDirectoryPort.isManagerOf(actor, subject)`. **Which manager relationship qualifies is OPEN** (spec §2 "which manager role", FR-013); see §12 D1.
- `canAccess` returns SUBJECT, REQUESTER, ASSIGNEE (the current stage assignee or pending cancellation approver) or NONE. NONE renders as 404 (AC-012).
- **Reason visibility (SEC-06):** decrypted for SUBJECT and REQUESTER only. Approvers don't see it until OQ-B14 is decided (§12 D4).
- **Super Admin** comes from `role_assignment` (seeded once by deployment tooling) plus the token role. It has no request visibility (OQ-B16).

---

## 8. Downstream Integration & Resilience

- `DownstreamUpdatePort.requestUpdate(stage, requestRef, correlationId)` gets a **5 s timeout** per call, **up to 5 attempts** with exponential backoff (30 s base, ×2, jitter), then `FAILED_TERMINAL`. Those values are technical and live in configuration.
- A terminal failure sets the stage to `FAILED` (AC-048). An operator re-queues through a re-run of the outbox job. There is no business-facing retry action.
- Confirmation arrives through the confirmation endpoint (manual owner) or an adapter callback that calls the same use case. Which one applies is OQ-T04.
- Contract doubles are generated from the port interfaces and pinned by contract tests (constitution §1).

---

## 9. Observability & Security Details

- A correlation ID flows through HTTP → use case → outbox → adapter (constitution §4).
- Events: `request.transitioned`, `stage.activated`, `stage.escalated`, `downstream.failed`, all PII-free (request UUID plus a non-reversible subject hash).
- No reason, note or required-information text is ever logged. Those fields are encrypted at rest, like the reason.
- `express.json({ limit: '64kb' })` caps payload size. This is a technical bound, not a reason-length rule.

---

## 10. Testing Strategy

- **Jest + ts-jest** (backend) and **Jest + React Testing Library** (`portal-journey/`). Snapshot-only tests are not allowed.
- **Every AC is tested by ID**, e.g. `employee-internal-transfer.AC-023`.
- **Transition matrix:** every declared transition and every refused `(status, action)` pair, generated from the table.
- **Coverage:** 85% per module for `domain/workflow`, `domain/request`, `domain/authorization`, `application/decide*`, `persistence/audit*`; 70% elsewhere (constitution §1). Per-module keys in `jest.config.js`, as today.
- **Integration tests** run against real PostgreSQL (existing `test/helpers/db.ts`). External systems are contract doubles only.
- **Security tests:** the audit trigger blocks UPDATE/DELETE even for the owner role (SEC-01); the reason column is unreadable plaintext (SEC-02); a body `subjectRef` never becomes the actor.

---

## 11. Constitution Check

- [x] **No new datastore.** PostgreSQL is the system of record; Redis is used only for rate-limit counters (ADR-002/003).
- [x] **Test-first.** Every task starts RED; each AC is verified by ID; transition matrix; coverage floors as in §10.
- [x] **Security.** Actor from session; object-level authorisation with 404; rate-limit decision per endpoint (§6); idempotency key on every write; reason and notes encrypted; no PII in logs; secrets from the runtime store; SEC-01/02 fixed.
- [x] **Architecture.** Express/React/REST; modular monolith with an import-rule test; adapters for every external system; declared state machine; downstream async; timeout/retry/terminal destination (§8); append-only audit for every transition.
- [x] **NFR.** Correlation IDs; PII-free events; durable outbox (no loss of an accepted request). p95 latency is measured at the gateway, which is outside this repo (release checklist).
- [x] **Versioning.** `/api/v1`; forward-only migrations; status names are contract → **ADR-004** (below).
- [x] **Dependencies.** One new runtime dependency (`redis`). Front-end tooling needs vetting at task time (React, RTL, a bundler). Everything else uses Node built-ins.

### ADR candidates
- **ADR-004:** status vocabulary is provisional under OQ-B09. `/api/v1` is marked pre-release until it's decided, so renames before the first release are not breaking.
- **ADR-005:** PostgreSQL outbox for durable jobs instead of a Redis queue.
- **ADR-006:** application-level field encryption for sensitive free text (reason, notes, required information).

---

## 12. Plan Decisions Needing Confirmation

Each of these is a minimal, reversible choice that lets an approved AC be built without deciding an open question. Each needs Architecture Check sign-off, and the business owner may override it later.

| ID | Decision | Why it's needed | Linked |
|---|---|---|---|
| D1 | On-behalf initiation allowed only where `OrgDirectoryPort.isManagerOf` is true. The adapter's definition of "manager" is supplied by org data, not chosen in code. | AC-002 needs *some* authorisation; which manager role qualifies is OPEN | Spec §2, FR-013 |
| D2 | Cancellation can't be requested once stage 4 (Payroll) has started | AC-036 / OQ-B08 cover in-flight work; since KD-012 v3, Payroll is stage 4 | AC-033, AC-036 |
| D3 | A stage-5 reject/return is allowed, records `payroll_reversal = UNDECIDED` and raises an operator event. No reversal is attempted. | AC-040 must work at every approval stage; AC-025/OQ-B17 is undecided | AC-025, ASM-004 |
| D4 | Approvers do not see the reason text | SEC-06 / OQ-B14; the narrowest choice | AC-013 |
| D5 | For RETURN, `responderRole ∈ {SUBJECT, REQUESTER}`, chosen by the approver | AC-041 requires recording a responder; who responds is OPEN | AC-041, OQ-B10 |
| D6 | Stage assignees come only from `OrgDirectoryPort.resolveAssignee(stage, request)`, never from job titles | FR-032 | AC-020–022 |

---

## 13. Explicitly Deferred

| Item | Reason |
|---|---|
| Notifications (spec §10) | OQ-B13; no approved AC |
| Edit/withdraw after submission | OQ-B07 (AC-030–032) |
| Eligibility, date rules, valid combinations | OQ-B04/B05/B06 (AC-007–009) |
| Reject/return resume and resubmission | OQ-B10 (AC-042) |
| In-flight cancellation; Payroll reversal | OQ-B08 (AC-036); OQ-B17 (AC-025) |
| Escalation thresholds and mapping values | OQ-B01/B02 (AC-044); mechanism is built, values empty |
| Delegation | OQ-B03 (FR-063) |
| Success-evidence rule | OQ-B12 (AC-047) |
| Facilities stage | OQ-B11 |
| Audit retention | OQ-B15 |
| Employee confirmation of a manager-raised request | FR-013 (no OQ-B ID in the BRD yet) |
| Real HRMS/Payroll/IT/IdP adapters | OQ-T01–T04; contract doubles only |
| NFR targets beyond the constitution | OQ-T07–T09 |

---

## 14. Sequencing (becomes `tasks.md`)

1. **Phase 0 — Baseline reset:** install dependencies and run the existing suite. Remove VR04/05/06/08 and the old status/transition code together with their tests. Add migrations 004–010. Write the SEC-01 trigger test and the SEC-02 encryption test (RED → GREEN).
2. **Phase 1 — Domain core:** status vocabulary, stage order (KD-012 v3), transition table and matrix test, aggregate with requester and stages. *(AC-020–024 domain half)*
3. **Phase 2 — Create and submit:** draft create/amend, on-behalf with `mayInitiateFor` (D1), submission to `SUBMITTED`, idempotency re-key. *(AC-001–006)*
4. **Phase 3 — Routing and decisions:** `OrgDirectoryPort`, outbox, router ACTIVATE, approve/reject/return endpoints, D3 and D5. *(AC-020–022, AC-040, AC-041)*
5. **Phase 4 — Downstream:** `DownstreamUpdatePort`, worker with retry and terminal failure, confirmation endpoint, completion rule. *(AC-045, AC-046, AC-048)*
6. **Phase 5 — Tracking and access:** status projection (six stages, role-only pending), list, tasks, `canAccess` 404 tests. *(AC-010–012)*
7. **Phase 6 — Cancellation:** request/decide, prior-status restore, D2 guard. *(AC-033–035)*
8. **Phase 7 — Escalation and administration:** `EscalationPolicyPort`, sweep worker, role-assignment and settings endpoints. *(AC-043, AC-050, AC-051)*
9. **Phase 8 — Portal journey (React):** start request (self / on behalf), status timeline, approver inbox and decisions, cancellation, Super Admin roles. RTL tests per AC.
10. **Phase 9 — Hardening:** rate limiting, import-boundary test, coverage gates, update `architecture.md` and record ADR-004–006. Then the full suite must be GREEN before Gate 2.
