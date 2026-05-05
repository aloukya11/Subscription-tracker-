const crypto = require("crypto");
const express = require("express");
const { z } = require("zod");
const { createScanSessionStore } = require("./scan-session-store");

const port = Number(process.env.API_PORT || 4000);
const baseUrl = process.env.PUBLIC_BASE_URL || "http://localhost:4000";
const parentWebBaseUrl = process.env.PARENT_WEB_BASE_URL || "http://localhost:3000";
const defaultTtlMinutes = Number(process.env.FAMILY_SCAN_TTL_MINUTES || 1440);

const app = express();
app.use(express.json({ limit: "64kb" }));

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function nowIso() {
  return new Date().toISOString();
}

function futureIso(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function randomToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function parseBearerToken(authorizationHeader) {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token.trim();
}

function isExpired(expiresAt) {
  return Date.now() > Date.parse(expiresAt);
}

const initSchema = z.object({
  requesterDeviceIdHash: z.string().min(8).max(256),
  expiresInMinutes: z.number().int().min(5).max(24 * 60).optional(),
  childPublicKey: z.string().min(16).max(8192)
});

const submitSchema = z.object({
  sessionId: z.string().uuid(),
  parentConsentVersion: z.string().min(4).max(40),
  resultSchemaVersion: z.number().int().min(1).max(10),
  summaryCounts: z.object({
    subscriptions: z.number().int().min(0).max(10000)
  }),
  resultCiphertext: z.string().min(32).max(200000)
});

function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

let store;

app.get("/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "api-relay",
    storageMode: store ? store.mode : "booting"
  });
});

app.post("/api/v1/family-scan/init", asyncHandler(async (req, res) => {
  const parsed = initSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_request", details: parsed.error.issues });
  }

  const sessionId = crypto.randomUUID();
  const uploadToken = randomToken();
  const readToken = randomToken();
  const expiresInMinutes = parsed.data.expiresInMinutes || defaultTtlMinutes;
  const expiresAt = futureIso(expiresInMinutes);

  await store.create({
    sessionId,
    sessionIdHash: sha256(sessionId),
    requesterDeviceIdHash: parsed.data.requesterDeviceIdHash,
    childPublicKey: parsed.data.childPublicKey,
    uploadTokenHash: sha256(uploadToken),
    readTokenHash: sha256(readToken),
    status: "pending",
    resultCiphertext: null,
    resultMetadata: null,
    parentConsentVersion: null,
    resultSchemaVersion: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    expiresAt,
    deletedAt: null
  });

  return res.status(200).json({
    sessionId,
    parentUrl: `${parentWebBaseUrl}/family-scan/${sessionId}?uploadToken=${uploadToken}`,
    readToken,
    expiresAt
  });
}));

app.post("/api/v1/family-scan/submit", asyncHandler(async (req, res) => {
  const parsed = submitSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_request", details: parsed.error.issues });
  }

  const bearer = parseBearerToken(req.header("authorization"));
  if (!bearer) return res.status(401).json({ error: "missing_token" });

  const session = await store.get(parsed.data.sessionId);
  if (!session) return res.status(404).json({ error: "session_not_found" });

  if (session.deletedAt || session.status === "revoked") {
    return res.status(410).json({ error: "session_revoked" });
  }
  if (isExpired(session.expiresAt)) {
    await store.update(session.sessionId, { status: "expired", deletedAt: nowIso() });
    return res.status(410).json({ error: "session_expired" });
  }

  if (sha256(bearer) !== session.uploadTokenHash) {
    return res.status(401).json({ error: "invalid_token" });
  }

  await store.update(session.sessionId, {
    status: "completed",
    resultCiphertext: parsed.data.resultCiphertext,
    resultMetadata: parsed.data.summaryCounts,
    parentConsentVersion: parsed.data.parentConsentVersion,
    resultSchemaVersion: parsed.data.resultSchemaVersion
  });

  return res.status(202).json({ accepted: true });
}));

app.get("/api/v1/family-scan/results/:sessionId", asyncHandler(async (req, res) => {
  const bearer = parseBearerToken(req.header("authorization"));
  if (!bearer) return res.status(401).json({ error: "missing_token" });

  const session = await store.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "session_not_found" });

  if (session.deletedAt || session.status === "revoked") {
    return res.status(410).json({ error: "session_revoked" });
  }
  if (isExpired(session.expiresAt)) {
    await store.update(session.sessionId, { status: "expired", deletedAt: nowIso() });
    return res.status(410).json({ error: "session_expired" });
  }

  if (sha256(bearer) !== session.readTokenHash) {
    return res.status(401).json({ error: "invalid_token" });
  }

  return res.status(200).json({
    sessionId: session.sessionId,
    status: session.status,
    expiresAt: session.expiresAt,
    resultSchemaVersion: session.resultSchemaVersion,
    summaryCounts: session.resultMetadata,
    resultCiphertext: session.resultCiphertext
  });
}));

app.delete("/api/v1/family-scan/:sessionId", asyncHandler(async (req, res) => {
  const bearer = parseBearerToken(req.header("authorization"));
  if (!bearer) return res.status(401).json({ error: "missing_token" });

  const session = await store.get(req.params.sessionId);
  if (!session) return res.status(404).json({ error: "session_not_found" });

  const hashed = sha256(bearer);
  const allowed = hashed === session.uploadTokenHash || hashed === session.readTokenHash;
  if (!allowed) return res.status(401).json({ error: "invalid_token" });

  await store.update(session.sessionId, {
    status: "revoked",
    deletedAt: nowIso(),
    resultCiphertext: null,
    resultMetadata: null
  });
  return res.status(204).send();
}));

app.use((_req, res) => res.status(404).json({ error: "not_found" }));

app.use((error, _req, res, _next) => {
  console.error("Unhandled API error:", error.message);
  return res.status(500).json({ error: "internal_error" });
});

async function start() {
  store = await createScanSessionStore(nowIso);
  app.listen(port, () => {
    console.log("api-relay listening on http://localhost:" + port + " storage=" + store.mode);
  });
}

start().catch((error) => {
  console.error("Failed to boot api-relay:", error);
  process.exit(1);
});
