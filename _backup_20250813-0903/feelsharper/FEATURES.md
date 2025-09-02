## 1) Onboarding & Identity

### Account creation & auth
- [ ] [ ] Email/Apple/Google sign-in, 2FA (optional)

### Profile basics  
- [ ] [ ] Name/alias, DOB, height, sex, country, preferred language, units

### Goal setup (multi-goal + date-bound)
- [ ] [ ] Templates: weight loss, muscle gain, endurance race (5K–ultra), team sport season, rehab/return-to-play, general health
- [ ] [ ] Target metrics: body mass/comp, event date/time, health markers (BP/A1c), habit goals (sleep/steps)
- [ ] [ ] Constraints: time available/week, equipment access, injury flags, budget, diet rules (veg, kosher, etc.)

### Motivation & identity
- [ ] [ ] "Why" capture (short narrative + value tags) with periodic resurfacing
- [ ] [ ] Reward style selection (badges, streaks, progress cards) & privacy defaults

### Baseline measures
- [ ] [ ] Fitness testing presets (e.g., 1-mile, 3RM, jump, plank), resting HR/HRV intake
- [ ] [ ] Optional medical inputs (conditions, meds, allergies) with contraindication rules

### Personalization switches
- [ ] [ ] Coaching tone (strict/friendly/neutral), push frequency, social visibility (public/squads/private)

2) Data Ingestion & Integrations
Wearables & platforms (connect/disconnect + scoped permissions)

Apple Health/Watch, Google Fit, Garmin, Strava (import activities), Oura/WHOOP/Fitbit (sleep/HRV/recovery).

Calendars

Google/Apple Calendar read/write of planned sessions; travel detection (time zones).

Environment

Weather/heat index/air quality; altitude/elevation (GPS).

Nutrition databases

Global search, localized foods; barcode lookup; custom foods/recipes.

File import/export

CSV upload w/ mapping wizard for workouts/meals/weights; JSON/CSV export of user data.

Community integrations

Discord/Slack webhook for squad digests.

Share targets

System share sheets (Instagram, TikTok, X, WhatsApp) for progress cards/reels.

3) Input & Logging (Frictionless)
Universal quick-add

Natural language (“ran 5k easy”), voice dictation, templates, recents/favorites, shortcuts.

Workouts

Strength: exercise list, sets/reps/load, tempo, RPE/RIR, supersets, rest timer, notes, media attach.

Endurance: run/ride/row/swim; distance/time, pace, HR zones, lap splits, terrain, shoes/bike.

Skill/team sports: drill blocks with time/reps; intensity and volume fields; match scrimmage markers.

Tennis-specific: rally count, serve attempts/accuracy; drill timers; optional video tag points.

Meals

Search + barcode + photo-to-food (with editable suggestions), custom recipes, saved meals, portion helper.

Macro/micro display with “swap” suggestions; recurring meals scheduling.

Biometrics & health

Weight, BF%, girths, BP, glucose/CGM (if connected), HRV, resting HR, sleep duration/quality.

Menstrual cycle logging; pain/injury check-ins (location/severity), illness flags.

Habits & lifestyle

Water intake, steps, meditation, mobility minutes, screen-time wind-down, caffeine/alcohol.

4) Planning & Periodization
Program generator

Goal-based macro/meso/micro cycles; equipment/time constraints; indoor/outdoor variants; travel-aware.

Daily plan card

Session(s) with type/duration/intensity target; mobility/rehab; warm-up/cool-down; nutrition targets by day type.

Alternate tracks

Auto-suggest “Plan A/B” based on readiness; quick “bump to tomorrow” handling with ripple adjust.

Return-to-play (RTP)

Protocol libraries per injury; staged clearance gates; pain rules that downshift plan automatically.

Taper/peak

Event countdown; session intensity tapering; carbo-load prompts (if applicable).

5) Session Execution (Guided Workouts)
Timers & cues

Interval beeps/vibration, rests, set countdowns, pacing/HR zone prompts; on-screen big numbers.

Technique helpers

In-app demo library (GIF/video); checklists for form cues; optional AI video form feedback (post-session).

Strength utilities

Plate math, 1RM estimators, velocity placeholders (if VBT sensor later).

Endurance utilities

Pacing coach (target window alerts), lap auto-split, treadmill toggle; route GPX import (visual map in-app).

Skill drills

Court/field drill designer with cone layouts; repetition targets; serving ladders; ball machine scripts.

6) Nutrition & Hydration
Targets

Daily calories/macro goals (protein anchored), fiber minimum, sodium ranges; micro flags (iron, calcium, B12, D).

Training day periodization (pre/during/post fueling suggestions).

Meal builder

Swaps to reach targets (higher satiety / lower kcal / higher protein options).

Recipe macros by portion; batch-cook scaling; grocery list export.

Hydration coach

Fluid & sodium estimator by duration/weather/sweat bias; heat-acclimation guidance; bottle reminders.

Supplement planner

Evidence-based catalog with timing (creatine, caffeine, beta-alanine, electrolytes); interaction warnings (meds/allergies).

Budget & culture

Low-cost meal sets; localized cuisines; vegetarian/vegan/gluten-free presets.

7) Recovery, Health & Wellbeing
Sleep coach

Target bedtime/wake, wind-down routine, light/caffeine cutoffs; variability tracking; naps logic.

Readiness hygiene

HRV trends, resting HR, prior load; breathwork prompts; micro-recovery (walks, mobility).

Stress & mood

Quick mood slider, journaling prompts; correlations surfaced later.

Menstrual phase adjustments

Auto-tune training/nutrition by phase; symptom logging and program tweaks.

Illness mode

Downgrade plan to symptom-safe activities; return criteria checklist.

8) Readiness, Load & Analytics (Explainable)
Training load

Endurance: rTSS/HR-based or pace-to-threshold; weekly ramp %, acute:chronic, monotony/strain.

Strength: volume per muscle group; hard set counts adjusted by RPE/RIR; weekly progression trends.

Skill/team: session density, drill mix; match load proxies (HR, movement).

Energy balance

Adaptive RMR (formula + device), TDEE estimator, TEF; weight trend vs target line (noise-smoothed).

Readiness score

Transparent weighted factors (sleep/HRV/load/mood); clickable “why” breakdown and suggested action.

Forecasts

Body weight by date; event performance (race time or match readiness); confidence bands.

Correlations & insights

Habit → outcome links (e.g., ≥25g fiber correlates with better weight trend); simple causal notes.

PRs & tests

Strength PRs, pace PRs, jump/sprint tests; retest scheduling; deltas displayed on cards.

9) AI Coaching & Explanations
Conversational coach

Commands: create/adjust plan, analyze week, build workout/meal, travel/illness mode, rehab suggestions.

Daily recommendations

“Do this today” + rationale (fueling tweaks, intensity adjust, mobility suggestion).

Adherence-aware tuning

Adjust macros/load after non-response; learn user’s responsiveness to carbs/sleep/volume over time.

What-if tools

Simulate deficit/surplus changes; tweak taper; schedule constraints; travel impact.

Safety rails

Red-flag alerts (rapid weight loss, low energy availability, overtraining signs, disordered logging patterns).

Explainability-first

Every change shows the math and factors (no black box).

10) Motivation, Adherence & Behavior Design
Streaks & momentum

Daily and weekly streak counters; “momentum score” weighting recent adherence.

Progress cards

Auto-generated shareable images (PRs, weight deltas, streaks) in story/square formats.

Highlight reels

15–30s weekly recap videos (top 3 wins, consistency).

Milestones & badges

Consistency, protein targets, sleep streaks, comeback, RTP completion, taper discipline.

Nudges

Smart timing windows (user-specific); pre-commit prompts; friction-killers (one-tap log links).

Identity reminders

Periodic surfacing of user’s “Why”; customizable lock-screen affirmations (opt-in).

11) Social & Community
Squads

Private groups (5–15); posts feed for PRs, plans, coach digest; reactions/comments; join by link/code.

Challenges

Public monthly (opt-in) + squad-only; metrics: consistency, total minutes, elevation, protein days; live leaderboards.

Leaderboards

Verified vs unverified entries; filters (age/sex/sport/region); fairness notes.

Referrals

Personal code; reward (trial days/cosmetics/coach insights boost).

Highlights hub

Opt-in showcase of anonymized wins; follow users/squads (lightweight).

Anti-cheat & integrity

Anomaly flags; verified device requirement for ranked boards; report button; moderation queue.

12) Dashboards & Reports
Today

Readiness, plan, session cards, remaining macros, hydration; quick actions.

Weekly

Summary of training load, macro adherence, weight trend, sleep; coach notes; shareable recap.

Trends

Multi-chart views (weight vs kcal vs protein; load vs readiness; habit compliance).

Performance

PR history; test batteries; season overview for athletes.

Reports

Weekly PDF export, coach packet, CSV/JSON data dumps.

13) Notifications & Reminders
Types

Session start, fuel timing, hydration, weigh-in, bedtime wind-down, log completeness, RTP checks, event countdowns.

Controls

Quiet hours, channel preference (push/email), frequency throttle; squad digests schedule.

Deep links

Open directly to action (start timer, log meal template, mark weigh-in).

14) Personalization, Localization & Accessibility
Languages

EN/ES/PT/FR; date/time/number formats; local food examples.

Units

kg/lb, km/mi, °C/°F; pace vs speed toggles.

Accessibility

Color-blind safe palettes, large text/tap targets, voice support, haptics; offline mode with sync later.

User-level tuning

Coach tone; analytics depth (simple/advanced); chart density preferences; data detail toggles.

15) Coach & Team Tools (Optional but Powerful)
Coach mode

Athlete roster; assign templates; leave comments on days; approve RTP gates; see adherence/insights.

Program templates

Share/clone plans; micro-edits; marketplace-ready structure (future).

Team dashboards

Stacked load/readiness per athlete; event calendars; injury reports; export team summary.

16) Privacy, Trust & Safety
Privacy controls

Public vs friends vs squads vs private; showcase mode opt-in; auto-share toggles per integration.

Consent & data rights

Clear consent pages per data source; export/delete my data; retention settings for health data.

Risk safeguards

Alerts for extreme deficits, low BMI, excessive exercise; support links; encourage professional care when needed.

Content moderation

Report/resolve flow; blocked terms; visibility throttling for flagged posts.

17) Growth & Distribution (Built-In)
Shareables

Progress cards/reels with watermark + deep link; prewritten captions (editable).

Referrals

Invite flow, redemption, rewards; tracking; post-signup nudges.

Squad external digests

Discord/Slack weekly recap embeds with join link.

A/B hooks

Feature flags for referral rewards, share prompts, card themes.

18) Reliability & Observability (User-Facing Features)
Sync status

“Last synced X min ago”; per-integration health; manual resync.

Data quality

Duplicate detection prompts; conflict resolution UI; edit history & undo.

Outage notices

In-app banner when a provider is down; retries schedule; status link.

19) Marketplace & Pro (Future-Ready)
Coach programs

Curated plans by sport/goal; ratings; preview; one-tap apply with calendar merge.

Premium

Advanced analytics (readiness deep dive), video form AI, extended history, coach DM/channel, cosmetic themes.

20) “Blockers → Features” Mapping (so we solve the real problems)
Friction to log → Quick-add, voice/photo, recents/favorites, templates, offline log.

Not sure what to do today → Daily plan card, Plan A/B, readiness-aware adjustments.

Time/equipment constraints → Program generator with constraints, indoor/outdoor swaps.

Plateaus & confusion → Explainable analytics, “what changed” weekly coach notes, what-if tools.

Injury/illness → RTP/illness modes, pain check-ins, auto-downgrade sessions.

Motivation dips → Streaks, milestones, identity reminders, squads, challenges, progress cards.

Safety risks → Red-flag alerts, nutritional safeguards, anti-cheat for fair community.

Travel & life chaos → Calendar sync, travel mode, time-zone-aware nudges, grocery lists.

Cultural fit → Localization (foods/language/units), budget-friendly recipes, dietary rules.