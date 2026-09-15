# Workflow: /generate-plan

**Input:** an Approved spec at `.ai-context/specs/<feature-slug>.spec.md`
**Output:** `.ai-context/plans/<feature-slug>.plan.md`

Steps:
1. Read the spec in full, including API Contract and Acceptance Criteria.
2. Read `.ai-context/constitution.md` in full.
3. Read `.ai-context/architecture.md` for existing integration points.
4. Draft the plan using the template at `.ai-context/plans/_TEMPLATE.plan.md`.
5. Complete the Constitution Check section explicitly — for every constitution
   rule that applies, state how the plan complies. Do not leave it silent.
6. State what is explicitly deferred and why.
7. Propose a Sequencing list — this becomes the tasks file.
8. Do not write any code in this step.
