# PRD: Subscription "Ghost Buster" Engine

**Version**: 1.0 (MVP)
**Status**: Draft
**Owner**: [User]

---

## 1. Executive Summary
A proactive financial decision engine for Indian consumers (primarily Gen Z) to identify, optimize, and eliminate "Shadow Subscriptions"—recurring payments that users have forgotten or for which they have deleted the corresponding app.

## 2. The Problem
- **Subscription Creep**: Small monthly charges (AI tools, streaming, gaming) accumulate unnoticed.
- **The "Delete App ≠ Stop Payment" Fallacy**: Users think deleting an app cancels the subscription, but UPI Autopay mandates remain active.
- **The Parental Blindspot**: Students use parents' cards for trials, but parents don't realize the silent monthly debits.

## 3. Goals & Success Metrics
- **Goal**: Help users save at least ₹500/month on average.
- **Success Metric 1**: % of users who find at least one "Ghost" subscription during onboarding.
- **Success Metric 2**: Health Score "Share Rate" on social media.
- **Success Metric 3**: Conversion rate of "Family Scan" links sent to parents.

## 4. User Personas
1. **Zaid (Gen Z Student)**: Juggles 10+ free trials for AI and coding tools. Often uses his father's credit card.
2. **Mr. Sharma (Parent)**: Tech-literate but doesn't keep track of the 20 small ₹199-₹499 debits hitting his account monthly.

## 5. Functional Requirements (MVP)

### FR-1: Local AI Parsing Engine
- Must use a small, on-device LLM to parse transactional SMS and Gmail receipts.
- Must identify the merchant (e.g., Netflix, ChatGPT, Zomato) and the recurring frequency.
- **Privacy Constraint**: No raw bank data must ever leave the device.

### FR-2: The "Ghost" Detector
- App must cross-reference detected subscriptions with the list of apps installed on the user's phone.
- If a recurring debit exists for an app NOT installed, flag it as a "GHOST DETECTED."

### FR-3: The "Family Scan" (P2P Discovery)
- User can generate a secure "Audit Link" to send to a parent.
- When the parent opens the link on their phone, the app (via web or lite-install) performs a local scan of the parent's notifications.
- The results (merchant name and amount only) are sent back to the child's app for review.

### FR-4: Subscription Health Score
- A numeric score (0-1000) based on:
  - % of income spent on subscriptions.
  - Number of "Ghost" or "Zombie" (low usage) subscriptions.
  - Number of duplicate services (e.g., Netflix + SonyLIV + Hotstar).

### FR-5: Direct Cancellation Navigator
- For every detected subscription, provide a direct deep-link or a 3-step visual guide to the "Mandate" section of GPay, PhonePe, or Paytm.

## 6. Non-Functional Requirements
- **Performance**: Initial scan must take < 15 seconds.
- **Security**: All financial data encrypted at rest.
- **Reliability**: Identify at least 90% of top 50 Indian subscription merchants.

## 7. Roadmap (Post-MVP)
- **V1.1**: Automatic "Cancel for Me" bot.
- **V1.2**: Price Hike Detector (historical tracking).
- **V1.3**: Student Discount Auto-Applier.
