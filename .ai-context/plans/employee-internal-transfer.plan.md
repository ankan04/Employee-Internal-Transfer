<!-- Deliverable 4 — Technical Plan. Authored after Gate 1 CONDITIONAL PASS
     and the v1.1 remediation, per §13. This plan describes HOW the approved
     specification is built. It defines no business behaviour. -->

# Plan: Employee Internal Transfer Digital Journey

## Derived From
- `.ai-context/specs/employee-internal-transfer.spec.md` — **Approved v1.1**
- `.ai-context/reviews/employee-internal-transfer.gate1.md` — CONDITIONAL PASS
- `.ai-context/constitution.md` v1.0
- `.ai-context/discovery/employee-internal-transfer.decision-log.md` v1.1

## Status
**Reviewed v1.1** — plan review 2026-08-30 returned CHANGES REQUESTED; all nine
required actions closed and re-validated. Derived from spec **Approved v1.2**.

### Revision History

| Version | Change | Driver |
|---|---|---|
| v1.0 | Initial plan | — |
| v1.1 | Gate taxonomy adopted; approver inbox split into unblocked seam + gated routing; ports moved to Phase 1; two AC mappings corrected; `canAccess` given a module home and the 85% coverage gate; ADR-0001 resequenced; pending metric relabelled; RPO/RTO made a release-checklist item; front-end phase re-derived from spec AC50–AC55 | Plan-review findings P-F01 – P-F07 |

---

## 0. Authority Statement

**This plan defines no business behaviour.** Every rule it implements traces to
an approved acceptance criterion. Where the specification is silent because a
decision is gated, this plan is silent too — it designs the *seam* at which the
answer will attach, and stops.

Per constitution §0, an implementation choice that would only be resolvable by
picking a business outcome is not a design decision. Three such seams appear
below (§6.3, §9, §10) and each names its gate condition rather than filling it.

---

## 1. Gate 1 Boundary Inheritance

The plan is partitioned by the Gate 1 implementation boundary. Nothing about
this partition is a technical preference; it is the review's finding, carried
forward.

### 1.1 Authorised — designed and built now

| Capability | AC | Plan section |
|---|---|---|
| Request persistence and draft lifecycle | AC1, AC16 | §5, §6.1 |
| Field validation VR01, VR02, VR05, VR06, VR08 | AC2–AC6, AC10, AC11 | §6.2 |
| Session-derived subject identity | AC7 | §7 |
| One-active-request concurrency rule | AC12, AC13 | §5.3 |
| Submission and idempotency | AC14, AC15 | §6.4 |
| Withdrawal before the point of no return | AC27–AC29 | §6.1 |
| Object-level authorisation, `404`-not-`403` | AC39 | §7.3 |
| Reason-field projection by role | AC37, AC38 | §7.4 |
| Status projection, role-not-name | AC36 | §6.5 |
| Listing, approver inbox, reference data | AC43–AC48 | §6.6 |
| Append-only audit | AC41 | §11 |
| PII containment | AC42 | §12.4 |
| Adapter **ports** (interfaces only) | — | §9.1 |

### 1.2 Gated — designed to a seam, not implemented

| Capability | AC | Gate | Seam designed in |
|---|---|---|---|
| Approval routing and decisions | AC17–AC26 | C1 | §8.3 — the transition table is data, not code |
| Eligibility evaluation | AC23, AC24 | C2 | §9.2 — a port with no rules behind it |
| Position/requisition model | AC8 | C3 | §5.2 — a nullable column and a validation hook |
| Position-closure handling | — | C4 | not designed; no seam needed until C3 |
| SLA, reminders, escalation, **liveness** | AC49 | **C5 (release gate)** | §10.3 |
| Resignation interrupt | — | C6 | §10.3 — same scheduled-evaluation seam |
| Payroll-aligned effective date | AC9 | C7 | §6.2 — one pluggable validator |
| Downstream task-requirement conditions | AC32, AC33 | C8 | §9.3 — a policy function returning a required-set |
| Execution trigger timing | AC30, AC31 | C9 | §10 |
| Downstream adapter implementations | AC34, AC35 | C10 | §9.1 — ports stable under either answer |

### 1.3 Gate taxonomy — implementation gate vs release gate

Adopted from the plan review §2 and **binding on every task in D5**. "Gated"
means two materially different things, and reading a release gate as
"don't build" would defer work unnecessarily.

| Gate type | Meaning | Conditions |
|---|---|---|
| **Implementation gate** | The policy is undecided, so the behaviour cannot be written. Seams, contracts, writable tests and all surrounding infrastructure **may and should** be built. | C1, C2, C3, C4, C6, C7, C8, C9, C10 |
| **Release gate** | The behaviour may be implemented and validated; the feature must not reach production users while the condition stands. | **C5** |
| **Process gate** | Neither implementation nor release is complete until a named human acts. | C11 (Security/Architecture sign-off), C12 (independent peer review) |

Under C5 specifically: approval infrastructure, the transition table and engine,
the tests, and controlled-environment validation are all permitted; the
production, user-facing approval workflow is not.

### 1.4 The design consequence

Every gated capability is reachable through a **named extension point**, so that
lifting a condition is an implementation task against a stable interface rather
than a redesign. This is the plan's central organising principle and the reason
half a specification can be built while the other half awaits policy.

---

## 2. Architecture Approach

**Modular monolith**, per constitution §3. A single deployable Node/Express
service backed by PostgreSQL, with Redis for queueing and caching, and a React
front end in the existing One-Point Employee Portal shell.

**Why not services.** The journey has one transactional core — the request and
its state — and four integrations. Splitting the core across services would put
a network boundary inside a state machine that must not lose a transition. The
integrations are already isolated behind adapters (§9.1); those are the seams
that would become services if scale ever demanded it, and extraction is
recorded as **ADR-C2** rather than pre-emptively performed.

**No new service and no new datastore is introduced.** Constitution §3 is
satisfied without an ADR on that count.

### 2.1 Module map

```text
apps/
  portal-web/                    React — journey UI, status view, approver inbox
  transfer-service/              Node/Express — the deployable

transfer-service/src/
  http/                          Express routers, request/response mapping only
    routes/                      One router per API## group
    middleware/                  auth, correlation-id, idempotency, rate-limit
  domain/                        ← no I/O, no framework imports
    request/                     TransferRequest aggregate, invariants
    workflow/                    state machine, transition table
    validation/                  VR01–VR12 rules
    authorization/               canAccess predicate — §7.3  ← 85% coverage gate
    policy/                      ⛔ gated seams: eligibility, task-requirement
  application/                   use-cases; orchestrates domain + ports
  ports/                         interfaces the domain owns
    HrmsPort, PayrollPort, AccessPort, FacilitiesPort,
    EligibilityPort, NotificationPort, MasterDataPort, ClockPort
  adapters/                      implementations of ports (⛔ mostly gated)
  persistence/                   repositories, migrations, outbox
  scheduling/                    execution evaluator
  observability/                 logging, metrics, tracing, PII redaction
```

**Boundary enforcement is mechanical, not cultural.** ESLint
`no-restricted-imports` forbids: `domain/*` importing from `adapters/*`,
`http/*` or any npm client library; `http/*` importing from `persistence/*`.
A violation fails the build, not the review.

**Rationale.** `domain/` contains every acceptance criterion's logic and no I/O,
so AC-level tests run without a database, HTTP server or network. That is what
makes 118 test cases fast enough to run on every commit — a precondition for
test-first to survive contact with a deadline.

---

## 3. Component Design

| Component | Responsibility | Depends on |
|---|---|---|
| `TransferRequestAggregate` | Owns request state and invariants; the only thing that may mutate status | workflow, validation |
| `WorkflowEngine` | Validates and applies transitions against a declared table | — |
| `ValidationEngine` | Executes VR01–VR12; returns **all** failures, never the first | MasterDataPort |
| `SubmissionUseCase` | Idempotent submit: validate → transition → audit → outbox | aggregate, repos |
| `DecisionUseCase` | ⛔ C1 — records an approver decision | aggregate, workflow |
| `WithdrawalUseCase` | Withdraw before the point of no return | aggregate |
| `QueryService` | Read projections; enforces per-role field visibility | repos |
| `ExecutionEvaluator` | ⛔ C9 — daily sweep; starts execution at the effective date | repos, ClockPort |
| `TaskOrchestrator` | ⛔ C8/C10 — raises and tracks downstream tasks | ports |
| `AuditWriter` | Append-only; called inside the transition transaction | repos |
| `OutboxPublisher` | Drains the outbox to Redis; at-least-once | Redis |
| `NotificationDispatcher` | Consumes events, renders, dispatches | NotificationPort |

---

## 4. Data Model

PostgreSQL. Forward-only migrations, one per task.

### 4.1 Schema

```sql
CREATE TYPE transfer_status AS ENUM (
  'DRAFT','PENDING_RELEASING_MANAGER','PENDING_RECEIVING_MANAGER',
  'PENDING_HR_VALIDATION','APPROVED_SCHEDULED','IN_EXECUTION',
  'EXECUTION_ATTENTION','COMPLETED','REJECTED','WITHDRAWN','CANCELLED'
);

CREATE TABLE transfer_request (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_ref         text        NOT NULL,   -- opaque; never a name or number
  status              transfer_status NOT NULL DEFAULT 'DRAFT',
  department_id       text,
  location_id         text,
  position_id         text,
  effective_date      date,
  reason_ciphertext   bytea,                  -- envelope-encrypted; see §12.3
  reason_present      boolean     NOT NULL DEFAULT false,
  created_at          timestamptz NOT NULL DEFAULT now(),
  submitted_at        timestamptz,
  terminal_at         timestamptz,
  version             integer     NOT NULL DEFAULT 0   -- optimistic lock
);

-- AC12 enforced by the database, not only by application logic.
CREATE UNIQUE INDEX one_active_request_per_subject
  ON transfer_request (subject_ref)
  WHERE status NOT IN ('COMPLETED','REJECTED','WITHDRAWN','CANCELLED');

CREATE TABLE transfer_decision (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id   uuid NOT NULL REFERENCES transfer_request(id),
  stage        text NOT NULL,          -- derived by the system, never supplied
  actor_ref    text NOT NULL,
  outcome      text NOT NULL CHECK (outcome IN ('APPROVE','REJECT')),
  comment      text,
  decided_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, stage)            -- one decision per stage, ever
);

CREATE TABLE transfer_execution_task (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id    uuid NOT NULL REFERENCES transfer_request(id),
  function      text NOT NULL,        -- HRMS | PAYROLL | ACCESS | FACILITIES
  state         text NOT NULL,        -- PENDING|IN_PROGRESS|CLOSED|FAILED|NOT_REQUIRED
  attempt_count integer NOT NULL DEFAULT 0,
  external_ref  text,                 -- ITSM ticket id, if ticket-based (C10)
  failure_code  text,
  raised_at     timestamptz,
  closed_at     timestamptz,
  UNIQUE (request_id, function)
);

CREATE TABLE transfer_audit (
  id             bigserial PRIMARY KEY,
  request_id     uuid NOT NULL,
  actor_ref      text NOT NULL,
  action         text NOT NULL,
  from_status    transfer_status,
  to_status      transfer_status,
  correlation_id uuid NOT NULL,
  occurred_at    timestamptz NOT NULL DEFAULT now(),
  metadata       jsonb NOT NULL DEFAULT '{}'::jsonb   -- never PII
);
REVOKE UPDATE, DELETE ON transfer_audit FROM app_user;   -- AC41, .UT48

CREATE TABLE idempotency_record (
  key           text PRIMARY KEY,
  subject_ref   text NOT NULL,
  endpoint      text NOT NULL,
  request_hash  text NOT NULL,
  response_body jsonb NOT NULL,
  status_code   integer NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE outbox (
  id            bigserial PRIMARY KEY,
  request_id    uuid NOT NULL,
  event_type    text NOT NULL,
  payload       jsonb NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  published_at  timestamptz
);
```

### 4.2 Four design decisions worth defending

**`one_active_request_per_subject` as a partial unique index.** AC12 could be
enforced by a read-then-write in the application, which loses under concurrency
(`.UT90` tests exactly this race). A partial unique index makes the invariant
unfalsifiable regardless of how many requests arrive simultaneously. The
application still checks first, to return `409 ACTIVE_REQUEST_EXISTS` with the
existing id rather than a constraint-violation error.

**`UNIQUE (request_id, stage)` on decisions.** Makes AC25 and `.UT91` — a second
decision at the same stage — structurally impossible rather than
defensively coded.

**`REVOKE UPDATE, DELETE` on the audit table.** Constitution §3 requires
append-only audit. Enforcing it with a grant means `.UT48` tests a database
guarantee, not a code convention that a future refactor could quietly drop.

**`reason_ciphertext` + `reason_present`.** The constitution classifies the
reason as sensitive. Storing it encrypted means a database dump does not
disclose it; the separate boolean lets list and projection queries answer
"is there a reason" without decrypting, so the plaintext is touched only on the
one path (§7.4) that is entitled to it.

### 4.3 Gated column

`position_id` is `text` and unconstrained. Under C3-requisition it becomes a
foreign key to a requisition projection with headcount; under C3-role-type it
stays a role identifier. **The column is deliberately weakly typed until C3
lifts** — the alternative is a migration that must be reversed.

---

## 5. API Design

Contracts are owned by the spec (`API01`–`API09`) and **not restated here**.
Plan-level decisions only:

| Concern | Decision |
|---|---|
| Versioning | URL-versioned `/api/v1`, per constitution §5 |
| Validation | Zod schemas generated from the spec's payload shapes; schema failure → `400`, business-rule failure → `422` |
| Error shape | Single middleware renders the spec's error envelope; no route builds one by hand |
| Correlation | `X-Correlation-Id` accepted or generated; propagated to every port call and audit row |
| Idempotency | Middleware, not per-route code — §6.4 |
| Rate limiting | Redis token bucket keyed by subject + endpoint, using the spec's per-endpoint limits |
| Pagination | `page`/`pageSize`, clamped to 50 (`.UT118`), stable ordering by `(created_at, id)` (`.UT111`) |

---

## 6. Behaviour Design

### 6.1 Draft lifecycle
Create → amend → submit or withdraw. `PATCH` permitted only in `DRAFT` (AC16).
Withdrawal permitted from `DRAFT` and every `PENDING_*` state, refused at or past
`APPROVED_SCHEDULED` (AC28) — the point-of-no-return check is a single predicate
on the aggregate, used by both the endpoint and the state machine.

### 6.2 Validation
`ValidationEngine` runs every applicable rule and returns **all** failures
(`.UT73` asserts four failures reported together, not one). Rules are
independent functions registered in a table.

**C7 seam:** `VR04` is registered as `effectiveDateLeadTime`. The payroll
alignment rule attaches as an additional registered validator when C7 lifts —
no change to the engine, the endpoint, or any other rule.

### 6.3 ⛔ Eligibility — C2 seam
`EligibilityPort` is defined now with `evaluate(subjectRef, target) → Eligible |
Ineligible(codes[])`. No implementation is written. The `PENDING_HR_VALIDATION`
state exists; the transition into it is C1-gated; the automated pre-check is
C2-gated. **The port's shape is safe to fix now because it does not encode the
criteria** — only that criteria exist and produce codes rather than reasons.

### 6.4 Idempotency
Middleware on every state-changing route. On a request with `Idempotency-Key`:
look up the key; if present and `request_hash` matches, replay the stored
response (AC15); if present and the hash differs, `409
IDEMPOTENCY_KEY_MISMATCH` (G1-F06); if absent, execute inside a transaction that
writes the idempotency record and the state change **together**, so a crash
mid-write cannot leave one without the other.

### 6.5 Status projection
`QueryService` maps internal status to the spec's employee-visible vocabulary and
resolves `pendingWith` to a **role**, never a person (AC36). The projection is a
pure function over the aggregate, unit-tested without HTTP (`.UT41`, `.UT84`).

### 6.6 Listing, inbox, reference data
Three read paths, all subject to the same authorisation predicate as `API04`
(`.UT80` asserts projection is not endpoint-specific). The approver inbox is
**stage-scoped**: it queries requests whose current state awaits the caller's
role, so a request appears in exactly one inbox at any instant (`.UT112`).

---

## 7. Authentication and Authorisation

### 7.1 Authentication
SSO/OIDC bearer tokens validated against the IdP's JWKS. **Pending confirmation
per constitution §6 (OQ60)** — if the mechanism differs, the change is confined
to one middleware.

### 7.2 Subject derivation
The acting subject comes from the validated token, always. Request bodies,
query parameters and headers naming a subject are **ignored, not rejected**
(AC7, `.UT78`, `.UT79`) — rejecting would leak that the field is meaningful.

### 7.3 Object-level authorisation
A single `canAccess(actor, request) → visibility | none` function, called by
every read and write path. `none` produces `404`, never `403` (AC39,
constitution §2). Enumeration resistance is tested by `.UT76`, including the
timing requirement.

**Why one function.** BOLA/IDOR defects arise when authorisation is re-derived
per endpoint. One predicate, one place, nine callers.

### 7.4 Field-level projection
`canAccess` returns a visibility level that determines whether `reason` is
decrypted and included. The plaintext is read on exactly one code path. `.UT81`
asserts the reason is absent from a manager's **entire** payload including
`timeline[].comment` — so the projection is applied to nested structures, not
only the top level.

---

## 8. Workflow and State Management

### 8.1 Declared transition table
Transitions live in data, not in branching code:

```ts
// domain/workflow/transitions.ts
{ from: 'DRAFT', action: 'SUBMIT', to: 'PENDING_RELEASING_MANAGER', guard: 'allValidationsPass' }
```

Any `(from, action)` absent from the table is refused with
`409 INVALID_STATE_TRANSITION`. The test_cases state matrix (66 cells) is
generated against this table, so a transition added without a test fails the
build.

### 8.2 Concurrency
Optimistic locking on `version`. A losing writer retries once, then returns
`409`. Prevents the lost-update in `.UT91`.

### 8.3 ⛔ Approval routing — C1 seam
The transition table **is** the approval model. Under C1-two-manager it holds
three pending stages; under C1-one-manager, two. Changing the model changes a
data structure and its generated tests — not the engine, the endpoint, the
aggregate or the projection.

**This is the single most valuable structural decision in the plan**, because C1
is the most likely condition to resolve against the current assumption.

---

## 9. Downstream Integration

### 9.1 Ports — authorised now
`HrmsPort`, `PayrollPort`, `AccessPort`, `FacilitiesPort` defined by what the
domain needs, not by any vendor's shape (constitution §3). **Ports are stable
under either answer to C10** — a port says *"apply this org change"*, and whether
that becomes an HTTP call or an ITSM ticket is the adapter's concern.

Contract tests and in-memory doubles are written now (constitution §1); real
adapters are C10-gated.

### 9.2 ⛔ Eligibility port — C2
Defined; unimplemented. See §6.3.

### 9.3 ⛔ Task-requirement policy — C8 seam
`requiredTasks(request) → Set<Function>` is a single pure function.
Today it cannot be written: "may need to be updated" states a conditional
without its condition. **A stub returning all four functions is not written
either** — that would be inventing the policy, which constitution §0 forbids.
The function is declared and throws `NotYetSpecified`, so any attempt to run
gated execution fails loudly rather than silently transferring someone.

---

## 10. Scheduling and Execution

### 10.1 ⛔ Execution evaluator — C9
A single scheduled job sweeps `APPROVED_SCHEDULED` requests at least once per
calendar day (AC30) and starts execution on the first evaluation on or after the
effective date, guaranteeing start within 24 hours (AC31).

**Mechanism:** a Redis-backed repeatable job with a database advisory lock, so
multiple instances do not double-execute. Chosen over cron-per-instance because
the guarantee AC31 states is *at-least-once within 24h*, and duplicate execution
would double-write to HRMS.

### 10.2 Ordering
HRMS first, alone (AC31). On success, the remaining required tasks are raised in
parallel with no ordering between them (AC32).

### 10.3 ⛔ Liveness sweep — C5 / C6 seam
The same daily evaluator is the natural home for approver-inaction handling
(C5) and resignation interrupts (C6). **The sweep is designed to accept
additional evaluators; none is written.**

**C5 is a release gate, not an implementation gate** (spec, Liveness Invariant).
This plan therefore carries a release precondition: *the approval path must not
be enabled for real users while a request can enter a state it cannot leave.*
That is recorded in §17 and must appear in the release checklist.

---

## 11. Audit

`AuditWriter` is called **inside** the same transaction as the state change, so
a transition cannot exist without its audit row (AC41). Append-only is enforced
by grant (§4.2), not convention. `metadata` carries codes and identifiers only,
never PII — enforced by the same redaction allowlist as logging (§12.4).

---

## 12. Security Design

### 12.1 Threats considered
| Threat | Control | Verified by |
|---|---|---|
| BOLA/IDOR on request id | Single `canAccess`; `404` not `403` | `.UT45`, `.UT76`, `.UT77` |
| Privilege escalation via subject spoofing | Subject from token only | `.UT07`, `.UT78`, `.UT79` |
| Self-approval | `VR11` + `UNIQUE(request_id, stage)` | `.UT24`, `.UT85` |
| Enumeration | Uniform `404`, uniform timing | `.UT76` |
| Sensitive-data disclosure (reason) | Encryption at rest + single decrypt path + nested projection | `.UT81`, `.UT82` |
| PII leakage to logs | Redaction allowlist (§12.4) | `.UT49`, `.UT50`, `.UT96`, `INT08` |
| Injection | Parameterised queries only; no string-built SQL | SAST |
| Duplicate/replay | Idempotency middleware | `.UT17`, `.UT88`, `.UT108` |
| API abuse | Per-endpoint Redis rate limits from the spec | contract tests |
| Untrusted downstream payloads | Adapter-boundary schema validation before entering the domain | `.UT96` |
| Secret exposure | Runtime secret store; no `.env` in any repo | pipeline scan |

### 12.2 CSRF/CORS
Bearer tokens in the `Authorization` header, no cookie-based session ⇒ CSRF is
not applicable. CORS allowlists the portal origin only.

### 12.3 Encryption
Envelope encryption for `reason_ciphertext` with a key from the runtime secret
store. In transit: TLS 1.2+ everywhere including adapter calls.

### 12.4 PII redaction
A structured logger with an **allowlist**, not a denylist: only explicitly
permitted fields are serialised. A new field is invisible to logs until someone
adds it deliberately. `.UT49` and `INT08` assert the property end to end.

**Denylist rejected on purpose:** it fails open. The first engineer to add
`employeeName` to a log context leaks it, and no test catches a field nobody
thought to forbid.

---

## 13. Observability

| Signal | Design |
|---|---|
| Correlation | Generated or accepted at the edge; carried through every module, port and audit row; asserted by `INT10` |
| Logs | Structured JSON, allowlisted fields, correlation id on every line |
| Metrics | Requests by endpoint/status; transitions by from→to; task outcomes by function; queue depth and age; **`pending_duration_days` histogram over `PENDING_*` requests** |
| Traces | Span per request, child span per port call |
| Alerts | Any request in `EXECUTION_ATTENTION` > 24h; outbox lag > 5 min; **`pending_duration_days` > 14 — labelled "exceeds observability threshold; no SLA is defined, see condition C5"** |

**`pending_duration_days` is the compensating control for C5.** It cannot fix the
liveness gap, but it makes the gap *visible* rather than silent, so a stuck
request surfaces on a dashboard instead of in a complaint.

The alert label is deliberate (P-F07): an operator seeing a bare "pending > 14
days" alert would reasonably infer that 14 days is the SLA — which is precisely
the policy C5 has not decided. The threshold is a monitoring choice within
engineering's authority; it is not, and must not be read as, an approval SLA.

---

## 14. Failure Handling and Resilience

| Failure | Behaviour |
|---|---|
| Master data unavailable at draft | Draft creation still permitted; selection lists degrade with an explicit error |
| Eligibility unavailable at submit | Retryable error; no partial request created |
| DB write fails mid-transition | Transaction rolls back; no audit row, no state change, no outbox row |
| Outbox publish fails | Row stays unpublished; publisher retries; at-least-once, consumers idempotent |
| Downstream 5xx | Bounded retry, exponential backoff with jitter, per constitution §3 |
| Downstream timeout | Explicit per-adapter timeout; retries bounded; then terminal (AC35) |
| Terminal downstream failure | Task `FAILED`, request → `EXECUTION_ATTENTION`, remediation task to HR, **no reversal** (AC34) |
| Duplicate downstream effect | Adapters carry an idempotency token so a retry after an ambiguous timeout does not double-apply (`.UT93`) |

**No unbounded retry exists anywhere**; every failure path has a named terminal
destination (constitution §3).

---

## 15. Constitution Check

Every rule, explicitly. Silence on a rule is a gap, not a pass (§13).

| Constitution rule | Compliance |
|---|---|
| §0 no business decision in code | ✅ Three gated seams (§6.3, §9.3, §10.3) declare and throw rather than default. §9.3 explicitly refuses a plausible stub. |
| §1 test-first, Red before Green | ✅ 118 cases exist; task sequencing (§18) makes each task's tests precede its implementation |
| §1 Jest / RTL, no logic snapshot tests | ✅ |
| §1 85% coverage on state/authz/audit modules | ✅ `domain/` (including `domain/authorization/`, the home of `canAccess`) and `persistence/audit` gated at 85% in CI; 70% elsewhere. Placement fixed at v1.1 per P-F05 — `canAccess` is the most security-critical function in the design and must not sit under the 70% floor |
| §1 every transition tested incl. rejected | ✅ Matrix generated from the transition table (§8.1); untested transition fails the build |
| §1 contract doubles, not live systems | ✅ §9.1 |
| §2 no PII in logs at any level | ✅ Allowlist logger (§12.4) |
| §2 reason treated as sensitive | ✅ Encrypted at rest, single decrypt path, nested projection (§7.4) |
| §2 actor identity from session | ✅ §7.2 |
| §2 server-side authorisation, per object | ✅ §7.3, one predicate |
| §2 `404` not `403` | ✅ §7.3 |
| §2 rate-limit decision per endpoint | ✅ Spec carries all nine; §5 implements them |
| §2 idempotency on state-changing endpoints | ✅ §6.4 |
| §2 secrets from runtime store | ✅ §12.3 |
| §2 dependencies vetted, built-ins preferred | ✅ `crypto.randomUUID` for ids; new deps listed §16 |
| §2 external content untrusted | ✅ Adapter-boundary validation (§12.1) |
| §3 approved runtime and datastores | ✅ Node/Express, React, PostgreSQL, Redis. **No new datastore ⇒ no ADR required** |
| §3 Redis never system of record | ✅ Redis holds queues, rate-limit counters and cache only; all state in PostgreSQL |
| §3 modular monolith, enforced boundaries | ✅ §2.1, lint-enforced |
| §3 adapter-mediated integration | ✅ §9.1; no vendor shape in the domain |
| §3 persisted, explicit, inspectable workflow | ✅ §8.1; invalid transitions refused |
| §3 async downstream, none in request path | ✅ Outbox → queue → worker |
| §3 timeout, bounded retry, terminal destination | ✅ §14 |
| §3 append-only audit | ✅ §11, grant-enforced |
| §4 p95 latency targets | ✅ Read paths are single-table indexed queries; no downstream call in any request path |
| §4 availability; no loss of a submitted request | ✅ Durable-on-commit; outbox survives worker failure |
| §4 RPO 15m / RTO 2h | ✅ PITR + 15-minute WAL archiving. **Owner: Platform. Verified by a restore drill, recorded as a release-checklist item — not by assertion** (plan review §4 flagged the original wording as a compliance claim with no task and no owner) |
| §4 correlation id propagated | ✅ §13 |
| §5 URL + semantic versioning | ✅ §5 |
| §5 forward-only migrations | ✅ §4 |
| §5 states are public contract | ✅ Enum change = breaking change; §17 |

**No rule is unaddressed. No rule is violated. No ADR is required for a
constitution exception** — the ADR candidates in §16 are architectural
significance, not exceptions.

---

## 16. ADR Candidates

Per §13, a decision is significant if reversing it costs more than a day.

| ID | Decision | Why significant |
|---|---|---|
| **ADR-0001** | In-service persisted state machine rather than a BPM engine | Reversal rewrites the workflow core. Resolves discovery OQ61. **Write before the first workflow task.** |
| **ADR-0002** | Transactional outbox for downstream dispatch | Alternative (direct publish) risks losing a transition on crash; reversal touches every use case |
| **ADR-0003** | Modular monolith over services, with adapters as future extraction seams | Records *why* not services and what would change the answer |
| **ADR-0004** | Reason field encrypted at rest with a single decrypt path | Privacy-relevant; reversal requires migration and re-review |
| **ADR-0005** | Allowlist logging over denylist redaction | Fails closed; costs developer friction. Worth recording so it is not "simplified" later |
| **ADR-0006** | ⛔ Downstream integration style | **Cannot be written until C10.** Recorded as a placeholder so the gap is visible |

New dependencies proposed: `zod` (schema validation), `pg`, `bullmq` (Redis
queue), `pino` (structured logging), `jose` (JWKS/JWT). All maintained,
high-adoption, no crypto reimplementation. Ids use built-in
`crypto.randomUUID` per constitution §2.

---

## 17. Explicitly Deferred

| Deferred | Reason |
|---|---|
| Real downstream adapters | C10 unresolved; ports and doubles built instead |
| Eligibility rules | C2 — no criteria exist |
| Requisition/vacancy model | C3 — column weakly typed until resolved |
| SLA, reminders, escalation, delegation, **liveness** | **C5 — release gate**, see below |
| Resignation interrupt | C6 |
| Payroll-aligned date validation | C7 — validator slot reserved |
| Task-requirement policy | C8 — function declared, throws |
| Execution scheduler | C9 — mechanism designed, not built |
| Service extraction | Not needed at this scale (ADR-0003) |
| Multi-level and threshold-based approvals | discovery OQ04, deferred |
| Confidential transfers bypassing the releasing manager | discovery OQ51 — **known limitation HR must be told before rollout** |
| Audit purge tooling | OQ54 — retention undecided; append-only store satisfies any answer |

### Release precondition carried from §10.3

**The approval path must not be enabled for real users while C5 is open.** A
production request that can never complete is a support burden and, for an
employee awaiting a career move, a real harm. The 14-day pending alert (§13)
makes the gap visible but does not close it. This must appear in the release
checklist, not only in this plan.

---

## 18. Sequencing

Unblocked work first, deliberately — so delivery is not held hostage to a policy
meeting. Each item becomes one or more tasks in
`employee-internal-transfer.tasks.md` (D5). Every item carries its AC and, where
applicable, its gate **and gate type** (§1.3).

### Phase 1 — Foundation and ports (unblocked)
1. **ADR-0001** (in-service state machine), **ADR-0002** (outbox), **ADR-0005** (allowlist logging) — *written before the code they justify (P-F06)*
2. Port interfaces + in-memory doubles + contract tests — `HrmsPort`, `PayrollPort`, `AccessPort`, `FacilitiesPort`, `EligibilityPort`, `NotificationPort`, `MasterDataPort`, `ClockPort` — *moved from Phase 4 (P-F03): later items depend on these*
3. Migrations: `transfer_request`, partial unique index, `transfer_audit` with `REVOKE`
4. `TransferRequestAggregate` + repository; optimistic locking
5. Workflow engine + declared transition table *(the table's contents for approval stages are C1-gated; the engine is not)*
6. `AuditWriter` inside the transition transaction *(AC41)*
7. Correlation-id middleware; allowlist logger *(AC42)*

### Phase 2 — Request lifecycle (unblocked)
8. Validation engine + VR01, VR02, VR05, VR06, VR08, VR09 *(AC2–AC6, AC10, AC11)*
9. `API01`, `API02` — draft create and amend *(AC1, AC16)*
10. Idempotency middleware + `idempotency_record` *(AC15, UT108)*
11. `API03` — submission, VR07 concurrency *(AC12, AC13, AC14)*
12. `API06` — withdrawal, point-of-no-return predicate *(AC27, AC28, AC29)*

### Phase 3 — Access and read paths (unblocked)
13. OIDC middleware; subject derivation *(AC7)*
14. `domain/authorization/canAccess`; `404`-not-`403` *(AC39)* — *85% coverage gate (P-F05)*
15. Field projection incl. nested reason handling *(AC37, AC38)*
16. Status projection, role-not-name *(AC36)*
17. `API04` — retrieval *(AC36, AC37, AC38, AC39)* — *mapping corrected (P-F04)*
18. `API05` — listing *(AC43, AC44)*
19. `API09` — reference data *(AC47, AC48)* — *depends on item 2*
20. Rate limiting across all endpoints *(constitution §2)*

### Phase 4 — Approver inbox seam (unblocked; population gated)
21. `API08` contract, repository query, stage-scoped semantics, pagination *(AC45, AC46)*
22. Approver-role authorisation via `canAccess` *(AC39)*
23. Inbox empty, loading and error states
24. Inbox UI shell and navigation
25. ⛔ **Approver population and routing rules — C1, implementation gate**

> **P-F02.** Items 21–24 are unblocked: AC45 and AC46 describe stage-scoped
> inbox semantics that hold under *any* approval model. Only *which approver
> sees which request* depends on C1. The task instruction is: **implement the
> approver-inbox technical seam and non-policy behaviour; do not implement
> approver-selection or routing rules until C1 is resolved.** This avoids
> over-blocking on one side and policy invention on the other.

### Phase 5 — Infrastructure (unblocked)
26. Outbox table, publisher, queue wiring *(constitution §3)*
27. Notification dispatcher against `NotificationPort` *(spec Notifications)*
28. Observability: metrics, traces, `pending_duration_days` *(constitution §4)*

### Phase 6 — Portal journey (unblocked)
29. Request form with master-data selection *(AC50, AC51)* — *re-derived from spec v1.2 (P-F01); previously mapped to server-side AC2–AC6, which a form does not satisfy (P-F04)*
30. Active-request redirect *(AC52)*
31. Status view, role-not-name *(AC53)*
32. My Requests list and empty state *(AC54)*
33. Accessibility conformance across the journey *(AC55)*

### Phase 7 — ⛔ Gated by policy
| # | Item | AC | Gate | Type |
|---|---|---|---|---|
| 34 | Approval transitions + `API07` decisions | AC17–AC26 | C1 | Implementation |
| 35 | Eligibility adapter | AC23, AC24 | C2 | Implementation |
| 36 | Requisition model + VR03 | AC8 | C3 | Implementation |
| 37 | Position-closure handling | — | C4 | Implementation |
| 38 | Payroll-aligned date validator | AC9 | C7 | Implementation |
| 39 | `requiredTasks` policy | AC32, AC33 | C8 | Implementation |
| 40 | Execution evaluator | AC30, AC31 | C9 | Implementation |
| 41 | Downstream adapters + ADR-0006 | AC34, AC35 | C10 | Implementation |
| 42 | Resignation interrupt | — | C6 | Implementation |
| 43 | Liveness sweep | AC49 | **C5** | **Release** |

Phase 7 items may be planned and their tests written where writable, but not
implemented, until their condition lifts. **Item 43 differs**: under a release
gate the work may be built and validated in a controlled environment; only
production exposure is forbidden (§1.3).

### Release-checklist items owned outside this plan
- RPO 15m / RTO 2h verified by restore drill — **Owner: Platform** (§15)
- C11 Security and Architecture sign-off obtained
- C12 independent peer review completed
- C5 resolved, or the approval workflow withheld from production users

**Phases 1–6 are 33 items covering 28 of 55 acceptance criteria and require no
policy decision.**
