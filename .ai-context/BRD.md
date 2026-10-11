# Deliverable 1 — Requirement / Discovery Analysis

## Employee Internal Transfer Digital Journey

| | |
|---|---|
| **Status** | Discovery draft — updated with project-owner clarifications; open questions remain |
| **Source** | `Requirement for SDD.docx` (SDD Developer Assessment) plus project-owner clarifications recorded in this conversation |
| **Next artefact** | Deliverable 2 — Feature Specification (`.spec.md`) |

**Purpose:** Analyse the stated business requirement before producing the feature specification. This document separates source requirements, project-owner-confirmed decisions, recommendations, assumptions, and unresolved questions. It does not silently convert unanswered questions into approved requirements.

---

## Table of Contents

1. [Business objective](#1-business-objective)
2. [Primary users and stakeholders](#2-primary-users-and-stakeholders)
3. [Initial journey stages](#3-initial-journey-stages)
4. [Business requirements identified from the brief](#4-business-requirements-identified-from-the-brief)
5. [Business rules](#5-business-rules)
6. [Known decisions vs. open questions](#6-known-decisions-vs-open-questions)
7. [Assumptions](#7-assumptions)
8. [Dependencies](#8-dependencies)
9. [Out of scope — provisional boundaries](#9-out-of-scope--provisional-boundaries)
10. [Business decisions vs. technical decisions](#10-business-decisions-vs-technical-decisions)
11. [Risks and failure scenarios](#11-risks-and-failure-scenarios-to-carry-into-specification)
12. [Initial traceability approach](#12-initial-traceability-approach)
13. [Discovery exit criteria](#13-discovery-exit-criteria)
14. [Source limitations](#14-source-limitations)

---

## 1. Business objective

Provide a single digital journey through the One-Point Employee Portal that allows an employee to initiate an Internal Transfer Request and view its progress, including the current status and actions pending with other stakeholders.

The wider business context is that an internal transfer currently involves multiple teams and systems. The brief gives examples of manager confirmation, HR eligibility validation, organisational-information updates, possible payroll updates, IT access changes, facilities arrangements, and employee confirmation.

### Intended business value (stated or implied)

- Give employees one place to initiate and track an internal transfer.
- Orchestrate relevant downstream activities across stakeholders and systems.
- Make the progress of the request visible to the employee.

> **Not yet defined:** measurable success targets (for example, processing time, completion rate, or reduction in manual follow-ups).

---

## 2. Primary users and stakeholders

| User / stakeholder | Current understanding | Discovery notes / decisions needed |
|---|---|---|
| **Employee / requester** | Can initiate a request for self, enter transfer details, submit, and view request status. | Confirmed: can edit/withdraw a submitted request only up to the agreed cutoff associated with the Releasing HRBP stage (exact cutoff semantics remain open). Can request cancellation, subject to manager approval. Define exactly which status and pending-action details are visible. |
| **Manager** | Can participate in the approval workflow and can initiate a transfer request on behalf of an employee. | Confirm which manager role is initiating, how the employee is notified, whether the employee must confirm a manager-created request, and how requester/subject employee are distinguished in audit records. |
| **Releasing Manager** | First approval stage in the confirmed sequential workflow. | Identity and authority should come from approved organisation/manager data. L1/L2/L3 escalation mappings remain open. |
| **Releasing Department HRBP** | Second approval stage. Employee edit/withdraw cutoff is associated with this stage, but exact timing is unresolved. | Define what "until the Releasing HRBP is approving" means operationally, and whether a request can be edited while waiting for or while being reviewed by this HRBP. L1/L2/L3 mappings remain open. |
| **Receiving HRBP** | Third approval stage. | Define decision authority, required checks, and L1/L2/L3 mappings. |
| **Receiving Manager** | Fourth approval stage. | Define decision authority and L1/L2/L3 mappings. |
| **Payroll** | Fifth stage; must update the relevant organisational/payroll database as part of completion. | Confirm data fields, integration or manual action, success evidence, retries, and L1/L2/L3 escalation mappings. |
| **IT** | Sixth stage; must update the relevant organisational/IT database as part of completion. | Confirm data fields, integration or manual action, success evidence, retries, and L1/L2/L3 escalation mappings. |
| **Super Admin** | Final escalation fallback. Can configure roles and other administrative settings; exact capabilities need definition. | Confirm permissions, separation of duties, audit requirements, and which actions Super Admin may perform. Final fallback if L1/L2/L3 escalation does not resolve the issue. |
| **One-Point Employee Portal** | Entry point for the digital journey. | Confirm portal integration, navigation, identity propagation, and hosting conventions. Project-owner clarification: one shared login entry point for employees, managers, and other users; role-based permissions still need to be defined. |
| **HR / business process owner** | Owns policy decisions and the business workflow. | Confirm eligibility, effective-date policy, rejection/rework policy, cancellation approval, SLAs, notifications, and audit/retention rules. |

> The role and workflow details above include project-owner clarifications and are more specific than the original high-level assessment brief. Where this document marks a question open, do not infer an answer from job titles alone.

---

## 3. Initial journey stages

The stages below reflect the current project-owner clarifications. The six workflow stages are sequential and must not run in parallel. Some policy and exception details remain open.

1. **Access the journey** — Employee, manager, and other authorised users enter through one shared login entry point in the One-Point Employee Portal. Permissions are role-based; the exact role matrix remains to be specified.
2. **Start a request** — An employee may initiate a transfer for self, or a manager may initiate one on behalf of an employee.
3. **Enter proposed transfer details** — Capture proposed department/business unit, location, role/job position, effective date, and optional reason. Eligibility rules, valid combinations, and effective-date constraints remain open.
4. **Submit and track** — Persist the request and provide the employee with the request status and a view of all relevant status stages. Status names, transitions, and pending-action visibility remain to be defined.
5. **Sequential approvals/actions** — Process one stage at a time in this exact order:

   **Releasing Manager → Releasing Department HRBP → Receiving HRBP → Receiving Manager → Payroll → IT**

   The next stage must not start until the preceding stage has completed successfully according to the approved business rules.
6. **Edit/withdraw before cutoff** — The employee may edit or withdraw a submitted request only up to the cutoff associated with the Releasing HRBP stage. The phrase "until the Releasing HRBP is approving" is not precise enough to determine whether the cutoff is when the request enters that queue or when review actually begins; this remains open.
7. **Cancellation request** — If the request was raised by a manager on behalf of an employee or by the employee directly, the employee can select "Cancel request". Cancellation requires manager approval. The relevant manager, cancellation timing, and effect on in-progress downstream actions remain to be defined.
8. **Handle decisions and exceptions** — Rejection, request for more information, approver absence, SLA escalation, and technical failures must follow defined paths. Recommendations are recorded separately from confirmed rules.
9. **Complete downstream updates** — Payroll and IT update their relevant organisational databases. Completion should not be shown until the required updates have been confirmed; the exact evidence/confirmation mechanism remains open.
10. **Notify and show progress** — Keep the portal as the status source of truth and notify relevant users according to a notification policy that remains to be approved.

> **Confirmed workflow order:** the six approval/action stages in step 5 are sequential, not parallel.
>
> **Open:** each stage's exact completion condition; whether Payroll and IT always apply to every transfer; and how a rejected/returned/cancelled request affects the sequence.

---

## 4. Business requirements identified from the brief

| ID | Requirement from the brief | Status / note |
|---|---|---|
| BR-001 | An employee can initiate an Internal Transfer Request from the One-Point Employee Portal. | Explicit |
| BR-002 | The employee can select a proposed new department/business unit. | Explicit |
| BR-003 | The employee can select a proposed new location. | Explicit |
| BR-004 | The employee can select a proposed role/job position. | Explicit |
| BR-005 | The employee can provide an effective date. | Explicit; date rules are unspecified |
| BR-006 | The employee can provide an optional reason for the transfer. | Explicit; length/content rules are unspecified |
| BR-007 | The employee can submit the request. | Explicit; validation and duplicate-submission rules are unspecified |
| BR-008 | The employee can view the current request status. | Explicit; status model is unspecified |
| BR-009 | The employee can view actions pending with other stakeholders. | Explicit; visibility and detail level are unspecified |
| BR-010 | The portal should orchestrate downstream activities. | Explicit objective; integrations and orchestration rules are unspecified |
| BR-011 | The employee should have a single view of progress. | Explicit objective; presentation and update freshness are unspecified |

> These IDs are proposed discovery identifiers for traceability. They are not identifiers supplied by the source brief; retain or remap them consistently in later artefacts.

---

## 5. Business rules

### 5.1 Rules explicitly stated

**From the original brief**

- The employee initiates the request through the One-Point Employee Portal.
- The proposed transfer details include department/business unit, location, role/job position, and effective date.
- The reason for transfer is optional.
- The employee can submit the request.
- The employee can view current status and actions pending with other stakeholders.
- The portal is intended to orchestrate downstream activities and present one view of progress.
- Facilities is mentioned as a possible downstream activity, but whether it is included in the confirmed workflow remains open.

**Project-owner clarifications**

- One shared login entry point serves employees, managers, and other users; role-based access remains to be defined.
- A manager can initiate a request on behalf of an employee.
- The approval/action stages are sequential in this order: Releasing Manager, Releasing Department HRBP, Receiving HRBP, Receiving Manager, Payroll, IT.
- An employee can request cancellation, and manager approval is required.
- An employee can edit or withdraw a submitted request only until the cutoff associated with the Releasing HRBP stage; the exact cutoff is unresolved.
- Super Admin can configure roles and other administrative settings, with detailed permissions still to be specified.
- Payroll and IT update their relevant organisational databases as part of the completion path.

### 5.2 Rules not yet defined

> Do not implement these as assumed policy until a business owner confirms them.

**Access and permissions**

- Which employee/manager permissions apply beyond the confirmed ability for employees to self-initiate and managers to initiate on behalf of employees.
- Whether the employee must confirm a manager-created request.

**Submission and validation**

- Whether and how eligibility is checked before submission.
- Valid department, business unit, location, and role combinations.
- Whether the effective date must be in the future, minimum notice periods, and date/calendar rules.
- Whether a reason is optional in every case or mandatory for particular transfer types.
- Duplicate-request detection and handling of concurrent requests.

**Workflow and exceptions**

- Exact decision rights and completion conditions for each confirmed workflow stage.
- Delegation and timeout behaviour, and L1/L2/L3 escalation mappings for each approval/action role (Super Admin is the confirmed final fallback).
- Exact cutoff semantics for employee edit/withdraw rights at the Releasing HRBP stage; resubmission rules.
- Which manager must approve an employee-requested cancellation, the cancellation decision SLA, and how cancellation affects actions already underway.
- Complete status list, permitted transitions, and terminal states.
- Rejection, cancellation, return-for-information, and resubmission behaviour, including their effects on the sequential workflow.
- Whether Payroll and IT actions are mandatory for every transfer or conditional by transfer type; whether Facilities or other teams are included.
- The exact success evidence for Payroll and IT database updates.
- What constitutes completion and when the employee is notified.

**Communication, visibility, and governance**

- Notification recipients, events, channels, reminder/escalation policy, and templates.
- What pending stakeholder information may be exposed to the employee.
- SLA thresholds for each approval/action stage and the L1/L2/L3 mapping for each role.
- Audit/history, retention, and visibility rules.

---

## 6. Known decisions vs. open questions

### 6.1 Known decisions

| ID | Known decision / requirement | Evidence in source |
|---|---|---|
| KD-001 | The journey is accessed through the One-Point Employee Portal. | Business Requirement |
| KD-002 | The employee initiates an Internal Transfer Request. | Business Requirement |
| KD-003 | The employee supplies the proposed department/business unit, location, role/job position, and effective date. | Business Requirement |
| KD-004 | Transfer reason is optional. | Business Requirement |
| KD-005 | The employee can submit the request and view status. | Business Requirement |
| KD-006 | The employee can see actions pending with other stakeholders. | Business Requirement |
| KD-007 | The portal should orchestrate downstream activities and provide a single progress view. | Business Requirement |
| KD-008 | Manager confirmation and HR eligibility validation appear in the example journey. | Business Context |
| KD-009 | Organisational-information updates are part of the example journey; payroll, IT, and facilities actions may apply. | Business Context |
| KD-010 | One shared login entry point serves employee, manager, and other users. | Project-owner clarification |
| KD-011 | A manager can initiate a transfer request on behalf of an employee. | Project-owner clarification |
| KD-012 | Workflow order is sequential: Releasing Manager → Releasing Department HRBP → Receiving HRBP → Receiving Manager → Payroll → IT. | Project-owner clarification |
| KD-013 | Employee can request cancellation; manager approval is required. | Project-owner clarification |
| KD-014 | Employee can edit/withdraw only until the cutoff tied to the Releasing HRBP stage. | Project-owner clarification; exact cutoff open |
| KD-015 | Super Admin is the final escalation fallback and can configure roles and other administrative settings. | Project-owner clarification |
| KD-016 | Payroll and IT must update their relevant organisational databases as part of the completion path. | Project-owner clarification |

### 6.2 Open business questions

| ID | Question | Why it matters | Suggested owner |
|---|---|---|---|
| OQ-B01 | For each workflow role (Releasing Manager, Releasing Department HRBP, Receiving HRBP, Receiving Manager, Payroll, IT), who are the L1, L2, and L3 escalation authorities? | Determines role-specific SLA escalation and absence handling. **Super Admin is the confirmed final fallback** if L1/L2/L3 escalation does not resolve the issue. | HR / business process owner |
| OQ-B02 | What are the SLA thresholds for each approval and downstream action, and at what elapsed time does escalation move from L1 to L2 to L3 and then Super Admin? | Enables predictable reminders, escalations, and operational monitoring. | Business owner / operations |
| OQ-B03 | If an approver is absent, who may act as an authorised delegate, how is delegation granted, and can a delegate make the same decision as the assigned approver? | Avoids stalled requests without bypassing authority controls. | HR / business process owner |
| OQ-B04 | What are the eligibility rules for an internal transfer? | Needed to determine valid submissions and HR outcomes. | HR |
| OQ-B05 | What effective-date rules apply (future date, notice period, cut-off, calendar, or blackout dates)? | Affects validation and downstream scheduling. | HR |
| OQ-B06 | Which combinations of department/business unit, location, and role/job position are valid, and which system is authoritative? | Affects selection controls and validation. | HR / organisation data owner |
| OQ-B07 | What exactly is the edit/withdraw cutoff: when the request is assigned to the Releasing Department HRBP, when that HRBP opens/reviews it, or another defined event? Can the employee resubmit after withdrawal? | The phrase "until the Releasing HRBP is approving" is ambiguous and must become a testable rule. | HR / business owner |
| OQ-B08 | Which manager approves a cancellation request, and what happens if cancellation is requested after approval has started or Payroll/IT work has begun? | Defines cancellation authority and safe handling of work already in progress. | HR / business owner |
| OQ-B09 | What statuses and transitions should the employee see across the full journey, including waiting, in-review, returned for information, rejected, cancellation requested, cancelled, and completed? | The employee should see all relevant status stages, but exact labels and permitted transitions are not yet defined. | HR / business owner |
| OQ-B10 | What happens when a manager or HR rejects a request or asks for more information? Who responds, which stage resumes, and can the request be resubmitted? | Defines exception paths and employee actions. | HR / business owner |
| OQ-B11 | Which downstream activities are mandatory for every transfer, and which are conditional? Does Facilities participate in the workflow? | Defines conditional orchestration. Payroll and IT are confirmed stages; applicability of other activities remains open. | HR with Payroll, IT, Facilities |
| OQ-B12 | What evidence confirms that Payroll and IT have successfully updated their relevant organisational databases? | Prevents premature completion status or notification. | Payroll / IT / business owner |
| OQ-B13 | What notifications are required, to whom, on which events, and through which channels? Are reminders and SLA escalation notifications required? | Establishes communication policy. | HR / portal owner |
| OQ-B14 | What information about pending stakeholder actions can the employee see? | Establishes privacy and user-experience boundaries. | HR / security / business owner |
| OQ-B15 | What audit history must be captured and how long must it be retained, including manager-on-behalf submissions, edits, withdrawals, cancellation, delegation, and escalations? | Affects compliance, support, and traceability. | HR / security / records owner |
| OQ-B16 | What additional permissions and capabilities can Super Admin exercise beyond role configuration and final escalation? | Supports least privilege and separation of duties. | HR / security / product owner |

#### Recommended handling of rejection and requests for more information

*(Recommendation — not yet approved policy.)*

- Record the decision, actor, timestamp, and reason.
- A rejection should not silently become a success; whether it is terminal or can be reopened must be confirmed.
- A request for more information should identify the required information and the responsible responder, then resume at an explicitly defined stage after the response.
- Technical failures must not be represented as business rejection or successful completion.

#### Recommended notification approach

*(Recommendation — not yet approved policy.)*

- Use the portal as the source of truth for status.
- Consider notifications on submission, stage/action required, approval/rejection/return, cancellation decision, SLA escalation, and completion.
- Define recipients and channels with HR, and avoid exposing unnecessary sensitive transfer details.
- Do not invent reminder intervals before SLAs are approved.

#### Absence/escalation rule currently known

- L1/L2/L3 mappings remain open separately for each role.
- The final fallback is **Super Admin**.
- Escalation must not automatically approve a transfer or bypass the required sequential workflow unless an explicit business policy authorises a defined reassignment/decision path.

### 6.3 Open technical questions

| ID | Question | Why it matters |
|---|---|---|
| OQ-T01 | What authentication and employee identity source does the One-Point Portal use? | Determines identity propagation and access control. |
| OQ-T02 | Which systems are authoritative for employee, organisation, location, and job data? | Prevents inconsistent or stale selection data. |
| OQ-T03 | Which systems must be integrated for HR, organisational updates, Payroll, IT, and Facilities? | Defines integration scope and dependencies. |
| OQ-T04 | Are integration interfaces APIs, events, queues, or manual tasks? | Shapes the technical plan and failure handling. |
| OQ-T05 | What are the portal's standards for API contracts, error responses, logging, and correlation IDs? | Supports consistency and supportability. |
| OQ-T06 | How should retries, timeouts, duplicate messages, partial failures, and reconciliation work? | Protects workflow consistency across systems. |
| OQ-T07 | What are the availability, performance, accessibility, and browser/device requirements? | Non-functional requirements are not specified in the brief. |
| OQ-T08 | What security, privacy, audit, and data-retention standards apply? | Needed before selecting implementation controls. |
| OQ-T09 | What deployment environments, CI/CD controls, monitoring, and operational ownership are required? | Needed for delivery and release planning. |

> The suggested owners are recommendations for discovery, not confirmed assignments.

---

## 7. Assumptions

These are working assumptions for analysis only. They must be confirmed or rejected; they are not approved business requirements.

| ID | Working assumption | Validation needed |
|---|---|---|
| AS-001 | All users enter through one shared login entry point; access after login is role-based. | Confirm portal authentication, identity context, and role matrix. |
| AS-002 | A request records both the employee subject and the user who submitted it, if they differ. | Confirm employee identifier, requester, and audit requirements for manager-on-behalf submissions. |
| AS-003 | Department, location, and role selections should use governed organisation data rather than unrestricted free text. | Confirm authoritative data sources and allowed combinations. |
| AS-004 | A submitted request needs a persistent identifier so it can be tracked. | Confirm identifier, visibility, and lifecycle requirements. |
| AS-005 | Stakeholder actions and downstream activities need explicit outcomes to support an accurate progress view. | Confirm statuses, action model, and completion rules. |
| AS-006 | Some downstream activities will be conditional because the brief says Payroll, IT, and Facilities may need to act. | Confirm triggering rules per transfer type. |
| AS-007 | Failures in downstream systems must not silently make the request appear complete. | Confirm business recovery and reconciliation policy. |

---

## 8. Dependencies

| ID | Dependency | Risk if unavailable or unresolved |
|---|---|---|
| DEP-001 | One-Point Employee Portal access and integration capability | Employees may not be able to enter the journey consistently. |
| DEP-002 | Employee identity and organisational master data | Requests or eligibility checks may use incorrect employee details. |
| DEP-003 | Governed department, business unit, location, and job/position data | Employee may select invalid or outdated values. |
| DEP-004 | Manager hierarchy, HRBP mapping, Payroll/IT action ownership, and L1/L2/L3 role mappings | Requests may route to the wrong approver or stall; SLA escalation cannot be configured until mappings are confirmed. |
| DEP-005 | HR eligibility rules and decision process | Approval workflow cannot be specified reliably. |
| DEP-006 | Interfaces and operational ownership for organisational updates | Transfer completion cannot be orchestrated end-to-end. |
| DEP-007 | Payroll, IT, and Facilities processes/systems where applicable | Downstream fulfilment may be incomplete or delayed. |
| DEP-008 | Notification capability and approved communication policy | Employee may not receive outcome or action updates if required. |
| DEP-009 | Security, audit, and retention standards | Access, compliance, and evidence requirements may be missed. |

> These dependencies are inferred from the described journey; the brief does not name specific systems, APIs, vendors, or owners.

---

## 9. Out of scope — provisional boundaries

The brief does not explicitly define a full scope boundary. The following are therefore **not confirmed as in scope** and should not be assumed to be part of the initial implementation without approval:

- Redesigning the organisation's overall HR policy or transfer eligibility rules.
- Building or replacing the One-Point Employee Portal itself.
- Replacing HR, Payroll, IT, Facilities, or organisational master-data systems.
- Implementing the full internal transfer process outside the digital request and orchestration journey.
- Defining compensation changes, payroll calculations, or benefits policy.
- Performing the actual IT provisioning/deprovisioning or facilities work, rather than initiating/tracking those actions through agreed integrations.
- Adding transfer types or employee journeys not described in the brief.
- Defining a particular technology stack, database, cloud platform, or integration product before technical discovery.

> **Scope clarification required:** The brief does state that the portal should orchestrate downstream activities. Downstream orchestration therefore cannot simply be declared out of scope; the implementation boundary and system responsibilities must be agreed.

---

## 10. Business decisions vs. technical decisions

A *business decision* defines policy, ownership, or the intended user/business outcome. A *technical decision* defines how an approved outcome will be implemented. Technical choices must not be used to invent missing business policy.

| Topic | Business decision (needs business owner input) | Technical decision (engineering input) |
|---|---|---|
| **Approvals** | The sequential stage order is confirmed; define decision rights, delegation, and L1/L2/L3 mappings per role. | How approval tasks and transitions are represented and executed. |
| **Eligibility** | What makes an employee eligible? | Where and how approved eligibility rules are evaluated. |
| **Effective date** | What date constraints and notice rules apply? | Date validation implementation and timezone/date representation. |
| **Organisation selections** | Which departments, locations, and roles are valid? | How authoritative values are retrieved, cached, and validated. |
| **Status** | Which states and transitions are meaningful to users? | How status is persisted, exposed by APIs, and updated. |
| **Pending actions** | Which details may the employee see? | API response shape and authorization enforcement. |
| **Downstream activities** | Which systems/actions are mandatory or conditional? | Synchronous/asynchronous orchestration, retries, idempotency, and reconciliation design. |
| **Notifications** | Who must be notified, when, and through which channels? | Notification integration and delivery/retry mechanism. |
| **Audit** | Which events must be retained and for how long? | Audit event schema, storage, access controls, and observability. |
| **Security** | Who may submit, approve, view, cancel, delegate, or administer a request? Define Super Admin powers. | Authentication integration, authorization checks, secrets handling, and technical controls. |
| **Availability / performance** | What service levels does the business require? | Architecture and capacity decisions to meet the agreed targets. |

> No specific technology or architecture is selected in this discovery document.

---

## 11. Risks and failure scenarios to carry into specification

These are discovery risks to analyse, not final solution requirements.

| Risk | Description |
|---|---|
| **Ambiguous approver or escalation mapping** | Request routes to the wrong approver, L1/L2/L3 cannot be resolved, or the request remains pending despite Super Admin being the final fallback. |
| **Approver absence or SLA breach** | Workflow stalls or escalation is incorrectly treated as approval. |
| **Manager-on-behalf request ambiguity** | Requester and employee subject are confused, or audit history does not show who submitted the request. |
| **Cancellation after work starts** | Payroll/IT actions continue after cancellation is requested or approved unless handling is defined. |
| **Invalid or stale organisation data** | Employee selects a department, location, or role that is no longer valid. |
| **Partial downstream completion** | Organisational data is updated but another required action fails. |
| **Integration outage or timeout** | Status becomes stale or a stakeholder action is not created. |
| **Duplicate submission or repeated event** | Duplicate requests or downstream actions are created. |
| **Incorrect status** | The employee sees completion before all required activities finish. |
| **Unauthorised access** | An employee views or acts on another employee's request. |
| **Sensitive information exposure** | Reason or transfer details are visible beyond authorised users. |
| **Unclear rejection/rework path** | A rejected or returned request cannot progress or be corrected appropriately. |

For each risk, the specification and technical plan should define the applicable business behaviour, acceptance criteria, tests, and controls once the relevant decisions are confirmed.

---

## 12. Initial traceability approach

Use stable identifiers in later artefacts so requirements remain connected to specification, acceptance criteria, tests, tasks, and implementation evidence.

| Discovery reference | Subject | Expected downstream linkage |
|---|---|---|
| BR-001 – BR-011 | Explicit business requirements/objectives | Spec sections and individually identifiable acceptance criteria |
| OQ-B01 – OQ-B16 | Business questions | Decision log; affected spec requirements; tests once resolved |
| OQ-T01 – OQ-T09 | Technical questions | Technical plan, architecture decisions, integration contracts, security assessment |
| AS-001 – AS-007 | Working assumptions | Validation outcome; requirements or design changes if rejected |
| DEP-001 – DEP-009 | Dependencies | Plan, task dependencies, integration tests, release readiness |
| Risk scenarios (§11) | Potential failure cases | Failure-handling requirements, test cases, security assessment |

**Clarification provenance:** KD-010 – KD-016 and the workflow/cancellation/edit rules above come from project-owner clarifications, not from the original assessment brief. Recommendations are explicitly labelled and must not be treated as approved policy.

**Traceability rule:** An unresolved question must remain visibly unresolved in downstream artefacts. Do not present an assumption as a confirmed decision merely to make the specification look complete.

---

## 13. Discovery exit criteria

Discovery is ready to inform the next artefact when:

- [ ] The business objective and user journey have been reviewed.
- [ ] Explicit requirements are recorded with stable identifiers.
- [ ] Business decisions are separated from technical decisions.
- [ ] Open questions have owners or an agreed process for resolution.
- [ ] Assumptions are visible and either validated or explicitly accepted as temporary.
- [ ] Dependencies and provisional scope boundaries are reviewed.
- [ ] The team knows which unresolved decisions block specification or implementation.
- [ ] The next specification can reference the discovery identifiers without losing traceability.

---

## 14. Source limitations

The source brief is a high-level assessment requirement. It does not provide detailed eligibility criteria, effective-date rules, complete status definitions, API contracts, data models, named downstream systems, non-functional targets, or security standards.

Project-owner clarifications establish:

- a shared login entry point;
- manager-on-behalf initiation;
- the six sequential workflow stages;
- employee-requested cancellation subject to manager approval;
- the edit/withdraw cutoff being tied to the Releasing HRBP stage;
- Super Admin as final escalation fallback; and
- Payroll/IT database updates as part of completion.

Those clarifications still leave decision details unresolved, as identified in the open questions. This document records gaps instead of inventing answers; they must be resolved with relevant business and technical stakeholders or explicitly recorded as accepted assumptions under the SDD process.

---

**Next artefact:** Deliverable 2 — Feature Specification (`.spec.md`), using the validated requirements and decisions from this discovery analysis.