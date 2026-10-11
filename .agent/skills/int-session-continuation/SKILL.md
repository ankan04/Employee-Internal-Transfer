---
name: int-session-continuation
description: Resume context and continue engineering tasks across session restarts by reading repository persistent memory (.ai-context/status.md, specs, plans, tasks, git status).
---

# INT Session Continuation & Context Recovery

## Purpose
This skill defines the mandatory protocol for resuming work in a project repository after a session restart, context clearance, or agent handoff.

The repository, NOT the chat window, is the persistent memory of the project.

---

# Core Rule — Repository Memory Authority

- Do NOT rely on chat history, memory, or user recall as the permanent source of truth.
- Do NOT guess project state, active features, or next tasks.
- Read only the specific repository artifacts required to determine the active state.
- All file paths and references written to `.ai-context/` artifacts MUST be **repository-relative** (e.g. `.ai-context/specs/<slug>.spec.md`, `src/...`) to ensure full Git portability across developer workstations and CI/CD. Never write local OS absolute paths (`C:\Users\...`).

---

# Skill & Governance Resolution Hierarchy

When executing any engineering task or reading project governance:
1. **Priority 1 — Check Repository Local Files FIRST**: Inspect project repository root for `AGENTS.md` and `.agent/skills/<skill_name>/SKILL.md`. If present, load and follow local project skills.
2. **Priority 2 — Fallback to Global Skills SECOND**: If and ONLY if a requested skill or rule file is not present in `.agent/skills/`, fall back to reading global skills from the active AI assistant's global configuration directory (`<global-skills-root>/`).

---

# State-Driven `int-project-resume` Engine

The `/int-project-resume` workflow is the **authoritative entry point for resuming an interrupted or in-progress SDD project**.

> [!IMPORTANT]
> **Zero Blind Execution & True State-Awareness**
> The system MUST NEVER assume the next step based on the last command executed or blindly advance the workflow. Every time `/int-project-resume` is run, the system MUST reconstruct the **actual current project state** from repository memory and Git, validate state consistency, detect manual edits, and present valid next actions for explicit user confirmation.

---

## State Reconstruction Chain

When `/int-project-resume` is executed, the engine reconstructs project state in this exact sequence:

```text
Inspect Repository Memory (.ai-context/status.md, dashboard.html, project_context.md)
        ↓
Inspect BRD & Gate 0 Review State (.ai-context/BRD.md, pr_reviews/BRD-*.md)
        ↓
Inspect Manual BRD Changes (Git diff vs last reviewed commit/record)
        ↓
Inspect All Feature Specs & Gate 1 Status (.ai-context/specs/*.spec.md, pr_reviews/GATE1-*.md)
        ↓
Present Multi-Spec Interactive Selection Table (If BRD & Gate 0 Approved)
        ↓
Inspect Selected Spec Downstream State (.plan.md, .tasks.md, .test_cases.md)
        ↓
Inspect Development & TDD State (tests/, src/, incomplete - [ ] tasks)
        ↓
Inspect Gate 2 Review State (pr_reviews/GATE2-*.md)
        ↓
Inspect Release State & Release Artifacts (.ai-context/releases/)
        ↓
Inspect Git Working Tree & PR Comments (Branch, commit, working tree diff)
        ↓
Validate Workflow Consistency & Present Action Options to Developer
        ↓
Wait for Developer Confirmation & Execute Selected Action
```

---

## State-Driven Branching Rules

### 1. BRD & Gate 0 State Rules

#### Scenario A — BRD Approved (`BRD = APPROVED` / `Gate 0 = APPROVED`)
If `.ai-context/BRD.md` has passed Gate 0 PR review:
- Do **NOT** automatically regenerate or modify the approved BRD.
- Prompt developer: "BRD Approved. Continue with Spec Generation?"

#### Scenario B — BRD Changes Requested (`BRD = CHANGES_REQUESTED` / `Gate 0 = NOT_APPROVED`)
If Gate 0 PR review record (`.ai-context/pr_reviews/BRD-*.md`) has status `Changes Requested` or `Rejected`:
- Identify reviewer comments and display them clearly to the developer.
- Provide suggested BRD updates based on reviewer feedback.
- Prompt developer to apply updates and re-submit for Gate 0 PR review.

#### Scenario C — Manual BRD Change Detection
If developer manually modified `.ai-context/BRD.md`:
- Notify developer of detected changes.
- Ask developer to review changes and re-submit for Gate 0 PR review.

---

## Non-Negotiable Safety Rules
1. **Precedence Hierarchy**: `Gate 0 Approval > Spec Approval (Gate 1) > Gate 2 Approval > Release Generation`.
2. **No Blind Execution**: Never assume previous command represents current state.
3. **No Gate Bypassing**: Never skip Gate 0, Gate 1, or Gate 2 review cycles.
4. **No Silent Overwrites**: Never overwrite or regenerate approved artifacts without user sign-off.
