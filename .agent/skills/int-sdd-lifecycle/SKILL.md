---
name: int-sdd-lifecycle
description: Manage the end-to-end INT SDD feature development lifecycle, including feature specs, status board updates, Gate 1 peer reviews, implementation plans, task breakdown, test-first TDD, Gate 2 code reviews, and Definitions of Ready & Done.
---

# INT SDD Feature Engineering Lifecycle

## Scope Boundary & Strict Non-Regression Guarantee
> [!IMPORTANT]
> **Strict Scope Restriction — PR Gate Workflow Enhancement**
> - **Before Spec Generation (🔒 NO CHANGE)**: BRD process, project setup, permissions, authentication, BRD ingestion, technology discovery, and pre-spec entry points remain 100% unchanged.
> - **Spec Generation → Gate 1 → Development → Gate 2 (✅ ENHANCEMENT ALLOWED)**: Non-blocking parallel specs, reviewer detection, decision prompts, work selection, standardized review templates, role validation, and dashboard synchronization.
> - **After Gate 2 Approval (🔒 NO CHANGE)**: Release Management, CR Management, Hot Fix Management, Deployment Management, Production Movement, Release Approvals, and downstream status transitions remain 100% unchanged. Handover to downstream workflows occurs exactly as it does today.

---

# Mandatory Lifecycle Flow

```text
1. BRD Ingestion / Authoring (.ai-context/BRD.md & .ai-context/assumptions.md)
       ↓
2. Gate 0: BRD PR Review & Approval (Standardized BRD Review Template + 5-Artifact Sync)
       ↓
3. Spec Authoring (.ai-context/specs/<feature-slug>.spec.md) [Parallel & Non-Blocking]
       ↓
4. Reviewer Detection / Selection & Decision Prompt (Review Pending Specs vs Work on Approved Specs)
       ↓
5. Gate 1: Spec PR Review & Approval (Standardized Gate 1 Template + Git Identity Validation)
       ↓
6. Developer Work Selection ("Which approved spec would you like to start development on?")
       ↓
7. Pre-Development PR Review Check & Developer Notification
       ↓
8. Plan (.ai-context/plans/<slug>.plan.md), Tasks (.tasks.md), Test Cases (.test_cases.md) Breakdown
       ↓
9. Full Development Phase: Test-First (RED) ──► Implementation (GREEN) ──► Full Test Suite Verification (PASS)
       ↓
10. Gate 2: Code PR Review & Approval (Standardized Gate 2 Template + Git Identity Validation + Dashboard Sync)
       ↓
11. EXISTING DOWNSTREAM WORKFLOW (Release Management / Release Note / CR Management / Hot Fix Management)
```

## Mandatory Lifecycle Rules
- **No implementation without an approved Spec**.
- **Gate 1 Approval Required for Development**: Development MUST NOT start for a spec that has not received Gate 1 approval.
- **Pre-Development PR Review Verification**: Before starting development on any spec, the system MUST inspect the existing PR Review record (`.ai-context/pr_reviews/GATE1-<slug>-*.md`) and notify the developer of the review findings.
- **Strict Rejection Blocking Rule**: If a spec was `Rejected` or marked `Changes Requested` at Gate 1, the user is **STRICTLY BLOCKED** from creating plans, tasks, test cases, or implementation code. The user MUST update the spec (`.ai-context/specs/<slug>.spec.md`) and re-submit for Gate 1 approval.
- **Developer Work Selection**: Once specs receive Gate 1 approval, present the eligible approved specs to the developer to select which one to work on.
- **Reviewer Detection on Git Pull**: Identify user Git credentials (`git config user.name`/`user.email` or configured User ID). If assigned as reviewer for pending specs, prompt with options: `Review Pending Specs` or `Work on Approved Specs`.
- **Git & Local Reviewer Validation**: Validate authenticated user matches assigned reviewer before official approval/rejection. In local-only mode, capture reviewer metadata without failing Git validation.
- **Plan, Tasks & Tests Generation**: Only after Gate 1 approval is granted, create `.plan.md`, `.tasks.md`, and `.test_cases.md`. Before creating tasks or implementation, perform CodeGraph impact analysis (`.ai-context/codegraph.sqlite`) to inspect existing call paths and module dependencies.
- **TDD RED before GREEN**: Write failing executable tests (`tests/`) first and confirm RED before writing implementation code (GREEN).
- **Mandatory Task-to-Code Traceability Annotations**: Generated implementation functions, methods, and classes MUST include structured JSDoc/Docstring traceability headers (`@task`, `@requirement`, `@spec`, `@description`).
- **Complete Development Before Gate 2**: All feature development tasks must be executed and test suites run to confirm 100% PASS before triggering Gate 2 review.
- **Gate 2 HALT**: After development is complete and tests pass GREEN, halt and perform Gate 2 code review using the standardized Gate 2 template.
- **Dashboard & Spec Synchronization**: Gate 1 and Gate 2 approval/rejection updates both Dashboard HTML (complete record) and Spec (current status) simultaneously.
- **Handover to Downstream**: Upon Gate 2 approval, hand over cleanly to existing downstream Release Management / Deployment workflows without modifying post-Gate-2 processes.
- One task per agent execution. Prompt by stable artifact ID (`<feature-slug>`).

---

# Stable Feature Slug & Traceability

Every feature receives a short, kebab-case feature slug when its Spec is created (e.g. `user-authentication`, `dynamic-form-management`).

The feature slug is the single stable traceability key across:
- Spec: `.ai-context/specs/<slug>.spec.md` (e.g. `dynamic-request-management.spec.md`)
- Plan: `.ai-context/plans/<slug>.plan.md` (e.g. `dynamic-request-management.plan.md`)
- Tasks: `.ai-context/tasks/<slug>.tasks.md` (e.g. `dynamic-request-management.tasks.md`)
- Test Cases: `.ai-context/test_cases/<slug>.test_cases.md` (e.g. `dynamic-request-management.test_cases.md`)
- Git branch: `feature/<slug>`
- Status Board: `.ai-context/status.md`

## CRITICAL RULE — FLAT FILE STRUCTURE (NO SUBDIRECTORIES)
All artifact files inside `.ai-context/` MUST be created directly as **flat files** at the root of their respective category folder.

## CRITICAL RULE — PORTABLE REPOSITORY-RELATIVE PATHS (NO ABSOLUTE PATHS)
All path references, file links, and code paths recorded inside repository artifacts (`.ai-context/`, `status.md`, specs, plans, tasks, test cases, ADRs, releases) MUST be **relative to the repository root**.
