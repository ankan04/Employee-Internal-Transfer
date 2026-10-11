# Architecture — TRANSFER360

<!-- Living system design doc. Must stay current or it actively misleads
     the next agent session — update whenever a plan introduces a new
     integration, data store, or significant decision. -->

## System Overview

TRANSFER360 delivers the **Employee Internal Transfer Digital Journey** within the One-Point Employee Portal.
The service is structured as a **Modular Monolith** using **Hexagonal / Clean Architecture (Ports & Adapters)**.

### Auto-Detected Module & Directory Structure

```text
Project-TRANSFER360-Gate2/
├── transfer-service/                      # Backend Service Core
│   ├── src/
│   │   ├── http/                          # Driving Adapter / Entry Points
│   │   │   ├── app.ts                     # HTTP Composition Root & REST endpoints
│   │   │   └── middleware/                # Auth (JWT/JWKS), Correlation ID, Idempotency
│   │   ├── domain/                        # Pure Enterprise Business Rules
│   │   │   ├── request/                   # TransferRequest aggregate & state transitions
│   │   │   ├── authorization/             # Server-side Object-Level Access (canAccess)
│   │   │   ├── validation/                # Domain validation rules
│   │   │   └── workflow/                  # State machine definitions
│   │   ├── application/                   # Use Case Orchestration
│   │   │   └── submitRequest.ts           # Transfer request submission use case
│   │   ├── ports/                         # Driven Ports (Interfaces)
│   │   │   └── masterDataPort.ts          # Master data integration port
│   │   └── persistence/                   # Driven Adapters
│   │       ├── transferRequestRepository.ts # PostgreSQL repository adapter
│   │       ├── auditWriter.ts             # Append-only audit log writer
│   │       └── inMemoryMasterData.ts      # Contract double for testing
│   ├── migrations/                        # PostgreSQL relational schema migrations
│   └── test/                              # Jest automated test suites
├── docs/                                  # Client requirements & BRDs
└── .ai-context/                           # AI-First Context Plane & Governance
```

## Data Model & Datastores

- **System of Record:** PostgreSQL (connection pool max 10).
- **Core Entities:**
  - `transfer_requests`: Lifecycle status, employee subjectRef, departmentId, locationId, positionId, effectiveDate, sensitive free-text reason.
  - `transfer_request_audit`: Immutable, append-only record of actor, action, source/target state, correlationId, timestamp.
  - `idempotency_keys`: Dedicated table guaranteeing at-most-once execution for state-changing endpoints.
- **Cache / Job Processing:** Redis (Strictly cache/queue only; never system of record).

## Security & API Design

- **API Versioning:** URL-versioned REST API (`/api/v1/transfer-requests`).
- **Subject Extraction:** Actor identity is strictly extracted from verified session JWT/JWKS, never caller-supplied.
- **Authorization:** Server-side object-level access verification via `canAccess()`. Unauthorized records return `404` to avoid disclosing existence.
- **Idempotency:** State-modifying submissions require `Idempotency-Key` header with database-backed deduplication.

## Integrations

- **Downstream External Systems:** HRMS, Payroll, IAM/ITSM, Facilities.
- **Integration Boundary:** Explicit port interfaces (`ports/`), adapter-mediated. Downstream execution is asynchronous with contract doubles for testing.

## Decisions In Force

- **ADR-001:** Modular Monolith Architecture with Hexagonal layering (`domain`, `application`, `ports`, `persistence`, `http`).
- **ADR-002:** PostgreSQL as sole system of record for transfer state and audit logs.
- **ADR-003:** Redis restricted to caching and transient task queueing.
