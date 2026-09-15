# Workflow: /generate-tests

**Input:** a spec's Acceptance Criteria and Unit Test Cases table
**Output:** failing (Red) tests for the given task ID only

Steps:
1. Read the spec section referenced by the task's Acceptance IDs only.
2. Generate tests matching the spec-derived Unit Test Cases table — do not
   invent scenarios not traceable to an AC or add cases the spec doesn't cover.
3. Run the tests and confirm they fail for the right reason (feature not yet
   implemented, not a broken test).
4. Do not write implementation code in this step.
5. Stop and flag if an AC is not testable as written — do not guess and
   proceed; the spec needs revision, not the test.
