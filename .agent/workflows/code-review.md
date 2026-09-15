# Workflow: /code-review

**Input:** a diff plus the task's Acceptance IDs
**Output:** categorised review comments (Gate 2)

Check, in order:
1. Each Acceptance Criterion the task cites — verified individually, by ID.
2. Security checklist (INT_SDD_Standard.md §30): PII in logs, hardcoded
   secrets, rate-limit decisions, dependency vetting, auth boundaries,
   data-at-rest/in-transit.
3. No AI-attribution in comments or commit messages.
4. Tests exist and were written before implementation (Red confirmed first).
5. Consistency with existing codebase patterns in the touched module.
6. Failure paths and edge cases, not just the happy path.
7. Whether architecture.md or an ADR needs updating as a result of this change.
8. Standard review: readability, naming, DRY.

Report findings as: Blocking / Should-fix / Nit — don't approve with
unresolved Blocking items.
