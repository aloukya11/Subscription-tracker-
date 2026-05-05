# Frontend Design Document

## Product UX Direction
- The app should feel trustworthy first and clever second. This is a consumer-finance product asking for sensitive permissions, so avoid making the experience feel like a prank or fear tactic.
- Use an Android-first native experience for automated scanning. The web experience is a consent/manual-entry flow for Family Scan.
- Treat "Ghost Detected" as a high-attention moment, but show the evidence and confidence behind it.

## UI Framework Recommendation
- **Primary app**: React Native with Expo development builds/EAS and custom native modules.
- **Web Family Scan**: Next.js or Vite PWA for invite landing, consent, manual entry/upload, and encrypted result submission.
- **Design system**: High-contrast trust palette with both light and dark modes. Neon accents can be used sparingly for alerts and wins, but the core UI should remain readable for parents and older users too.

## Screen List
1. **Welcome / Privacy Promise**: Explain local-first scanning and what will never be uploaded.
2. **Device Capability Check**: Show whether automated Android scan, manual import, or limited mode is available.
3. **Permission Request Flow**: Request one sensitive permission at a time after explaining its value.
4. **Source Setup**: SMS, notifications, Gmail/manual import, and statement/manual audit options.
5. **Scanning Screen**: Show source coverage and first-results progress instead of promising a full scan in exactly 15 seconds.
6. **Review Queue**: User confirms low-confidence merchants, cadences, and amounts.
7. **Home Dashboard**: Health Score, monthly spend estimate, confirmed ghosts, and pending review count.
8. **Subscription List**: Filters for confirmed, possible ghost, needs review, cancelled, and ignored.
9. **Subscription Details**: Evidence timeline, amount, cadence, app-match status, and cancellation actions.
10. **Cancellation Navigator**: Deep link when verified, otherwise visual guide by payment app and version.
11. **Family Scan Invite**: Generate consent-based link and show expiry/revocation state.
12. **Parent Consent Page**: Parent sees what will be shared before scanning or manual entry.
13. **Parent Review Page**: Parent approves the merchant/amount summary before encrypted submission.

## Component Hierarchy
- `AppNavigator`
  - `OnboardingFlow`
    - `PrivacyPromise`
    - `CapabilityCheck`
    - `PermissionExplainer`
    - `SourceSetup`
  - `ScanFlow`
    - `ScanProgress`
    - `SourceCoverageList`
    - `ReviewQueue`
  - `MainTabs`
    - `Dashboard`
      - `HealthScoreWidget`
      - `SpendSummary`
      - `GhostSignalCard`
      - `ReviewQueueCard`
    - `SubscriptionsList`
      - `SubscriptionItemCard`
      - `FilterBar`
      - `ConfidenceBadge`
    - `FamilyScan`
      - `LinkGenerator`
      - `SessionStatusList`
      - `ScanResultsList`
  - `CancellationFlow`
    - `PaymentAppSelector`
    - `DeepLinkButton`
    - `VisualGuideCarousel`
    - `OutcomeConfirmation`

## UX Guardrails
- Do not block the app if permissions are denied; show the manual path.
- Do not say "cancelled" until the user confirms the outcome.
- Do not calculate income-based Health Score unless the user enters income locally. If missing, show a spend-based score variant.
- Do not use red/green alone to indicate financial status; pair color with labels and icons.
- Show when a cancellation guide was last verified.
- Let users correct merchant names, cadence, amount, and ghost status; corrections should improve future local parsing.

## Accessibility Requirements
- Large tap targets, minimum 44x44 pt.
- Screen-reader labels for monetary values, score changes, confidence levels, and cancellation steps.
- Dynamic text support without clipped cards or buttons.
- High contrast in both light and dark modes.
- Parent web flow must work on low-end Android browsers with large text and simple forms.
