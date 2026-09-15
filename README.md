# Project TRANSFER360 — Gate 2 Submission

**Employee Internal Transfer Digital Journey.** This package is scoped
specifically for **Gate 2 — Code Review**: does the implementation match what
was approved at Gate 1 and in the technical plan?

## What's in this package, and why

| Folder | Contents |
|---|---|
| `.ai-context/discovery/`, `BRD.md` | The original requirement and its discovery analysis — context, not under review here |
| `.ai-context/specs/` | The specification (with acceptance criteria and API contract) that this implementation is checked against |
| `.ai-context/test_cases/` | Spec-derived and QA-expanded test cases |
| `.ai-context/plans/` | The technical plan, already reviewed and remediated |
| `.ai-context/reviews/employee-internal-transfer.plan-review.md` | Evidence that the plan itself passed its own review |
| `.ai-context/tasks/`, `.ai-context/prompts/` | The task decomposition and AI prompts the implementation was built from |
| `.ai-context/evidence/` | RED and GREEN test logs, coverage output |
| `.ai-context/reviews/employee-internal-transfer.security.md` | Security assessment — **the implementer's own evidence, not a verdict.** Reach your own conclusion. |
| `.ai-context/architecture.md`, `.ai-context/decisions/` | As they currently stand — deliberately not padded out for this submission |
| `.ai-context/traceability.md` | AC → test → task mapping |
| `.ai-context/checklists/` | **Blank** §30 Gate 2 and Security checklists, for you to complete |
| `transfer-service/` | The implementation |

## What's deliberately not in this package

Any document where the implementer has already reached a Gate 2 verdict. That
question is yours to answer, not to be handed pre-answered. If you'd like to
see how the implementer's own self-review went after you've formed your own
view, ask — it exists, it's just not in this package.

## Scope of the implementation

**14 of 49 tasks are implemented.** This is a deliberate vertical slice, not a
partial delivery of the full feature — chosen to exercise schema, domain logic,
validation, authentication, authorisation and endpoints end to end. The
remaining 35 tasks are specified and task-decomposed but intentionally not
built; `.ai-context/tasks/employee-internal-transfer.tasks.md` marks each one
as either unblocked-but-out-of-scope-for-this-slice, or gated on an unresolved
business decision (which the tasks file names).

## Running the tests yourself

Requires Docker and Node 20+.

```bash
docker run -d --name t360-pg \
  -e POSTGRES_PASSWORD=t360test \
  -e POSTGRES_DB=transfer360 \
  -p 55432:5432 \
  postgres:16-alpine

until docker exec t360-pg pg_isready -U postgres; do sleep 1; done

cd transfer-service
npm install
npx jest --runInBand              # test suite
npx jest --runInBand --coverage   # per-module coverage thresholds

docker rm -f t360-pg
```

Migrations are applied by the test harness itself. `--runInBand` is required —
the suites share one database and one test deliberately provokes a write
conflict between two parallel connections.

The database password above is a throwaway for a container you run locally.
It is not a production secret.

## What to do with this

1. Read the spec's acceptance criteria and API contract.
2. Read the task decomposition to see what each implemented task claims to satisfy.
3. Review the code in `transfer-service/src/` and `transfer-service/test/`
   against those claims.
4. Run the tests yourself.
5. Review `security.md` as evidence, then form your own security judgement.
6. Check `git log` for task traceability and attribution.
7. Complete both checklists in `.ai-context/checklists/`.
