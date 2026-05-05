# App Flow Diagram: Subscription Ghost Buster

## MVP Stance
- The automated MVP is Android-first. iOS and web cannot provide the same SMS, notification, or installed-app visibility, so they should be treated as companion/manual modes until proven.
- The Family Scan web link cannot scan a parent's SMS or notifications by itself. It can collect consent, open/install a native companion, or accept manual input/upload.
- "Ghost" should be shown as a confidence-based signal, not an absolute fact. A missing app does not always mean the subscription is unused.

## Primary Android Flow
```mermaid
graph TD
    A[Launch App] --> B{First Time User?}
    B -- Yes --> C[Privacy Promise and Eligibility Check]
    B -- No --> D[Home Dashboard]

    C --> C1[Choose Scan Sources]
    C1 --> C2{Automated Android Scan Available?}
    C2 -- Yes --> C3[Request Source Permissions]
    C2 -- No --> C4[Manual Import or Guided Audit]
    C3 --> C5[Source Readiness Check]
    C4 --> C5
    C5 --> C6[Local Prefilter: Payments and Receipts]
    C6 --> C7[Local Parser: Merchant, Amount, Cadence]
    C7 --> C8[Confidence Review and User Confirmation]
    C8 --> D

    D --> D1[View Health Score]
    D --> D2[View Detected Subscriptions]
    D --> D3[Family Scan]

    D2 --> D2A[Subscription Details]
    D2A --> D2B{Possible Ghost?}
    D2B -- Yes --> D2C[Explain Evidence and Confidence]
    D2B -- No --> D2E[Keep, Ignore, or Mark Cancelled]
    D2C --> D2D[Cancellation Navigator]
    D2D --> D2F[User Confirms Outcome]
    D2F --> D

    D3 --> F1[Generate Consent-Based Invite]
    F1 --> F2[Parent Opens Secure Link]
    F2 --> F3{Parent Scan Mode}
    F3 -- Android Companion --> F4[Parent Native Local Scan]
    F3 -- Manual --> F5[Parent Manual Upload or Entry]
    F4 --> F6[Parent Reviews Summary]
    F5 --> F6
    F6 --> F7[Encrypted Summary Relay]
    F7 --> F8[Child App Decrypts Results]
    F8 --> D
```

## Flow Notes
1. **Onboarding**: Show what data is read, what stays local, and what cannot be supported on the current device. Do not request sensitive permissions before the user understands the value.
2. **Scanning**: Use a two-stage scan: fast local rules to filter candidate messages, then a small local parser/classifier only for candidates. Background indexing can continue after the first result set.
3. **Review**: Put low-confidence detections behind a review step so false positives do not damage trust.
4. **Ghost Detection**: Match merchants to a targeted allowlist of app package IDs. Use "possible ghost" when there is no installed app match, but explain that web-only subscriptions and shared family accounts can be valid exceptions.
5. **Cancellation**: Prefer verified deep links where available, but always provide versioned visual guides because UPI app screens and routes can change.
6. **Family Scan**: Parent must explicitly review and approve the summary before any data is returned to the child. Results should be encrypted for the child's device and expire from the relay.

## Failure and Empty States
- Permission denied: offer manual audit, statement upload, or "try later"; do not block all product value.
- No subscriptions found: show scan coverage, sources checked, and next steps instead of a blank dashboard.
- Parser uncertain: mark as "Needs review" and avoid health-score penalties until confirmed.
- Cancellation route unavailable: show generic mandate-revocation guide and record the route as unverified.
