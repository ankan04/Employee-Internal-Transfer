<!-- Deliverable 1 — Requirement / Discovery Analysis.
     Produced per INT_SDD_Standard.md §7 (Discovery & Consulting) before any
     spec authoring. Feeds .ai-context/BRD.md#BRD-001. -->

# Discovery Analysis: Employee Internal Transfer Digital Journey

## Feature Slug
`employee-internal-transfer`

Kebab-case, three words, verb-free, unique for the life of the project (§9).
This slug threads every downstream artefact: spec, plan, tasks, test cases,
branch `feature/employee-internal-transfer`, PR titles, status board row.

## Status
Discovery — Open (not yet closed against the §7 exit gate; see §15 below)

## Source
Business Context and Business Requirement, SDD Developer Assessment —
Employee Internal Transfer Digital Journey.

## Identifier Convention
IDs in this document are canonically slug-scoped
(`employee-internal-transfer.OQ01`) and written in short form (`OQ01`) inside
this file for readability. §9 defines `.AC#`, `.API##`, `.UT##`, `.T##`;
`FR##`, `BR##`, `KD##`, `OQ##`, `AS##`, `DEP##`, `JS##`, `OOS##` are
discovery-stage extensions scoped under the same slug so they never collide
with another feature's numbering.

---

## 1. Business Objective

Replace the fragmented, multi-team internal transfer process with a single
orchestrated digital journey in the One-Point Employee Portal, so that an
employee raises **one** request and receives **one** consolidated view of
progress, while the portal coordinates the downstream HR, organisational,
payroll, IT and facilities activities that today require the employee to
chase multiple teams separately.

**Target outcome:** one employee request → one orchestrated workflow → one
consolidated progress view.

**Value drivers, in the order the requirement implies them:**

| Driver | What it addresses |
|---|---|
| Self-service initiation | Removes the employee's need to know *who* to approach first |
| Orchestration | Removes manual hand-offs between HR, payroll, IT, facilities |
| Transparency | Removes "where is my request?" chase-ups — the stated single view |
| Traceability | Creates an auditable record of a decision that changes org data, pay and access rights |

The fourth driver is **not stated in the requirement** but follows necessarily:
a transfer mutates the employee record, payroll instructions and access
entitlements. Any such journey carries an audit obligation whether or not the
business articulated one. Raised as `OQ47`/`OQ48`.

---

## 2. Actors and Personas

### 2.1 Human actors

| Actor | Responsibility in the journey | Stated in requirement? |
|---|---|---|
| **Employee (transferee)** | Initiates the request, supplies transfer details, tracks status | Yes |
| **Releasing manager** (current line manager) | Confirms release of the employee from the current team | Partially — requirement says "the manager", unspecified which |
| **Receiving manager** (target role's hiring manager) | Accepts the employee into the target team/position | **No — not mentioned** |
| **HR Business Partner** | Validates eligibility and transfer details | Yes |
| **HR / Organisation Admin** | Effects the organisational data change | Yes (as "organisational information is updated") |
| **Payroll Officer** | Performs payroll updates where required | Yes, conditionally ("may need") |
| **IT / Access fulfilment** | Provisions and revokes access per the new role | Yes, conditionally |
| **Facilities coordinator** | Arranges the employee's new location/workspace | Yes, conditionally |
| **HR Administrator (elevated)** | Override, cancel, reassign, audit inspection | **No — not mentioned** |

### 2.2 System actors

| System | Role |
|---|---|
| One-Point Employee Portal | Entry point, orchestrator, single status view |
| HR system (HRMS) | System of record for employee, org hierarchy, manager relationship |
| Position / requisition master | Source of selectable departments, locations, roles |
| Payroll system | Cost-centre, pay-structure and location-allowance updates |
| IT identity & access management (IAM/ITSM) | Access provisioning and revocation |
| Facilities / workplace system | Seat, badge and location allocation |
| Identity provider (SSO) | Authentication and role claims |
| Notification service | Employee and stakeholder communications |

### 2.3 Discovery finding — the missing second manager

**This is the most consequential gap in the stated requirement.** The business
context describes step 1 as "Employee discusses the transfer with the manager"
and step 2 as "Manager confirms the transfer", both singular. An internal
transfer is by definition a movement *between* two organisational units, and
therefore involves two managerial interests that can conflict:

- the **releasing** manager, who loses a team member and may wish to retain them;
- the **receiving** manager, who gains one and must agree to take them.

Treating these as one actor produces a workflow in which an employee can be
transferred into a team whose manager never consented, or one in which a
retention-motivated releasing manager is the only gate. Neither is acceptable
in practice. The requirement does not resolve this, so it is raised as `OQ01`
rather than silently assumed, and `AS01` records the working assumption used to
let specification proceed.

### 2.4 Related finding — self-approval and conflict of interest

Where the receiving manager is also the releasing manager (an intra-department
role change), or where the requesting employee *is* a manager whose own
approver is the target manager, the approval chain can collapse onto a single
person or onto the requester themselves. Raised as `OQ05`.

---

## 3. Employee Journey

### 3.1 Current state (as described in the business context)

```text
Employee ──discusses──> Manager ──confirms──> HR ──validates eligibility──>
Org data updated ──> Payroll (maybe) ──> IT (maybe) ──> Facilities (maybe)
──> Employee receives confirmation
```

Each arrow today is a separate human interaction across a separate team and
system. The employee has no consolidated view and must chase each team to
learn where the request stands.

### 3.2 Target state (business journey, not architecture)

```text
                        Employee
                           │
                  Open One-Point Portal
                           │
                 Initiate Transfer Request
                           │
        ┌──────────────────┴──────────────────┐
        │        Enter Transfer Details        │
        │  • Department / Business Unit        │
        │  • Location                          │
        │  • Role / Position                   │
        │  • Effective Date                    │
        │  • Reason (optional)                 │
        └──────────────────┬──────────────────┘
                           │
                     Submit Request
                           │
              ┌────────────┴────────────┐
              │  Portal Orchestration   │
              └────────────┬────────────┘
                           │
              ═══ APPROVAL PHASE ═══
                           │
        Releasing Manager ──> Receiving Manager ──> HR Eligibility
                           │
              ═══ DECISION POINT ═══
                           │
              Approved ────┴──── Rejected ──> Employee notified ──> [end]
                           │
              ═══ EXECUTION PHASE (on/around effective date) ═══
                           │
              Organisational record updated (HRMS)
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    Payroll              IT Access        Facilities
   (conditional)       (conditional)     (conditional)
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                 All required tasks complete
                           │
                   Transfer Completed
                           │
                  Employee Confirmation

  Throughout: Employee tracks consolidated status + pending-with-whom
```

**Two structural observations the flat 8-step list in the requirement obscures:**

1. The journey has a **decision point** separating an *approval phase* (reversible,
   nothing has changed in any system of record) from an *execution phase*
   (progressively irreversible — once HRMS org data is committed, payroll and
   access changes cascade). The requirement presents all eight steps as one
   uniform sequence. Treating them uniformly is the root of the failure-handling
   problem raised in `OQ38`–`OQ40`.
2. The three downstream activities (payroll, IT, facilities) are **mutually
   independent and conditional**, not sequential steps 5→6→7. Whether they run
   in parallel is a technical decision; whether *all* must complete before the
   transfer counts as "complete" is a business decision.

---

## 4. Journey Stages

| ID | Stage | Description | Primary Actor | Output |
|---|---|---|---|---|
| JS01 | Initiation | Employee starts an internal transfer request | Employee | Draft request |
| JS02 | Detail capture | Employee provides proposed transfer information | Employee | Completed draft |
| JS03 | Submission | Employee submits the request | Employee | Submitted request |
| JS04 | Releasing manager review | Current line manager confirms or declines release | Releasing manager | Release decision |
| JS05 | Receiving manager review | Target manager accepts or declines the employee | Receiving manager | Acceptance decision |
| JS06 | HR eligibility validation | HR validates the employee against transfer policy | HR Business Partner | Eligible / ineligible |
| JS07 | Scheduling | Approved request held until the effective date window | System | Scheduled transfer |
| JS08 | Organisational update | Employee's org record updated in the system of record | HR / HRMS | Updated employee record |
| JS09 | Payroll processing | Cost centre / pay elements updated where required | Payroll | Payroll task closed |
| JS10 | IT access processing | Access provisioned for new role, revoked for old | IT | Access task closed |
| JS11 | Facilities processing | Seat, badge, location arranged at destination | Facilities | Facilities task closed |
| JS12 | Completion | All required activities confirmed complete | System | Transfer completed |
| JS13 | Confirmation | Employee notified of completion | System → Employee | Confirmation |

**Stages present in the target journey but absent from the requirement's
eight steps:** JS05 (receiving manager), JS07 (scheduling against the
effective date). Both are raised as open questions (`OQ01`, `OQ40`) rather
than asserted.

**Ordering caveat:** the sequence of JS04–JS06 and the parallelism of
JS09–JS11 are **not confirmed business decisions**. The table records the
stages, not an approved order.

### 4.1 Non-happy-path stages not enumerated in the requirement

The requirement describes only the successful path. The following journey
terminations and detours exist in any real approval workflow and are raised
as open questions rather than designed here:

| Path | Trigger | Open question |
|---|---|---|
| Employee withdrawal | Employee changes their mind | OQ21 |
| Rejection | Any approver declines | OQ07, OQ23 |
| Ineligibility | HR validation fails | OQ09, OQ11 (and OQ10 on when this is detected) |
| Approver inaction | No decision within SLA | OQ25 |
| Position withdrawn | Target role closed or filled mid-journey | OQ18 |
| Employee exit | Employee resigns between approval and effective date | OQ27 |
| Downstream failure | A downstream system rejects or times out | OQ38, OQ42 |
| Post-approval reversal | Business changes its mind before effective date | OQ26 |

---

## 5. Request Data — Stated Fields

| Field | Required | Source | Notes |
|---|---|---|---|
| Employee identity | Yes | Authenticated session | Derived, never entered — see 5.1 |
| Proposed department / business unit | Yes | Employee selection from master data | Selectable set undefined (OQ20) |
| Proposed location | Yes | Employee selection from master data | Selectable set undefined (OQ20) |
| Proposed role / job position | Yes | Employee selection from master data | **Requisition vs role type unresolved — OQ16, §10.1** |
| Effective date | Yes | Employee input | No constraints stated (OQ30–OQ34) |
| Reason | No | Employee free text | Visibility unresolved (OQ49) — see §5.2 |
| Request ID | System | Generated | AS18 |
| Status | System | Workflow state | Employee-visible vocabulary undefined (OQ52) |
| Pending actions | System | Workflow tasks | Disclosure level undefined (OQ52) |

### 5.1 Employee identity is derived, not entered

The employee raising the request must be taken from the authenticated portal
session, not supplied in the request payload. Accepting a
caller-supplied employee identifier would permit one employee to raise a
transfer on another's behalf — a privilege-escalation defect, not merely a
data-quality one. This is a **technical decision** with a security rationale,
and it holds unless the business explicitly requires proxy raising (for
example, HR raising on an employee's behalf — itself unstated and raised as
`OQ06`).

### 5.2 The optional reason field carries unexamined risk

A free-text reason on a transfer request will, in real use, sometimes contain
statements about the current manager or team — including grievance-adjacent
content. Routing that text to the releasing manager for approval, unexamined,
is a foreseeable harm. Whether the reason is visible to all approvers or
HR-only is a **business decision** (`OQ45`), and it must be answered before the
field is implemented, not after.

---

## 6. Functional Capabilities (Stated)

Directly supported by the business requirement; these become the basis for
acceptance criteria in the spec.

| ID | Capability |
|---|---|
| FR01 | An authenticated employee can initiate an Internal Transfer Request |
| FR02 | The employee can select the proposed department / business unit |
| FR03 | The employee can select the proposed new location |
| FR04 | The employee can select the proposed new role / job position |
| FR05 | The employee can provide an effective date |
| FR06 | The employee may optionally provide a reason |
| FR07 | The employee can submit the completed request |
| FR08 | The employee can view the current status of their request |
| FR09 | The employee can view actions pending with other stakeholders |
| FR10 | The system orchestrates the downstream activities required to process the transfer |
| FR11 | The system presents the employee a consolidated view of progress |

---

## 7. Business Rules

**Discovery finding:** the requirement states *capabilities* (§6 above) and
almost no *constraints*. A business rule restricts behaviour — "an employee
serving notice may not transfer" — as distinct from a capability, which
enables it. Restating capabilities as rules would give a false impression of
policy coverage.

Of the rules a working internal-transfer process requires, exactly **one** is
confirmed by the requirement.

### 7.1 Confirmed

| ID | Rule | Evidence |
|---|---|---|
| BR01 | The transfer reason is optional; all other stated transfer fields are mandatory before submission | Requirement §3: "Provide an optional reason" |

### 7.2 Proposed — require business confirmation before the spec can treat them as rules

Each is a candidate policy that a real transfer process would normally carry.
None is asserted. Each maps to the open question that must resolve it.

| ID | Proposed rule | Resolves via |
|---|---|---|
| BR02 | An employee may hold only one active transfer request at a time | OQ17 |
| BR03 | An employee serving a probation period may not request a transfer | OQ09 |
| BR04 | A minimum tenure in the current role/department is required | OQ12 |
| BR05 | An employee under an active performance or disciplinary process may not transfer | OQ13 |
| BR06 | An employee serving notice of resignation may not transfer | OQ14 |
| BR07 | The effective date must be at least *N* days after submission/approval | OQ30 |
| BR08 | The effective date may not be backdated | OQ31 |
| BR09 | The effective date must align to a payroll period boundary | OQ32 |
| BR10 | An employee may not approve their own transfer request at any stage | OQ05 |
| BR11 | A rejected request may be re-raised only after a defined cooling-off period | OQ23 |
| BR12 | A transfer may proceed only against a target position with confirmed open headcount | OQ16, OQ19, §10.1 |
| BR13 | Access changes must not take effect before the effective date | OQ40 |
| BR14 | The employee may withdraw the request at any point before organisational update | OQ21 |

**The ratio here is the finding.** One confirmed rule against thirteen
proposed ones is the quantified statement of how far the requirement sits from
implementation-ready.

---

## 8. Known Decisions

Decisions explicitly settled by the requirement as supplied. All are business
decisions; the requirement makes no technical commitments.

| ID | Decision | Type |
|---|---|---|
| KD01 | Internal transfer is initiated through the One-Point Employee Portal | Business |
| KD02 | The employee selects the proposed department / business unit | Business |
| KD03 | The employee selects the proposed location | Business |
| KD04 | The employee selects the proposed role / job position | Business |
| KD05 | An effective date is captured from the employee | Business |
| KD06 | The transfer reason is optional | Business |
| KD07 | The employee submits the request themselves | Business |
| KD08 | The employee can view the current request status | Business |
| KD09 | The employee can view actions pending with other stakeholders | Business |
| KD10 | The portal orchestrates downstream activities rather than the employee coordinating them | Business |
| KD11 | Manager confirmation forms part of the journey | Business |
| KD12 | HR validates employee eligibility as part of the journey | Business |
| KD13 | Payroll, IT and facilities involvement is conditional ("may need to") | Business |
| KD14 | The employee receives a confirmation on completion | Business |

---

## 9. Open Questions

Every question carries a type (**B**usiness / **T**echnical), the party who
should own the answer, and — where one is needed to let specification
proceed — the assumption adopted in its absence. An unanswered question is a
Gate 1 discussion item, not a licence to invent.

### A. Approval authority and routing

| ID | Question | Type | Owner |
|---|---|---|---|
| OQ01 | Is the receiving (target) manager a distinct approver from the releasing manager? The requirement says "the manager", singular. | B | HR Policy |
| OQ02 | Is releasing-manager approval mandatory and binding, or advisory/notification-only? | B | HR Policy |
| OQ03 | What is the authoritative approval sequence — manager(s) then HR, HR first, or parallel? | B | HR Policy |
| OQ04 | Do additional approval levels apply above a grade, cost or cross-BU threshold (skip-level, department head)? | B | HR Policy |
| OQ05 | Who approves where the approver and requester are the same person, or where releasing and receiving manager are the same? | B | HR Policy |
| OQ06 | May HR or a manager raise a transfer request on an employee's behalf? | B | HR Policy |
| OQ07 | Can HR reject a request both managers have approved, and is that decision final? | B | HR Policy |
| OQ08 | Is Finance or headcount-budget approval required where the transfer moves cost between cost centres? | B | Finance |
| OQ09 | What are the eligibility criteria HR validates against? | B | HR Policy |

### B. Eligibility

| ID | Question | Type | Owner |
|---|---|---|---|
| OQ10 | Is eligibility evaluated at submission (fail fast) or only after manager approval? Evaluating late spends approver time on requests that cannot succeed. | B | HR Policy |
| OQ11 | Is eligibility machine-evaluable from HRMS data, or a human judgement call by HR? | B + T | HR Policy / Architecture |
| OQ12 | Is a minimum tenure in the current role or department required, and what is it? | B | HR Policy |
| OQ13 | Does an active performance-improvement or disciplinary process block a transfer, and which system is authoritative for that status? | B | HR Policy |
| OQ14 | Does a pending resignation or notice period block a transfer? | B | HR Policy |
| OQ15 | Which system is the source of truth for eligibility determination? | T | Architecture |

### C. Position and vacancy model

| ID | Question | Type | Owner |
|---|---|---|---|
| OQ16 | Is the employee applying to a **specific open requisition**, or expressing interest in a role *type*? This materially changes the data model and the whole journey. | B | HR Policy |
| OQ17 | May an employee hold multiple concurrent transfer requests, or apply to several positions at once? | B | HR Policy |
| OQ18 | What happens if the target position is closed or filled while the request is in flight? | B | HR Policy |
| OQ19 | Is headcount / requisition availability validated at submission, re-validated at approval, or both? | B | HR Policy |
| OQ20 | Who determines which departments, locations and positions a given employee may select — is the list filtered by eligibility, grade or geography? | B + T | HR Policy / Architecture |

### D. Lifecycle and state

| ID | Question | Type | Owner |
|---|---|---|---|
| OQ21 | Can the employee withdraw or cancel a submitted request, and up to which state? | B | HR Policy |
| OQ22 | Can the employee modify a request after submission, or must they withdraw and re-raise? | B | HR Policy |
| OQ23 | After rejection, may the employee reapply — immediately, or after a cooling-off period? | B | HR Policy |
| OQ24 | Is there a draft / save-for-later state before submission? | B | Product |
| OQ25 | What happens when an approver takes no action — auto-escalate, auto-expire, or wait indefinitely? Is there an SLA per stage? | B | HR Policy |
| OQ26 | Can an approved request be reversed or cancelled before the effective date, and by whom? | B | HR Policy |
| OQ27 | What happens if the employee resigns between approval and the effective date? | B | HR Policy |
| OQ28 | Is the request "complete" at final approval, or only once the effective date has passed and all downstream tasks are closed? | B | HR Policy |
| OQ29 | Is approval delegation supported when an approver is on leave? | B | HR Policy |

### E. Effective date and payroll timing

| ID | Question | Type | Owner |
|---|---|---|---|
| OQ30 | What is the minimum lead time between final approval and the effective date? | B | HR Policy |
| OQ31 | May the effective date be backdated? | B | HR Policy / Payroll |
| OQ32 | Must the effective date align to a payroll period boundary? A mid-period transfer forces pay proration across two cost centres. | B | Payroll |
| OQ33 | Is the employee's proposed effective date binding, or may approvers amend it? | B | HR Policy |
| OQ34 | What is the payroll cut-off relative to the effective date, and what happens to a transfer approved after cut-off? | B | Payroll |

### F. Downstream orchestration and failure

| ID | Question | Type | Owner |
|---|---|---|---|
| OQ35 | Under what conditions is a payroll update actually required? The requirement says "may need to" without stating the condition. | B | Payroll |
| OQ36 | Under what conditions are IT and facilities activities required? | B | IT / Facilities |
| OQ37 | Must all downstream activities complete before the transfer is considered complete, or only a mandatory subset? | B | HR Policy |
| OQ38 | If one downstream activity fails while others succeed, is the transfer blocked, partially complete, or reversed? There is no distributed transaction across these systems. | B | HR Policy / Architecture |
| OQ39 | Is the organisational record update the point of no return, after which reversal requires a compensating transfer rather than a rollback? | B + T | Architecture |
| OQ40 | Do downstream actions execute at approval time or at the effective date? Revoking the employee's current access on approval rather than on the effective date would cut off a still-working employee. | B + T | IT / Architecture |
| OQ41 | Are downstream systems integrated as synchronous APIs, or as ticket-raising into human-fulfilled queues (typical for ITSM and facilities)? This changes the orchestration design fundamentally. | T | Architecture |
| OQ42 | Who is notified and who owns remediation when a downstream activity fails? | B | HR Policy |
| OQ43 | May downstream activities run in parallel, or does any ordering dependency exist between them? | T (within B constraint) | Architecture |

### G. Notifications and SLA

| ID | Question | Type | Owner |
|---|---|---|---|
| OQ44 | Which events trigger a notification, and to whom? | B | Product / HR |
| OQ45 | Are reminders issued for pending approver actions, and at what cadence? | B | HR Policy |
| OQ46 | Which channels are in scope — in-portal, email, SMS, mobile push? | B | Product |
| OQ47 | Is the employee notified on rejection, and does the notification carry the rejection reason? | B | HR Policy |

### H. Visibility, permissions and privacy

| ID | Question | Type | Owner |
|---|---|---|---|
| OQ48 | What employee information is the receiving manager permitted to see — the reason text, performance data, current compensation? | B | HR / Privacy |
| OQ49 | Is the optional reason visible to all approvers, or restricted to HR? See §5.2. | B | HR / Privacy |
| OQ50 | Is a transfer request visible to anyone beyond the named approvers — skip-level managers, HR at large? | B | HR / Privacy |
| OQ51 | Are confidential transfers (for example, grievance-driven moves away from a manager) required, bypassing the releasing manager? | B | HR / Privacy |
| OQ52 | What status detail may the employee see — named individuals holding pending actions, or generic stage labels only? | B | HR / Privacy |

### I. Audit, retention and compliance

| ID | Question | Type | Owner |
|---|---|---|---|
| OQ53 | Is a full immutable audit trail of decisions and data changes required, and to what standard? | B | Compliance |
| OQ54 | What is the retention period for transfer request records, including rejected and withdrawn ones? | B | Compliance |
| OQ55 | Are cross-border transfers in scope? They introduce work-authorisation, tax-residency and payroll-entity change, and are a materially different problem. | B | HR / Legal |

### J. Non-functional

| ID | Question | Type | Owner |
|---|---|---|---|
| OQ56 | What annual request volume and peak concurrency should the journey support? | B | Product |
| OQ57 | What availability and latency targets apply to the portal journey? | B + T | Architecture |

### K. Platform and delivery

| ID | Question | Type | Owner |
|---|---|---|---|
| OQ58 | What is the implementation technology stack? Undetermined; required before `constitution.md` can specify testing discipline and before any implementation task. | T | Architecture |
| OQ59 | Are the HRMS, payroll, IAM/ITSM and facilities integrations available for real integration, or to be stubbed at a contract boundary? | T | Architecture |
| OQ60 | What provides authentication and role claims, and is an existing RBAC model available to reuse? | T | Architecture |
| OQ61 | Does an approved workflow/BPM engine exist to reuse, or is workflow state to be held in-service? | T | Architecture |

**Count: 61 open questions, of which 44 are business decisions.** The
distribution is itself the discovery finding — the requirement is
predominantly missing *policy*, not *technology*.

---

## 10. Assumptions

Adopted so that specification can proceed. Each is provisional, traceable to
the question it pre-empts, and must be confirmed or replaced at Gate 1. An
assumption that survives to implementation unchallenged is a defect waiting
to be found in UAT.

| ID | Assumption | Pre-empts | Risk if wrong |
|---|---|---|---|
| AS01 | Both a releasing and a receiving manager approve, releasing first | OQ01, OQ03 | High — reworks the entire workflow state model |
| AS02 | HR eligibility validation follows both manager approvals, per the requirement's stated order | OQ03 | Medium — reordering is a state-machine change, not a redesign |
| AS03 | A machine-evaluable eligibility pre-check runs at submission; HR retains a final human validation | OQ10, OQ11 | Medium — affects UX and one endpoint |
| AS04 | **WITHDRAWN — NOT ADOPTED AS AN ASSUMPTION.** The position-selection model is escalated to an unresolved business decision. See §10.1. | OQ16 | **HIGH** — see §10.1 |
| AS05 | One active transfer request per employee at a time | OQ17 | Medium |
| AS06 | The employee may withdraw at any point before the organisational record is updated | OQ21 | Low |
| AS07 | A submitted request is immutable; changes require withdrawal and re-raise | OQ22 | Low |
| AS08 | The effective date must be at least 15 calendar days after **submission** and may not be backdated | OQ30, OQ31 | Medium — a configurable value, not a structural one |
| AS09 | Downstream execution is triggered at the effective date, not at approval | OQ40 | High — determines whether the design needs scheduling at all |
| AS10 | Payroll, IT and facilities activities execute in parallel and independently | OQ43 | Medium |
| AS11 | Downstream integrations are asynchronous and may be human-fulfilled; the portal tracks task state rather than assuming immediate completion | OQ41 | High — synchronous assumption would not survive contact with an ITSM queue |
| AS12 | Organisational update in the HRMS is the point of no return; reversal thereafter requires a new compensating transfer | OQ39 | High |
| AS13 | A failed downstream activity does not reverse the transfer; it raises a remediation task and surfaces on the employee's status view | OQ38, OQ42 | Medium |
| AS14 | The optional reason is visible to HR only, not to either manager | OQ49 | Low to implement, high if wrong in the other direction |
| AS15 | The employee sees stage-level status and the *role* holding a pending action, not named individuals | OQ52 | Low |
| AS16 | The employee's identity is derived from the authenticated session; proxy raising is not supported in v1 | OQ06 | Low |
| AS17 | Department, location and position values come from controlled master data; no free-text entry | — (design invariant) | Low |
| AS18 | The system generates a unique, non-guessable transfer request identifier | — (design invariant) | Low |
| AS19 | Access to transfer information is role-based and enforced server-side | — (security invariant) | Low |
| AS20 | Existing HR, payroll, IT and facilities systems are integrated, not replaced | — (stated scope) | Low |
| AS21 | A full audit trail of state transitions, actors and timestamps is required | OQ53 | Low — cheaper to build in than retrofit |
| AS22 | Cross-border transfers are excluded from v1 | OQ55 | Medium — see OOS08 |

**AS01, AS09, AS11 and AS12 are the load-bearing assumptions.** If any of them
is wrong, the plan changes structurally rather than incrementally. They should
be the first items a Gate 1 reviewer challenges.

### 10.1 Escalated — position-selection model (formerly AS04)

The requirement states only:

> "Select the proposed role/job position."

That sentence is **not sufficient evidence** to conclude that the employee is
applying against a specific open requisition. It is equally consistent with the
employee expressing interest in a role *type*. Discovery originally recorded the
requisition reading as assumption AS04; on review that was the wrong instrument.

**It is withdrawn as an assumption and recorded as an unresolved business
decision — OQ16 — with HIGH risk.**

**Why it is not an assumption.** An assumption is a provisional answer adopted
so that work can proceed, cheap to reverse if wrong. This one is neither
provisional nor cheap: it determines *product behaviour and workflow*, not
merely implementation. A requisition-based journey additionally requires:

| Requirement introduced by the requisition model | Absent from the role-type model |
|---|---|
| Position availability and open-headcount validation | No vacancy concept exists |
| Requisition ownership and lifecycle | No owning record |
| Receiving-manager association derived from the requisition | Receiving manager must be resolved some other way, or does not exist as an actor |
| Vacancy re-validation at approval time | Nothing to re-validate |
| Requisition closure and expiry handling mid-journey (OQ18) | No closure event to handle |
| Contention between multiple applicants for one position | Not applicable |

The role-type model, by contrast, resembles an expression of interest that HR
brokers — a different product with a different approval shape.

**Consequence for downstream artefacts.** The specification proceeds against the
requisition reading because acceptance criteria cannot be written without *some*
position model, but it does so under an explicitly flagged provisional decision
rather than a silent assumption, and it states which acceptance criteria and API
contract elements are contingent on the answer. **This is the first item on the
Gate 1 agenda.** It is a business decision, owned by HR Policy and the Portal
Product Owner, and no implementation task touching position selection should
start before it closes.

---

## 11. Dependencies

| ID | Dependency | Category | Nature |
|---|---|---|---|
| DEP01 | Employee master data | Data | Identity, grade, tenure, employment status |
| DEP02 | Organisation hierarchy | Data | Current department/BU, reporting line, manager resolution |
| DEP03 | Department / business unit master | Data | Selectable target departments |
| DEP04 | Location master | Data | Selectable target locations |
| DEP05 | Job / position master and requisition data | Data | Selectable roles; open headcount only if the requisition model is confirmed (OQ16, §10.1) |
| DEP06 | HR system (HRMS) | System | System of record for the organisational update |
| DEP07 | Payroll system | System | Cost-centre and pay-element updates |
| DEP08 | IT identity & access management / ITSM | System | Access provisioning and revocation |
| DEP09 | Facilities / workplace system | System | Seat, badge, location allocation |
| DEP10 | One-Point Employee Portal | Platform | Host application and entry point |
| DEP11 | Authentication / SSO and role claims | Platform | Identity and authorisation |
| DEP12 | Notification service | Platform | Employee and stakeholder communications |
| DEP13 | Workflow / orchestration capability | Platform | Either an existing engine or in-service state management (OQ61) |
| DEP14 | Eligibility policy definition | Organisational | HR must define the criteria before OQ09 can close |

**DEP14 is not a system dependency and is the one most likely to delay
delivery** — it requires an HR policy decision, not an engineering task, and
nothing in the eligibility path can be specified until it lands.

---

## 12. Out of Scope

| ID | Excluded | Rationale |
|---|---|---|
| OOS01 | External candidate recruitment and external job applications | Different journey, different actors |
| OOS02 | Creation or modification of job positions and requisitions | Owned upstream by HR/Talent |
| OOS03 | Payroll calculation itself | The journey triggers a payroll update; it does not compute pay |
| OOS04 | Implementation or redesign of IT provisioning systems | Integration, not replacement (AS20) |
| OOS05 | Implementation or redesign of facilities management systems | Integration, not replacement (AS20) |
| OOS06 | HR master-data redesign | Consumed as-is |
| OOS07 | Compensation revision arising from the transfer | Adjacent process; not stated in the requirement |
| OOS08 | Cross-border / international transfers | Work authorisation, tax residency and payroll-entity change make this a materially different problem (OQ55, AS22) |
| OOS09 | Temporary deputation, secondment and short-term assignment | Non-permanent moves have different reversal semantics |
| OOS10 | Contractor and non-employee worker transfers | Different data model and employment relationship |
| OOS11 | Employee performance-management workflows | Referenced by eligibility (BR05) but not modified here |
| OOS12 | Manager-initiated or HR-initiated transfers | v1 is employee-initiated per KD01/KD07 (OQ06, AS16) |
| OOS13 | Bulk or organisational restructure transfers | Different scale and approval model entirely |

OOS08 through OOS13 are **not stated in the requirement** — they are boundaries
proposed during discovery. Naming them explicitly is what prevents the
"explicitly out of scope" section from being tested by scope creep later
(§12.2, scope-creep check).

---

## 13. Business Decisions vs Technical Decisions

The distinction that governs the whole SDD chain: a business decision
determines **what is correct**; a technical decision determines **how correctness
is achieved**. A business decision recorded as a technical one gets made
silently by an engineer or an agent; a technical decision escalated as a
business one wastes stakeholder time.

| Topic | Business decision (what) | Technical decision (how) |
|---|---|---|
| Approval authority | Who must approve, in what order, with what veto rights | State-machine transitions, approval task model |
| Eligibility | What makes an employee eligible to transfer | Which service evaluates it, sync or async, caching |
| Position selection | Which positions a given employee may select | Master-data API, filtering and pagination |
| Effective date | Which dates are permissible and why | Date validation, timezone handling, scheduling mechanism |
| Status model | Which statuses the employee sees and at what granularity | Persisted state machine, status projection |
| Pending actions | What the employee is told is outstanding, and about whom | Workflow task model and query API |
| Notifications | Which events notify whom, on which channel | Event publication, template rendering, delivery retry |
| Downstream participation | Which systems participate, and under what conditions | REST / event / queue integration pattern |
| Failure handling | Whether a failed step blocks, partially completes or reverses the transfer | Retry policy, backoff, compensation, dead-letter handling |
| Permissions | Who may see and do what | RBAC/ABAC enforcement point and mechanism |
| Audit | Which activities must be recorded and retained how long | Audit log storage, immutability, query path |
| Reversal | Whether an approved transfer can be undone, and by whom | Compensating transaction vs rollback |
| Idempotency | *(none — purely technical)* | Duplicate-submission protection on the submit endpoint |
| Request identifier | *(none — purely technical)* | Non-guessable ID generation |

**Two rows deserve emphasis as classic misclassifications:**

- *Failure handling* is routinely treated as purely technical ("we'll add
  retries"). Whether a transfer whose IT provisioning failed is "complete" is
  a business decision with pay and access consequences; retry mechanics are
  the technical half.
- *Idempotency* is routinely escalated as a business question ("what if they
  click twice?"). It is not — duplicate suppression is an engineering
  obligation, and the business should never be asked to rule on it.

---

## 14. Traceability Forward

| Discovery output | Flows into |
|---|---|
| Business objective, KD01–KD14 | `BRD.md#BRD-001` → spec Intent |
| FR01–FR11 | Spec acceptance criteria (`employee-internal-transfer.AC#`) |
| BR01, BR02–BR14 (on confirmation) | Spec acceptance criteria and validation rules |
| JS01–JS13 | Spec status/state model; plan's workflow design |
| OQ01–OQ61 | Gate 1 review agenda (Deliverable 9); decision log |
| AS01–AS22 | Spec assumptions block; Gate 1 challenge list |
| DEP01–DEP14 | Plan integration points; `architecture.md` |
| OOS01–OOS13 | Spec "Explicitly Out of Scope" |
| OQ58–OQ61 | `constitution.md` and plan technical approach |

---

## 15. Discovery Exit Assessment

§7 sets the discovery gate: *"if you can't answer 'what problem, for whom,
bounded how' in one paragraph, the spec is not ready to write."*

| Test | Verdict |
|---|---|
| What problem? | **Answered** — fragmented multi-team transfer coordination with no consolidated visibility |
| For whom? | **Answered** — employees initiating internal transfers, plus the approving and fulfilling stakeholders |
| Bounded how? | **Partially answered** — journey boundaries are clear (OOS01–OOS13); *policy* boundaries are not (44 open business questions) |

### Verdict: discovery is closed enough to author a specification, and not closed enough to approve one.

This is a deliberate distinction, and it is **not** a Gate 1 outcome — Gate 1
(§12) reviews a specification, and none yet exists. The correct framing is
§27's Definition of Ready, which the feature does not currently meet on two
counts: acceptance criteria do not yet exist, and open decisions remain
unresolved.

**Recommended next step:** author `employee-internal-transfer.spec.md` with
every assumption (AS01–AS22) marked as provisional and every unresolved
question carried into the spec's own open-items list, so that Gate 1 becomes
the forum where the 44 business questions are actually answered by their named
owners — rather than a review that discovers them.

Proceeding to specification is correct **provided** the assumptions travel
with it as assumptions. Proceeding to *implementation* on this basis would be
the vibe-coding anti-pattern (§28) wearing a specification as cover.
