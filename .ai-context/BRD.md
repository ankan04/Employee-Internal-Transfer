# Business Requirements Document

<!-- Numbered entries, one per requirement. This is the source spec authoring
     pulls from — a spec should never be the first place a requirement is
     written down. See INT_SDD_Standard.md §7. -->

### BRD-001: Digitise the employee internal transfer journey
**Raised by:** HR Operations, via the One-Point Employee Portal product team
**Business need:** An employee requesting an internal transfer must today
coordinate separately with their manager, HR, payroll, IT and facilities across
multiple systems, with no consolidated view of where the request stands. The
organisation wants a single digital journey through the One-Point Employee
Portal: one request, one orchestrated workflow, one progress view.
**Sponsor:** HR Operations (process owner); One-Point Employee Portal Product Owner
**Priority:** To be confirmed — no deadline stated in the source requirement
**Decided:** Employee-initiated from the portal; employee supplies proposed
department/business unit, location, role/position and effective date, with an
optional reason; employee can submit, view status, and see actions pending with
other stakeholders; the portal orchestrates downstream activity rather than the
employee coordinating it; employee receives confirmation on completion.
Full list: discovery KD01–KD14.
**Open at BRD stage:** 61 questions logged in discovery, 44 of them business
decisions — most consequentially whether the receiving manager is a distinct
approver (OQ01), whether the employee applies to a specific open requisition or
a role type (OQ16), when downstream execution is triggered relative to the
effective date (OQ40), and what happens when one downstream activity fails
while others succeed (OQ38). Eligibility criteria (OQ09) are undefined and
require an HR policy decision before that path can be specified.
**Notes:** Scope boundaries proposed at discovery: excludes external
recruitment, position creation, payroll calculation itself, compensation
revision, cross-border transfers, secondments, contractor moves, and
manager/HR-initiated transfers. Full list: discovery OOS01–OOS13.
**Discovery analysis:** .ai-context/discovery/employee-internal-transfer.discovery.md
**Feature slug:** employee-internal-transfer
