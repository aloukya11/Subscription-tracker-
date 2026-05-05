# 🧭 PM AI Skills — How-to-Work Guide

> Your personal AI-powered PM operating system. This guide explains everything you need to use, customize, and build excellent product management work using the PM Skills Marketplace.

---

## 📦 What Was Installed

### 1. PM Skills Marketplace (`pm-skills` repo)
- **Location:** `h:\Jyotsna\AI Product management\pm-skills`
- **Source:** [github.com/phuryn/pm-skills](https://github.com/phuryn/pm-skills)
- **Contains:** 8 plugins, 65 skills, 36 commands across the full PM lifecycle.

### 2. Global Skills Directory
- **Location:** `C:\Users\jyotsna\.gemini\skills`
- **What's here:** All 65 base PM skills + 6 custom orchestrators (built in this session).
- **Effect:** These skills are **always available** in Gemini CLI and other supported tools without any extra setup.

---

## 🗂 Installed Plugins Overview

| Plugin | Focus Area | Skills | Commands |
|---|---|---|---|
| `pm-product-discovery` | Ideation, assumptions, experiments, interviews | 13 | 5 |
| `pm-product-strategy` | Vision, business models, pricing, SWOT/PESTLE | 12 | 5 |
| `pm-execution` | PRDs, OKRs, roadmaps, sprints, user stories | 15 | 10 |
| `pm-market-research` | Personas, journey maps, competitor analysis | 7 | 3 |
| `pm-data-analytics` | SQL, cohort analysis, A/B testing | 3 | 3 |
| `pm-go-to-market` | Beachhead, ICP, GTM motions, growth loops | 6 | 3 |
| `pm-marketing-growth` | Positioning, value props, North Star metrics | 5 | 2 |
| `pm-toolkit` | Resume review, legal docs, proofreading | 4 | 5 |

---

## 🤖 Custom Orchestrator Skills (Built in Session)

These are new "master" skills that automatically chain the base skills above in logical sequences. They eliminate the need to remember individual skill names.

| Orchestrator | Trigger Phrases | Journey |
|---|---|---|
| `product-discovery` | "new idea", "validate", "test an assumption", "user pain point" | Context → Ideation → Assumptions → Prioritize → Experiments |
| `product-strategy-orchestrator` | "strategy", "vision", "business model", "SWOT", "PESTLE" | Vision → Value Prop → Business Model → Market Scan → Pricing |
| `market-research-orchestrator` | "market research", "competitor analysis", "personas", "user feedback" | Competitor Landscape → Segmentation → Personas → Journey Map |
| `go-to-market-orchestrator` | "GTM", "launch plan", "beachhead", "growth loops" | Beachhead → ICP → GTM Motions → Growth Loops → Battlecard |
| `marketing-growth-orchestrator` | "marketing", "positioning", "naming", "North Star" | Product Name → Positioning → Value Props → North Star → Campaign Ideas |
| `execution-orchestrator` | "PRD", "roadmap", "sprint", "OKRs", "user stories", "stakeholders" | Plan → Define → Story Writing → Sprint → Ship → Retro |

---

## 🚀 How to Call a Skill

### Method 1: Auto-Triggering (Best for daily use)
Just have a natural conversation. The skills read your context and activate automatically.

```
"I'm thinking about a new app for freelance photographers"
→ triggers: product-discovery

"Help me define our product vision and build a business model"
→ triggers: product-strategy-orchestrator

"We're launching next quarter — where do we start with GTM?"
→ triggers: go-to-market-orchestrator
```

### Method 2: Explicit Slash-Command (Force trigger)
Use this if auto-triggering doesn't pick up the right skill:

```
/product-discovery AI-powered sleep tracker for athletes
/market-research-orchestrator Analyze the online tutoring market in India
/execution-orchestrator Help me plan a sprint for a mobile payments feature
```

### Method 3: Plugin-Prefixed Command
Use this to call a specific sub-skill from within a plugin:

```
/pm-product-discovery:brainstorm experiments existing — reduce churn in onboarding
/pm-execution:write-prd Smart notification system that reduces alert fatigue
/pm-market-research:competitive-analysis Figma competitors in the design tool space
```

---

## 📁 Using Skills in a Specific Project

To use skills in a specific project folder only (instead of globally):

```powershell
# Copy one orchestrator into a project
Copy-Item -Path "C:\Users\jyotsna\.gemini\skills\go-to-market-orchestrator" `
          -Destination "h:\Jyotsna\[YourProject]\.gemini\skills\go-to-market-orchestrator" `
          -Recurse -Force

# Or copy ALL installed skills into a project
Copy-Item -Path "C:\Users\jyotsna\.gemini\skills\*" `
          -Destination "h:\Jyotsna\[YourProject]\.gemini\skills\" `
          -Recurse -Force
```

---

## 🔧 Tool Compatibility

| Tool | Global Skills Folder | Project-Level Folder | Notes |
|---|---|---|---|
| **Gemini CLI** | `C:\Users\jyotsna\.gemini\skills\` | `[project]\.gemini\skills\` | ✅ Fully supported |
| **OpenCode** | `C:\Users\jyotsna\.opencode\skills\` | `[project]\.opencode\skills\` | Skills only |
| **Codex CLI** | `C:\Users\jyotsna\.codex\skills\` | `[project]\.codex\skills\` | Skills only |
| **Cursor** | `C:\Users\jyotsna\.cursor\skills\` | `[project]\.cursor\skills\` | Skills only |
| **Kiro** | `C:\Users\jyotsna\.kiro\skills\` | `[project]\.kiro\skills\` | Skills only |
| **Claude Code** | `claude plugin marketplace add phuryn/pm-skills` | Requires `.skill` packaging | Slash commands work fully |

> **For Claude Code custom skills:** Package using `python -m scripts.package_skill <path/to/skill-folder>` from inside the `skill-creator` directory. This creates a `.skill` file you can install locally.

---

## 🗺 The Complete PM Lifecycle — When to Use Which Skill

Use this as a mental map for any product project from zero to launch.

```
📌 STAGE 0 — OPPORTUNITY IDENTIFICATION
  └─ "Is this worth exploring?"
      → product-discovery (validate the idea)
      → market-research-orchestrator (understand the market)

📌 STAGE 1 — STRATEGY
  └─ "How do we build a sustainable business?"
      → product-strategy-orchestrator
          ├─ product-vision
          ├─ value-proposition
          ├─ lean-canvas / startup-canvas / business-model
          ├─ swot-analysis / pestle-analysis / porters-five-forces
          └─ pricing-strategy / monetization-strategy

📌 STAGE 2 — MARKET RESEARCH
  └─ "Who exactly are we building this for?"
      → market-research-orchestrator
          ├─ market-sizing (TAM/SAM/SOM)
          ├─ competitor-analysis
          ├─ user-personas
          └─ customer-journey-map

📌 STAGE 3 — GO-TO-MARKET
  └─ "How do we launch and grow?"
      → go-to-market-orchestrator
          ├─ beachhead-segment
          ├─ ideal-customer-profile
          ├─ gtm-strategy
          └─ growth-loops

📌 STAGE 4 — MARKETING
  └─ "How do we communicate the value?"
      → marketing-growth-orchestrator
          ├─ positioning-ideas
          ├─ value-prop-statements
          ├─ north-star-metric
          └─ marketing-ideas

📌 STAGE 5 — EXECUTION
  └─ "How do we build and ship it?"
      → execution-orchestrator
          ├─ brainstorm-okrs
          ├─ create-prd
          ├─ outcome-roadmap
          ├─ user-stories / job-stories
          ├─ sprint-plan
          └─ release-notes / retro

📌 STAGE 6 — ANALYTICS
  └─ "Is it working? What do we do next?"
      → pm-data-analytics plugin
          ├─ /write-query (SQL from natural language)
          ├─ /analyze-cohorts
          └─ /analyze-test (A/B test results)

─────────────────── DEVELOP & DELIVER ───────────────────

📌 STAGE 7 — TECHNICAL PLANNING (Agent 1: Gate Keeper)
  └─ "Let's start building"
      → gate-keeper
          ├─ Readiness check (are PM docs complete?)
          ├─ app-flow.md (screen-by-screen navigation)
          ├─ frontend-design.md (UI specs + design tokens)
          ├─ backend-architecture.md (tech stack + API design)
          ├─ database-schema.md (tables + ER diagram)
          ├─ security-checklist.md
          └─ deploy-config.md

📌 STAGE 8 — SCAFFOLDING (Agent 2: Architect)
  └─ "Set up the project"
      → architect
          ├─ Create directories (frontend/ backend/ docs/ tests/)
          ├─ Initialize frameworks (Next.js, Express, Prisma)
          ├─ Config files (.gitignore, .env.example, ESLint)
          ├─ Database schema + seed scripts
          ├─ Structure validation (no duplicates, no secrets)
          └─ Push to GitHub

📌 STAGE 9 — BUILD (Agent 3: Builder)
  └─ "Write the code"
      → builder + frontend-design
          ├─ Database layer (schema, migrations, seeds)
          ├─ Backend API (routes, auth, validation)
          ├─ Frontend UI (pages, components, API connection)
          ├─ Integrations (payments, email, file uploads)
          └─ Debug loop (fix until dev server runs clean)

📌 STAGE 10 — SHIP (Agent 4: Ship Master)
  └─ "Deploy and go live"
      → ship-master
          ├─ Code quality review
          ├─ Testing (unit + integration + e2e)
          ├─ Security hardening
          ├─ Performance optimization
          ├─ Deploy to production
          └─ GitHub finalization (README, release tag, CI/CD)
```

---

## 💡 Tips for Best Output

1. **Give context upfront.** The more you share (industry, stage, user type), the sharper the output. Don't just say "build a GTM plan" — say "build a GTM plan for a B2B SaaS tool targeting Indian SMBs in the HR space, we're pre-revenue."

2. **Attach files when you have them.** You can paste CSV data, interview transcripts, PRD drafts, or changelogs directly into the chat and the skills will analyze them.

3. **Use checkpoints.** The orchestrators are designed to pause and confirm with you at key decisions. Don't skip the checkpoints — this is where you steer the direction.

4. **Chain stages together.** The output from one stage feeds into the next. Export your Discovery output as a markdown file and reference it when you start the Strategy stage.

5. **Iterate, don't perfect.** Think of the first output as a working draft. Use it as a starting point, give feedback, and the skills will refine it.

---

## 🛠 How to Create a New Custom Skill

If you want to build a new orchestrator or a domain-specific skill:

1. **Open the `skill-creator`:** Located at `h:\Jyotsna\AI Product management\skill-creator`
2. **Tell the AI what you want the skill to do** — it will draft the `SKILL.md` for you.
3. **Test it** against 2-3 sample prompts.
4. **Install it globally:**
   ```powershell
   Copy-Item -Path "[path-to-new-skill]" -Destination "C:\Users\jyotsna\.gemini\skills\" -Recurse -Force
   ```

The key file for every skill is `SKILL.md`. Its structure is:
```markdown
---
name: skill-name         # Must match the folder name
description: ...         # THIS is what triggers the skill — make it descriptive and "pushy"
---

# Skill Title

## Instructions
[Step-by-step instructions for the AI]
```

---

## 🔄 Keeping Skills Updated

To pull the latest skills from the pm-skills marketplace:
```powershell
# Navigate to the repo
cd "h:\Jyotsna\AI Product management\pm-skills"

# Pull latest changes
git pull

# Re-copy all skills to .gemini
Get-ChildItem -Path "pm-*" -Directory | ForEach-Object {
  $skillsPath = Join-Path $_.FullName "skills"
  if (Test-Path $skillsPath) {
    Copy-Item -Path "$skillsPath\*" -Destination "C:\Users\jyotsna\.gemini\skills" -Recurse -Force
  }
}
```

> **Note:** This will NOT overwrite your custom orchestrators since they are in subdirectories named differently from the base skills.

---

## 🍽 Worked Example: Building a Meal-Planning App End-to-End

This walks through a full product lifecycle for a fictional product — **"MealMind"**, an AI-powered meal planner for busy Indian families — using the skills at every stage.

---

### Stage 0 — Discovery

**Prompt to use:**
> "I have an idea for a meal-planning app for Indian families that generates weekly grocery lists. Can we validate this idea?"

**Skills triggered:** `product-discovery`

**What it produces:**
- Identifies this as a **new product** (Initial Discovery).
- Brainstorms ideas: Smart pantry tracking, regional cuisine filtering, budget-first meal planning.
- Maps critical assumptions: *"Will users plan meals a week in advance?"* (Value risk), *"Can we source accurate Indian recipe data?"* (Feasibility risk).
- Designs validation experiments: Concierge MVP (manually curate 10 family meal plans and check engagement).

---

### Stage 1 — Strategy

**Prompt to use:**
> "Let's define the business model and product vision for MealMind targeting urban Indian families."

**Skills triggered:** `product-strategy-orchestrator`

**What it produces:**
- **Vision:** "A world where no Indian family wastes food or time deciding what to eat."
- **Value Proposition (6-part JTBD):** Busy working parents → Want healthy, budget-friendly meals → Currently spend 30 min/day deciding → MealMind generates a weekly plan in 2 minutes → Saves time, reduces waste → vs. cooking blogs, recipe apps.
- **Lean Canvas:** Problem: meal decision fatigue. Solution: AI-curated weekly plans. UVP: "Never ask 'what's for dinner?' again." Revenue: Freemium + grocery delivery affiliate.
- **SWOT:** Strength: regional cuisine depth. Threat: BigBasket/Swiggy launching similar features.

---

### Stage 2 — Market Research

**Prompt to use:**
> "Do a full market research for a meal planning app in India — who are the competitors and target users?"

**Skills triggered:** `market-research-orchestrator`

**What it produces:**
- **Market Sizing:** TAM = 90M urban Indian families; SAM = 20M with smartphones & food delivery experience; SOM = 500K in Year 1 (metro cities).
- **Competitor Analysis:** Slism (Japanese), Yummly (Western) — no India-specific player with regional cuisine depth.
- **User Persona:** "Priya" — 32, working mom in Bangalore, spends ₹8,000/mo on groceries, hates repeating the same 5 dishes.
- **Customer Journey Map:** Awareness (Instagram recipe content) → Consideration (app store search "meal planner India") → Onboarding friction (too many choices) → Aha moment (first auto-generated grocery list).

---

### Stage 3 — Go-To-Market

**Prompt to use:**
> "We're ready to launch MealMind. Help me create a GTM plan."

**Skills triggered:** `go-to-market-orchestrator`

**What it produces:**
- **Beachhead Segment:** Working mothers aged 28-38 in metro cities (Mumbai, Bangalore, Delhi), household income ₹15L+.
- **ICP:** Owns a smartphone, uses Swiggy/Zomato 3x/week, follows food Instagram pages, has at least one child.
- **GTM Motion:** Product-Led Growth (free tier with 3 meal plans/week) + influencer seeding with food bloggers.
- **Growth Loop:** User creates a meal plan → shares grocery list via WhatsApp → friend downloads app → creates their own plan (viral loop).

---

### Stage 4 — Marketing

**Prompt to use:**
> "Help me define MealMind's positioning and North Star metric."

**Skills triggered:** `marketing-growth-orchestrator`

**What it produces:**
- **Positioning:** "The only meal planner built for Indian kitchens — not a translated Western app."
- **Value Prop Statement (for ads):** "Spend 2 minutes on Sunday. Eat well all week."
- **North Star Metric:** Weekly Meal Plans Generated (captures both acquisition + engagement).
- **Input Metrics:** DAU/WAU ratio, Grocery list shares, Plan completion rate, D7 retention.

---

### Stage 5 — Execution

**Prompt to use:**
> "Let's write the PRD for MealMind's core meal generation feature."

**Skills triggered:** `execution-orchestrator`

**What it produces:**
- **OKRs:** Objective: Achieve product-market fit. KR1: 1,000 weekly active planners. KR2: 40% D30 retention. KR3: NPS > 50.
- **PRD:** 8-section document covering background, user segments, value proposition, solution details, success metrics, and release plan.
- **User Stories:** "As a busy mom, when I open the app on Sunday, I want to generate a 5-day meal plan in one tap, so I can buy groceries in one trip."
- **Test Scenarios:** Happy path (generates plan), edge case (user has 3 dietary restrictions), error (no internet connection).

---

### Stage 6 — Analytics

**Prompt to use:**
> "Write me a BigQuery SQL query showing weekly active users who generated at least one meal plan in the last 30 days, grouped by city."

**Skills triggered:** `pm-data-analytics` → `sql-queries`

**What it produces:**
- Clean, commented BigQuery SQL ready to run in your analytics platform.

---

## 📁 Recommended Project Folder Structure

Use this layout for every new PM project to stay organized and make it easy for AI skills to find context files.

```
h:\Jyotsna\[ProjectName]\
│
├── 00-context\
│   ├── project-brief.md         # One-page summary: what, who, why
│   ├── team.md                  # Team members, roles, contacts
│   └── constraints.md           # Timeline, budget, tech limits
│
├── 01-discovery\
│   ├── discovery-plan.md        # Output from product-discovery orchestrator
│   ├── assumptions.md           # Mapped assumptions with priority matrix
│   ├── experiments.md           # Designed validation experiments
│   └── interview-transcripts\   # Raw interview files for summarize-interview skill
│
├── 02-strategy\
│   ├── product-vision.md
│   ├── value-proposition.md
│   ├── lean-canvas.md
│   └── swot-pestle.md
│
├── 03-market-research\
│   ├── market-sizing.md
│   ├── competitor-analysis.md
│   ├── user-personas.md
│   └── customer-journey-map.md
│
├── 04-go-to-market\
│   ├── beachhead-segment.md
│   ├── icp.md
│   ├── gtm-strategy.md
│   └── growth-loops.md
│
├── 05-marketing\
│   ├── positioning.md
│   ├── value-prop-statements.md
│   └── north-star-metric.md
│
├── 06-execution\
│   ├── okrs.md
│   ├── prd.md
│   ├── roadmap.md
│   ├── sprint-plans\
│   │   ├── sprint-01.md
│   │   └── sprint-02.md
│   └── release-notes\
│
├── 07-analytics\
│   ├── sql-queries.md
│   ├── cohort-analysis.md
│   └── ab-test-results.md
│
└── .gemini\
    └── skills\                  # Project-specific skills (optional)
```

> **Pro Tip:** When talking to an AI skill, mention the file path of relevant context:
> *"Here's our product brief [paste content from project-brief.md] — now help me write the PRD."*
> This dramatically improves output quality because the skill has real, specific context.

---

## 📚 Key Resources

- **PM Skills GitHub:** [github.com/phuryn/pm-skills](https://github.com/phuryn/pm-skills)
- **Product Compass Newsletter:** [productcompass.pm](https://www.productcompass.pm)
- **Skill Creator:** `h:\Jyotsna\AI Product management\skill-creator`
- **Recommended Reading (built into skills):**
  - *Continuous Discovery Habits* — Teresa Torres
  - *INSPIRED* — Marty Cagan
  - *The Right It* — Alberto Savoia
  - *Go-To-Market Strategist* — Maja Voje
  - *Lean Analytics* — Croll & Yoskovitz

---

*Last updated: May 2026 | Maintained by Jyotsna*
