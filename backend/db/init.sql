CREATE TABLE IF NOT EXISTS incidents (
  id SERIAL PRIMARY KEY,
  component_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP NULL,
  rca JSONB NULL,
  severity TEXT NOT NULL DEFAULT 'P3'
);

CREATE INDEX IF NOT EXISTS idx_incidents_component_status
  ON incidents (component_id, status);

CREATE INDEX IF NOT EXISTS idx_incidents_created_at
  ON incidents (created_at DESC);
