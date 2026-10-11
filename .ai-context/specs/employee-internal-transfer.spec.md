# Deliverable 2 — Feature Specification

## Employee Internal Transfer Digital Journey

| | |
|---|---|
| **Document** | `employee-internal-transfer.spec.md` |
| **Status** | Draft v0.3 — revised by CR-20261011-payroll-before-receiving-manager against BRD v3 (**Gate 0 approved 2026-10-11**, BRD-20261011-201241); **submitted for Gate 1 re-review**; **not approved for implementation** |
| **Inputs** | `.ai-context/BRD.md` — Gate 0 **APPROVED** 2026-10-12 (`pr_reviews/GATE0-employee-internal-transfer-20261012-003400.md`): BR-001–011, KD-001–016, OQ-B01–17, OQ-T01–09, AS-001–007, DEP-001–009, §11 risks |
| **Change Request** | `change_requests/CR-20261011-payroll-before-receiving-manager.md`: workflow order changed to Releasing Manager → Releasing Dept HRBP → Receiving HRBP → **Payroll → Receiving Manager** → IT (KD-012 v3). |
| **BRD references** | The approved BRD is titled "Deliverable 1 — Requirement / Discovery Analysis". Every "Discovery §n" reference in this spec means `BRD.md` §n. |
| **Revision** | v0.3 (2026-10-11, CR-20261011): stage order swapped (Payroll = stage 4, Receiving Manager = stage 5) in §2, §4.1, FR-050, §6.1 and AC-023; AC-025 🔒 added for Payroll reversal (OQ-B17); §9, §15.1 and §16 updated. v0.2 (2026-10-11): BRD sync only — inputs re-pointed to the approved BRD; FR-013 trace corrected; KD-008/KD-009 traced; reason-mandatory question carried as OPEN; §16 completed for KD-001–009; §15.4 added. No acceptance criterion's behaviour changed. |
| **Next artefact** | Deliverable 3 — Technical Plan |

> **How to read this document.** Requirements are tagged by confidence:
>
> - **[CONFIRMED]** — stated in the brief or by the project owner (traces to BR/KD).
> - **[PROPOSED]** — a recommendation to make the spec testable; needs business approval.
> - **[OPEN]** — unresolved; linked to an open question (OQ). Must not be implemented as assumed policy.
>
> Unresolved items stay visibly unresolved (Discovery §12 traceability rule).

---

## Table of Contents

1. [Purpose and scope](#1-purpose-and-scope)
2. [Actors and roles](#2-actors-and-roles)
3. [User stories](#3-user-stories)
4. [Workflow specification](#4-workflow-specification)
5. [Functional requirements](#5-functional-requirements)
6. [Status model](#6-status-model)
7. [Data requirements](#7-data-requirements)
8. [Acceptance criteria](#8-acceptance-criteria)
9. [Exception and failure handling](#9-exception-and-failure-handling)
10. [Notifications](#10-notifications)
11. [Audit and traceability](#11-audit-and-traceability)
12. [Security and access control](#12-security-and-access-control)
13. [Non-functional requirements](#13-non-functional-requirements)
14. [Assumptions, dependencies and scope](#14-assumptions-dependencies-and-scope)
15. [Open decisions and blocking matrix](#15-open-decisions-and-blocking-matrix)
16. [Traceability matrix](#16-traceability-matrix)
17. [Specification exit criteria](#17-specification-exit-criteria)

---

## 1. Purpose and scope

### 1.1 Purpose

Provide a single digital journey in the One-Point Employee Portal where an employee (or a manager on the employee's behalf) can raise an Internal Transfer Request, and where the employee can see its current status and the actions pending with other stakeholders until completion. *(BR-001, BR-008–011; KD-001, KD-002, KD-005–007)*

### 1.2 In scope

| # | Capability | Confidence |
|---|---|---|
| S-1 | Access via the One-Point Employee Portal's shared login entry point, with role-based permissions | CONFIRMED (KD-010); role matrix OPEN |
| S-2 | Employee self-initiated and manager-on-behalf transfer requests | CONFIRMED (KD-002, KD-011) |
| S-3 | Capture of department/business unit, location, role/job position, effective date, optional reason | CONFIRMED (KD-003, KD-004) |
| S-4 | Submission, persistence, and a status/progress view for the employee | CONFIRMED (KD-005–007) |
| S-5 | Six-stage sequential approval/action workflow | CONFIRMED (KD-012) |
| S-6 | Employee edit/withdraw up to a cutoff tied to the Releasing HRBP stage | CONFIRMED (KD-014); cutoff semantics OPEN |
| S-7 | Employee-requested cancellation with manager approval | CONFIRMED (KD-013); details OPEN |
| S-8 | Payroll and IT organisational-database updates as completion path | CONFIRMED (KD-016); evidence OPEN |
| S-9 | Escalation with Super Admin as final fallback | CONFIRMED (KD-015); L1–L3 mappings OPEN |
| S-10 | Notifications, audit history | PROPOSED / OPEN |

### 1.3 Out of scope (provisional — Discovery §9)

- Redesigning HR policy or transfer eligibility rules.
- Building or replacing the One-Point Employee Portal, or HR/Payroll/IT/Facilities/master-data systems.
- Compensation, payroll calculation, or benefits policy.
- Performing actual IT provisioning or facilities work (the journey initiates/tracks via agreed integrations only).
- New transfer types or journeys not in the brief.
- Selection of technology stack, database, or cloud platform (deferred to Deliverable 3).

> **Boundary still to agree (OQ-B11, OQ-T03):** the brief says the portal orchestrates downstream activities, so orchestration is in scope, but the system responsibility split is not yet agreed. Facilities participation is **OPEN**.

---

## 2. Actors and roles

| Actor | Responsibility in this feature | Source |
|---|---|---|
| **Employee** (subject) | Raises request for self; views status and pending actions; edits/withdraws before cutoff; requests cancellation. | KD-002, KD-013, KD-014 |
| **Manager** (initiator) | Raises request on behalf of an employee. Which manager role is **OPEN**. | KD-011 |
| **Releasing Manager** | Stage 1 approver. | KD-012 |
| **Releasing Department HRBP** | Stage 2 approver; edit/withdraw cutoff tied to this stage. | KD-012, KD-014 |
| **Receiving HRBP** | Stage 3 approver. | KD-012 |
| **Payroll** | Stage 4 action owner; updates organisational/payroll database. | KD-012 (v3), KD-016 |
| **Receiving Manager** | Stage 5 approver, acting after the Payroll update. | KD-012 (v3), OQ-B17 |
| **IT** | Stage 6 action owner; updates organisational/IT database. | KD-012, KD-016 |
| **Super Admin** | Configures roles and administrative settings; final escalation fallback. Further powers **OPEN**. | KD-015, OQ-B16 |
| **HR / business process owner** | Owns policy decisions (not a runtime actor unless the role matrix says so). | Discovery §2 |

**Requester vs. subject:** the system distinguishes the user who submitted a request (*requester*) from the employee it concerns (*subject*); they are the same person for self-initiated requests. *(AS-002 — PROPOSED, to be validated.)*

---

## 3. User stories

| ID | Story | Traces to |
|---|---|---|
| US-01 | As an **employee**, I want to start an internal transfer request from the portal so that I don't chase multiple teams. | BR-001 |
| US-02 | As an **employee**, I want to choose a proposed department/business unit, location, and role, and give an effective date and optional reason, so that my intent is captured completely. | BR-002–006 |
| US-03 | As an **employee**, I want to submit my request and receive a persistent reference so that I can track it. | BR-007; AS-004 |
| US-04 | As an **employee**, I want to see the current status and a view of all status stages so that I know where my request is. | BR-008, BR-011 |
| US-05 | As an **employee**, I want to see which stakeholder action is pending so that I know what is holding it up. | BR-009 |
| US-06 | As a **manager**, I want to raise a request on behalf of an employee so that I can start a transfer I have agreed with them. | KD-011 |
| US-07 | As an **employee**, I want to edit or withdraw my request before the cutoff so that I can correct mistakes or change my mind. | KD-014 |
| US-08 | As an **employee**, I want to request cancellation, subject to manager approval, so that I can stop a request once it is past the edit/withdraw cutoff. | KD-013 |
| US-09 | As an **approver**, I want to approve, reject, or ask for more information, in sequence, so that the transfer is validated in the right order. | KD-012 |
| US-10 | As **Payroll / IT**, I want to complete my organisational-database update and have it confirmed so that the transfer is only shown as complete when my work is done. | KD-016 |
| US-11 | As a **business owner**, I want stalled requests to escalate L1 → L2 → L3 → Super Admin so that no request is stuck. | KD-015 |
| US-12 | As a **Super Admin**, I want to configure roles and administrative settings so that routing and permissions are maintainable. | KD-015 |

---

## 4. Workflow specification

### 4.1 Stage order **[CONFIRMED — KD-012 v3, CR-20261011]**

```text
Submit
  → 1. Releasing Manager
  → 2. Releasing Department HRBP
  → 3. Receiving HRBP
  → 4. Payroll
  → 5. Receiving Manager
  → 6. IT
  → Completed
```

**Rules**

- **WF-01** Stages run strictly one at a time; no two stages are active concurrently. *(KD-012)*
- **WF-02** A stage may start only after the preceding stage has completed successfully under approved business rules. *(KD-012)*
- **WF-03** Escalation and delegation must not auto-approve a stage or skip the sequence unless an explicit business policy defines a reassignment/decision path. *(Discovery §6.2)* **[CONFIRMED principle; policy OPEN — OQ-B03]**
- **WF-04** A request is shown as *Completed* only after Payroll and IT updates are confirmed. *(KD-016, AS-007)* **[CONFIRMED principle; evidence OPEN — OQ-B12]**

### 4.2 Edit/withdraw cutoff **[CONFIRMED rule, OPEN semantics]**

- **WF-05** The employee may edit or withdraw a submitted request only up to the cutoff associated with the Releasing HRBP stage. *(KD-014)*
- **WF-06** The cutoff event is **OPEN (OQ-B07)**. Candidate definitions:
  - **A.** when the request is assigned to / enters the Releasing HRBP queue;
  - **B.** when the Releasing HRBP opens or begins review;
  - **C.** another defined event.
- **WF-07** The cutoff event shall be implemented as a single, configurable, testable rule once OQ-B07 is resolved. Until then, no behaviour is assumed. *(Resubmission after withdrawal also OPEN.)*

### 4.3 Cancellation **[CONFIRMED rule, OPEN details]**

- **WF-08** The employee can select **"Cancel request"** whether the request was raised by the employee or by a manager on their behalf. *(KD-013)*
- **WF-09** Cancellation requires manager approval. *(KD-013)*
- **WF-10** **OPEN (OQ-B08):** which manager approves, the cancellation decision SLA, and handling when approvals have started or Payroll/IT work is underway.

### 4.4 Decisions and exceptions

| Event | Confirmed behaviour | Open |
|---|---|---|
| Approve | Moves to next stage per WF-01/02. | Per-stage completion conditions (OQ-B10). |
| Reject | Must be recorded with decision, actor, timestamp, reason; must not appear as success. *(PROPOSED)* | Terminal or reopenable (OQ-B10). |
| Request more information | Must identify the information needed and the responder. *(PROPOSED)* | Who responds; which stage resumes; resubmission (OQ-B10). |
| Approver absent / SLA breach | Escalate L1 → L2 → L3 → Super Admin; escalation ≠ approval. *(KD-015)* | L1–L3 mappings, thresholds, delegation (OQ-B01–B03). |
| Technical failure | Must not be shown as business rejection or successful completion. *(AS-007)* | Retry/reconciliation policy (OQ-T06). |

---

## 5. Functional requirements

IDs are stable for downstream tasks and tests. Priority: **M** = must, **S** = should.

### 5.1 Access and identity

| ID | Requirement | Conf. | Pri | Traces |
|---|---|---|---|---|
| FR-001 | Employees, managers, and other users shall access the journey through one shared login entry point in the One-Point Employee Portal. | CONFIRMED | M | KD-001, KD-010 |
| FR-002 | Capabilities after login shall be controlled by role-based permissions. | CONFIRMED (matrix OPEN) | M | KD-010, AS-001 |
| FR-003 | An employee shall be able to view and act only on their own requests, except where a role explicitly grants wider access. | PROPOSED | M | §11 risk "Unauthorised access" |

### 5.2 Request creation

| ID | Requirement | Conf. | Pri | Traces |
|---|---|---|---|---|
| FR-010 | An employee shall be able to initiate an Internal Transfer Request for themselves. | CONFIRMED | M | BR-001, KD-002 |
| FR-011 | A manager shall be able to initiate a request on behalf of an employee. | CONFIRMED | M | KD-011 |
| FR-012 | For manager-created requests, the system shall record requester and subject separately. | PROPOSED | M | AS-002 |
| FR-013 | Whether the employee must confirm a manager-created request, and how they are notified, is **OPEN**. | OPEN | — | BRD §2 (Manager row), BRD §5.2 (Access and permissions) — no OQ-B ID assigned in the BRD |
| FR-014 | The form shall capture proposed department/business unit, location, role/job position, effective date, and an optional reason. | CONFIRMED | M | BR-002–006, KD-003, KD-004 |
| FR-015 | Department/business unit, location, and role shall be selected from governed organisation data, not free text. | PROPOSED | M | AS-003, DEP-003 |
| FR-016 | Valid combinations of department, location, and role, and the authoritative source, are **OPEN**. | OPEN | — | OQ-B06, OQ-T02 |
| FR-017 | Effective-date rules (future date, notice period, calendar, blackout) are **OPEN**. | OPEN | — | OQ-B05 |
| FR-018 | Eligibility checks before or after submission are **OPEN**. | OPEN | — | KD-008, OQ-B04 |
| FR-019 | Duplicate-request detection and concurrent-request handling are **OPEN**; the system shall not create duplicate requests from a repeated submit action. | OPEN / PROPOSED | M | BR-007, §11 |

### 5.3 Submission and tracking

| ID | Requirement | Conf. | Pri | Traces |
|---|---|---|---|---|
| FR-020 | The employee shall be able to submit the request; submission persists it. | CONFIRMED | M | BR-007, KD-005 |
| FR-021 | Each submitted request shall have a persistent unique identifier. | PROPOSED | M | AS-004 |
| FR-022 | The employee shall see the current status of their request. | CONFIRMED | M | BR-008 |
| FR-023 | The employee shall see the full set of status stages for the journey, including which are done, current, and upcoming. | CONFIRMED | M | BR-011, OQ-B09 |
| FR-024 | The employee shall see actions pending with other stakeholders. The detail level is **OPEN**. | CONFIRMED (detail OPEN) | M | BR-009, OQ-B14 |
| FR-025 | The portal shall be the source of truth for status. | PROPOSED | M | Discovery §6.2 |

### 5.4 Workflow execution

| ID | Requirement | Conf. | Pri | Traces |
|---|---|---|---|---|
| FR-030 | The system shall route the request through the six stages in the confirmed order. | CONFIRMED | M | KD-012, WF-01 |
| FR-031 | The system shall not activate a stage until the previous stage completes successfully. | CONFIRMED | M | WF-02 |
| FR-032 | Approvers shall be resolved from approved organisation/manager data, not inferred from job titles. | PROPOSED | M | DEP-004 |
| FR-033 | Each stage shall have explicit outcomes sufficient to drive the progress view. | PROPOSED | M | AS-005 |
| FR-034 | Whether Payroll and IT apply to every transfer, and whether Facilities participates, is **OPEN**. | OPEN | — | KD-009, OQ-B11, AS-006 |

### 5.5 Edit, withdraw, cancel

| ID | Requirement | Conf. | Pri | Traces |
|---|---|---|---|---|
| FR-040 | The employee shall be able to edit a submitted request until the cutoff defined in WF-05. | CONFIRMED (cutoff OPEN) | M | KD-014 |
| FR-041 | The employee shall be able to withdraw a submitted request until the same cutoff. | CONFIRMED (cutoff OPEN) | M | KD-014 |
| FR-042 | After the cutoff, edit and withdraw shall not be available. | PROPOSED (follows KD-014) | M | KD-014 |
| FR-043 | The employee shall be able to select "Cancel request" on their request, whether self- or manager-raised. | CONFIRMED | M | KD-013 |
| FR-044 | A cancellation request shall require manager approval before the request is cancelled. | CONFIRMED | M | KD-013 |
| FR-045 | Approver identity, cancellation SLA, and handling of in-flight Payroll/IT work are **OPEN**. | OPEN | — | OQ-B08 |

### 5.6 Downstream completion

| ID | Requirement | Conf. | Pri | Traces |
|---|---|---|---|---|
| FR-050 | Payroll shall update the relevant organisational/payroll database as stage 4. | CONFIRMED (stage number per KD-012 v3) | M | KD-016, KD-012 |
| FR-051 | IT shall update the relevant organisational/IT database as stage 6. | CONFIRMED | M | KD-016 |
| FR-052 | The request shall be marked Completed only after both updates are confirmed. | CONFIRMED principle | M | WF-04, AS-007 |
| FR-053 | The success evidence (callback, API response, manual confirmation) and integration style (API/event/queue/manual) are **OPEN**. | OPEN | — | OQ-B12, OQ-T03, OQ-T04 |

### 5.7 Escalation and administration

| ID | Requirement | Conf. | Pri | Traces |
|---|---|---|---|---|
| FR-060 | Where an approval/action is not completed, the system shall escalate through L1, L2, L3, then Super Admin. | CONFIRMED (mappings OPEN) | M | KD-015, OQ-B01 |
| FR-061 | Escalation shall not constitute approval or skip the sequence. | CONFIRMED principle | M | WF-03 |
| FR-062 | SLA thresholds per stage and escalation timing are **OPEN**; no intervals shall be hard-coded before approval. | OPEN | — | OQ-B02 |
| FR-063 | Delegation (who, how granted, equivalent authority) is **OPEN**. | OPEN | — | OQ-B03 |
| FR-064 | Super Admin shall be able to configure roles and other administrative settings. | CONFIRMED (scope OPEN) | M | KD-015, OQ-B16 |

---

## 6. Status model

> **[OPEN — OQ-B09]** Labels, permitted transitions, and terminal states are not approved. The set below is **PROPOSED** so that acceptance criteria can be drafted; it must be validated before implementation.

### 6.1 Proposed statuses

| Status | Meaning | Terminal? |
|---|---|---|
| Draft | Created, not yet submitted | No |
| Submitted | Persisted; awaiting stage 1 | No |
| Pending — Releasing Manager | Stage 1 active | No |
| Pending — Releasing Dept HRBP | Stage 2 active | No |
| Pending — Receiving HRBP | Stage 3 active | No |
| Pending — Payroll | Stage 4 active | No |
| Pending — Receiving Manager | Stage 5 active | No |
| Pending — IT | Stage 6 active | No |
| Returned for information | An approver asked for more information | No *(OPEN)* |
| Rejected | An approver rejected | **OPEN** |
| Withdrawn | Employee withdrew before cutoff | Yes *(resubmission OPEN)* |
| Cancellation requested | Employee asked to cancel; awaiting manager decision | No |
| Cancelled | Cancellation approved | Yes |
| Completed | Payroll and IT updates confirmed | Yes |

### 6.2 Proposed transition constraints

```text
Draft → Submitted → Pending(1) → Pending(2) → Pending(3) → Pending(4) → Pending(5) → Pending(6) → Completed

Any Pending      → Returned for information   (resume stage: OPEN)
Any Pending      → Rejected                   (terminal or reopen: OPEN)
Submitted/early  → Withdrawn                  (only until cutoff: OPEN)
Any non-terminal → Cancellation requested → Cancelled | previous status (if declined)
```

- **ST-01** Only the transitions above (once approved) are permitted; any other change is rejected.
- **ST-02** *Completed* is reachable only from *Pending — IT* after confirmed updates.
- **ST-03** Technical failure shall not set *Rejected* or *Completed* (AS-007).
- **ST-04** Every transition records actor, timestamp, and reason where applicable (§11).

---

## 7. Data requirements

Logical entities only. Storage, schema, and API design belong to Deliverable 3.

### 7.1 Internal Transfer Request

| Field | Required | Notes | Traces |
|---|---|---|---|
| Request ID | System | Persistent, unique | AS-004 |
| Subject employee | Yes | Employee the transfer concerns | AS-002 |
| Requester | Yes | User who submitted; may equal subject | AS-002 |
| Proposed department / business unit | Yes | From governed data | BR-002, AS-003 |
| Proposed location | Yes | From governed data | BR-003, AS-003 |
| Proposed role / job position | Yes | From governed data | BR-004, AS-003 |
| Effective date | Yes | Rules **OPEN** | BR-005, OQ-B05 |
| Reason | **Optional** | Length/content rules **OPEN**; whether it becomes mandatory for particular transfer types is **OPEN** (BRD §5.2, no OQ-B ID); may be sensitive | BR-006, KD-004 |
| Current status | System | See §6 | BR-008 |
| Created / submitted timestamps | System | | — |

### 7.2 Workflow stage record

| Field | Notes |
|---|---|
| Request ID, stage (1–6), assigned approver/owner | Assignee from approved organisation data |
| Stage state | Not started / active / completed / failed / skipped *(skipped policy OPEN)* |
| Outcome, actor, timestamp, reason | For approve/reject/return decisions |
| Escalation level reached | None / L1 / L2 / L3 / Super Admin |

### 7.3 Cancellation request

Request ID, requester, approving manager *(OPEN)*, decision, timestamps, reason.

### 7.4 Audit event

Request ID, event type, actor, on-behalf-of (if any), timestamp, before/after values, correlation ID. Retention **OPEN (OQ-B15)**.

---

## 8. Acceptance criteria

Format: **Given / When / Then**. Criteria marked 🔒 are **blocked** until the referenced OQ is resolved; they are included so that the unresolved rule stays visible and testable later.

### 8.1 Request creation and submission

| ID | Criterion | Traces |
|---|---|---|
| AC-001 | **Given** an authenticated employee, **when** they open the transfer journey in the portal, **then** they can start a request for themselves. | FR-010, BR-001 |
| AC-002 | **Given** an authenticated manager, **when** they start a request on behalf of an employee, **then** the request records the manager as requester and the employee as subject. | FR-011, FR-012 |
| AC-003 | **Given** the request form, **when** the user completes department/business unit, location, role, and effective date and leaves reason blank, **then** the request can be submitted. | FR-014, KD-004 |
| AC-004 | **Given** a required field is missing, **when** the user submits, **then** submission is blocked and the missing field is identified. | FR-014, BR-007 |
| AC-005 | **Given** the user submits once, **when** the submit action is repeated (double-click/retry), **then** only one request exists. | FR-019 |
| AC-006 | **Given** a successful submission, **then** the request has a unique persistent ID and is visible to the employee with status *Submitted*. | FR-020–022 |
| AC-007 🔒 | **Given** an effective date violating the approved date rules, **when** submitting, **then** submission is rejected with a clear reason. | FR-017, OQ-B05 |
| AC-008 🔒 | **Given** an invalid department/location/role combination, **when** submitting, **then** submission is rejected. | FR-016, OQ-B06 |
| AC-009 🔒 | **Given** an ineligible employee, **then** the approved eligibility outcome applies. | FR-018, OQ-B04 |

### 8.2 Tracking and visibility

| ID | Criterion | Traces |
|---|---|---|
| AC-010 | **Given** a submitted request, **then** the employee sees the current status and all journey stages, with completed, current, and upcoming stages distinguishable. | FR-022, FR-023 |
| AC-011 | **Given** a stage is active, **then** the employee sees that an action is pending with the relevant stakeholder role (detail level per OQ-B14). | FR-024, BR-009 |
| AC-012 | **Given** another employee's request, **when** a user without a granting role tries to view it, **then** access is denied. | FR-003 |
| AC-013 🔒 | **Given** a pending stakeholder action, **then** the employee sees only the information approved as visible (e.g., role vs. named person). | OQ-B14 |

### 8.3 Sequential workflow

| ID | Criterion | Traces |
|---|---|---|
| AC-020 | **Given** a submitted request, **then** stage 1 (Releasing Manager) is the only active stage. | FR-030, WF-01 |
| AC-021 | **Given** stage N is not completed successfully, **then** stage N+1 is not active and its owner cannot act. | FR-031, WF-02 |
| AC-022 | **Given** stage N completes successfully, **then** stage N+1 becomes active and the status updates accordingly. | FR-030 |
| AC-023 | **Given** all six stages are processed in order, **then** the stages occur in the order Releasing Manager, Releasing Dept HRBP, Receiving HRBP, Payroll, Receiving Manager, IT. *(Revised by CR-20261011.)* | KD-012 (v3) |
| AC-024 | **Given** any stage, **then** no two stages are active at the same time. | WF-01 |
| AC-025 🔒 | **Given** Payroll has confirmed its stage-4 update, **when** the Receiving Manager rejects or returns the request at stage 5, **then** the approved Payroll-reversal rule applies. *(Added by CR-20261011.)* | KD-012 (v3), OQ-B17 |

### 8.4 Edit / withdraw / cancel

| ID | Criterion | Traces |
|---|---|---|
| AC-030 🔒 | **Given** the request has not reached the approved cutoff, **when** the employee edits it, **then** the edit is saved and recorded in audit history. | FR-040, OQ-B07 |
| AC-031 🔒 | **Given** the request has not reached the approved cutoff, **when** the employee withdraws it, **then** status becomes *Withdrawn* and no further stages activate. | FR-041, OQ-B07 |
| AC-032 🔒 | **Given** the request is at or beyond the approved cutoff, **then** edit and withdraw are unavailable. | FR-042, OQ-B07 |
| AC-033 | **Given** a self- or manager-raised request, **when** the employee selects "Cancel request", **then** status becomes *Cancellation requested* and a manager approval task is created. | FR-043, FR-044 |
| AC-034 | **Given** a pending cancellation, **when** the approving manager approves, **then** the request becomes *Cancelled*. | FR-044 |
| AC-035 | **Given** a pending cancellation, **when** the manager declines, **then** the request continues from its prior state. *(PROPOSED)* | FR-044 |
| AC-036 🔒 | **Given** cancellation approved after Payroll/IT work has started, **then** the approved in-flight handling rule applies. | FR-045, OQ-B08 |

### 8.5 Decisions, escalation, completion

| ID | Criterion | Traces |
|---|---|---|
| AC-040 | **Given** an approver rejects, **then** decision, actor, timestamp, and reason are recorded, and the request is not shown as successful. | §4.4, ST-03 |
| AC-041 | **Given** an approver requests more information, **then** the required information and responder are recorded. | §4.4 |
| AC-042 🔒 | **Given** a reject or return, **then** the approved terminal/resume/resubmission behaviour applies. | OQ-B10 |
| AC-043 | **Given** a stage exceeds its approved SLA, **then** the task escalates to the next level (L1 → L2 → L3 → Super Admin) and is **not** auto-approved. | FR-060, FR-061 |
| AC-044 🔒 | **Given** the approved L1–L3 mapping and SLA thresholds, **then** escalation targets and timing match them. | OQ-B01, OQ-B02 |
| AC-045 | **Given** Payroll and IT updates are not both confirmed, **then** the request is not shown as *Completed*. | FR-052, WF-04 |
| AC-046 | **Given** both Payroll and IT updates are confirmed, **then** the status becomes *Completed*. | FR-052 |
| AC-047 🔒 | **Given** the approved success-evidence rule, **then** only that evidence marks a downstream update as confirmed. | OQ-B12 |
| AC-048 | **Given** a downstream technical failure, **then** the request is not shown as *Rejected* or *Completed* and the failure is visible to operators. | ST-03, AS-007 |

### 8.6 Administration

| ID | Criterion | Traces |
|---|---|---|
| AC-050 | **Given** a Super Admin, **then** they can configure roles and administrative settings. | FR-064 |
| AC-051 | **Given** a non-Super Admin user, **then** they cannot change roles or administrative settings. | FR-002, FR-064 |
| AC-052 🔒 | **Given** a Super Admin action beyond role configuration, **then** it is permitted only if listed in the approved capability set. | OQ-B16 |

---

## 9. Exception and failure handling

Carries forward the §11 discovery risks. Business behaviour is **PROPOSED** unless marked.

| Scenario | Required behaviour | Open dependency |
|---|---|---|
| Ambiguous / unresolved approver | Request must not silently stall; escalation per FR-060; Super Admin is final fallback. | OQ-B01 |
| Approver absence or SLA breach | Escalate; never treat as approval. | OQ-B02, OQ-B03 |
| Manager-on-behalf ambiguity | Requester and subject always distinguishable in UI and audit. | OQ-B15 |
| Cancellation after work starts | Defined handling must stop or reverse in-flight Payroll/IT actions as approved. | OQ-B08 |
| Stale/invalid organisation data | Validate selections at submission; reject invalid values. | OQ-B06, OQ-T02 |
| Partial downstream completion | Request must not be *Completed*; failure surfaced; reconciliation per policy. | OQ-T06 |
| Integration outage / timeout | Status must not become falsely current; stakeholder action creation must be retried/visible. | OQ-T06 |
| Duplicate submission / repeated event | Idempotent handling; no duplicate requests or downstream actions. | OQ-T06 |
| Incorrect status shown | Completion only after all confirmations. | OQ-B12 |
| Unauthorised access | Enforce FR-003 and role matrix. | OQ-B14, OQ-T01 |
| Sensitive-data exposure | Limit reason/transfer details to authorised roles. | OQ-B14 |
| Unclear rejection/rework path | Defined path required before release. | OQ-B10 |
| Receiving Manager rejects after Payroll has updated | The Payroll update must not be left silently in place; the approved reversal or hold rule applies (AC-025). | OQ-B17 |

---

## 10. Notifications

> **[OPEN — OQ-B13]** Recipients, events, channels, reminders, and templates are not approved. The portal is the status source of truth regardless.

**PROPOSED event candidates** (for HR/portal-owner decision):

| Event | Candidate recipients |
|---|---|
| Request submitted | Employee (and requester, if different), stage-1 approver |
| Action required at a stage | Stage approver/owner |
| Approved / rejected / returned for information | Employee, requester |
| Cancellation requested / decided | Employee, approving manager |
| SLA escalation | Escalation target, affected approver |
| Completed | Employee, requester |

**Constraints**

- **NT-01** Notifications shall not expose unnecessary sensitive transfer details. *(PROPOSED)*
- **NT-02** Reminder intervals shall not be defined until SLAs are approved (OQ-B02).

---

## 11. Audit and traceability

> Retention and visibility rules are **OPEN (OQ-B15)**.

**PROPOSED** audit events:

- request created (including on-behalf, with requester and subject);
- submitted; edited (before/after); withdrawn;
- stage activated; approved; rejected; returned for information;
- cancellation requested and decided;
- delegation granted/used; escalation level changes;
- Payroll/IT update confirmation or failure;
- completion;
- Super Admin role/configuration changes.

**AU-01** Each event records actor, on-behalf-of, timestamp, request ID, and correlation ID. **AU-02** Audit records are append-only and access-controlled. *(PROPOSED)*

---

## 12. Security and access control

| ID | Requirement | Conf. |
|---|---|---|
| SEC-01 | Authenticate through the portal's shared login; identity propagates to the journey. | CONFIRMED (mechanism OPEN — OQ-T01) |
| SEC-02 | Authorise every view and action server-side by role and ownership. | PROPOSED |
| SEC-03 | Prevent employees from viewing/acting on others' requests unless a role grants it. | PROPOSED |
| SEC-04 | Restrict stage actions to the assigned approver (or authorised delegate once defined). | PROPOSED |
| SEC-05 | Apply least privilege and separation of duties to Super Admin. | PROPOSED (OQ-B16) |
| SEC-06 | Treat the optional reason as potentially sensitive; limit its visibility. | PROPOSED (OQ-B14) |

The detailed role matrix is **OPEN** and blocks authorisation implementation.

---

## 13. Non-functional requirements

> **[OPEN — OQ-T07, OQ-T08, OQ-T09]** The brief specifies none. Targets must be agreed before the technical plan commits to an architecture.

| Area | Status |
|---|---|
| Availability / performance targets | OPEN |
| Accessibility standard | OPEN |
| Browser / device support | OPEN |
| Status freshness (how quickly progress updates) | OPEN (BR-011) |
| Security / privacy / retention standards | OPEN |
| Logging, API contract, error, correlation-ID standards | OPEN (OQ-T05) |
| Deployment, CI/CD, monitoring, operational ownership | OPEN |
| Success metrics (processing time, completion rate, fewer manual follow-ups) | OPEN (Discovery §1) |

---

## 14. Assumptions, dependencies and scope

### 14.1 Working assumptions carried forward

| ID | Assumption | Status |
|---|---|---|
| AS-001 | One shared login; access role-based. | Partly confirmed (KD-010); matrix to validate |
| AS-002 | Request records subject and requester separately. | Unvalidated |
| AS-003 | Org selections use governed data. | Unvalidated |
| AS-004 | Requests have a persistent identifier. | Unvalidated |
| AS-005 | Stage actions have explicit outcomes. | Unvalidated |
| AS-006 | Some downstream activities may be conditional. | Unvalidated (conflicts with KD-016 for Payroll/IT — see OQ-B11) |
| AS-007 | Downstream failure never appears as completion. | Unvalidated |

### 14.2 Dependencies

DEP-001 – DEP-009 apply unchanged (portal integration, employee/org master data, governed org values, manager/HRBP/L1–L3 mappings, HR eligibility rules, org-update interfaces, Payroll/IT/Facilities systems, notification capability, security/audit/retention standards).

---

## 15. Open decisions and blocking matrix

### 15.1 Blocking items

| OQ | Decision needed | Blocks |
|---|---|---|
| OQ-B07 | Edit/withdraw cutoff event; resubmission | FR-040–042, AC-030–032 |
| OQ-B09 | Status labels, transitions, terminals | §6, FR-023, all status criteria |
| OQ-B10 | Reject / return / resubmit behaviour | §4.4, AC-042 |
| OQ-B08 | Cancellation approver and in-flight handling | FR-045, AC-036 |
| OQ-B01 / B02 / B03 | L1–L3 mapping, SLAs, delegation | FR-060–063, AC-043–044 |
| OQ-B12 | Payroll/IT success evidence | FR-052–053, AC-047 |
| OQ-B17 | Payroll reversal if the Receiving Manager rejects or returns after the stage-4 update | AC-025, FR-050 |
| OQ-B14 | Employee-visible pending-action detail | FR-024, AC-013 |
| OQ-B16 | Super Admin capability set | FR-064, AC-052 |
| OQ-B04 / B05 / B06 | Eligibility, date rules, valid combinations | FR-016–018, AC-007–009 |

### 15.2 Non-blocking for design, but needed before release

| OQ | Decision needed |
|---|---|
| OQ-B11 | Mandatory vs conditional downstream; Facilities participation |
| OQ-B13 | Notification policy |
| OQ-B15 | Audit and retention |
| OQ-T01 – T09 | Technical standards, integrations, NFRs |

### 15.3 Discovery-versus-clarification note

AS-006 (conditional downstream) must be reconciled with KD-016 (Payroll and IT updates are part of the completion path). Until OQ-B11 is answered, treat Payroll and IT as stages in the confirmed sequence, and treat any conditional applicability as **OPEN**, not assumed.

### 15.4 Gate 0 reviewer recommendation — needs reviewer clarification

The Gate 0 approval record asks that "open gating conditions (C3, C5, C12) in the spec are addressed against the approved BRD baseline". Condition IDs C3, C5 and C12 come from the superseded spec v1.3, which was replaced by this spec in commit `42dee74`. This spec has no C-numbered conditions. The likely matches below are **unconfirmed**, and the Gate 1 reviewer needs to confirm or correct them:

| Old condition | Old subject | Possible match in this spec |
|---|---|---|
| C3 | Position / requisition model (old OQ16) | No direct match. OQ-B06 (valid department/location/role combinations) is the closest. |
| C5 | Approval authority plus delegation (old OQ25 + OQ29) | OQ-B03 (delegation), with OQ-B01 (L1–L3 mapping) |
| C12 | Independent peer review | The Gate 1 review itself |

The BRD also leaves two items open without an OQ-B ID: whether the employee must confirm a manager-created request (FR-013), and whether the reason becomes mandatory for particular transfer types (§7.1). IDs for them should be raised in the BRD; this spec does not invent them.

---

## 16. Traceability matrix

| Discovery ref | Spec requirement(s) | Acceptance criteria |
|---|---|---|
| BR-001 | FR-010 | AC-001 |
| BR-002 – BR-004 | FR-014, FR-015 | AC-003, AC-008 |
| BR-005 | FR-014, FR-017 | AC-003, AC-007 |
| BR-006 / KD-004 | FR-014 | AC-003 |
| BR-007 | FR-019, FR-020 | AC-004, AC-005, AC-006 |
| BR-008 | FR-022 | AC-006, AC-010 |
| BR-009 | FR-024 | AC-011, AC-013 |
| BR-010 | FR-030, FR-031, FR-050–052 | AC-020 – AC-024, AC-045 – AC-048 |
| BR-011 | FR-023, FR-025 | AC-010 |
| KD-001 | FR-001 | AC-001 |
| KD-002 | FR-010 | AC-001 |
| KD-003 | FR-014, FR-015 | AC-003, AC-004 |
| KD-005 | FR-020, FR-022 | AC-006, AC-010 |
| KD-006 | FR-024 | AC-011, AC-013 |
| KD-007 | FR-023, FR-025, FR-030 | AC-010, AC-020 |
| KD-008 | FR-018, FR-030 | AC-009, AC-020 |
| KD-009 | FR-034, FR-050, FR-051 | AC-045, AC-046 |
| KD-010 | FR-001, FR-002 | AC-051 |
| KD-011 | FR-011, FR-012 | AC-002 |
| KD-012 (v3) | FR-030, FR-031, FR-050, WF-01/02 | AC-020 – AC-025 |
| KD-013 | FR-043 – FR-045 | AC-033 – AC-036 |
| KD-014 | FR-040 – FR-042 | AC-030 – AC-032 |
| KD-015 | FR-060 – FR-064 | AC-043, AC-044, AC-050 – AC-052 |
| KD-016 | FR-050 – FR-052 | AC-045 – AC-047 |
| §11 risks | §9 | AC-005, AC-012, AC-040, AC-043, AC-045, AC-048 |

---

## 17. Specification exit criteria

The specification is ready for the technical plan when:

- [x] The spec is synced to the Gate 0-approved BRD baseline (v0.2, 2026-10-11).
- [ ] All **blocking** OQ items in §15.1 are resolved, or explicitly accepted as temporary assumptions.
- [ ] The status model in §6 is approved.
- [ ] The role matrix, including Super Admin capabilities, is approved.
- [ ] Every 🔒 acceptance criterion has its rule confirmed and its marker removed.
- [ ] The system-responsibility boundary for orchestration is agreed.
- [ ] Non-functional targets are agreed (§13).
- [ ] Each FR/AC maps to a Discovery reference (§16) with no orphaned requirements.

---

**Next artefact:** Deliverable 3 — Technical Plan, using the approved portions of this specification and the technical open questions OQ-T01 – OQ-T09.