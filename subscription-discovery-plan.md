## Discovery Plan: Subscription Decision Engine

**Date**: 2026-05-04
**Product Stage**: New Concept (Educational Project)
**Target**: Gen Z Indian Consumers
**Discovery Question**: How might we build a proactive financial engine that automatically identifies, optimizes, and actions subscription savings?

### Selected Ideas for Validation
1. **SMS/Email Parsing Engine (Local LLM)**: Tech flex to bypass bank APIs.
2. **"Shadow Subscriptions" Reveal**: Viral "Aha!" moment showing wasted money.
3. **Subscription Health Score**: Shareable metric for growth loop.
4. **The "Family Detective" Scan**: Allow students to scan parent accounts via a secure link.
5. **"Ghost Buster" Logic**: Automatically flag debits for apps NOT installed on the phone.

### Critical Assumptions

| # | Assumption | Category | Impact | Uncertainty | Priority |
|---|-----------|----------|--------|-------------|----------|
| 1 | **The "Shadow" Reality**: Gen Z actually has enough forgotten subscriptions to make the "Aha!" moment work. | Value | High | High | P1 |
| 2 | **The Trust Hurdle**: Users (and their parents) will grant SMS/Email read permissions to a new app. | Usability | High | High | P2 |
| 3 | **Parental Collaboration**: Parents will actually click a link from their child and allow a scan. | GTM | High | High | P3 |

### Validation Experiments

| # | Tests Assumption | Method | Success Criteria | Effort |
|---|-----------------|--------|-----------------|--------|
| 1 | The "Shadow" Reality | **Concierge / Audit** | 4 out of 10 users find at least ₹300/mo in forgotten/wasted subscriptions. | Low |
| 2 | Parental Collaboration| **WhatsApp Message Test**| 5 out of 10 parents click a link sent by their child with the pitch: "I'll save you money." | Low |
| 3 | The Trust Hurdle | **Fake Door / Prototype** | 40% of users click "Allow" when shown the permissions screen mockup. | Low |

### Experiment Details

**Experiment 1: The "Manual Audit" (Testing Value)**
- **Hypothesis**: If we force Gen Z users to manually look at their bank statements, they will find money they didn't realize they were wasting on subscriptions.
- **Setup**: Sit down with 10 Gen Z friends/peers over coffee. Ask them to open their primary bank app/UPI history. Go through the last 30 days and manually tally every subscription. Ask: "Are you still actively using this?"
- **Measurement**: Total ₹ value of "shadow" (forgotten/wasted) subscriptions per user.
- **Decision**: If average waste is < ₹150/mo, the "Aha!" moment isn't strong enough, and the value prop fails.

**Experiment 2: The "Permission Bounce" (Testing Trust)**
- **Hypothesis**: Users want the "Shadow Reveal" enough that they will grant SMS permissions to a new app.
- **Setup**: Build a quick, non-functional Figma prototype on your phone. Screen 1: "Find your hidden subscriptions." Screen 2: "To do this safely, we use on-device AI to scan your SMS. [Allow Access] [Deny]." Hand it to 20 people and ask them to click through.
- **Measurement**: The drop-off rate at Screen 2. Do they hesitate? Do they click deny?
- **Decision**: If >60% hit deny or express severe hesitation, the app cannot function as designed, and we must pivot to manual entry or bank statements.

### Decision Framework
- If Experiment 1 fails (no shadow subscriptions) → **PIVOT** the app focus from "finding waste" to "managing shared family expenses."
- If Experiment 2 fails (no trust) → **PIVOT** from SMS parsing to a manual entry / PDF statement upload model.
- If both succeed → **PROCEED** to building the tech MVP.
