# Assumptions and Risk Register

## Verdict
The product direction is strong, but the current technical plan is not "all good" yet. The main concept can work as an Android-first, local-first MVP, but several assumptions would break in production if left unchanged.

## Must-Correct Assumptions
| Assumption | Reality | Product/Tech Decision |
|---|---|---|
| A web Family Scan link can scan a parent's SMS/notifications | Browsers do not have general SMS inbox or notification-history access | Web link becomes consent/manual entry or opens a native Android companion |
| Android and iOS can share the same automated scan scope | iOS does not allow broad SMS history scanning or installed-app enumeration | MVP is Android-first; iOS is manual/limited |
| `READ_SMS` is a simple permission request | Google Play treats SMS access as high-risk and restricted | Keep manual import fallback; validate Play policy before committing |
| Installed-app matching can use broad app inventory | Installed app inventory is sensitive; broad package visibility is restricted | Query a targeted merchant package allowlist instead of `QUERY_ALL_PACKAGES` |
| A deleted app means a ghost subscription | User may subscribe via web, another device, family account, or browser | Use "possible ghost" with confidence and evidence |
| Llama 3 8B can parse everything locally in under 15 seconds | Large models are likely too slow/heavy across mid-range phones | Use rules + merchant taxonomy + small classifier/SLM; benchmark before committing |
| Gmail receipt parsing is easy and local-only | Gmail API read scopes are restricted and require verification; Gmail data originates in Google's cloud | Make Gmail optional; start with manual import or scoped OAuth plan |
| Health Score can use income percentage | The app has no reliable income source unless the user enters it | Use spend-based score when income is missing |
| Zombie/low-usage detection is available | App usage tracking is limited and platform-dependent | Keep zombie detection out of MVP or make it self-reported |
| Direct deep links will always reach mandate screens | Payment app routes can be private, unstable, or unavailable | Maintain visual guides with last-verified versions |

## Highest-Risk Breakpoints
1. **Store-policy rejection**: SMS and broad app visibility can block Play Store release.
2. **Trust drop-off**: Users and parents may refuse sensitive permissions unless the value and local-only boundary are very clear.
3. **False positives**: Incorrect ghost flags can make the app feel unsafe and accusatory.
4. **Family privacy**: Parent financial summaries sent to a child are still sensitive personal data, even if raw SMS is stripped.
5. **Model performance**: A heavy local LLM can break the 15-second first-result promise and drain battery.
6. **Cancellation reliability**: Deep links may fail after payment app updates; guides need QA ownership.

## MVP Scope Recommendation
- Build Android automated scanning first.
- Use manual import as the universal fallback.
- Parse with deterministic rules and a merchant catalog before local AI.
- Ship Family Scan as parent-consented manual/native flow, not automatic browser scanning.
- Show possible ghosts with confidence and require user confirmation.
- Keep all cloud storage transient, encrypted, and non-readable by the backend.

## Acceptance Criteria Before Build
- Top 50 merchant catalog with aliases and target package IDs.
- Parser fixture set with positive and negative examples.
- Permission-denied path that still demonstrates product value.
- Family Scan consent copy and encryption design.
- Cancellation guide inventory with owner and verification date.
- Benchmarks on at least one low-end and one mid-range Android phone.

## Official Source Checks
- Google Play restricts SMS/Call Log permissions and requires policy-compliant use/declarations: https://support.google.com/googleplay/android-developer/answer/10208820
- Google Play restricts broad installed-app visibility via `QUERY_ALL_PACKAGES`: https://support.google.com/googleplay/android-developer/answer/10158779
- Android package visibility should prefer scoped queries: https://developer.android.com/training/package-visibility
- Android notification listener receives active/future notification callbacks, not arbitrary browser-style history: https://developer.android.com/reference/android/service/notification/NotificationListenerService
- Apple limits `canOpenURL` checks to declared URL schemes and caps declarations: https://developer.apple.com/documentation/uikit/uiapplication/canopenurl%28_%3A%29
- Apple SMS filtering is for filtering incoming unknown SMS/MMS, not reading historical inbox data: https://developer.apple.com/documentation/identitylookup/sms-and-mms-message-filtering
- WebOTP is for one-time password retrieval, not general SMS scanning: https://developer.chrome.com/docs/identity/web-apis/web-otp
- Gmail API read scopes such as `gmail.readonly` are restricted and require verification: https://developers.google.com/workspace/gmail/api/auth/scopes
- Expo Go cannot use arbitrary custom native code; development builds are needed: https://docs.expo.dev/workflow/customizing/
- India DPDP Act should be reviewed for consent, retention, correction, deletion, and fiduciary duties: https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf
- India DPDP Rules, 2025 commencement and implementation timelines should be reviewed before launch: https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf
