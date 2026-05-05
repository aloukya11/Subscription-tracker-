const { Pool } = require("pg");

function toDbJson(value) {
  if (value === null || value === undefined) return null;
  return JSON.stringify(value);
}

function mapDbRowToSession(row) {
  if (!row) return null;
  return {
    sessionId: row.session_id_plain,
    sessionIdHash: row.session_id_hash,
    requesterDeviceIdHash: row.requester_device_id_hash,
    childPublicKey: row.child_public_key,
    uploadTokenHash: row.upload_token_hash,
    readTokenHash: row.read_token_hash,
    status: row.status,
    resultCiphertext: row.encrypted_result,
    resultMetadata: row.result_metadata_json || null,
    parentConsentVersion: row.parent_consent_version,
    resultSchemaVersion: row.result_schema_version,
    createdAt: row.created_at ? row.created_at.toISOString() : null,
    updatedAt: row.updated_at ? row.updated_at.toISOString() : null,
    expiresAt: row.expires_at ? row.expires_at.toISOString() : null,
    deletedAt: row.deleted_at ? row.deleted_at.toISOString() : null
  };
}

class InMemoryScanSessionStore {
  constructor(nowIsoFn) {
    this.nowIsoFn = nowIsoFn;
    this.sessions = new Map();
    this.mode = "memory";
  }

  async create(session) {
    this.sessions.set(session.sessionId, session);
    return session;
  }

  async get(sessionId) {
    return this.sessions.get(sessionId) || null;
  }

  async update(sessionId, patch) {
    const existing = await this.get(sessionId);
    if (!existing) return null;
    const updated = { ...existing, ...patch, updatedAt: this.nowIsoFn() };
    this.sessions.set(sessionId, updated);
    return updated;
  }
}

class PostgresScanSessionStore {
  constructor(databaseUrl) {
    this.pool = new Pool({
      connectionString: databaseUrl
    });
    this.mode = "postgres";
  }

  async healthcheck() {
    await this.pool.query("SELECT 1");
  }

  async close() {
    await this.pool.end();
  }

  async create(session) {
    const query = `
      INSERT INTO scan_sessions (
        session_id_hash,
        session_id_plain,
        upload_token_hash,
        read_token_hash,
        requester_device_id_hash,
        child_public_key,
        status,
        encrypted_result,
        result_metadata_json,
        parent_consent_version,
        result_schema_version,
        created_at,
        updated_at,
        expires_at,
        deleted_at
      ) VALUES (
        $1, $2::uuid, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12::timestamptz, $13::timestamptz, $14::timestamptz, $15::timestamptz
      )
      RETURNING *;
    `;

    const values = [
      session.sessionIdHash,
      session.sessionId,
      session.uploadTokenHash,
      session.readTokenHash,
      session.requesterDeviceIdHash,
      session.childPublicKey,
      session.status,
      session.resultCiphertext,
      toDbJson(session.resultMetadata),
      session.parentConsentVersion,
      session.resultSchemaVersion,
      session.createdAt,
      session.updatedAt,
      session.expiresAt,
      session.deletedAt
    ];

    const result = await this.pool.query(query, values);
    return mapDbRowToSession(result.rows[0]);
  }

  async get(sessionId) {
    const query = `
      SELECT *
      FROM scan_sessions
      WHERE session_id_plain = $1::uuid
      LIMIT 1;
    `;
    const result = await this.pool.query(query, [sessionId]);
    return mapDbRowToSession(result.rows[0]);
  }

  async update(sessionId, patch) {
    const existing = await this.get(sessionId);
    if (!existing) return null;

    const merged = { ...existing, ...patch };
    const query = `
      UPDATE scan_sessions
      SET
        status = $2,
        encrypted_result = $3,
        result_metadata_json = $4::jsonb,
        parent_consent_version = $5,
        result_schema_version = $6,
        updated_at = NOW(),
        deleted_at = $7::timestamptz
      WHERE session_id_plain = $1::uuid
      RETURNING *;
    `;

    const values = [
      sessionId,
      merged.status,
      merged.resultCiphertext,
      toDbJson(merged.resultMetadata),
      merged.parentConsentVersion,
      merged.resultSchemaVersion,
      merged.deletedAt
    ];

    const result = await this.pool.query(query, values);
    return mapDbRowToSession(result.rows[0]);
  }
}

async function createScanSessionStore(nowIsoFn) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.warn("DATABASE_URL not set. Using in-memory session store.");
    return new InMemoryScanSessionStore(nowIsoFn);
  }

  const postgresStore = new PostgresScanSessionStore(databaseUrl);
  try {
    await postgresStore.healthcheck();
    return postgresStore;
  } catch (error) {
    console.warn("Postgres unavailable, falling back to in-memory store:", error.message);
    await postgresStore.close().catch(() => {});
    return new InMemoryScanSessionStore(nowIsoFn);
  }
}

module.exports = {
  createScanSessionStore
};
