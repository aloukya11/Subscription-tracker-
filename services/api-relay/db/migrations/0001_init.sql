-- Family Scan relay schema (cloud-side metadata only)
-- No raw SMS/email text or plaintext parent results should be stored.

CREATE TABLE IF NOT EXISTS scan_sessions (
  session_id_hash TEXT PRIMARY KEY,
  session_id_plain UUID UNIQUE NOT NULL,
  upload_token_hash TEXT NOT NULL,
  read_token_hash TEXT NOT NULL,
  requester_device_id_hash TEXT NOT NULL,
  child_public_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'expired', 'revoked')),
  encrypted_result TEXT,
  result_metadata_json JSONB,
  parent_consent_version TEXT,
  result_schema_version INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY,
  event_name TEXT NOT NULL,
  anonymous_user_id TEXT NOT NULL,
  properties_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_sessions_expiry_status
  ON scan_sessions (expires_at, status);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created
  ON analytics_events (event_name, created_at);

