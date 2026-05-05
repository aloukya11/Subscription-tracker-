# API Relay Service

Family Scan relay API for session creation, encrypted result submission, result fetch, and revocation.

## Current mode
- Runtime: `Express`
- Storage: in-memory (for local development)
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

## Postgres migration
SQL migration is under:
- `db/migrations/0001_init.sql`

Next step is replacing the in-memory store with a PostgreSQL repository that maps this schema.

