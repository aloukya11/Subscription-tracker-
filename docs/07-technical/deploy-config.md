# Deploy Configuration Document

## Hosting Platform Recommendation
- **Android MVP**: React Native with Expo development builds/EAS, not Expo Go. The app requires custom native modules for SMS, notification listener, app-package checks, encryption, and on-device ML.
- **iOS**: Ship later as a limited/manual companion unless the PRD is revised around iOS constraints.
- **Web/PWA**: Next.js or Vite for the Family Scan landing page, consent flow, and manual entry/upload. Do not position it as an automatic scanner.
- **API**: Vercel serverless API routes or AWS Lambda for Family Scan relay and operational metrics.
- **Database**: Supabase/PostgreSQL for expiring relay sessions only.

## Environment Setup
- **Local development**: EAS development build or local native build, local SQLite, local API server, and local parser fixture set.
- **Staging**: Internal Android track, Vercel preview, Supabase staging, synthetic test data only.
- **Production**: Play Store production only after sensitive-permission review is passed or the build uses a manual-import fallback that avoids restricted permissions.

## CI/CD Pipeline Structure
Use GitHub Actions or equivalent.

### On Pull Request
- Run linting, type checks, and unit tests.
- Run parser golden-file tests for top merchant fixtures.
- Run local database migration tests.
- Run privacy tests that fail on raw SMS/email strings in logs, analytics, crash reports, or network payloads.
- Build the web Family Scan app.

### On Merge to Main
- Build Android internal test artifact with EAS.
- Deploy API/web to staging first, then production after smoke checks.
- Run relay-session TTL and deletion tests.
- Publish merchant catalog and cancellation-guide versions separately from app binaries where possible.

## Release Gates
- Sensitive permissions documented with user-facing rationale.
- Play Console declaration prepared for SMS or broad package visibility if used.
- Fallback manual flow works when permissions are denied.
- Sentry and analytics verified to redact financial text and merchant/amount payloads.
- At least 90% precision target on the top merchant fixture set before claiming reliability.
- First visible scan results should appear within 15 seconds on target mid-range Android devices; full background indexing may continue later.

## Monitoring and Alerting
- **Sentry**: React Native and web crash reporting with PII scrubbing, disabled raw breadcrumbs, and release tags.
- **API logs**: Request IDs, latency, status codes, and session state only. No merchant names, amounts, SMS text, email text, or installed-app data.
- **Product analytics**: Allowlisted events such as `scan_started`, `permission_denied`, `ghost_confirmed`, and `cancel_route_opened`; no financial payloads.
- **Ops alerts**: Relay error rate, expired-session cleanup failures, API latency, and abnormal link-generation volume.

## Secrets and Config
- Store API keys, Sentry DSNs, Supabase keys, and signing credentials in EAS/Vercel/Supabase secret stores.
- Keep model files, merchant catalogs, and cancellation guide manifests versioned and checksummed.
- Use separate staging and production projects for analytics, Sentry, Supabase, and OAuth clients.
