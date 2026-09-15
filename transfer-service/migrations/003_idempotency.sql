-- employee-internal-transfer.T15 — Implements AC15
CREATE TABLE IF NOT EXISTS idempotency_record (
  key           text PRIMARY KEY,
  subject_ref   text    NOT NULL,
  endpoint      text    NOT NULL,
  resource_id   uuid    NOT NULL,
  request_hash  text    NOT NULL,
  response_body jsonb   NOT NULL,
  status_code   integer NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idempotency_one_per_resource
  ON idempotency_record (endpoint, resource_id);
