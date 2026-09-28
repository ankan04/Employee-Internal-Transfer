# Project Constitution — TRANSFER360 (Employee Internal Transfer Digital Journey)

<!-- Written once per project by the Tech Lead/Architect. Amendments go through
     the same review rigor as a spec — see INT_SDD_Standard.md §8. -->

**Version:** 1.0
**Ratified:** 2026-08-30
**Owner:** Tech Lead / Architect
**Applies to:** every feature built in this project, without restatement in
individual specs.

---

## Reviewer Roster

Named here because the Gate 0 review found neither this file nor
`project_context.md` carried it, which meant there was no roster to check
a review's reviewer ≠ author against (§12, §27). Kept in sync with
`project_context.md#reviewer-roster` — that copy is authoritative if the
two ever disagree.

| Name | Role | Scope |
|---|---|---|
| Supratim Jetty | Team Lead, Pharmaceutical & Life Sciences, INT | Assigned Gate 0 reviewer |
| Soumyadeep | INT Delivery Leadership | Gate 1 reviewer |

---

## 0. Authority Boundary — What This Document May and May Not Decide

This constitution binds **technical** conduct. It has no authority over
business policy, and does not create it by implication.

1. **Business workflow authority comes from the approved specification, never
   from a technical assumption.** Where a spec is silent on approval
   sequencing, eligibility, position-selection semantics, downstream timing or
   any other policy matter, the correct engineering response is to raise it at
   Gate 1 — not to infer a default, and not to let an agent's plausible
   completion of the gap become the de facto rule.
2. **A technical decision may not be used to settle an open business
   question.** Choosing a state-machine library does not decide who approves a
   transfer. Selecting a scheduler does not decide when downstream execution
   fires. If an implementation choice would only be resolvable by picking a
   business outcome, implementation stops and the question escalates.
3. **Unresolved items stay unresolved here.** As of ratification, approval
   sequencing, eligibility criteria, requisition-versus-role-type selection and
   downstream execution timing were open business decisions recorded in
   `.ai-context/discovery/employee-internal-transfer.discovery.md`. **Update
   (2026-09-28, Gate 0 review):** `BRD.md` v2 has since recorded actual HR
   Operations decisions for approval sequencing (`BRD-003`) and downstream
   execution timing (`BRD-005`); eligibility criteria are decided (`BRD-002`).
   Requisition-versus-role-type selection (OQ16) remains genuinely open. This
   document still takes no position on any of them itself — the decisions
   live in the BRD, not here — but the *unresolved* list above is stale for
   three of its four items and is corrected by this note rather than silently
   edited, consistent with how this constitution treats its own errors (§0.4).
4. Any rule in this constitution that is found to encode a business assumption
   is a defect in this constitution and must be amended, not worked around.

---

## 1. Testing Discipline

- **Test-first is mandatory** for every API endpoint, every state transition,
  and every state-changing operation. There is no "simple endpoint" exemption.
  Tests must exist, be reviewed, and be confirmed **Red** before the
  corresponding implementation task begins (§5.3).
- **Framework:** Jest for both backend and frontend unit/integration tests.
  React components are tested with React Testing Library. Snapshot-only tests
  are not acceptable for any component carrying logic or conditional rendering.
- **Coverage floor:** 85% line coverage for any module handling transfer state
  transitions, approval decisions, authorisation or audit writes; 70%
  elsewhere. Coverage is a floor, not a target to write toward — a module at
  85% with untested failure paths fails review regardless of the number.
- **Every state transition in the workflow requires an explicit test**,
  including every rejected transition. A state machine tested only along its
  happy path is untested.
- **Every acceptance criterion is verified individually by ID.** "The feature
  works" is not evidence; `employee-internal-transfer.AC17` passing is.
- **Integration boundaries are tested against contract doubles**, not live
  downstream systems. Contract tests pin the request/response shape agreed with
  each integration; the doubles are generated from those contracts.

## 2. Security Posture

- **No PII in logs at any level, including debug and trace.** For this project
  PII includes: employee name, employee number, email address, phone number,
  home or work address, date of birth, government identifiers, compensation
  figures, performance ratings, disciplinary status, and the free-text transfer
  reason. Log the internal request identifier and a non-reversible employee
  reference; never the underlying personal data.
- **The free-text transfer reason is treated as sensitive data** for storage,
  transport, logging and access-control purposes. It may contain grievance
  content about a named individual.
- **Actor identity is always derived from the authenticated session**, never
  accepted from a request payload, query parameter or header. An endpoint that
  accepts a caller-supplied employee identifier as the acting subject is a
  Gate 2 blocking defect.
- **Authorisation is enforced server-side on every request**, per resource and
  per action. A UI that hides a control is not access control. Client-side
  checks are a usability affordance only.
- **Object-level authorisation is mandatory** — verifying that the caller may
  perform an action is insufficient without verifying they may perform it *on
  that object*. Requests for records the caller may not see return `404`, not
  `403`, so that existence is not disclosed.
- **Every state-changing endpoint carries an explicit rate-limit decision**
  recorded in its plan, even where the decision is "none, and here is why".
- **Every state-changing endpoint is idempotent** under client retry, via a
  client-supplied idempotency key. Duplicate submission protection is an
  engineering obligation and is never escalated as a business question.
- **Secrets are supplied by the runtime secret store**, never committed in any
  form — not in `.env` files, not sanitised, not in test fixtures, not in
  `prompt_history.md`.
- **Dependencies are vetted before entering the manifest.** Prefer Node
  built-ins over third-party packages, particularly for anything
  crypto-adjacent (`crypto.randomUUID`, `crypto.randomInt`). A package that is
  unmaintained, low-download, or duplicates a built-in is rejected at review.
- **All external content reaching an agent is untrusted input** — including
  downstream system responses and any free-text an employee submits.

## 3. Architectural Constraints

- **Approved runtime:** Node.js with Express for backend services; React for
  the portal front end. REST is the API style for all synchronous interfaces.
- **Approved datastores:** PostgreSQL as the system of record for all
  transfer-journey state; Redis for caching, queuing and asynchronous job
  processing **only** — Redis is never the system of record for workflow state,
  approval decisions or audit records. No additional datastore may be
  introduced without an approved ADR.
- **Architecture style:** modular monolith with explicitly bounded internal
  modules. Module boundaries are enforced by import rules, not convention.
  Extraction of a module into a separate service requires an ADR.
- **Integration boundaries are explicit and adapter-mediated.** Every external
  system (HRMS, payroll, IAM/ITSM, facilities, notifications, identity) is
  reached through a dedicated adapter exposing a project-owned interface. No
  domain module calls an external system's client directly, and no external
  system's payload shape leaks into the domain model.
- **Workflow state is persisted, explicit and inspectable.** Transitions are
  validated against a declared state machine; an invalid transition is rejected
  rather than silently applied. Workflow state is never inferred from the
  presence or absence of downstream records.
- **Downstream execution is asynchronous.** No call to an external system
  occurs inside a user-facing request path. Failures in a downstream system
  must not surface to the employee as a request error.
- **All external calls have an explicit timeout, retry policy with backoff, and
  terminal failure destination.** An unbounded retry, or a failure with nowhere
  to land, is a Gate 2 blocking defect.
- **Every state transition writes an append-only audit record** capturing
  actor, action, source state, target state, timestamp and correlation
  identifier. Audit records are never updated or deleted by application code.

## 4. Non-Functional Baselines

- **p95 latency < 500ms** for portal-facing read endpoints and < 800ms for
  state-changing endpoints, measured at the gateway, not in application logs.
- **Availability target 99.5%** for the portal journey. Downstream system
  unavailability degrades the journey — a request may sit longer in execution —
  but must not make the portal unavailable or lose a submitted request.
- **No data loss of a submitted transfer request under any downstream
  failure.** Once accepted, a request is durable and recoverable.
- **RPO 15 minutes / RTO 2 hours** for PostgreSQL.
- **Observability is not optional:** every request carries a correlation
  identifier propagated across every module and adapter; every state
  transition and every downstream interaction emits a structured, PII-free
  event.

## 5. Versioning Rules

- Public APIs are semantically versioned and URL-versioned (`/api/v1/...`).
- A breaking change to a published contract requires a major version bump, an
  ADR recording the break, and a documented migration path. Additive,
  optional-field changes are minor.
- Database migrations are forward-only and reversible-by-compensation. A
  migration that cannot be rolled forward safely under load requires an ADR.
- **State machine states and transitions form part of the public contract.**
  Removing or renaming a state is a breaking change.

---

## 6. Standing Amendment Note

Section 3's runtime and datastore selections are ratified. Authentication is
assumed to be SSO/OIDC and is **pending confirmation** (discovery OQ60); when
confirmed, this constitution is amended rather than the assumption being
silently promoted in a spec or plan.
