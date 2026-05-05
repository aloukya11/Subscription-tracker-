# Database Schema

## Data Principles
- Use a local-first database. Raw financial text, raw email bodies, screenshots, and bank statements must not be stored in cloud.
- Store money as integer minor units, for example INR paise, not floating-point values.
- Every inferred field should include confidence or a user-confirmed override.
- Keep parser versions so detections can be reprocessed when the model or merchant catalog improves.

## Local Database (SQLite / WatermelonDB)

### Table: `Sources`
| Column | Type | Description |
|---|---|---|
| `id` | String (UUID) | Primary key |
| `type` | String | `sms`, `notification`, `gmail`, `manual`, `statement` |
| `permission_state` | String | `not_requested`, `granted`, `denied`, `limited`, `unsupported` |
| `last_scanned_at` | Timestamp | Last successful scan |
| `platform_limitations` | String | Human-readable limitation shown in diagnostics |

### Table: `MessageFingerprints`
| Column | Type | Description |
|---|---|---|
| `id` | String (UUID) | Primary key |
| `source_type` | String | Source adapter |
| `source_item_hash` | String | Hash of message/email/statement item; no raw body |
| `sender_hash` | String | Optional hash of sender/source |
| `received_at` | Timestamp | Original event time |
| `parsed_at` | Timestamp | Parser run time |
| `amount_minor` | Integer | Amount in minor units |
| `currency` | String | ISO currency, default `INR` |
| `merchant_candidate_id` | String | FK to `Merchants` when matched |
| `parser_version` | String | Rules/model version |
| `confidence` | Float | 0.0 to 1.0 |

### Table: `Merchants`
| Column | Type | Description |
|---|---|---|
| `id` | String (UUID) | Primary key |
| `canonical_name` | String | Normalized merchant name |
| `category` | String | `streaming`, `ai_tool`, `food`, `gaming`, etc. |
| `aliases_json` | JSON | SMS/email/payment aliases |
| `known_packages_json` | JSON | Target Android package IDs to query |
| `cancellation_route_id` | String | FK to `CancellationRoutes` |
| `reliability_tier` | String | `top_50`, `known`, `unverified` |

### Table: `Subscriptions`
| Column | Type | Description |
|---|---|---|
| `id` | String (UUID) | Primary key |
| `merchant_id` | String | FK to `Merchants` |
| `display_name` | String | User-facing merchant label |
| `amount_minor` | Integer | Latest expected recurring amount |
| `currency` | String | ISO currency |
| `cadence` | String | `weekly`, `monthly`, `quarterly`, `yearly`, `unknown` |
| `cadence_confidence` | Float | 0.0 to 1.0 |
| `first_seen_at` | Timestamp | First detected charge/mandate |
| `last_seen_at` | Timestamp | Most recent detected charge/mandate |
| `next_expected_at` | Timestamp | Predicted next billing date |
| `source_count` | Integer | Supporting events |
| `status` | String | `suspected`, `active`, `cancelled`, `ignored`, `needs_review` |
| `detection_reason` | String | `recurring_charge`, `mandate_setup`, `email_receipt`, `manual` |
| `is_ghost` | Boolean | Possible ghost flag |
| `ghost_confidence` | Float | 0.0 to 1.0 |
| `ghost_reason` | String | `app_not_installed`, `orphaned_mandate`, `user_reported` |
| `installed_match_status` | String | `matched`, `not_matched`, `not_checked`, `unsupported` |
| `user_verified_at` | Timestamp | User confirmation timestamp |

### Table: `CancellationRoutes`
| Column | Type | Description |
|---|---|---|
| `id` | String (UUID) | Primary key |
| `payment_app` | String | GPay, PhonePe, Paytm, bank app, etc. |
| `route_type` | String | `deep_link`, `visual_guide`, `generic_steps` |
| `route_value` | String | Deep link or local guide asset ID |
| `last_verified_at` | Timestamp | Last product QA verification |
| `verification_status` | String | `verified`, `stale`, `broken`, `unknown` |

### Table: `HealthScoreSnapshots`
| Column | Type | Description |
|---|---|---|
| `id` | String (UUID) | Primary key |
| `score` | Integer | 0-1000 |
| `score_version` | String | Formula version |
| `subscription_spend_minor` | Integer | Monthly subscription spend estimate |
| `income_amount_minor` | Integer | Optional user-entered income; local only |
| `inputs_missing_json` | JSON | Missing inputs, such as income |
| `ghost_count` | Integer | Count of possible ghosts |
| `duplicate_count` | Integer | Count of likely duplicate services |
| `computed_at` | Timestamp | Calculation time |

### Table: `FamilyScans`
| Column | Type | Description |
|---|---|---|
| `id` | String (UUID) | Primary key |
| `session_id_hash` | String | Hash of relay session |
| `parent_label` | String | Optional user label |
| `status` | String | `created`, `shared`, `submitted`, `expired`, `revoked` |
| `expires_at` | Timestamp | Local expiry |
| `result_decrypted_json` | JSON | Child device only, after decrypting approved summary |

## Cloud Database (PostgreSQL - Supabase / Neon)
Used only for transient Family Scan relay and non-PII operational metrics.

### Table: `ScanSessions`
| Column | Type | Description |
|---|---|---|
| `session_id_hash` | String | Primary key; never store raw public ID if avoidable |
| `upload_token_hash` | String | Parent submit token hash |
| `read_token_hash` | String | Child read token hash |
| `child_public_key` | String | Used by parent client for encryption |
| `status` | String | `pending`, `completed`, `expired`, `revoked` |
| `encrypted_result` | Text | Client-side encrypted summary only |
| `result_metadata_json` | JSON | Counts/schema version only, no merchant names or amounts |
| `created_at` | Timestamp | Creation time |
| `expires_at` | Timestamp | Hard TTL, default 24 hours |
| `deleted_at` | Timestamp | Set when revoked or purged |

### Table: `AnalyticsEvents`
| Column | Type | Description |
|---|---|---|
| `id` | String (UUID) | Primary key |
| `event_name` | String | Allowlisted event name |
| `anonymous_user_id` | String | Rotatable anonymous ID |
| `properties_json` | JSON | Non-PII properties only |
| `created_at` | Timestamp | Event time |

## Required Indexes
- `Subscriptions(status, next_expected_at)`
- `Subscriptions(merchant_id, status)`
- `MessageFingerprints(source_item_hash)`
- `ScanSessions(expires_at, status)`
- `AnalyticsEvents(event_name, created_at)`
