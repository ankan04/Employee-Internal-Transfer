-- employee-internal-transfer.T03 — Implements AC12 (database half)
DO $$ BEGIN
  CREATE TYPE transfer_status AS ENUM (
    'DRAFT','PENDING_RELEASING_MANAGER','PENDING_RECEIVING_MANAGER',
    'PENDING_HR_VALIDATION','APPROVED_SCHEDULED','IN_EXECUTION',
    'EXECUTION_ATTENTION','COMPLETED','REJECTED','WITHDRAWN','CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS transfer_request (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_ref       text            NOT NULL,
  status            transfer_status NOT NULL DEFAULT 'DRAFT',
  department_id     text,
  location_id       text,
  -- No FOREIGN KEY: the position model is gated on C3 (discovery OQ16).
  position_id       text,
  effective_date    date,
  reason            text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  submitted_at      timestamptz,
  version           integer     NOT NULL DEFAULT 0
);

-- AC12 enforced by the database. An application-level read-then-write loses
-- the .UT90 race; a partial unique index cannot.
CREATE UNIQUE INDEX IF NOT EXISTS one_active_request_per_subject
  ON transfer_request (subject_ref)
  WHERE status NOT IN ('COMPLETED','REJECTED','WITHDRAWN','CANCELLED');
