# Auto-Log Instruction

After completing any task, append an entry to `.ai-context/prompt_history.md`
with: date, task ID, model used, one-line prompt summary, and outcome
(merged / needs revision / blocked).

Do not add AI-attribution to code comments or commit messages — task-ID
references (e.g. `Implements <slug>.T03`) are the only traceability needed
and are required, per INT_SDD_Standard.md §5 and §14.
