# Project Context

<!-- One-page orientation — what you'd hand a new hire (or a new agent
     session) on day one before anything else. -->

## Objective

Project TRANSFER360 delivers the **Employee Internal Transfer Digital Journey**
within the organisation's One-Point Employee Portal — the single place employees
access HR, payroll, IT, learning and facilities services.

Today an employee seeking an internal transfer coordinates separately with their
manager, HR, payroll, IT and facilities, across separate systems, with no
consolidated view of progress. This project replaces that with one request that
the portal orchestrates end to end, and one status view showing what is
outstanding and with whom.

**Outcome:** one employee request → one orchestrated workflow → one consolidated
progress view.

## Architecture Summary

Not yet established. The technical approach is authored at the plan stage, after
the specification passes Gate 1. What is known from discovery: the journey
depends on an HR system of record, position/requisition master data, payroll,
IT identity & access management, and a facilities system — all integrated rather
than replaced. Whether those integrations are synchronous APIs or ticket-raising
into human-fulfilled queues is unresolved (discovery OQ41) and is the single
biggest open influence on the design.

See `.ai-context/architecture.md` — currently unpopulated pending the plan.

## Stakeholders

| Role | Interest |
|---|---|
| Employee | Initiates and tracks the transfer request |
| Releasing manager | Confirms release from the current team |
| Receiving manager | Accepts the employee into the target team — *not named in the source requirement; see discovery OQ01* |
| HR Business Partner | Validates eligibility, owns transfer policy |
| Payroll | Cost-centre and pay-element updates |
| IT | Access provisioning and revocation |
| Facilities | Seat, badge and location arrangement |
| Portal Product Owner | Journey experience and prioritisation |

## Tech Stack

**Undetermined.** Logged as discovery OQ58. This blocks `constitution.md`'s
Testing Discipline section and every implementation task; it does not block
specification. Decide before the plan stage.

## Where To Start

1. `.ai-context/discovery/employee-internal-transfer.discovery.md` — the full
   requirement analysis, open questions and assumptions
2. `.ai-context/BRD.md#BRD-001` — the business requirement as logged
3. `.ai-context/status.md` — what is in flight right now
4. `INT_SDD_Standard.md` — the methodology this project runs on
