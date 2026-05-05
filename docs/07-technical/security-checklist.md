# Security Checklist

## Privacy-First Architecture
- [ ] No raw SMS, email body, bank statement, screenshot, or installed-app inventory leaves the device.
- [ ] No raw financial text is written to local logs, crash reports, analytics, or debug traces.
- [ ] Parser stores hashes/fingerprints and extracted fields only.
- [ ] Local database is encrypted; encryption keys are stored in platform secure storage.
- [ ] User can delete local data and revoke Family Scan sessions.
- [ ] Data retention policy is visible in the app and enforced in code.

## Platform Permission Safety
- [ ] Android SMS permission is used only if Play policy review is viable and the app has a compliant core use case.
- [ ] Broad `QUERY_ALL_PACKAGES` is avoided for MVP; use targeted package queries from the merchant allowlist.
- [ ] Notification listener access is requested only after clear disclosure and is treated as future/active notification monitoring, not historical scan.
- [ ] iOS and web flows do not promise SMS history, notification history, or broad installed-app scanning.
- [ ] Permission denial paths are product-complete.

## Authentication and Session
- [ ] Local app lock supports device biometrics/PIN for financial context.
- [ ] Family Scan sessions use cryptographically random opaque IDs.
- [ ] Upload and read tokens are separate and stored hashed server-side.
- [ ] Links are single-use or explicitly revocable.
- [ ] Sessions expire automatically, default 24 hours.

## Family Scan Consent
- [ ] Parent sees exactly what will be shared before scan/manual entry.
- [ ] Parent reviews merchant/amount summary before submission.
- [ ] Parent results are encrypted client-side for the child's device before upload.
- [ ] Backend cannot read merchant names or amounts from Family Scan payloads.
- [ ] Child app labels Family Scan data as parent-provided and separately deletable.

## API Security
- [ ] Rate limiting on session creation, submission, polling, and revocation.
- [ ] CORS restricted to production/staging web origins.
- [ ] Strict request schema validation.
- [ ] No merchant names, amounts, SMS text, email text, or installed-app data in API logs.
- [ ] Replay protection for submit tokens.
- [ ] TTL cleanup job has monitoring and alerting.

## Data Encryption
- [ ] HTTPS/TLS 1.2+ enforced for every API call.
- [ ] Cloud database stores Family Scan result ciphertext only.
- [ ] Local backups exclude raw source data and protect encrypted databases.
- [ ] Signing keys, API keys, OAuth secrets, and DSNs are stored in managed secret stores.

## Model and Parser Safety
- [ ] Model files are checksummed and versioned.
- [ ] Parser fixture tests cover top merchants, false positives, refunds, one-time purchases, failed payments, and trial charges.
- [ ] Low-confidence detections require user review before affecting Health Score.
- [ ] Network egress tests prove parser execution does not call remote AI APIs.

## Compliance Review Before Public Launch
- [ ] Google Play sensitive-permission declarations completed where required.
- [ ] Gmail OAuth verification plan documented before requesting restricted scopes.
- [ ] India DPDP consent, notice, retention, correction, and deletion obligations reviewed.
- [ ] Financial guidance copy reviewed so the app does not imply regulated financial advice.
