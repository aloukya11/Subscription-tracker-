# Backend Architecture Document

## Product and Platform Decision
- **MVP platform**: Android-first native app for automated detection. This is where SMS, notification listener, and app-package checks are technically possible, subject to policy approval and user consent.
- **iOS**: Companion/manual mode only for MVP. iOS can deep link to known apps, but it cannot broadly read SMS history or enumerate installed apps.
- **Web/PWA**: Family Scan landing and manual entry/upload only. A browser cannot read a user's SMS inbox or notification history.

## Local Device Architecture
Most product value must run on the user's device.

### Source Adapters
- **SMS adapter (Android only)**: Use only if Google Play policy approval is viable. Never upload raw SMS. Store message hashes/fingerprints and extracted fields only.
- **Notification adapter (Android only)**: Use `NotificationListenerService` for active and future notifications after the user enables notification access. Do not assume historical notifications are available.
- **Email/Gmail adapter**: Treat Gmail as optional. Gmail API read scopes are restricted and require OAuth verification; an MVP can start with manual receipt import or user-selected email exports.
- **Manual import adapter**: Support copy/paste, screenshot/PDF statement upload, or guided checklist as the privacy-safe fallback.
- **Installed app adapter**: Avoid broad `QUERY_ALL_PACKAGES` for MVP. Query a finite allowlist of known package IDs for the top merchant catalog.

### Parsing Pipeline
1. **Prefilter**: Local regex/rules detect likely payment/mandate/receipt messages.
2. **Normalize**: Convert amounts to minor units, normalize merchant aliases, and infer currency.
3. **Classify**: Use a small on-device classifier or compact language model only for ambiguous candidates. Do not make Llama 3 8B the default MVP model; it is too heavy for the 15-second first-scan target on many phones.
4. **Subscription inference**: Require either an explicit mandate/receipt signal or repeated charges with a plausible cadence before creating a subscription.
5. **Confidence scoring**: Every merchant, amount, cadence, ghost flag, and duplicate-service flag must carry confidence.

## Cloud Backend Scope
The backend should be a relay and control plane, not the subscription brain.

- **Runtime**: Next.js API routes or Node.js on serverless infrastructure.
- **Database**: Supabase/PostgreSQL for expiring Family Scan sessions and non-PII operational metrics.
- **Storage rule**: Cloud must never store raw SMS, raw email bodies, bank statements, screenshots, or full installed-app inventory.
- **Family Scan privacy**: Parent results should be client-side encrypted for the child's device before upload. The relay stores ciphertext plus minimal metadata and deletes it after expiry.

## API Design

### `POST /api/v1/family-scan/init`
Creates a temporary invite.

Request:
```json
{
  "requesterDeviceIdHash": "hash",
  "expiresInMinutes": 1440,
  "childPublicKey": "base64"
}
```

Response:
```json
{
  "sessionId": "opaque-id",
  "parentUrl": "https://example.com/family-scan/...",
  "readToken": "secret-for-child-device"
}
```

### `POST /api/v1/family-scan/submit`
Used by the parent flow after consent and review.

Headers:
```text
Authorization: Bearer <upload-token-from-parent-link>
```

Body:
```json
{
  "sessionId": "opaque-id",
  "parentConsentVersion": "2026-05-05",
  "resultSchemaVersion": 1,
  "summaryCounts": {
    "subscriptions": 3
  },
  "resultCiphertext": "base64"
}
```

### `GET /api/v1/family-scan/results/:sessionId`
Used by the child app with the read token. Returns only encrypted payloads.

### `DELETE /api/v1/family-scan/:sessionId`
Allows either side to revoke the session and delete stored ciphertext before TTL.

## Third-Party Integrations
- **On-device ML**: ONNX Runtime Mobile or MediaPipe LLM Inference after benchmarking on target Android devices.
- **Deep linking**: React Native/Expo Linking for payment app entry points, backed by visual fallback guides.
- **Crash reporting**: Sentry with PII scrubbing and disabled breadcrumbs for parsed financial text.
- **Analytics**: PostHog or equivalent with an explicit allowlist of non-PII events only.

## Breakpoints to Watch
- Play Store rejection for SMS or broad app-visibility permissions.
- Parent refusing to install a native companion from a link.
- False ghost flags caused by web-only subscriptions, shared accounts, or package-name mismatch.
- Health Score requiring income data the app does not actually have.
- Parser latency and battery drain if the app tries to run a large LLM over every message.
