# Change Request: CR-20261011-payroll-before-receiving-manager

## Change Request ID
CR-20261011-payroll-before-receiving-manager

## Date
2026-10-11

## Source
User prompt from Ankan Gupta (`ankangupta02@gmail.com`, Senior Software Engineer / Spec Author), who states the decision is theirs: "CR: move Payroll before Receiving Manager".

> **Decision authority note:** the requester is also the spec author and holds the same email as the listed Gate 0 reviewer. The Gate 0 reviewer must ratify this as a business decision. It must not be treated as self-approved.

## Status
Gate 0 Approved (2026-10-11) — In Peer Review (Gate 1, spec v0.3)

## Description
Change the confirmed sequential workflow order (KD-012) so that Payroll acts before the Receiving Manager.

| | Order |
|---|---|
| **Before** | Releasing Manager → Releasing Department HRBP → Receiving HRBP → Receiving Manager → Payroll → IT |
| **After** | Releasing Manager → Releasing Department HRBP → Receiving HRBP → **Payroll → Receiving Manager** → IT |

Payroll becomes stage 4 and the Receiving Manager becomes stage 5. Stages remain strictly sequential. IT remains stage 6, and completion still requires confirmed Payroll and IT updates (KD-016, unchanged).

**New business risk raised (OQ-B17):** Payroll now updates its database before the Receiving Manager decides. If the Receiving Manager rejects or returns the request, it is undefined whether the payroll update is reversed, held or left in place. The CR does not decide this; it is raised as an open question.

## Linked Assets
- **BRD revision:** `.ai-context/BRD.md` (v3), `.ai-context/brd-change-log.md`, `.ai-context/assumptions.md`
- **Spec revision:** `.ai-context/specs/employee-internal-transfer.spec.md` (v0.3)
- **Prompt History:** `.ai-context/prompt_history.md`

## Affected Spec IDs & Impact Analysis
| Spec ID | Impact Scope | Affected Files / Components | Description of Required Change |
|---|---|---|---|
| employee-internal-transfer | Requirements only (no code is approved for this lineage) | `BRD.md` §2, §3, §5.1, §6.1 KD-012, §6.2, §11; spec §2, §4.1, §5.6, §6.1, §8.3, §9, §15.1, §16 | Swap stages 4 and 5; add OQ-B17 and blocked AC-025 for the Payroll-reversal gap |

## Multi-Spec Impact Matrix
- **employee-internal-transfer**: AC-023 revised (new order). AC-025 🔒 added (Payroll reversal after a Receiving Manager reject or return; blocked on OQ-B17). FR-050 changed from stage 5 to stage 4. Actor and status-model stage numbers updated.
- No other specs exist.

## Proposed Spec Modifications
### Revised Acceptance Criteria:
1. employee-internal-transfer.AC-023 (revised) — **Given** all six stages are processed in order, **then** the stages occur in the order Releasing Manager, Releasing Dept HRBP, Receiving HRBP, Payroll, Receiving Manager, IT.
2. employee-internal-transfer.AC-025 🔒 (new) — **Given** Payroll has confirmed its stage-4 update, **when** the Receiving Manager rejects or returns the request at stage 5, **then** the approved Payroll-reversal rule applies. *(Blocked on OQ-B17.)*

## Gate Approvals & History
| Gate | Approver | Date | Outcome | Approval Comment |
|---|---|---|---|---|
| Gate 0 (BRD v3 re-review) | Supratim Jetty (`ankangupta02@gmail.com`) | 2026-10-11 | Approved | "Order change accepted; OQ-B17 kept open (AC-025 stays blocked)." See `pr_reviews/BRD-20261011-201241.md`. Reviewer email is the same as the CR author. |
| Gate 1 (Spec v0.3 review) | Soumyadeep (assigned) | — | Pending | — |
| Gate 2 (Code Review) | Tech Lead (assigned) | — | Not started | — |
