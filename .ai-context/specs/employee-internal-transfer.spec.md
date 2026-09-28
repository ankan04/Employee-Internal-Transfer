<!-- Authored per INT_SDD_Standard.md §11. Derived from
     .ai-context/discovery/employee-internal-transfer.discovery.md and
     .ai-context/BRD.md#BRD-001. Not yet submitted to Gate 1. -->

# Spec: Employee Internal Transfer Digital Journey

## Spec ID
`employee-internal-transfer`

## Status
**v1.3, Gate 1 outcome under correction.** The original record — "Approved
v1.3, Gate 1 CONDITIONAL PASS" — was self-reviewed (reviewer = author) and
invented a status INT_SDD_Standard.md does not define. Per `status.md`
(2026-09-28), the honest outcome given the standard's binary model is
**Changes Requested**, with a genuine independent second-opinion review now
on record (`employee-internal-transfer.gate1-second-opinion.md`, Soumyadeep,
2026-09-08) that partially — not fully — mitigates the independence gap.
`.ai-context/reviews/employee-internal-transfer.gate1.md`, cited below and in
the second-opinion review, does not exist in this repository; the original
Gate 1 record lives inline in `status.md`.

Plan drafting authorised. Implementation authorised for the unblocked scope
only. Gated scope is controlled by conditions C1–C10; C11 (Security/
Architecture sign-off) and C12 (independent peer review) remain unmet and
gate Gate 2 entry and production implementation respectively.

**Update (2026-09-28) — BRD v2 impact on gate conditions.** `BRD.md` v2 now
records actual HR Operations decisions that supersede the provisional
positions behind C1, C2, C8 and C9 (see `decision-log.md` v1.2). This does
**not** self-lift those conditions — a provisional decision becoming
BRD-confirmed is exactly the kind of change that must go back through Gate 1,
not be silently accepted by the spec that was provisional on it:

| Condition | Provisional decision | BRD v2 status | Spec impact if formally lifted |
|---|---|---|---|
| C1 (OQ01, OQ03) | PD02 — three-stage approval | **CONFIRMED**, `BRD-003` | AC17–AC26, API07, AC14, PD11 status projection can drop their contingency tags |
| C2 (OQ09) | PD12 (partial) — eligibility criteria | **CONFIRMED**, `BRD-002` | AC23, AC24, API03's `NOT_ELIGIBLE` exception become implementable |
| C8 (OQ35–OQ37) | PD06 (partial) — task-requirement conditions | **CONFIRMED**, `BRD-005` — all four downstream activities always required | AC32, AC33's task-requirement policy is no longer a stub |
| C9 (OQ40) | PD03 — execution trigger timing | **CONFIRMED**, `BRD-005` | AC29–AC33 scheduling design can proceed |
| C7 (OQ32, OQ34) | payroll-aligned effective date | **PARTIALLY** — OQ32 (boundary alignment) CONFIRMED via `BRD-005`; OQ34 (cutoff handling) still open | Still blocked — one of two sub-questions remains |
| C3, C4, C6, C10, C11, C12 | PD01, resignation interrupt, adapters, security sign-off, peer review | **Unchanged** | Still blocked — not addressed by BRD v2 |

Also now BRD-confirmed, not gate-blocking but previously only author-proposed:
PD05 (point of no return, `BRD-005`), PD09 (reason visibility, `BRD-006`),
PD11 (status projection detail, `BRD-006`).

## Revision History

| Version | Date | Change | Driver |
|---|---|---|---|
| v1.0 | 2026-08-30 | Initial draft, 42 AC, 9 API contracts | — |
| v1.1 | 2026-08-30 | AC43–AC48 added for API05/API08/API09; API03 `NOT_ELIGIBLE` marked contingent; AC30/AC31 given an evaluation guarantee; `hasReason` removed in favour of presence-by-omission; `IDEMPOTENCY_KEY_MISMATCH` added; Liveness section added with gated AC49 | Gate 1 findings G1-F01 – G1-F06 |
| v1.2 | 2026-08-30 | **AC50–AC55 added — the specification had no front-end acceptance criteria at all.** Audit group reordered so list ordinals match AC IDs | Plan-review finding P-F01 |
| v1.3 | 2026-08-30 | AC14 and the employee-visible status projection tagged contingent on PD02/C1; AC25 and AC33 marked **partially contingent** with an explicit Gate 2 verification instruction | Task-decomposition findings D5-F01, D5-F02 |

**v1.0 shipped with six defects; three were blocking. v1.1 still had one: it
described a portal journey with no acceptance criterion for the portal.** Both
were found by a gate, not by Gate 2 or by production. This history is retained
deliberately — a specification that appears to have been correct on first draft
is evidence of a gate that did not run, not of an author who did not err.

The v1.1 → v1.2 gap is the more instructive of the two: it was invisible from
inside the specification and only became visible when the *plan* tried to
sequence three front-end tasks and the reviewer asked what acceptance criterion
each satisfied.

## Linked BRD
`.ai-context/BRD.md#BRD-001` through `#BRD-007` (v2, 2026-09-28)

## Context
- Builds on: `.ai-context/architecture.md` (unpopulated — this is the first feature)
- Governed by: `.ai-context/constitution.md` v1.0
- Discovery: `.ai-context/discovery/employee-internal-transfer.discovery.md`
- External contracts consumed: HRMS, payroll, IAM/ITSM, facilities, notification
  service — none yet defined; adapter interfaces are a plan-stage deliverable

---

## Intent

An employee in the One-Point Employee Portal raises a single Internal Transfer
Request naming a proposed department/business unit, location and role/position,
an effective date, and optionally a reason. The portal routes that request
through releasing-manager, receiving-manager and HR-eligibility decisions;
on approval it schedules the transfer to the effective date, then orchestrates
the organisational, payroll, IT-access and facilities activities the transfer
requires. Throughout, the employee sees one consolidated status and which
stakeholder role currently holds an outstanding action, without contacting any
of those teams directly.

---

## Provisional Decisions

**Read this section before any acceptance criterion below.**

This specification is authored to be *reviewable*, which requires it to be
concrete. Several of the decisions that make it concrete are not yet business
decisions — they are provisional positions adopted so that Gate 1 has something
specific to accept or reject. They are listed here rather than distributed
silently through the acceptance criteria.

**A provisional decision is not an approved requirement.** No implementation
task depending on one may start until Gate 1 resolves it.

**Update (2026-09-28):** rows marked ✅ below now have a matching HR
Operations decision in `BRD.md` v2. They are not re-labelled "approved" here
— that relabelling is Gate 1's job, not this table's — but a reader should
know the provisional/BRD gap has closed for these seven.

| ID | Provisional position taken | Source | Risk | AC / API contingent on it |
|---|---|---|---|---|
| PD01 | The employee selects a **specific open requisition**, not a role type | discovery OQ16, §10.1 | **HIGH** | AC08, AC12, AC13, API01, API09 |
| PD02 ✅ | Three sequential approvals: releasing manager → receiving manager → HR eligibility | discovery OQ01, OQ03, AS01, AS02 — now `BRD-003` | **HIGH** | AC17–AC26, API07 |
| PD03 ✅ | Downstream execution is triggered **at the effective date**, not at approval | discovery OQ40, AS09 — now `BRD-005` | **HIGH** | AC29–AC33 |
| PD04 | Downstream integrations are **asynchronous and may be human-fulfilled**; the portal tracks task state | discovery OQ41, AS11 | **HIGH** | AC30–AC33 |
| PD05 ✅ | HRMS organisational update is the **point of no return** | discovery OQ39, AS12 — now `BRD-005` | **HIGH** | AC27, AC32 |
| PD06 ✅ | A failed downstream activity does **not** reverse the transfer; it raises remediation | discovery OQ38, AS13 — now `BRD-005` | Medium | AC32 |
| PD07 | One active transfer request per employee | discovery OQ17, AS05 | Medium | AC12, AC13 |
| PD08 | Effective date ≥ 15 calendar days after submission; never backdated | discovery OQ30, OQ31, AS08 | Medium | AC09, AC10 |
| PD09 ✅ | The reason field is visible to HR only, never to either manager | discovery OQ49, AS14 — now `BRD-006` | Medium | AC36 |
| PD10 | A submitted request is immutable; changes require withdrawal and re-raise | discovery OQ22, AS07 | Low | AC16, AC26 |
| PD11 ✅ | Employee sees stage-level status and the *role* holding a pending action, never a named individual | discovery OQ52, AS15 — now `BRD-006` | Low | AC34, AC37 |
| PD12 ✅ | Eligibility is machine pre-checked at submission, with HR retaining final human validation | discovery OQ10, OQ11, AS03 — now `BRD-002` | Medium | AC23, AC24 |

**Deliberately unspecified, because no provisional position is defensible:**
eligibility *criteria* themselves (discovery OQ09 / DEP14 — an HR policy
decision with no engineering default), payroll-cycle alignment of the effective
date (OQ32, OQ34), approver SLA and inaction handling (OQ25), delegation
(OQ29), rejection cooling-off (OQ23), and notification channel set (OQ46).
Acceptance criteria for these are **absent by design**, not by oversight. The
spec is incomplete on these points and says so.

---

## Roles and Permissions

| Role | May do |
|---|---|
| **Employee (subject)** | Create, amend and submit their own draft; view their own requests; withdraw their own request before the point of no return |
| **Releasing manager** | View requests raised by their direct reports, excluding the reason field; record a release decision on requests pending their action |
| **Receiving manager** | View requests targeting a position they own, excluding the reason field; record an acceptance decision on requests pending their action |
| **HR Business Partner** | View all requests including the reason field; record an eligibility decision on requests pending HR validation |
| **HR Administrator** | All HR Business Partner rights, plus cancel a request before the point of no return |
| **Downstream fulfiller** (payroll / IT / facilities) | View and close only the execution task assigned to their function; no access to the request's reason or to approval history |

**Enforcement rules, binding on every endpoint:**
- The acting subject is derived from the authenticated session. A payload,
  query or header naming a different subject is never honoured (constitution §2).
- Authorisation is checked per resource *and* per object, server-side.
- A request the caller may not see returns `404`, never `403`, so existence is
  not disclosed (constitution §2).
- No actor may record a decision on a request whose subject is themselves.

---

## State Model

### Internal states

```text
                          ┌─────────┐
                          │  DRAFT  │
                          └────┬────┘
                               │ submit
                               ▼
              ┌────────────────────────────────┐
              │  PENDING_RELEASING_MANAGER     │──reject──┐
              └────────────────┬───────────────┘          │
                               │ release confirmed        │
                               ▼                          │
              ┌────────────────────────────────┐          │
              │  PENDING_RECEIVING_MANAGER     │──reject──┤
              └────────────────┬───────────────┘          │
                               │ acceptance confirmed     │
                               ▼                          │
              ┌────────────────────────────────┐          │
              │  PENDING_HR_VALIDATION         │──reject──┤
              └────────────────┬───────────────┘          │
                               │ eligible                 │
                               ▼                          ▼
              ┌────────────────────────────────┐    ┌──────────┐
              │  APPROVED_SCHEDULED            │    │ REJECTED │
              └────────────────┬───────────────┘    └──────────┘
                               │ effective date reached
                               ▼
              ┌────────────────────────────────┐
              │  IN_EXECUTION                  │◄──────┐
              └───┬────────────────────────┬───┘       │
                  │ all tasks closed       │ a task    │ remediated
                  │                        │ failed    │
                  ▼                        ▼           │
            ┌───────────┐        ┌──────────────────┐  │
            │ COMPLETED │        │ EXECUTION_       │──┘
            └───────────┘        │ ATTENTION        │
                                 └──────────────────┘

  WITHDRAWN  ◄── employee, from DRAFT or any PENDING_* state
  CANCELLED  ◄── HR Administrator, from any state before IN_EXECUTION
```

**Point of no return:** the boundary between `APPROVED_SCHEDULED` and
`IN_EXECUTION`. Before it, a request may be withdrawn or cancelled with no
external effect. After it, the organisational record has been or is being
changed in the HRMS, and reversal requires a new compensating transfer rather
than a rollback (PD05).

### Employee-visible status projection (PD11)

> **Contingent on PD02 / C1 (D5-F01).** The three `PENDING_*` rows below reflect
> the provisional three-stage model. If C1 resolves to a different approval
> chain, those rows change; the projection *mechanism* does not. Implementations
> must derive stage labels from the transition table, never from a hard-coded
> map — see task T21.

| Internal state | Shown to employee | Pending with |
|---|---|---|
| `DRAFT` | Draft | You |
| `PENDING_RELEASING_MANAGER` | Awaiting manager confirmation | Your current manager |
| `PENDING_RECEIVING_MANAGER` | Awaiting receiving team confirmation | Receiving manager |
| `PENDING_HR_VALIDATION` | Awaiting HR validation | HR |
| `APPROVED_SCHEDULED` | Approved — scheduled for {effectiveDate} | — |
| `IN_EXECUTION` | In progress | Per-task role list |
| `EXECUTION_ATTENTION` | In progress — one step needs attention | HR |
| `COMPLETED` | Completed | — |
| `REJECTED` | Not approved | — |
| `WITHDRAWN` | Withdrawn | — |
| `CANCELLED` | Cancelled by HR | — |

Named individuals are never returned to the employee.

---

## Validation Rules

| ID | Rule | Enforced at |
|---|---|---|
| VR01 | `departmentId`, `locationId`, `positionId` and `effectiveDate` are all present | Submission |
| VR02 | `departmentId`, `locationId`, `positionId` each resolve to an active master-data record | Draft save and submission |
| VR03 | `positionId` refers to an open requisition with available headcount *(contingent on PD01)* | Submission and re-checked at HR validation |
| VR04 | `effectiveDate` is a valid future date, at least 15 calendar days after submission *(PD08)* | Submission |
| VR05 | `effectiveDate` is not in the past | Draft save and submission |
| VR06 | `reason`, if supplied, is at most 2000 characters | Draft save and submission |
| VR07 | The subject has no other request in a non-terminal state *(PD07)* | Submission |
| VR08 | The target position is not the subject's current position | Submission |
| VR09 | The acting subject equals the request subject for create/amend/submit/withdraw | Every call |
| VR10 | A decision may only be recorded against the state that awaits that decision | Decision endpoint |
| VR11 | The decision-maker is not the request subject | Decision endpoint |
| VR12 | `idempotencyKey` is present on every state-changing call | Every state-changing call |

---

## API Contract

All endpoints are `/api/v1`, authenticated via SSO/OIDC bearer token, and
return `application/json`. Error bodies share one shape:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Human-readable summary, free of PII",
    "details": [ { "field": "effectiveDate", "rule": "VR04" } ],
    "correlationId": "uuid"
  }
}
```

**Status code convention:** `400` malformed request or schema violation;
`401` unauthenticated; `403` authenticated but action not permitted;
`404` resource absent *or not visible to this caller*; `409` state or
uniqueness conflict; `422` business-rule violation; `429` rate limited.

**Rate-limit decisions** are recorded per endpoint below, per constitution §2.

---

### `employee-internal-transfer.API01` — POST /transfer-requests

Creates a draft. Subject is derived from the session.

**Request payload:**
```json
{
  "departmentId": "string",
  "locationId": "string",
  "positionId": "string",
  "effectiveDate": "YYYY-MM-DD",
  "reason": "string|null"
}
```
All fields optional at draft stage; validated on submission.

**Success response (201):**
```json
{
  "requestId": "uuid",
  "status": "DRAFT",
  "subjectRef": "opaque-employee-reference",
  "departmentId": "string|null",
  "locationId": "string|null",
  "positionId": "string|null",
  "effectiveDate": "YYYY-MM-DD|null",
  "reason": "string|omitted",
  "createdAt": "ISO-8601"
}
```
**Presence-by-omission is the single convention for the reason field across
every endpoint** (G1-F04): the `reason` key is present when the caller is
entitled to the value and absent when they are not. A draft's own subject is
entitled to it, so it is returned here. No parallel boolean signal exists.

**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 401 | No valid session | `AUTH_REQUIRED` |
| 409 | Subject already has a non-terminal request (VR07) | `ACTIVE_REQUEST_EXISTS` with the existing `requestId` |
| 422 | Supplied master-data identifier is not active (VR02) | `INVALID_REFERENCE_DATA` |
| 429 | Rate limit exceeded | `RATE_LIMITED` |

**Rate limit:** 10 draft creations per subject per hour. Rationale: draft
creation is cheap but unbounded creation is an abuse and storage vector.

---

### `employee-internal-transfer.API02` — PATCH /transfer-requests/{requestId}

Amends a draft. Permitted only in `DRAFT` (PD10).

**Request payload:** same shape as API01, partial.

**Success response (200):** the draft representation, as API01.

**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 404 | Request absent, or subject is not the caller | `NOT_FOUND` |
| 409 | Request is not in `DRAFT` (VR10, PD10) | `IMMUTABLE_AFTER_SUBMISSION` |
| 422 | Reference data invalid, date in the past, reason too long (VR02, VR05, VR06) | `VALIDATION_FAILED` |

**Rate limit:** 60 per subject per hour.

---

### `employee-internal-transfer.API03` — POST /transfer-requests/{requestId}/submission

Submits a draft for approval. Idempotent on `Idempotency-Key`.

**Request headers:** `Idempotency-Key: <uuid>` (required, VR12)

**Request payload:** empty.

**Success response (200):**
```json
{
  "requestId": "uuid",
  "status": "PENDING_RELEASING_MANAGER",
  "displayStatus": "Awaiting manager confirmation",
  "pendingWith": [ { "role": "RELEASING_MANAGER" } ],
  "effectiveDate": "YYYY-MM-DD",
  "submittedAt": "ISO-8601"
}
```

Replaying the same `Idempotency-Key` returns the identical body with `200`
and creates no second submission.

**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 400 | `Idempotency-Key` absent (VR12) | `IDEMPOTENCY_KEY_REQUIRED` |
| 409 | `Idempotency-Key` differs from the key that recorded the original submission (G1-F06) | `IDEMPOTENCY_KEY_MISMATCH` — distinguished from a genuine state error so a client can tell a retry bug from a workflow error |
| 404 | Request absent, or subject is not the caller (VR09) | `NOT_FOUND` |
| 409 | Request is not in `DRAFT` | `INVALID_STATE_TRANSITION` |
| 409 | Subject already has another non-terminal request (VR07) | `ACTIVE_REQUEST_EXISTS` |
| 422 | Any of VR01–VR06, VR08 fails | `VALIDATION_FAILED` with a `details[]` entry per failed rule |
| 422 | Eligibility pre-check fails (PD12) | `NOT_ELIGIBLE` — reason codes only, never underlying personal data. **⛔ GATED on C2 / OQ09 (G1-F02): the eligibility criteria do not exist, so this exception's *conditions* are undefined and it is not implementable. The shape is specified; the trigger is not. `.UT27` and `.UT87` remain unwritable until C2 lifts.** |

**Rate limit:** 5 submissions per subject per hour.

---

### `employee-internal-transfer.API04` — GET /transfer-requests/{requestId}

Returns a request, projected to the caller's role.

**Success response (200):**
```json
{
  "requestId": "uuid",
  "status": "PENDING_HR_VALIDATION",
  "displayStatus": "Awaiting HR validation",
  "pendingWith": [ { "role": "HR" } ],
  "departmentId": "string",
  "locationId": "string",
  "positionId": "string",
  "effectiveDate": "YYYY-MM-DD",
  "reason": "string|omitted",
  "timeline": [
    { "stage": "SUBMITTED", "outcome": "DONE", "at": "ISO-8601" },
    { "stage": "RELEASING_MANAGER", "outcome": "APPROVED", "at": "ISO-8601" },
    { "stage": "RECEIVING_MANAGER", "outcome": "APPROVED", "at": "ISO-8601" },
    { "stage": "HR_VALIDATION", "outcome": "PENDING", "at": null }
  ],
  "executionTasks": [
    { "function": "HRMS", "state": "PENDING" },
    { "function": "PAYROLL", "state": "NOT_REQUIRED" }
  ]
}
```

**Projection rules:**
- `reason` is present only for HR roles (PD09); the key is **omitted**, not
  null, for every other caller.
- `timeline[].actor` is never returned to the subject (PD11).
- Downstream fulfillers receive only their own `executionTasks` entry and no
  `timeline`.

**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 404 | Request absent, or not visible to this caller | `NOT_FOUND` |

**Rate limit:** 300 per caller per hour.

---

### `employee-internal-transfer.API05` — GET /transfer-requests

Lists the caller's own requests, newest first.

**Query parameters:** `status` (repeatable), `page`, `pageSize` (max 50).

**Success response (200):** `{ "items": [ …API04 shape… ], "page": 1, "total": 3 }`

**Rate limit:** 300 per caller per hour.

---

### `employee-internal-transfer.API06` — POST /transfer-requests/{requestId}/withdrawal

Withdraws the caller's own request. Permitted from `DRAFT` and any `PENDING_*`
state; refused from `APPROVED_SCHEDULED` onward (PD05).

**Request headers:** `Idempotency-Key` (required)

**Request payload:**
```json
{ "note": "string|null" }
```

**Success response (200):** `{ "requestId": "uuid", "status": "WITHDRAWN", "withdrawnAt": "ISO-8601" }`

**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 404 | Request absent, or subject is not the caller (VR09) | `NOT_FOUND` |
| 409 | Request is at or past `APPROVED_SCHEDULED` | `PAST_POINT_OF_NO_RETURN` |
| 409 | Request already terminal | `ALREADY_TERMINAL` |

**Rate limit:** 20 per subject per hour.

---

### `employee-internal-transfer.API07` — POST /transfer-requests/{requestId}/decisions

Records an approver decision. The decision *stage* is derived from the
request's current state, never supplied by the caller — a caller cannot choose
which gate they are answering.

**Request headers:** `Idempotency-Key` (required)

**Request payload:**
```json
{ "outcome": "APPROVE|REJECT", "comment": "string|null" }
```

**Success response (200):**
```json
{
  "requestId": "uuid",
  "status": "PENDING_RECEIVING_MANAGER",
  "recordedStage": "RELEASING_MANAGER",
  "outcome": "APPROVE",
  "decidedAt": "ISO-8601"
}
```

**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 403 | Caller is not the approver the current state awaits (VR10) | `NOT_YOUR_DECISION` |
| 403 | Caller is the request subject (VR11) | `SELF_APPROVAL_FORBIDDEN` |
| 404 | Request absent or not visible | `NOT_FOUND` |
| 409 | Request is in a state that awaits no decision | `INVALID_STATE_TRANSITION` |
| 422 | `outcome` is `REJECT` and `comment` is absent | `REJECTION_REASON_REQUIRED` |

**Rate limit:** 100 per approver per hour.

---

### `employee-internal-transfer.API08` — GET /transfer-requests/pending-decisions

Returns requests awaiting the calling approver's decision.

**Success response (200):** `{ "items": [ …API04 shape, projected… ], "total": 4 }`

**Rate limit:** 300 per caller per hour.

---

### `employee-internal-transfer.API09` — GET /reference/{departments|locations|positions}

Returns master data selectable by the calling employee.

**Query parameters:** `search`, `page`, `pageSize` (max 50); for `positions`,
`departmentId` and `locationId` narrow the result.

**Success response (200):**
```json
{ "items": [ { "id": "string", "label": "string", "available": true } ], "total": 128 }
```

For `positions`, `available` reflects open headcount *(contingent on PD01)*.

**Exceptions:**
| Code | Condition | Response body |
|---|---|---|
| 400 | Unknown collection name | `UNKNOWN_COLLECTION` |

**Rate limit:** 600 per caller per hour.

> **Contingency note.** If Gate 1 resolves PD01 against the requisition model,
> API09's `positions` collection loses `available`, VR03 is withdrawn, API01's
> `positionId` becomes a role-type identifier, and AC08/AC12/AC13 are rewritten.
> API02–API08 are unaffected. The blast radius is deliberately confined to one
> endpoint and three criteria.

---

## Acceptance Criteria

### A. Initiation and data capture

1. `employee-internal-transfer.AC1` — Given an authenticated employee with no active transfer request, when they create a transfer request, then a request is created in `DRAFT` whose subject is the authenticated employee and a `requestId` is returned.
2. `employee-internal-transfer.AC2` — Given a draft with no `departmentId`, when the employee submits it, then submission is refused with a validation error naming `departmentId` and rule `VR01`, and the request remains in `DRAFT`.
3. `employee-internal-transfer.AC3` — Given a draft with no `locationId`, when the employee submits it, then submission is refused naming `locationId` and `VR01`.
4. `employee-internal-transfer.AC4` — Given a draft with no `positionId`, when the employee submits it, then submission is refused naming `positionId` and `VR01`.
5. `employee-internal-transfer.AC5` — Given a draft with no `effectiveDate`, when the employee submits it, then submission is refused naming `effectiveDate` and `VR01`.
6. `employee-internal-transfer.AC6` — Given an otherwise complete draft with no `reason`, when the employee submits it, then submission succeeds.
7. `employee-internal-transfer.AC7` — Given an authenticated employee, when they submit a payload whose body names a different employee as the subject, then the authenticated employee remains the subject and the supplied value has no effect.
8. `employee-internal-transfer.AC8` — Given a `positionId` that does not resolve to an active, open requisition, when the employee submits, then submission is refused with `INVALID_REFERENCE_DATA` or `VALIDATION_FAILED` citing `VR02`/`VR03`. *(contingent on PD01)*
9. `employee-internal-transfer.AC9` — Given a draft whose `effectiveDate` is fewer than 15 calendar days after today, when the employee submits it, then submission is refused citing `VR04`. *(contingent on PD08)*
10. `employee-internal-transfer.AC10` — Given a draft whose `effectiveDate` is in the past, when the employee submits it, then submission is refused citing `VR05`.
11. `employee-internal-transfer.AC11` — Given a draft whose `positionId` equals the employee's current position, when the employee submits it, then submission is refused citing `VR08`.

### B. Concurrency and submission

12. `employee-internal-transfer.AC12` — Given an employee with a request in any non-terminal state, when they submit a second request, then submission is refused with `409 ACTIVE_REQUEST_EXISTS` citing the existing `requestId`. *(contingent on PD07)*
13. `employee-internal-transfer.AC13` — Given an employee whose only prior request is in a terminal state, when they submit a new request, then submission succeeds.
14. `employee-internal-transfer.AC14` — Given a valid complete draft, when the employee submits it, then the request moves to **the first pending state declared in the workflow transition table** — `PENDING_RELEASING_MANAGER` under the current provisional model — `pendingWith` reports that state's role, and an audit record of the transition is written. *(state name contingent on PD02 / C1 — see below)*

> **D5-F01.** At v1.2 this criterion named `PENDING_RELEASING_MANAGER` as a
> literal with no contingency tag, while AC17–AC26 were all tagged. Under a
> one-manager approval model — live until C1 resolves — that state does not
> exist. Because AC14 belongs to an **unblocked** task (T16, submission), an
> implementer following it literally would have hard-coded the approval model
> into the submission path, settling C1 in code from work that looks entirely
> policy-free. The criterion is now expressed as *the first pending state
> declared in the transition table*, and remains satisfiable under any approval
> model C1 resolves to.
15. `employee-internal-transfer.AC15` — Given a submission that has already succeeded, when the identical request is replayed with the same `Idempotency-Key`, then the original result is returned and no second submission is recorded.
16. `employee-internal-transfer.AC16` — Given a request that has been submitted, when the employee attempts to amend it, then the amendment is refused with `409 IMMUTABLE_AFTER_SUBMISSION`. *(contingent on PD10)*

### C. Approval decisions

17. `employee-internal-transfer.AC17` — Given a request in `PENDING_RELEASING_MANAGER`, when the releasing manager approves, then the request moves to `PENDING_RECEIVING_MANAGER` and `pendingWith` reports the receiving-manager role. *(contingent on PD02)*
18. `employee-internal-transfer.AC18` — Given a request in `PENDING_RELEASING_MANAGER`, when the releasing manager rejects with a comment, then the request moves to `REJECTED` and no further decision is accepted.
19. `employee-internal-transfer.AC19` — Given a request in `PENDING_RELEASING_MANAGER`, when the releasing manager rejects without a comment, then the decision is refused with `422 REJECTION_REASON_REQUIRED`.
20. `employee-internal-transfer.AC20` — Given a request in `PENDING_RELEASING_MANAGER`, when an employee who is not the releasing manager attempts a decision, then it is refused with `403 NOT_YOUR_DECISION` and the state is unchanged.
21. `employee-internal-transfer.AC21` — Given a request whose subject is also an approver on it, when that person attempts a decision, then it is refused with `403 SELF_APPROVAL_FORBIDDEN`.
22. `employee-internal-transfer.AC22` — Given a request in `PENDING_RECEIVING_MANAGER`, when the receiving manager approves, then the request moves to `PENDING_HR_VALIDATION`. *(contingent on PD02)*
23. `employee-internal-transfer.AC23` — Given a request in `PENDING_HR_VALIDATION`, when HR records an eligible outcome, then the request moves to `APPROVED_SCHEDULED` and no downstream task is raised. *(contingent on PD03)*
24. `employee-internal-transfer.AC24` — Given a request in `PENDING_HR_VALIDATION`, when HR records an ineligible outcome, then the request moves to `REJECTED` and the response contains reason codes only, with no underlying personal data.
25. `employee-internal-transfer.AC25` — **⚠ PARTIALLY CONTINGENT (D5-F02).** Given a request in `PENDING_RECEIVING_MANAGER`, when the releasing manager attempts a second decision, then it is refused with `403 NOT_YOUR_DECISION`. *The database uniqueness half is satisfied by task T04 (unblocked); the decision-sequencing half by task T38 (gated on C1).* **Gate 2 must verify this criterion by task, not by AC** — the unblocked half passing does not make the criterion met.
26. `employee-internal-transfer.AC26` — Given a request in a terminal state, when any actor attempts a decision, then it is refused with `409 INVALID_STATE_TRANSITION`.

### D. Withdrawal

27. `employee-internal-transfer.AC27` — Given a request in any `PENDING_*` state, when its subject withdraws it, then the request moves to `WITHDRAWN` and an audit record is written.
28. `employee-internal-transfer.AC28` — Given a request in `APPROVED_SCHEDULED` or later, when its subject attempts to withdraw it, then withdrawal is refused with `409 PAST_POINT_OF_NO_RETURN`. *(contingent on PD05)*
29. `employee-internal-transfer.AC29` — Given a request belonging to another employee, when an employee attempts to withdraw it, then the attempt is refused with `404 NOT_FOUND`.

### E. Scheduled execution and downstream orchestration

30. `employee-internal-transfer.AC30` — Given a request in `APPROVED_SCHEDULED` whose effective date has not been reached, when a scheduled execution evaluation runs, then no downstream task is raised and the state is unchanged. Every request in `APPROVED_SCHEDULED` is evaluated **at least once per calendar day**. *(contingent on PD03)*
31. `employee-internal-transfer.AC31` — Given a request in `APPROVED_SCHEDULED`, when the first scheduled evaluation on or after its effective date runs, then the request moves to `IN_EXECUTION` and the HRMS organisational-update task is raised first. The observable guarantee is that execution begins **no later than 24 hours after** the effective date is reached; the scheduling *mechanism* is a plan-stage decision, the *guarantee* is not. *(contingent on PD03)*
32. `employee-internal-transfer.AC32` — Given a request in `IN_EXECUTION` whose HRMS task has closed successfully, when orchestration continues, then the required payroll, IT-access and facilities tasks are raised independently of one another. *(contingent on PD04)*
33. `employee-internal-transfer.AC33` — **⚠ PARTIALLY CONTINGENT (D5-F02).** Given a request in `IN_EXECUTION` whose every required task has closed successfully, when the final task closes, then the request moves to `COMPLETED` and a confirmation notification is raised to the subject. *The confirmation-notification half is satisfied by task T31 (unblocked); the all-required-tasks-complete half by task T43 (gated on C8, which defines which tasks are "required" at all).* **Gate 2 must verify this criterion by task, not by AC.** *(also contingent on PD03, PD04)*
34. `employee-internal-transfer.AC34` — Given a request in `IN_EXECUTION` where one downstream task fails terminally, when the failure is recorded, then the request moves to `EXECUTION_ATTENTION`, a remediation task is raised to HR, the other tasks are unaffected, and the transfer is **not** reversed. *(contingent on PD06)*
35. `employee-internal-transfer.AC35` — Given a downstream adapter that times out, when the call is retried per policy and still fails, then the failure is terminal for that task, it lands in a recorded terminal destination, and no unbounded retry occurs.

### F. Status visibility and permissions

36. `employee-internal-transfer.AC36` — Given a request belonging to the caller, when the caller retrieves it, then the response contains the current display status and the *role* holding each pending action, and no named individual. *(contingent on PD11)*
37. `employee-internal-transfer.AC37` — Given a request with a reason, when either manager retrieves it, then the `reason` key is omitted from the response. *(contingent on PD09)*
38. `employee-internal-transfer.AC38` — Given a request with a reason, when an HR role retrieves it, then the `reason` value is returned.
39. `employee-internal-transfer.AC39` — Given a request belonging to another employee and not assigned to the caller, when the caller retrieves it by `requestId`, then the response is `404 NOT_FOUND`, not `403`.
40. `employee-internal-transfer.AC40` — Given a downstream fulfiller, when they retrieve a request, then they receive only their own execution task and no approval timeline.

### G. Audit and observability

41. `employee-internal-transfer.AC41` — Given any state transition, when it is applied, then an append-only audit record is written capturing actor reference, action, source state, target state, timestamp and correlation identifier.
42. `employee-internal-transfer.AC42` — Given any request processed by the journey, when application logs for that request are inspected, then no employee name, employee number, email address, phone number, compensation figure, performance rating or reason text appears at any log level.

### H. Listing, inbox and reference data

43. `employee-internal-transfer.AC43` — Given an employee with several requests in differing states, when they list their requests, then every returned request has the authenticated employee as its subject, ordered most-recently-created first.
44. `employee-internal-transfer.AC44` — Given a request belonging to another employee, when any employee lists their own requests, then that request is absent from every page and under every status filter.
45. `employee-internal-transfer.AC45` — Given an approver, when they retrieve their pending decisions, then the result contains exactly those requests whose current state awaits a decision from that approver, and no others.
46. `employee-internal-transfer.AC46` — Given an approver who has already recorded a decision on a request, when they retrieve their pending decisions, then that request is absent from the result.
47. `employee-internal-transfer.AC47` — Given a reference-data collection containing both active and deactivated master records, when an employee retrieves it, then only active records are returned.
48. `employee-internal-transfer.AC48` — Given the positions collection retrieved with both `departmentId` and `locationId` supplied, when the result is returned, then every item matches both filters.

### I. Liveness

49. `employee-internal-transfer.AC49` — **⛔ GATED on C5. Not implementable.** Given a request in any `PENDING_*` state whose designated approver cannot or does not act, when the liveness rule applies, then the request reaches a terminal or reassigned state within a defined period. **The behaviour is undefined because the policy does not exist.** This criterion is recorded, unimplementable, so that the gap cannot be forgotten — see the Liveness Invariant below.

### J. Portal journey (front end)

**Added at v1.2 per plan-review finding P-F01.** The specification previously
contained no user-interface acceptance criterion, meaning FR01, FR08 and FR11 —
all user-facing capabilities of the business requirement — could be satisfied at
Gate 2 by API tests alone. An employee unable to reach the form at all would
have passed every one of the 118 test cases.

Throughout this group, **server-side validation and authorisation remain
authoritative**; nothing below relaxes a rule stated elsewhere in this
specification. Client-side behaviour is an affordance, never a control
(constitution §2).

50. `employee-internal-transfer.AC50` — Given an authenticated employee with no active transfer request, when they open Internal Transfer in the portal, then the request form is presented with fields for department/business unit, location, role/position, effective date and an optional reason.
51. `employee-internal-transfer.AC51` — Given the request form with a mandatory field empty, when the employee attempts to submit, then the omission is indicated against that field and no submission is sent; server-side validation remains authoritative and is not bypassed for any field validated client-side.
52. `employee-internal-transfer.AC52` — Given an employee who already has an active transfer request, when they open Internal Transfer, then the existing request and its status are presented instead of a blank form, with no route to creating a second one.
53. `employee-internal-transfer.AC53` — Given a submitted request, when the employee views it, then the current stage and the *role* holding the pending action are displayed, and no individual's name is displayed.
54. `employee-internal-transfer.AC54` — Given an employee with no transfer requests, when they open My Requests, then an empty state explaining how to begin is presented — not an error, and not an empty table with no explanation.
55. `employee-internal-transfer.AC55` — Given any screen in the journey, when it is operated by keyboard alone, then every interactive control is reachable and operable in a logical order, every field has a programmatically associated label, and request status is conveyed by text and not by colour alone.

---

## Acceptance Criterion Status Model

**Added at v1.3 per D5-F02.** A binary satisfied/unsatisfied status is not
sufficient for this specification, because an acceptance criterion can be
*half* implemented when one of its constituent tasks sits behind a gate.

| Status | Meaning | Gate 2 treatment |
|---|---|---|
| **SATISFIED** | Every constituent task complete and GREEN | Verify by AC |
| **PARTIAL** | At least one constituent task complete, at least one gated | **Verify by task, never by AC. May not be reported as met.** |
| **NOT STARTED** | No constituent task complete | — |

**Currently PARTIAL and unable to become SATISFIED while their gates stand:**
`AC25` (T04 ✅ + T38 ⛔ C1) and `AC33` (T31 ✅ + T43 ⛔ C8).

Criteria that are partial only by construction — `AC1`, `AC12`, `AC40`, `AC41`,
`AC55` — resolve to SATISFIED once all their unblocked tasks are GREEN.

---

## Unit Test Cases (spec-derived)

| Test ID | Maps to AC | Scenario | Expected |
|---|---|---|---|
| `.UT01` | AC1 | Authenticated employee, no active request, creates a draft | `201`, status `DRAFT`, subject = session identity |
| `.UT02` | AC2 | Submit draft missing `departmentId` | `422`, `details[]` cites `departmentId`/`VR01`, state unchanged |
| `.UT03` | AC3 | Submit draft missing `locationId` | `422` citing `locationId`/`VR01` |
| `.UT04` | AC4 | Submit draft missing `positionId` | `422` citing `positionId`/`VR01` |
| `.UT05` | AC5 | Submit draft missing `effectiveDate` | `422` citing `effectiveDate`/`VR01` |
| `.UT06` | AC6 | Submit complete draft with `reason` absent | `200`, state `PENDING_RELEASING_MANAGER` |
| `.UT07` | AC7 | Payload names a different subject | Session subject persisted; payload value discarded |
| `.UT08` | AC8 | `positionId` resolves to a closed requisition | `422` citing `VR03` |
| `.UT09` | AC9 | `effectiveDate` = today + 14 days | `422` citing `VR04` |
| `.UT10` | AC9 | `effectiveDate` = today + 15 days | `200` — boundary accepted |
| `.UT11` | AC10 | `effectiveDate` = yesterday | `422` citing `VR05` |
| `.UT12` | AC11 | `positionId` = subject's current position | `422` citing `VR08` |
| `.UT13` | AC12 | Second submission while one is `PENDING_HR_VALIDATION` | `409 ACTIVE_REQUEST_EXISTS` with existing `requestId` |
| `.UT14` | AC13 | New submission after prior request `REJECTED` | `200` |
| `.UT15` | AC13 | New submission after prior request `WITHDRAWN` | `200` |
| `.UT16` | AC14 | Valid submission | State `PENDING_RELEASING_MANAGER`; audit row written |
| `.UT17` | AC15 | Replay submission with same `Idempotency-Key` | Identical body; exactly one submission recorded |
| `.UT18` | AC15 | Replay submission with a *different* key | `409 INVALID_STATE_TRANSITION` |
| `.UT19` | AC16 | PATCH a submitted request | `409 IMMUTABLE_AFTER_SUBMISSION` |
| `.UT20` | AC17 | Releasing manager approves | State → `PENDING_RECEIVING_MANAGER` |
| `.UT21` | AC18 | Releasing manager rejects with comment | State → `REJECTED`; terminal |
| `.UT22` | AC19 | Releasing manager rejects without comment | `422 REJECTION_REASON_REQUIRED`; state unchanged |
| `.UT23` | AC20 | Unrelated employee posts a decision | `403 NOT_YOUR_DECISION`; state unchanged |
| `.UT24` | AC21 | Subject is also the receiving manager and decides | `403 SELF_APPROVAL_FORBIDDEN` |
| `.UT25` | AC22 | Receiving manager approves | State → `PENDING_HR_VALIDATION` |
| `.UT26` | AC23 | HR records eligible | State → `APPROVED_SCHEDULED`; zero downstream tasks raised |
| `.UT27` | AC24 | HR records ineligible | State → `REJECTED`; body contains reason codes only |
| `.UT28` | AC25 | Releasing manager decides again at receiving stage | `403 NOT_YOUR_DECISION` |
| `.UT29` | AC26 | Decision on a `COMPLETED` request | `409 INVALID_STATE_TRANSITION` |
| `.UT30` | AC27 | Subject withdraws from `PENDING_RECEIVING_MANAGER` | State → `WITHDRAWN`; audit row written |
| `.UT31` | AC28 | Subject withdraws from `APPROVED_SCHEDULED` | `409 PAST_POINT_OF_NO_RETURN` |
| `.UT32` | AC28 | Subject withdraws from `IN_EXECUTION` | `409 PAST_POINT_OF_NO_RETURN` |
| `.UT33` | AC29 | Employee withdraws another employee's request | `404 NOT_FOUND` |
| `.UT34` | AC30 | Scheduler evaluates a request one day before effective date | No task raised; state unchanged |
| `.UT35` | AC31 | Scheduler evaluates on the effective date | State → `IN_EXECUTION`; HRMS task raised; no other task yet |
| `.UT36` | AC32 | HRMS task closes successfully | Payroll, IT and facilities tasks raised; no ordering dependency between them |
| `.UT37` | AC33 | Final required task closes | State → `COMPLETED`; confirmation notification raised once |
| `.UT38` | AC34 | IT task fails terminally, others succeed | State → `EXECUTION_ATTENTION`; remediation task to HR; other tasks unaffected; no reversal |
| `.UT39` | AC34 | Remediation closes the failed task | State returns to `IN_EXECUTION`, then `COMPLETED` |
| `.UT40` | AC35 | Adapter times out on every attempt | Retries bounded by policy; task terminal; failure recorded in its terminal destination |
| `.UT41` | AC36 | Subject retrieves own request | `pendingWith[].role` present; no `actor` name anywhere in the body |
| `.UT42` | AC37 | Releasing manager retrieves a request with a reason | `reason` key absent from the body |
| `.UT43` | AC37 | Receiving manager retrieves a request with a reason | `reason` key absent from the body |
| `.UT44` | AC38 | HR retrieves a request with a reason | `reason` value present |
| `.UT45` | AC39 | Employee retrieves an unrelated request by id | `404 NOT_FOUND` — never `403` |
| `.UT46` | AC40 | Payroll fulfiller retrieves a request | Only the payroll task returned; no `timeline` |
| `.UT47` | AC41 | Any transition applied | Audit row: actor ref, action, from-state, to-state, timestamp, correlation id |
| `.UT48` | AC41 | Attempt to update an existing audit row | Rejected — audit store is append-only |
| `.UT49` | AC42 | Full journey executed, logs captured | No name, employee number, email, phone, compensation, rating or reason text at any level |
| `.UT50` | AC42 | Validation failure on a reason-bearing request | Error body and logs contain no reason text |
| `.UT97` | AC43 | Employee with 3 requests in differing states lists them | All 3 returned, subject = caller, newest first |
| `.UT98` | AC44 | Employee lists requests while another employee has an active one | Other employee's request absent from every page |
| `.UT99` | AC44 | Employee lists with a status filter matching another's request | Still absent — filtering never widens visibility |
| `.UT100` | AC45 | Releasing manager retrieves pending decisions | Only requests in `PENDING_RELEASING_MANAGER` for their reports |
| `.UT101` | AC45 | HR retrieves pending decisions | Only requests in `PENDING_HR_VALIDATION` |
| `.UT102` | AC46 | Approver who already approved retrieves their inbox | That request absent |
| `.UT103` | AC45 | Approver retrieves inbox while a request sits at a later stage | Absent — inbox is stage-scoped, not request-scoped |
| `.UT104` | AC47 | Departments collection containing a deactivated record | Deactivated record absent |
| `.UT105` | AC47 | Locations collection containing a deactivated record | Deactivated record absent |
| `.UT106` | AC48 | Positions filtered by `departmentId` + `locationId` | Every item matches both |
| `.UT107` | AC48 | Positions filtered by a `departmentId` with no positions | Empty `items`, `total` 0, `200` not `404` |
| `.UT108` | AC15, G1-F06 | Replay submission with a different `Idempotency-Key` | `409 IDEMPOTENCY_KEY_MISMATCH`, distinct from `INVALID_STATE_TRANSITION` |
| `.UT119` | AC50 | Employee with no active request opens Internal Transfer | Form rendered with all five fields; reason marked optional |
| `.UT120` | AC51 | Submit attempted with `effectiveDate` empty | Field-level message shown; no network call issued |
| `.UT121` | AC51 | Client validation bypassed, request sent directly | Server returns `422` — client checks are not the control |
| `.UT122` | AC52 | Employee with a `PENDING_HR_VALIDATION` request opens Internal Transfer | Existing request shown; no "new request" control present |
| `.UT123` | AC52 | Employee whose only request is `WITHDRAWN` opens Internal Transfer | Blank form shown — terminal states do not block a new request |
| `.UT124` | AC53 | Employee views a request pending with the releasing manager | Stage and role displayed; no personal name anywhere in the view |
| `.UT125` | AC54 | Employee with zero requests opens My Requests | Empty state with guidance; no error, no bare empty table |
| `.UT126` | AC55 | Form completed using keyboard only | Every control reachable and operable; focus order follows visual order |
| `.UT127` | AC55 | Each form field inspected for a programmatic label | Every field has an associated label |
| `.UT128` | AC55 | Status view rendered in greyscale | Status remains distinguishable — text carries the meaning, not colour |

Broader QA coverage — data-volume variation, browser/device matrix,
accessibility, and cross-feature regression — lives in
`.ai-context/test_cases/employee-internal-transfer.test_cases.md` (Deliverable 3)
and is not duplicated here, per §11.3.

---

## Liveness Invariant

**Every non-terminal state must have a defined exit.** A workflow state a
request can enter but cannot leave is a defect regardless of how rarely it
occurs.

Gate 1 finding G1-F05 established that this specification currently violates
that invariant. Three individually defensible rules combine unsafely:

| Rule | Source | Effect |
|---|---|---|
| No actor may decide on a request whose subject is themselves | VR11, AC21 | Removes the subject as an approver of last resort |
| Approval delegation is not supported | OQ29 | No substitute approver exists |
| No SLA or inaction handling is defined | OQ25 | No timeout ever fires |

A request whose designated approver has left the organisation, is the subject
themselves, or simply never acts therefore remains in `PENDING_*` **forever**.
`CANCELLED` exists but is an HR Administrator cancelling a legitimate request,
which is a workaround, not a resolution.

**No liveness rule is invented here.** Choosing between escalation, expiry,
reassignment and auto-approval is a policy decision with materially different
consequences for the employee, and constitution §0 forbids settling it in code.
OQ25 and OQ29 are therefore jointly BLOCKING under **gate condition C5**, and
AC49 stands unimplementable until C5 lifts.

**What this means for implementation.** The approval path may be built to the
extent C1 allows, but no request may be *released to real users* while the
liveness gap stands — a production request that can never complete is a support
burden and, for an employee awaiting a career move, a real harm. C5 is therefore
a release gate, not merely an implementation gate.

## Failure and Exception Scenarios

| Scenario | Handling | AC |
|---|---|---|
| Master-data service unavailable at draft time | Selection lists degrade with an explicit error; draft creation without selections still permitted | — (plan-stage) |
| Eligibility service unavailable at submission | Submission refused with a retryable error; no partial request created | — (plan-stage) |
| Approver acts on a stale view | Decision refused as out-of-sequence rather than silently applied | AC25, AC26 |
| Duplicate submit from a double-clicked button | Idempotency key collapses to one submission | AC15 |
| HRMS update fails | Request stays `IN_EXECUTION`, no downstream task raised, remediation to HR | AC34 |
| A single downstream task fails | `EXECUTION_ATTENTION`, others unaffected, no reversal | AC34 |
| Downstream adapter times out repeatedly | Bounded retry, terminal destination, no unbounded retry | AC35 |
| Employee resigns after approval | **Unspecified** — discovery OQ27 open | — |
| Approver never acts | **Unspecified** — discovery OQ25 open | — |
| Target position closes mid-journey | **Unspecified** — discovery OQ18 open | — |

The three unspecified rows are stated rather than omitted. Each is a known
gap for Gate 1, not an oversight to be discovered at Gate 2.

---

## Notifications

Events that raise a notification. **Channel set is unresolved** (discovery
OQ46), so this specifies *when* and *to whom* only, never *how*.

| Event | Recipient |
|---|---|
| Request submitted | Subject (acknowledgement); releasing manager (action required) |
| Releasing manager approved | Subject; receiving manager (action required) |
| Receiving manager approved | Subject; HR (action required) |
| HR validated eligible | Subject |
| Rejected at any stage | Subject, with the stage; rejection comment disclosure is **unresolved** (OQ47) |
| Withdrawn by subject | Subject; any approver holding an open action |
| Execution started | Subject |
| Execution task needs attention | HR |
| Transfer completed | Subject |

No notification carries PII beyond what its recipient is already entitled to
see, and none carries the reason text to a manager (PD09).

---

## Audit Requirements

- Every state transition writes an append-only record: actor reference, action,
  source state, target state, timestamp, correlation identifier (AC41).
- Every approver decision records the outcome and comment against the stage
  derived by the system, not the stage claimed by the caller.
- Every downstream task raise, close and failure is recorded.
- Audit records are never updated or deleted by application code (`.UT48`).
- Retention period is **unresolved** (discovery OQ54) — the store is built
  append-only so that whatever period is chosen is satisfiable without rework.

---

## Explicitly Out of Scope

Carried from discovery OOS01–OOS13:

- External candidate recruitment and external job applications
- Creation or modification of job positions and requisitions
- Payroll calculation itself — the journey triggers an update, it does not compute pay
- Implementation or redesign of IT provisioning or facilities systems
- HR master-data redesign
- Compensation revision arising from the transfer
- Cross-border and international transfers
- Temporary deputation, secondment and short-term assignment
- Contractor and non-employee worker transfers
- Employee performance-management workflows
- Manager-initiated and HR-initiated transfer requests
- Bulk and organisational-restructure transfers

---

## Non-Functional Constraints

Sourced from `constitution.md` v1.0 §4; not restated as new rules.

- p95 < 500ms for read endpoints; < 800ms for state-changing endpoints, at the gateway
- 99.5% availability for the portal journey; downstream unavailability delays a
  transfer but never makes the portal unavailable or loses a submitted request
- No data loss of a submitted request under any downstream failure
- Every request carries a correlation identifier propagated across all modules
  and adapters
- No external call inside a user-facing request path

---

## Open Items Carried Into Gate 1

The spec is **not complete**, and this section is the reason it can still be
reviewed. Gate 1's job is to resolve these, not to discover them.

| Priority | Item | Discovery ref | Blocks |
|---|---|---|---|
| 1 | Requisition vs role-type position model | OQ16, §10.1, PD01 | AC08, AC12, AC13, API01, API09 |
| 2 | Eligibility criteria — no engineering default exists | OQ09, DEP14 | AC23, AC24; the entire eligibility path |
| 3 | Approval sequence and whether the receiving manager is an approver at all | OQ01, OQ03, PD02 | AC17–AC26, API07, the state model |
| 4 | Downstream execution timing — approval vs effective date | OQ40, PD03 | AC30–AC33 |
| 5 | Downstream integration style — API vs ticket queue | OQ41, PD04 | AC32–AC35; the whole orchestration design |
| 6 | Failure semantics — block, partial-complete or reverse | OQ38, PD06 | AC34 |
| 7 | Approver SLA and inaction handling | OQ25 | No AC exists yet |
| 8 | Employee resignation mid-journey | OQ27 | No AC exists yet |
| 9 | Target position closure mid-journey | OQ18 | No AC exists yet |
| 10 | Payroll-cycle alignment of the effective date | OQ32, OQ34 | VR04, AC9 |
| 11 | Reason-field visibility | OQ49, PD09 | AC37, AC38 |
| 12 | Notification channels and rejection-reason disclosure | OQ46, OQ47 | Notifications section |
| 13 | Audit retention period | OQ54 | Audit section |

**Definition of Ready assessment (§27), re-run at v1.2:** seven of eight
criteria met. Intent is one unambiguous paragraph; 49 acceptance criteria are
testable and individually identified; the API contract is complete across all
nine endpoints with every endpoint now exercised by at least one AC; context
artefacts are linked; out-of-scope items are named; non-functional constraints
are sourced from the constitution; status is `Approved`.

**The one unmet criterion is that the Gate 1 reviewer was the author (C12).**
That is a real failure of §27, not a technicality, and it is why C12 gates
production implementation.

This specification is **ready for development within the Gate 1 boundary** and
**not ready for production release** until C5, C11 and C12 lift.
