# viral + defensible

Brutal truth: features won’t make this big. **Built-in distribution** and **real moats** will. Below is everything you need to **ship viral loops** (3) and **lock in defensibility** (4) — down to flows, copy, data models, API endpoints, analytics, and a 90-day build plan. No fluff.

# 3) Build Distribution Into the Product

## 3.1 Viral Objects (things people *want* to share)

**A. Progress Cards (image)**

- Purpose: bragging rights that advertise the product.
- Triggers: new PR, week-over-week consistency, streak milestones, “coach badge” (e.g., 90g protein 7 days).
- Output: 1080×1920 (story), 1200×1200 (square), dynamic OG image (1200×630).
- Fields: user alias, goal, metric delta (e.g., −1.4kg in 14 days), mini trendline, “Coached by Feel Sharper” watermark + referral code.
- UX: “Share → Instagram / TikTok / X / Save”.
- **Repo tasks**
    - `components/share/ProgressCard.tsx` (SVG → PNG export)
    - `lib/share/renderImage.ts` (node-canvas/satori)
    - `app/api/share/progress/[id]/route.ts` (signed URL)
    - Add CTA in TodayCard when new milestone hit.

**B. Highlight Reels (15–30s auto video)**

- Purpose: more viral than static images.
- Inputs: top 3 clips/stats this week (PR, consistency badge, steps, runs).
- Output: MP4 with title card, metric overlays, subtle music.
- **Repo tasks**
    - `workers/video/highlightReel.ts` (server job; ffmpeg)
    - `app/api/share/reel/route.ts` (generate + return URL)
    - “Create Reel” button in Weekly Summary.

**C. Challenge Badges**

- Purpose: easy competitive loop.
- Types: “7-Day Consistency”, “Protein Perfect 5x”, “Zone-2 King/Queen”.
- Shareable badge + team leaderboard.
- **Repo tasks**
    - `lib/challenges/rules.ts` (rule engine)
    - `components/challenges/Badge.tsx`
    - `app/api/challenges/claim/route.ts`

## 3.2 Social Loops

**A. Invite → Accept → Reward**

- Each user has `refCode`. Every accepted referral = unlocks cosmetic pack (card themes), +7 days Pro trial, + coach insights boost.
- **Repo tasks**
    - `User.refCode`, `UserReferral {referrerId, referredId, status}`
    - `/api/referrals/create`, `/api/referrals/accept`
    - Deep link handler: `app/ref/[code]/page.tsx` → onboarding with banner (“Renato invited you. Earn Pro Trial.”)
    - Event tracking: `referral.invite_sent`, `referral.accepted`, `referral.activated`.

**B. Team/Squad**

- Create “Squad” (5–15 ppl). Private board: streaks, PRs, weekly coach recap auto-posted.
- **Repo tasks**
    - Models: `Squad {id, name, joinCode}`, `SquadMember {squadId, userId, role}`, `SquadPost {type, payload, createdAt}`
    - Routes: `/squads`, `/squads/[id]`, invite by link or code.
    - Weekly cron: `jobs/coachWeeklyDigest.ts` → summary post + share buttons.

**C. Challenges & Leaderboards**

- Public monthly challenge (opt-in), private squad challenge (default).
- **Repo tasks**
    - `Challenge {id, slug, startAt, endAt, metric, eligibility}`
    - `Leaderboard {challengeId, userId, score}`
    - Pages: `/challenges`, `/challenges/[slug]`
    - Anti-cheat checks (see 4.3).

## 3.3 Platform Piggybacking (distribution through integrations)

**A. Strava/Garmin/Apple Health**

- Sync runs/workouts; optionally **auto-post summary** (user toggled) with “Powered by Feel Sharper”.
- **Repo tasks**
    - OAuth flows, webhook receivers, per-platform mappers.
    - “Auto-share to Strava” toggle per user + UTM param.

**B. Discord/Slack Webhooks**

- Push weekly squad summary + top PRs to channel.
- **Repo tasks**
    - `app/api/integrations/discord/install`
    - `lib/integrations/discord.ts`
    - UI: `/squads/[id]/integrations`.

**C. Share Templates**

- Pre-baked text/captions per network; safe defaults.
- **Repo tasks**
    - `lib/share/captions.ts` (title case, emoji sparingly)
    - UI copy e.g.: “PR unlocked: 5K in 19:52. Coached by #FeelSharper — join my squad: {deep-link}”.

## 3.4 In-App Content Hub (earned distribution)

- “Highlights” tab shows anonymized top wins (only from users who consented to “Showcase Mode”).
- Tap-to-follow squads/people; follow events power a subtle graph.
- **Repo tasks**
    - `ShowcaseConsent` flag per user
    - `FeedItem {type: 'pr'|'streak'|'challenge', data, userAlias}`
    - `/highlights` page; moderation toggle (see 4.4).

## 3.5 Growth Analytics & Experimentation

**Events (minimum)**

- `share.progress_card`, `share.reel_created`, `referral.invite_sent/accepted/activated`, `squad.created/joined/weekly_digest_viewed`, `challenge.joined/completed`, `integration.connected`, `auto_share.enabled`.
    
    **KPIs**
    
- k-factor = invited*accept rate; Weekly Active Users; squad participation rate; share rate/user/week; virality-sourced signups %; Day-30 retention cohort difference for squad vs non-squad.
    
    **Infra**
    
- Add `lib/analytics.ts` → source, campaign, medium; identify + alias; sessionization.
- Feature flags + A/B harness (`lib/experiments.ts`) for: share defaults, referral rewards, invite copy.

---

# 4) Make It Defensible

## 4.1 Data Moat (unique dataset + better coach over time)

**A. Unified Fitness Graph (your schema)**

- Tables (core):
    - `User`
    - `Goal {primary, targetDate, constraints}`
    - `Workout {type, duration, intensity, rpe, tags}`
    - `Run {distance, time, hrAvg, zoneDist, terrain, shoes}`
    - `Nutrition {kcal, protein, carbs, fat, mealTime}`
    - `Recovery {sleepDur, sleepQuality, HRV, RHR, soreness}`
    - `Context {injuryFlags, schedule, timeAvailable, travel}`
    - `Events {eventType, timestamp, payload}` (append-only)
- **Feature store** (analytics DB, not prod):
    - Rolling 7/14/28-day aggregates, streaks, trend slopes, adherence %, day-part compliance, “strain” score.
- **Repo tasks**
    - ETL job: `workers/etl/featureStore.ts` (daily)
    - Warehouse connection (e.g., Postgres replica or DuckDB parquet for start)

**B. Adaptive Coaching Engine (evolves with data)**

- Phase 1: rules + heuristics by goal (fast to ship)
    - e.g., weight loss: drop kcal 5–10% after 7-day non-loss w/ high adherence; endurance: adjust mileage ±10% based on RPE & HRV.
- Phase 2: simple models
    - Adherence prediction (logistic) → nudge timing.
    - “Best next step” recommender (gradient boosted trees) using past wins for similar users.
- Phase 3: personalization at the edge
    - Per-user priors (Bayesian updates) for responsiveness to macros/volume/sleep → true lock-in.
- **Repo tasks**
    - `services/coach/engine.ts` (strategy pattern: weightLoss|muscleGain|endurance)
    - `services/coach/personalization.ts` (per-user coefficients; persisted `UserAdaptiveParams`)
    - `app/api/coach/plan/route.ts` (returns plan deltas + rationale)
    - Unit tests with synthetic data.

**C. Cold-Start Tactics (still defensible)**

- Borrow priors from goal cohort; fast personalize after 7–10 logs.
- Ask 3 “response probes” in onboarding (How do you usually respond to higher carbs before runs? Sleep variability?) to seed initial coefficients.

## 4.2 Community Moat (switching costs = relationships + history)

**A. Squads History**

- Persistent timeline (posts, PRs, inside jokes). Exportable but non-portable UX.
- Pin moments (“State titles”, “First marathon”) → emotional anchoring.
- **Repo tasks**
    - `SquadPin {title, date, mediaUrl, addedBy}`
    - UI pinboard in `/squads/[id]`.

**B. Streaks & Identity**

- Individual: daily/weekly streaks; “Consistency score”.
- Squad: “Most Dependable”, “Comeback of the Month”.
- **Repo tasks**
    - `services/streaks.ts` (durable; backfills)
    - Badge inventory with unlock conditions.

## 4.3 Workflow Moat (embed in daily routine; hard to replace)

**A. Multi-source Sync**

- Auto log from wearables; one hub to rule them all.
- Bidirectional where safe (do **not** let third parties overwrite your key targets).
- **Repo tasks**
    - Source adapters; reconciler to avoid duplicates; conflict rules.

**B. Coach Nudge Timing**

- Learn when the user actually acts; shift nudges to that window.
- **Repo tasks**
    - `NudgeWindow {userId, hourOfDay, confidence}`
    - Learner job recalculates weekly.

**C. Program Templates + Micro-Edits**

- Users & coaches save/clone/share templates; micro-edit via quick actions (add mobility, swap rest day).
- Switching becomes painful (they’d lose templates and auto-learned tweaks).

## 4.4 Integrity, Moderation, Anti-Cheat (prevents rot and keeps leaderboards legit)

**A. Anomaly Detection**

- Flag outliers: impossible pace/HR zones, macro logs that defy physics.
- **Repo tasks**
    - `services/quality/anomalies.ts` (simple Z-scores & heuristics first)
    - `QualityFlag {entityId, reason, severity}`

**B. Leaderboard Guardrails**

- Require verified data (synced device) for ranked boards.
- Mark manual logs as “unverified”.
- **Repo tasks**
    - `LeaderboardEntry.verified: boolean`
    - UI badges.

**C. Content Moderation**

- Allow reporting; basic banned words; image NSFW checks optional later.
- **Repo tasks**
    - `app/api/moderation/report`
    - Admin queue UI (internal only).

## 4.5 Privacy, Trust, and IP (defense against copycats & churn)

- Transparent data policy; toggles for Showcase/Auto-share.
- Export personal data (legal baseline) but keep **value in your models** (non-exportable personalization).
- **Repo tasks**
    - `/settings/privacy` page
    - `UserFlags {showcaseOptIn, autoShareStrava}`

---

# Engineering Blueprint (files, endpoints, migrations)

**Data (Prisma or your ORM)**

- `User { id, email, refCode, ... }`
- `UserReferral { id, referrerId, referredId, status, createdAt }`
- `Squad { id, name, joinCode, ownerId }`
- `SquadMember { id, squadId, userId, role }`
- `SquadPost { id, squadId, type, payload JSONB, createdAt }`
- `Challenge { id, slug, name, startAt, endAt, metric, rules JSONB }`
- `Leaderboard { id, challengeId, userId, score, verified }`
- `UserGoal { id, userId, primaryGoal, targetDate, hoursPerWeek }`
- `UserDashboardPrefs { id, userId, modules JSONB, order JSONB }`
- `UserAdaptiveParams { id, userId, params JSONB, updatedAt }`
- `NudgeWindow { id, userId, hourOfDay, confidence }`
- `QualityFlag { id, entityType, entityId, reason, severity, createdAt }`

**API (App Router)**

- `/api/referrals/create` (POST) | `/api/referrals/accept` (POST)
- `/api/squads` (POST/GET), `/api/squads/[id]` (GET/PATCH/DELETE)
- `/api/squads/[id]/invite` (POST)
- `/api/challenges` (GET), `/api/challenges/[slug]/join` (POST)
- `/api/leaderboard/[slug]` (GET)
- `/api/share/progress/[id]` (GET image) | `/api/share/reel` (POST)
- `/api/integrations/strava/*`, `/api/integrations/discord/*`
- `/api/coach/plan` (GET) | `/api/coach/insights` (GET) | `/api/coach/apply` (POST)
- `/api/moderation/report` (POST)

**Frontend**

- Pages: `/ref/[code]`, `/squads`, `/squads/[id]`, `/challenges`, `/challenges/[slug]`, `/highlights`, `/settings/privacy`
- Components: `ProgressCard`, `HighlightReelButton`, `SquadBoard`, `Leaderboard`, `ChallengeBadge`, `ShareButtons`, `CoachPanel`, `Streaks`, `PrivacyToggles`

**Background Jobs (cron/workers)**

- `jobs/coachWeeklyDigest.ts` (squad summaries)
- `jobs/etl/featureStore.ts`
- `jobs/nudgeWindowLearner.ts`
- `jobs/leaderboardRecompute.ts`
- `jobs/anomalyScanner.ts`

**Analytics**

- `lib/analytics.ts` wrapper
- `lib/experiments.ts` (bucketing, assignment, exposure)
- Dashboards: virality (k, invites, accepts), retention by squad, share rate, leaderboard participation.

---

# Copy That Converts (ready to paste)

**Progress Card subtitle**

- “14-day momentum: −1.4kg · 6/7 workouts · Protein on point”
    
    **Share caption (autofill)**
    
- “Hit a new PR — coached by Feel Sharper. Join my squad: {link}”
    
    **Referral banner**
    
- “You were invited by {name}. Get 7 days of Pro when you join this month.”
    
    **Squad weekly digest header**
    
- “Coach Recap: Strong week. Keep the streak alive (3→4 is where compounding starts).”
    
    **Challenge CTA**
    
- “Lock your spot in the August Consistency Challenge — top 10 get custom card skins.”

---

# Anti-Cheat Heuristics (V1)

- Reject runs with pace < 2:00/km or HR 0 with speed > 15 km/h unless treadmill flagged.
- Mark macros invalid if kcal < BMR-40% for >3 days and steps > 20k/day (probable under-report).
- Require device-verified data for leaderboard ranking; manual allowed but unranked.