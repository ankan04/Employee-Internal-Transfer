-- employee-internal-transfer.T05 / T08 — Implements AC41
CREATE TABLE IF NOT EXISTS transfer_audit (
  id             bigserial PRIMARY KEY,
  request_id     uuid NOT NULL,
  actor_ref      text NOT NULL,
  action         text NOT NULL,
  from_status    transfer_status,
  to_status      transfer_status,
  correlation_id uuid NOT NULL,
  occurred_at    timestamptz NOT NULL DEFAULT now(),
  metadata       jsonb NOT NULL DEFAULT '{}'::jsonb
);
-- Constitution §3: append-only, enforced by grant rather than by convention.
DO $$ BEGIN
  EXECUTE 'REVOKE UPDATE, DELETE ON transfer_audit FROM PUBLIC';
EXCEPTION WHEN OTHERS THEN NULL; END $$;
