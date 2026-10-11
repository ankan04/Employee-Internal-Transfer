# Project Assumptions

This document tracks technical, operational, and architectural assumptions across the project lifecycle.

| ID | Assumption | Category | Status | Impact / Related Artefact |
|---|---|---|---|---|
| ASM-001 | Authentication identity is derived from session SSO/OIDC tokens; subject is never caller-supplied. | Security | Active | `constitution.md` §2, `transfer-service` |
| ASM-002 | PostgreSQL serves as the sole system of record for request state and audit logs. | Architecture | Active | `constitution.md` §3 |
| ASM-003 | Downstream system integrations (HRMS, Payroll, IAM, Facilities) are adapter-mediated and asynchronous. | Architecture | Active | `constitution.md` §3 |
| ASM-004 | No behaviour is assumed for reversing a Payroll update when the Receiving Manager rejects or returns the request after stage 4 (KD-012 v3). Implementation is blocked until OQ-B17 is answered. | Business / Workflow | Open — not assumed | `BRD.md` OQ-B17, spec AC-025, CR-20261011 |
