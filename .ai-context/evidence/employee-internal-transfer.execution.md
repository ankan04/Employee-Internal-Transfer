<!-- Deliverable 6 — Test-first execution evidence.
     The deliverable the assessment brief numbers past (5 → 7); produced anyway
     because the chain Task → Prompt → RED → Implementation → GREEN needs a
     recorded artefact, not just a claim. -->

# Execution Evidence: Vertical Slice

## Scope
Ten tasks selected for a vertical slice through schema → domain → validation →
authentication → authorisation → endpoints, chosen to exercise the two
highest-risk areas (D5-F01) rather than to maximise task count.

## Environment
| | |
|---|---|
| Runtime | Node v24.18.0, TypeScript 5.7, Jest 29 |
| Database | **PostgreSQL 16.15** in Docker — a real server, not an in-memory emulation |
| Why that matters | `.UT90` requires two connections committing in parallel against a partial unique index. An emulated database would not prove the invariant holds. |

---

## 1. Result

| Task | RED | GREEN | Tests unchanged | AC | AC status |
|---|---|---|---|---|---|
| T03 — migration, one-active index | ✅ | ✅ | ✅ | AC12 (db half) | Satisfied |
| T06 — aggregate + repository | ✅ | ✅ | ✅ | AC1 (domain half) | Satisfied |
| T07 — workflow engine + table | ✅ | ✅ | ✅ | AC26 | Satisfied |
| T11 — validation engine | ✅ | ✅ | ✅ | framework | Satisfied |
| T12 — validation rules | ✅ | ✅ | ✅ | AC2–AC6, AC10, AC11 | Satisfied |
| T13 — API01 create draft | ✅ | ✅ | ✅ | AC1 | Satisfied |
| T15 — idempotency | ✅ | ✅ | ✅ | AC15 | Satisfied |
| T16 — API03 submission | ✅ | ✅ | ✅ | AC12, AC13, AC14 | Satisfied |
| T18 — OIDC + subject derivation | ✅ | ✅ | ✅ | AC7 | Satisfied |
| T19 — canAccess | ✅ | ✅ | ✅ | AC39 | Satisfied |
| **T02ᵈ — ports + in-memory master data** | ✅ | ✅ | ✅ | derived | Satisfied |
| **T05ᵈ — audit migration** | ✅ | ✅ | ✅ | AC41 (storage) | **NOT satisfied — SEC-01** |
| **T08ᵈ — AuditWriter in-transaction** | ✅ | ✅ | ✅ | AC41 | **NOT satisfied — SEC-01** |
| **T09ᵈ — correlation id** | ✅ | ✅ | ✅ | derived | Satisfied |

ᵈ = pulled in as a dependency during execution; see finding **EX-02**.

> **Corrected after D8.** AC41 was first recorded here as Satisfied. The
> security assessment established that it is not: the audit table's `REVOKE` is
> inert because the application connects as a database superuser, and `.UT48` —
> the test that would have exercised immutability — was never written. Audit
> rows *are* written correctly inside the transition transaction, which is why
> the row looked green. Append-only, the property AC41 actually asserts, is
> unenforced. See SEC-01.

**67 tests, 6 suites, all GREEN.** Coverage gate passes with per-module
thresholds.

---

## 2. RED Evidence

Full log: `red-run.txt`.

```
Test Suites: 6 failed, 6 total
Tests:       4 failed, 4 total
```

Every failure was **for the right reason** — the feature was absent, not the
test broken. `generate-tests.md` step 3 requires confirming this rather than
accepting any red result:

| Suite | Failure reason |
|---|---|
| `persistence/transferRequest.schema` | `error: relation "transfer_request" does not exist` |
| `domain/aggregate` | `TS2307: Cannot find module '../../src/domain/request/transferRequest'` |
| `domain/workflow` | `TS2307: Cannot find module '../../src/domain/workflow/stateMachine'` |
| `domain/validation` | `TS2307: Cannot find module '../../src/domain/validation/engine'` |
| `domain/authorization` | `TS2307: Cannot find module '../../src/domain/authorization/canAccess'` |
| `http/api` | `TS2307: Cannot find module '../../src/http/app'` |

No `src/` file and no migration existed when this ran.

## 3. GREEN Evidence

Full log: `green-run.txt`.

```
PASS test/persistence/transferRequest.schema.test.ts
PASS test/http/api.test.ts
PASS test/domain/aggregate.test.ts
PASS test/domain/authorization.test.ts
PASS test/domain/workflow.test.ts
PASS test/domain/validation.test.ts

Test Suites: 6 passed, 6 total
Tests:       67 passed, 67 total
```

## 4. Coverage — constitution §1

Full log: `coverage-run.txt`.

| Module | Stmts | Lines | Floor | |
|---|---|---|---|---|
| `domain/request` | 100 | 100 | 85 | ✅ |
| `domain/validation` | 100 | 100 | 85 | ✅ |
| `domain/workflow` | 92 | 100 | 85 | ✅ |
| `domain/authorization` | 90 | 100 | 85 | ✅ |
| All files | 94.73 | 97.02 | — | |

---

## 5. Changes To RED Tests

Two, both recorded before implementation was written or immediately after, and
**neither altered an assertion**. The `.GREEN` rule — *do not modify the RED
tests to make them pass* — was not breached.

### RD-01 — helper returned a Promise, breaking supertest chaining
`submit()` in `api.test.ts` was declared `async`, so it returned
`Promise<Response>` and `.expect()` was not chainable. The suite could not
compile. Corrected in the RED phase, **before any implementation existed**.
No assertion added, removed or weakened.

### RD-02 — the app's connection pool was never closed
Jest reported an open handle after the run. Teardown only: `afterAll` now closes
the pool the app owns. No assertion touched.

**Neither change was made to make a failing assertion pass.** Both were defects
in test *scaffolding*. Had either been an assertion that the implementation
could not satisfy, the correct response would have been a specification review,
not a test edit.

---

## 6. Findings From Execution

### EX-01 — BLOCKING (config) — The coverage threshold aggregated, masking a per-module shortfall

`jest.config.js` declared one threshold key, `'src/domain/'`. Constitution §1
sets the 85% floor for *"any module handling transfer state transitions,
approval decisions, authorisation or audit writes"* — **per module**.

With the aggregate key, the suite passed at exit 0 while
`domain/request/transferRequest.ts` sat at **73.91%**, carried by
higher-covered siblings. The rule was being reported as met while a module it
names was below the floor.

**Resolution.** One threshold key per module. The gate then failed, correctly:

```
Jest: ".../src/domain/request/transferRequest.ts" coverage threshold for
      lines (85%) not met: 73.91%
```

**How the shortfall was closed matters.** The uncovered lines were five field
accessors and an `isTerminal()` helper that nothing in the slice reads — callers
use `snapshot()`. They were **removed**, not covered by tests written to lift a
number. Constitution §1: *"Coverage is a floor, not a target to write to."*
They return with tasks T20 and T22, which bring their own acceptance criteria
and their own tests.

### EX-02 — SHOULD-FIX — Four task contracts had incomplete dependencies

The slice was specified as ten tasks. Executing it required **four more**:

| Pulled in | Why | Declared in D5? |
|---|---|---|
| T05 — audit migration | AC14 requires an audit record on submission | ❌ not in T16's `Depends` |
| T08 — AuditWriter | Same | ❌ not in T16's `Depends` |
| T09 — correlation id | The audit row's `correlation_id` is NOT NULL | ❌ not in T16's `Depends` |
| T02 — MasterDataPort adapter | VR02 resolves against master data | ✅ declared in T12 |

**T16's contract declares `Depends: T07, T11, T12, T15`.** Three of its four
real dependencies are missing, all reachable from a single clause of AC14 —
*"and an audit record of the transition is written."*

This is the mirror of D5-F02: an acceptance criterion whose scope spans more
tasks than its owning task admits. **Required:** tasks → v1.1 correcting T16's
dependencies, and a decomposition check that every clause of every cited AC maps
to a declared dependency.

### EX-03 — NIT — `branch` coverage is materially lower than line coverage

`domain/workflow` is at 71.42% branches against 100% lines; `persistence` at
66.66%. Line coverage passing the floor while branch coverage lags is the
classic way a state machine looks tested and is not. Constitution §1 sets a line
floor only. **Suggested:** add a branch floor at the next constitution amendment
— it is the metric that actually matters for a transition table.

---

## 7. D5-F01 Verification — The Constraint Held

The whole point of choosing T07 and T16 for the slice.

| Check | Result |
|---|---|
| Approval-stage literal in `submitRequest.ts` | **none** — target resolved via `firstPendingState()` |
| Approval-stage literal in the workflow tests | **none** — asserted by the test itself |
| `DECIDE` transitions declared in the table | **0** — asserted by test |
| `EXECUTE` transitions declared | **0** — gated on C9 |
| Eligibility port called from submission | **no** — gated on C2 |
| `VR03` registered | **no** — gated on C3 |
| Payroll date rule registered | **no** — gated on C7 |
| `available` field on positions | **not implemented** — gated on C3 |

Two tests enforce the constraint structurally rather than by convention:

```ts
it('declares no approval-stage transition — those rows are gated on C1', () => {
  expect(TRANSITIONS.filter((t) => t.action === 'DECIDE')).toHaveLength(0);
});

it('the resolved state is a pending state, whatever the approval model
    turns out to be', () => {
  expect(firstPendingState().startsWith('PENDING_')).toBe(true);
});
```

**If C1 resolves to a one-manager chain, one line of the transition table
changes and all 67 tests still pass.** That is the property the whole gate
structure exists to buy.

`canAccess` carries the same constraint, verified by source inspection: the
predicate performs no I/O and contains no org-hierarchy lookup, because
resolving *who approves* is task T29 — gated.

---

## 8. Everything Else

The remaining 35 tasks are **specified, prompted, and deliberately not
implemented**. That is a different state from incomplete work, and Gate 2 must
record it as such.

| State | Tasks | Which | Meaning |
|---|---|---|---|
| **Implemented and GREEN** | 14 | T02, T03, T05, T06, T07, T08, T09, T11, T12, T13, T15, T16, T18, T19 | §1 above |
| **Specified + prompted + not implemented** | 22 | T01, T04, T10, T14, T17, T20–T28, T30–T37 | Unblocked; a scope decision, not a gap |
| **Gated — must not be implemented** | 10 | T29, T38–T46 | IMPLEMENTATION gates C1–C4, C6–C10 |
| **Gated — must not be released** | 1 | T47 | RELEASE gate C5 |
| **Requires a named human** | 2 | T48, T49 | PROCESS gates C11, C12 |
| **Total** | **49** | | |

**No task is in an undefined state.** Every one of the 49 appears in exactly one
row, and each row names its members so the total is verifiable rather than
asserted.

> **Correction, recorded.** This table first reported 22 as **23**, summing to 50
> against a 49-task decomposition. The error was caught on review, not by the
> author, and is retained here rather than silently fixed. An unexplained extra
> task in a status table is precisely the class of defect Gate 2 exists to catch —
> and a count that had been *enumerated* rather than asserted could not have been
> wrong in the first place, which is why every row now names its members.


---

## 9. Reproduction

Everything needed to re-run this evidence from a clean machine. No secrets
appear here; the database password below is a throwaway used only by the
ephemeral test container.

### Environment

| | |
|---|---|
| Node | v24.18.0 |
| npm | 11.16.0 |
| TypeScript | 5.7.x |
| Jest | 29.7.x |
| Database image | `postgres:16-alpine` |
| Digest | `sha256:cf78e76683b9ca8c5733cbbdce6c9262b45b6767934dd0a95e671f9a0fc20685` |
| Server version | PostgreSQL 16.15 on x86_64-pc-linux-musl |
| Host port | **55432** → container 5432 |

### Start the test database

```bash
docker run -d --name t360-pg \
  -e POSTGRES_PASSWORD=t360test \
  -e POSTGRES_DB=transfer360 \
  -p 55432:5432 \
  postgres:16-alpine

# wait for readiness
until docker exec t360-pg pg_isready -U postgres; do sleep 1; done
```

### Environment variable

| Variable | Default if unset |
|---|---|
| `DATABASE_URL` | `postgres://postgres:t360test@localhost:55432/transfer360` |

The default is defined in `test/helpers/db.ts`. Override it to point at another
server; nothing else changes.

### Run

```bash
cd transfer-service
npm install
npx jest --runInBand              # 67 tests, 6 suites
npx jest --runInBand --coverage   # per-module thresholds, constitution §1
```

**Migrations are applied by the tests themselves** — `test/helpers/db.ts`
`migrate()` reads every file in `migrations/` in filename order, after
`resetSchema()` drops and recreates `public`. There is no separate migrate step
to run, and no migration state to get out of sync.

`--runInBand` is required, not cosmetic: the suites share one database and
`.UT90` deliberately provokes a write conflict.

### Tear down

```bash
docker rm -f t360-pg
```

The container is ephemeral by design. It holds no state worth keeping — the
schema is rebuilt on every run, which is what makes the evidence reproducible
rather than dependent on a long-lived environment.

---

## 10. Git History — What It Does And Does Not Evidence

The repository was **initialised during evidence preparation, after the slice
was already implemented**. Commit timestamps are therefore all from that
session.

**Commit timestamps must not be read as evidence of the RED → GREEN order.**
That ordering is evidenced separately and independently by §2 and §3 of this
document: the RED log records six suites failing because `src/` did not exist,
captured before any implementation was written; the GREEN log records the same
suites passing afterwards.

No attempt was made to manufacture separate historical RED and GREEN commits.
Fabricating a plausible history would have been easy and would have been worth
less than the honest record, because a reviewer cannot distinguish a real
timestamp from an invented one — but they can read a failure log that names
`Cannot find module '../../src/domain/workflow/stateMachine'`.

What the history **does** provide is §14 traceability: each implementation
commit names the task it implements, so a reviewer can move from a line of code
to a task, to an acceptance criterion, to a test.

### Note on commit-message attribution

The Claude Code environment used for this work defaults to appending a
`Co-Authored-By` trailer to commit messages. **That trailer is not present**, on
instruction, because INT_SDD_Standard.md §5.4 and §14, constitution §2, Definition
of Done item 3 and Gate 2 checklist item 2 all prohibit AI attribution in commit
messages. Task-ID references are the only traceability those rules permit, and
they are the only traceability used.
