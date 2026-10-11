---
name: int-project-setup
description: Initialize a new software project using the exact INT AI-First standard Control Plane, project-specific AI context, technology-aware execution structure, and foundational repository baseline.
---
# INT AI-First Project Setup

## Purpose

Initialize a new software project according to the INT AI-First development architecture.

This skill is responsible for project initialization and baseline setup only. Do not implement business functionality or create business modules during initial setup unless explicitly requested.

The INT Control Plane is an organizational standard and MUST remain unchanged.

---

# MANDATORY STEP 1 — Existing Codebase Detection, User Confirmation Halt & Technology Discovery Gate

Before prompting or creating any artifacts, the agent **MUST FIRST INSPECT THE WORKSPACE** to determine whether the project is a **Brand New Empty Project** or an **Existing / Legacy Project Codebase**.

> [!CRITICAL]
> **SAFE OPERATION & USER CONFIRMATION HALT PROTOCOL**:
> 1. **Zero-Harm Codebase Guarantee**: Under NO circumstances will `int-project-setup` modify, delete, overwrite, re-structure, or harm any existing source code files, codebase folders, or ongoing project architectures. Existing codebase files are 100% preserved and untouched.
> 2. **Inspect Workspace Disk First**: Check if the workspace already contains source code or build configuration files (`package.json`, `pom.xml`, `requirements.txt`, `go.mod`, `Cargo.toml`, `src/`, `models/`, `controllers/`, `routes/`, etc.).
> 3. **IF AN EXISTING CODEBASE IS DETECTED — MANDATORY USER HALT**:
>    - The agent MUST **HALT** and present an explicit confirmation prompt to the user:
>      > **Existing Codebase Detected**: "An existing codebase was found in this directory. No existing codebase files or folders will be altered or harmed. Please select how you would like to populate `.ai-context/architecture.md` and `.ai-context/project_context.md`:"
>      > - **Option 1 (Recommended)**: *Auto-Detect from Codebase* — Automatically inspect existing files/folders to populate `project_context.md` and `architecture.md` without asking redundant tech stack questions.
>      > - **Option 2**: *Manual Stack Entry* — Answer interactive discovery questions to manually define or verify technology stack & architecture parameters.
> 4. **Execution Based on User Choice**:
>    - **If Option 1 is chosen**: Programmatically extract language, framework, database, ORM, and architecture pattern from codebase files; write auto-extracted values to `.ai-context/project_context.md` and `.ai-context/architecture.md`. Prompt ONLY for missing Gate 0/1/2 reviewer emails if empty.
>    - **If Option 2 is chosen**: Ask standard interactive discovery questions (Project type, architecture, stack, DB, ORM, reviewers) and write confirmed answers to `.ai-context/project_context.md` and `.ai-context/architecture.md`.
>    - **In BOTH options**: Bypass CLI scaffolding (`create-vite`, `@nestjs/cli`, etc.) completely so existing codebase folders are never modified or re-scaffolded.
> 5. **IF THE WORKSPACE IS BRAND NEW & EMPTY**:
>    - Execute standard interactive discovery: prompt user to confirm Project Type, Architecture Style, Technology Stack, Database, ORM, Deployment Target, and Reviewer Roster before executing automated CLI scaffolding in Step 2.

### Stack Parameters for Discovery (Clean Projects or Option 2 Manual Entry):
1. **Project Name & Type**: Full Stack, Frontend Only, Backend Only, or Mobile.
2. **Architecture Style**: Monolithic vs Modular Monolith vs Microservices vs Clean Architecture vs Feature-Sliced Architecture.
3. **Frontend Technology & Styling**: (e.g., React / Vite + Vanilla CSS or Tailwind).
4. **Backend Technology & Framework**: (e.g., Node.js Express / NestJS / Python FastAPI / Go).
5. **Database & ORM Layer**: (e.g., PostgreSQL + Sequelize / Prisma / Mongoose / TypeORM).
6. **Authentication & Security Strategy**: (e.g., JWT / OAuth2).
7. **Deployment Target**: (e.g., Docker / AWS / Vercel).
8. **Gate 0 Reviewer(s)**: Business Analyst / Project Manager / Product Owner names & emails (BRD Review).
9. **Gate 1 Reviewer(s)**: Project Manager / Tech Lead / Product Owner names & emails (Spec Review).
10. **Gate 2 Reviewer(s)**: Technical Lead / Architect / Senior Developer names & emails (Code Review).

---

# MANDATORY STEP 2 — Automated CLI-Driven Scaffolding & Dynamic Architecture Sync Protocol

Once all technology and architecture parameters are confirmed in Step 1, the agent MUST automatically generate the project directory structure on disk using official framework command-line interface (CLI) tools.

> [!CRITICAL]
> **AUTOMATED CLI SCAFFOLDING & ZERO STATIC TEMPLATES**:
> 1. The system carries **ZERO pre-defined or hardcoded static folder structures**. Static templates for `src/` and `tests/` are completely removed.
> 2. **NO MANUAL CONFIRMATION PROMPT**: The agent does NOT pause to ask for folder structure approval. Scaffolding is automatically executed via CMD / terminal using the official framework CLI generator matching the project setup plan.
> 3. **DYNAMIC ARCHITECTURE DOCUMENTATION**: `.ai-context/architecture.md` and `.ai-context/project_context.md` MUST NEVER contain hardcoded static paths. They MUST be populated dynamically with the actual directory tree scanned from disk after CLI execution.

---

# CRITICAL RULE — INT CONTROL PLANE (.agent/ CONTROL DIRECTORY)

The INT Control Plane files are authoritative and must remain content-equivalent to the approved source files.
- Dynamic rule and workflow synchronization from the master control plane.
- Vendor-agnostic governance (`AGENTS.md`) in workspace root.
- Copy ONLY skill directory and `SKILL.md` file, strictly excluding nested `resources/` subfolders.
- Auto-generate `.gitignore` protecting `.agent/`, `.ai-context/`, and `AGENTS.md`.

---

# Project Knowledge Base

Create the project-specific AI context directory structure:

```text
.ai-context/
├── constitution.md
├── project_context.md
├── architecture.md
├── BRD.md
├── assumptions.md
├── brd-change-log.md
├── status.md
├── prompt_history.md
├── specs/
├── plans/
├── tasks/
├── test_cases/
├── pr_reviews/
├── decisions/
├── incidents/
├── hotfixes/
├── releases/
├── change_requests/
└── templates/
    ├── spec.template.md
    ├── plan.template.md
    ├── tasks.template.md
    ├── test_cases.template.md
    ├── gate-1-review.template.md
    ├── gate-2-review.template.md
    ├── adr.template.md
    ├── incident.template.md
    ├── hotfix-spec.template.md
    ├── release.template.md
    ├── change-request.template.md
    └── gate-review-dashboard-design.html
```
