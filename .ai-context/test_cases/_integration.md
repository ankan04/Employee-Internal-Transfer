<!-- Cross-feature and system-level scenarios that don't map to a single spec.
     See INT_SDD_Standard.md §19.1. -->

# Integration & System Test Cases

## Cases

| Test ID | Scenario | Spans Specs | Expected |
|---|---|---|---|
| `INT01` | **Full happy-path journey.** Employee submits → releasing manager approves → receiving manager approves → HR validates eligible → effective date reached → HRMS, payroll, IT and facilities tasks all close → transfer completes | employee-internal-transfer + HRMS, payroll, IAM, facilities adapters | End state `COMPLETED`; one confirmation to the employee; complete audit chain from submission to completion with no gap |
| `INT02` | **Rejection at the first gate.** Employee submits → releasing manager rejects | employee-internal-transfer | End state `REJECTED`; no downstream system contacted at any point; employee notified |
| `INT03` | **Withdrawal mid-approval.** Employee submits → releasing manager approves → employee withdraws | employee-internal-transfer | End state `WITHDRAWN`; receiving manager's pending action is cleared, not left orphaned |
| `INT04` | **Partial downstream failure.** Full approval → execution begins → IT provisioning fails terminally while payroll and facilities succeed | employee-internal-transfer + all downstream adapters | State `EXECUTION_ATTENTION`; HRMS change stands and is **not** reversed; remediation task raised to HR; employee's status view shows one step needing attention |
| `INT05` | **Recovery after remediation.** Continues INT04 — HR resolves the IT task | employee-internal-transfer + IAM adapter | State returns to `IN_EXECUTION` then `COMPLETED`; exactly one completion notification across the whole journey, not two |
| `INT06` | **Downstream system unavailable for an extended period.** HRMS adapter unavailable across the effective date | employee-internal-transfer + HRMS adapter | Request is not lost; remains `IN_EXECUTION`; portal stays available; retries bounded per policy; failure reaches its terminal destination |
| `INT07` | **Audit chain integrity.** Any completed journey, audit records inspected end to end | employee-internal-transfer | Every state transition present exactly once, ordered, with actor reference, correlation id and timestamp; no record mutated after write |
| `INT08` | **PII containment across the whole journey.** Full journey executed with logs, error bodies and notification payloads captured | employee-internal-transfer + notification adapter | No employee name, number, email, phone, compensation figure, rating or reason text at any log level, in any error body, or in any notification to a recipient not entitled to it |
| `INT09` | **Concurrent journeys at scale.** Multiple employees transferring into the same target position simultaneously | employee-internal-transfer + position master | Headcount is not oversubscribed; losing requests are refused deterministically, not by race *(contingent on OQ16 resolving to the requisition model)* |
| `INT10` | **Correlation propagation.** Single request traced across portal, domain modules and every adapter | employee-internal-transfer + all adapters | One correlation identifier present at every hop, per constitution §4 |

## Blocked Integration Scenarios

| Scenario | Blocked by |
|---|---|
| Eligibility failure journey, end to end | OQ09 — criteria undefined |
| Approver-inaction escalation journey | OQ25 — no SLA defined |
| Resignation-during-journey interrupt | OQ27 — no defined behaviour |
| Payroll-period-boundary transfer | OQ32, OQ34 — alignment rule undefined |
