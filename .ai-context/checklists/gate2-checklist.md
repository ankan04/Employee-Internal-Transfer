<!-- Blank. To be completed by the Gate 2 reviewer — not the implementer.
     Per INT_SDD_Standard.md §30 "Gate 2 — Code Review". -->

# Gate 2 — Code Review Checklist

**Reviewer:** _____________________ (must not be the implementer)
**Date:** _____________________

- [ ] Each AC verified individually against the diff, by ID
- [ ] No AI-attribution in comments/commits (task-ID references are fine)
- [ ] Security checklist (see `security-checklist.md`) passed
- [ ] `architecture.md` / ADR updated if warranted
- [ ] Tests were written first and confirmed Red before Green (not retrofitted)
- [ ] `status.md` and spec Status updated same day
- [ ] Standard PR review (readability, naming, DRY) otherwise applies

## Where to look

| Checklist item | Evidence |
|---|---|
| AC verified by ID | `.ai-context/specs/employee-internal-transfer.spec.md` (AC list) against `transfer-service/src/` and `transfer-service/test/` |
| AI attribution | `git log` in this repository |
| Security | `.ai-context/reviews/employee-internal-transfer.security.md` (evidence, not a verdict — reach your own) |
| architecture.md / ADR | `.ai-context/architecture.md`, `.ai-context/decisions/` |
| Red before Green | `.ai-context/evidence/employee-internal-transfer.execution.md`, `red-run.txt`, `green-run.txt` |
| status.md / spec Status | `.ai-context/status.md`, spec Status field |
| Task ↔ commit traceability | `.ai-context/tasks/employee-internal-transfer.tasks.md` against `git log` |

## Scope note

This implementation is a **deliberate vertical slice**: 14 of 49 tasks. The
remaining 35 are specified, task-decomposed and prompted, but intentionally not
built — see the tasks file for which are gated on unresolved business
decisions versus which are simply unblocked and out of scope for this slice.
That is not the same as incomplete work; judge only what was implemented.

## Verdict

- [ ] Approved
- [ ] Changes Requested
- [ ] Rejected

**Findings:**

_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
