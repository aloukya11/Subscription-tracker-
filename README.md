# Subscription Ghost Buster

Monorepo scaffold for the Subscription Ghost Buster app:
- `apps/mobile`: Android-first mobile app
- `apps/family-scan-web`: parent consent and manual Family Scan flow
- `services/api-relay`: secure Family Scan relay APIs
- `docs/07-technical`: architecture, data model, security, and deployment specs

## Prerequisites
- Node.js 20+
- npm 10+

## Quick Start
```bash
npm install
npm run dev:api
```

In a second terminal:
```bash
npm run dev:web
```

In a third terminal:
```bash
npm run dev:mobile
```

For mobile API calls, set:
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

## Structure
```text
apps/
  mobile/
  family-scan-web/
services/
  api-relay/
packages/
  shared/
docs/
  07-technical/
backend/
  docs/openapi.yaml
```

## Next Build Step
Use the Builder agent to implement:
1. Local-first subscription parsing data pipeline
2. Family Scan APIs (`init`, `submit`, `results`, `revoke`)
3. Mobile onboarding, review queue, ghost confidence flow
4. Parent consent and manual submission flow
