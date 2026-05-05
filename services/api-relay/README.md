# API Relay Service

Family Scan relay API for session creation, encrypted result submission, result fetch, and revocation.

## Current mode
- Runtime: `Express`
- Storage: PostgreSQL when `DATABASE_URL` is reachable, otherwise in-memory fallback
- Validation: `zod`
- Security behavior: hashed tokens, session TTL checks, revoke support

## Endpoints
- `GET /health`
- `POST /api/v1/family-scan/init`
- `POST /api/v1/family-scan/submit` with `Authorization: Bearer <uploadToken>`
- `GET /api/v1/family-scan/results/:sessionId` with `Authorization: Bearer <readToken>`
- `DELETE /api/v1/family-scan/:sessionId` with either upload or read token

## Run
```bash
npm run dev
```

Optional:
- Set `DATABASE_URL` to enable PostgreSQL-backed sessions
- Keep unset for in-memory local mode
- Set `PARENT_WEB_BASE_URL` so `init` returns links to the web consent app (default `http://localhost:3000`)

## Postgres migration
SQL migration is under:
- `db/migrations/0001_init.sql`

Storage implementations:
- `src/scan-session-store.js` contains both in-memory and PostgreSQL adapters
