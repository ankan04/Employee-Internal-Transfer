<!-- Deliverable 8 — Security Assessment.
     Assesses the IMPLEMENTED vertical slice, not the planned design.
     A control that exists only in the plan is not a control. -->

# Security Assessment: Employee Internal Transfer Digital Journey

| Field | Value |
|---|---|
| **Assessed** | `transfer-service/` as implemented — 14 tasks, 67 tests |
| **Against** | constitution v1.0 §2, spec v1.3, INT_SDD §20 and §30 |
| **Date** | 2026-08-30 |
| **Assessor** | SDD Assessment Reviewer (AI-assisted, author-executed) |

## ⚠ Scope And Independence

**This assessment covers a vertical slice, not an application.** 14 of 49 tasks
are implemented. **No blanket PASS is issued and none would be meaningful** — 35
tasks carry security-relevant behaviour that does not exist yet.

Independence limitation as before: the assessor is the author. Condition **C11
(Security and Architecture sign-off) is unmet**, and §12.1 requires that sign-off
because this feature touches constitution §2 throughout. Condition **C12
(independent peer review by a named non-author) is also unmet**. This document
does not substitute for either.

---

# Verdict

## CONDITIONAL — implemented controls pass; **three defects must be fixed before any release**

| Category | Count | Verdict |
|---|---|---|
| A — Implemented and verified by test | 8 controls | **PASS** |
| B — Implemented but defective | 3 controls | **FAIL** — SEC-01, SEC-02, SEC-03 |
| C — Designed, not implemented | 9 controls | **NOT SECURED** — must not be reported as secured |
| D — Not assessable, policy unresolved | 6 areas | Blocked on C1–C10 |

---

## A. Implemented And Verified

Each control exists in code **and** is proved by a passing test. Nothing in this
table rests on a design intention.

| Control | Constitution | Implementation | Verified by |
|---|---|---|---|
| Object-level authorisation, single predicate | §2 | `domain/authorization/canAccess.ts`, 9 callers | `.UT45`, `.UT77` — GREEN |
| Invisible resource returns `404`, never `403` | §2 | `app.ts` submission route | `.UT33` (404 on another subject's request) — GREEN |
| No I/O in the authorisation predicate — no existence timing channel | §2 | `canAccess` is pure | source-inspection test — GREEN |
| Acting subject derived from session only | §2 | `middleware/auth.ts` | `.UT79` (body subject ignored), `.UT78` (header ignored) — GREEN |
| Caller-supplied subject **ignored, not rejected** | §2 | `DraftSchema` does not model it | `.UT79` — GREEN |
| One-active-request invariant enforced by the database | — | partial unique index | `.UT90`, two parallel commits — GREEN |
| Idempotency on state-changing endpoints | §2 | `middleware/idempotency.ts` | `.UT17`, `.UT18`, `.UT108` — GREEN |
| Input validation reporting all failures | §2 | `ValidationEngine` | `.UT73` — GREEN |
| Approver identity never derived in code | §0 | `canAccess` takes resolved roles as input | source-inspection test — GREEN |

**On the source-inspection tests.** Two controls are verified by asserting
properties of the source rather than of behaviour — that `canAccess` contains no
`await`/`query`/`fetch`, and no org-hierarchy lookup. This is a weaker form of
evidence than a behavioural test and is recorded as such. It is used because the
properties being asserted are *absences*, and an absence cannot be exercised.

---

## B. Implemented But Defective — must be fixed before release

### SEC-01 — HIGH — Audit immutability is claimed but neither enforced nor tested

`migrations/002_audit.sql` executes:

```sql
REVOKE UPDATE, DELETE ON transfer_audit FROM PUBLIC;
```

**Two independent reasons this does not deliver AC41's append-only guarantee:**

1. **The application connects as `postgres`, a superuser.** PostgreSQL
   superusers bypass all privilege checks. The `REVOKE` is inert against the
   very role the application uses. There is no `app_user`; the plan (§4.1) named
   one, the migration does not create one, and nothing grants to it.
2. **`.UT48` was never written.** The test case exists in
   `test_cases` §3 and in the traceability map, and no corresponding test exists
   in the suite. The control was never exercised.

An `UPDATE` or `DELETE` against `transfer_audit` from application code would
succeed today. Constitution §3 requires audit records to be *"never updated or
deleted by application code"*, and the mechanism intended to guarantee that is a
no-op.

**Required:** create a non-superuser `app_user`, grant `INSERT, SELECT` only on
`transfer_audit`, connect as that role, and write `.UT48` to prove an `UPDATE`
is rejected. **Until then AC41 is NOT satisfied**, notwithstanding that the
audit rows are written correctly (`.UT47`-equivalent assertions in the
submission suite pass).

> This is the most instructive finding in the assessment. The migration *looks*
> like a database-enforced guarantee, the plan review praised it as one, and the
> execution evidence listed AC41 as Satisfied. It took reading the connection
> string against the `REVOKE` target to see that the two never meet.

### SEC-02 — HIGH — The reason field is stored in plaintext, contrary to the plan

Plan §4.1 specifies `reason_ciphertext bytea` with envelope encryption, and
§12.3 requires it; constitution §2 classifies the transfer reason as sensitive
because it may contain grievance content about a named individual.

`migrations/001_transfer_request.sql` declares:

```sql
reason            text,
```

Plaintext. A database dump, a replica, or a backup discloses every reason ever
submitted. The plan's `reason_present` boolean — which exists so list and
projection queries can answer *"is there a reason"* without decrypting — is also
absent.

**Required:** implement envelope encryption per plan §12.3 before any real
employee data is entered, and before task T20 (projection) reads the field.

**Why it happened, recorded honestly:** the slice did not include T20, so no
test read the reason through a projection, and no test asserted its storage
form. The plan specified the control; the task contract for T03 did not restate
it; no acceptance criterion covers storage-at-rest. **Nothing in the chain
would have caught this except reading the migration against the plan** — which
is what this assessment is for.

### SEC-03 — MEDIUM — `canAccess` grants FULFILLER visibility unconditionally

```ts
if (actor.roles.includes('FULFILLER')) return 'FULFILLER';
```

Any actor holding the `FULFILLER` role receives `FULFILLER` visibility on **every
request**, with no check that they hold a task on it. AC40 requires a fulfiller
to see *"only their own execution task"*.

The narrowing is intended to live in projection (task T20, not implemented), so
the defect is not currently exploitable — nothing calls `canAccess` with a
fulfiller actor, and no projection exists. But the predicate is the single
authorisation control, and a control that grants broadly and relies on a
downstream layer to narrow is the wrong shape.

**Required:** scope the branch to a resolved task assignment, in the same way
the `APPROVER` branch consumes `approverForRequestIds`.

### SEC-04 — MEDIUM — JWT verified without issuer or audience constraints

```ts
const { payload } = await jwtVerify(token, keySet);
```

No `issuer` or `audience` option. Any token signed by a key in the configured
JWKS is accepted, regardless of which service it was minted for. In an estate
where one identity provider serves many applications, a token issued for a
different audience would authenticate here.

**Required:** pass `{ issuer, audience }` and reject on mismatch. Cheap, and it
closes a genuine cross-service replay path.

### SEC-05 — LOW — Unhandled route errors fall through to Express's default handler

Route handlers `throw e` for unrecognised errors. Express's default handler
returns a stack trace when `NODE_ENV !== 'production'`, disclosing file paths and
internal structure.

**Required:** a terminal error middleware rendering the spec's error envelope
with a correlation id and no internals.

---

## C. Designed But NOT Implemented — must not be reported as secured

**These controls exist in the plan and in no running code.** Listing them as
"designed" rather than omitting them is deliberate: a security assessment that
silently skips unimplemented controls reads as though they were assessed.

| Control | Task | Constitution | Status |
|---|---|---|---|
| Allowlist logging / PII redaction | T10 | §2 | **Not implemented.** The slice performs no logging at all, so no PII currently leaks — but **AC42 is unverified**, and `.UT49`, `.UT50`, `.UT96` were never written |
| Per-endpoint rate limiting | T25 | §2 | **Not implemented.** All endpoints are unthrottled. The spec sets nine limits; zero are enforced |
| Field-level projection of the reason | T20 | §2 | **Not implemented.** Compounds SEC-02 |
| Fulfiller task scoping | T20 | §2 | **Not implemented.** See SEC-03 |
| Downstream adapter security (TLS, credentials, payload validation) | T45 | §2, §3 | **Not implemented** — and gated on C10 |
| Notification content controls | T31 | §2 | **Not implemented** |
| Master-data integration security | T24 | §3 | **Not implemented** — the in-memory adapter is a double, not an integration |
| Security headers, CORS allowlist, TLS termination | — | §2 | **Not implemented.** Plan §12.2 reasons CSRF is inapplicable under bearer auth, which holds; CORS and headers remain absent |
| Secret management via runtime store | — | §2 | **Not implemented.** The test password is a throwaway in an ephemeral container, so nothing is currently exposed, but no secret-store integration exists |

---

## D. Not Assessable — Policy Unresolved

These cannot be assessed because the behaviour they would secure has not been
decided. Each maps to its gate condition.

| Area | Condition | Why not assessable |
|---|---|---|
| Approval routing and decision authority | **C1** | Who may approve is undecided, so "correct authorisation" has no referent |
| Eligibility data handling | **C2** | The criteria are undefined; the sensitivity of the data they read is therefore unknown |
| Rejection-reason disclosure | **OQ47** | Whether a manager's comment reaches the employee is a live privacy question |
| Liveness and stuck-request exposure | **C5** | A request that can never complete is a support and privacy surface with no defined resolution |
| Downstream task selection and payload contents | **C8** | Which systems receive employee data is undecided |
| Downstream integration mode | **C10** | API versus ticket queue changes the entire data-in-transit surface |

**Reason-field visibility (PD09, HR-only) is implemented in neither direction
and requires Privacy sign-off**, per the Gate 1 conditions register.

---

## §30 Security Checklist — Scoped To The Slice

| Item | Result |
|---|---|
| No PII in logs at any level | **N/A — no logging exists.** Not a pass. AC42 unverified, T10 unimplemented |
| No secrets, credentials or tokens hardcoded or logged | **PASS** for the slice — the only credential is an ephemeral container password recorded in reproduction instructions; no production secret exists yet |
| All new/changed endpoints have an explicit rate-limit decision | **PASS on decision, FAIL on enforcement.** All nine limits are decided in the spec; none is implemented (T25) |
| New dependencies vetted | **PASS** — `express`, `pg`, `zod`, `jose`, `jest`, `ts-jest`, `supertest`, `ts-node`, `typescript`. All maintained and high-adoption. IDs use built-in `crypto.randomUUID`, not a package (constitution §2) |
| Auth boundaries and least-privilege IAM checked, not assumed | **FAIL — SEC-01.** The application runs as a database superuser. Least privilege is not merely unverified, it is contradicted |
| Data at rest and in transit matches constitution | **FAIL — SEC-02.** Reason stored in plaintext against an explicit plan requirement. TLS not configured (deployment concern, not yet applicable) |
| SAST/DAST and dependency scan run and clean | **NOT RUN.** No pipeline exists. Recorded as a gap, not waived |

---

## Findings Summary

| ID | Severity | Finding | Blocks |
|---|---|---|---|
| SEC-01 | **HIGH** | Audit immutability inert (superuser) and untested (`.UT48` missing) | AC41; release |
| SEC-02 | **HIGH** | Reason stored plaintext against plan §4.1/§12.3 | Any real employee data; T20 |
| SEC-03 | MEDIUM | `canAccess` grants FULFILLER visibility unconditionally | T20 |
| SEC-04 | MEDIUM | JWT verified without issuer/audience | Release |
| SEC-05 | LOW | Stack traces via Express default error handler | Release |

**SEC-01 and SEC-02 both share a root cause worth naming: a control specified in
the plan was not restated in the task contract, and no acceptance criterion
covered it.** The chain carried the requirement from constitution to plan and
then dropped it at the task boundary. **Recommended chain fix:** the D5
decomposition check should verify that every constitution §2 control named in
the plan appears in at least one task's Scope or Definition of Done — the same
class of check that D5-F02 and EX-02 established for AC clauses.

---

## Conclusion

The controls that *are* implemented are implemented well and proved by tests —
object-level authorisation, session-derived identity, database-enforced
invariants, idempotency. The two HIGH findings are not sloppiness in those
controls; they are **controls that were specified and then quietly not carried
into the task contracts**, which no gate downstream of the plan was checking for.

That is the honest headline of this assessment, and it is a stronger result than
a clean pass would have been: the SDD chain caught defects at Gate 1, at plan
review, at decomposition, during execution, and now at the security review —
**and this stage found a class of defect none of the earlier ones was shaped to
catch.**
