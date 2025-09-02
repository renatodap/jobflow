---
status: DRAFT
owner: TBD
lastUpdated: 2025-08-12
---

# 00 — Brand Audit & Gaps

This audit consolidates current brand intent and execution across `brand.md`, site code (`src/app/`), Tailwind tokens, FeelSharper’s `FEATURES.md`, and StudySharper’s repository structure.

## Findings — What’s Defined

- __Core Promise & Taglines__
  - From `brand.md` and `src/lib/brand.ts`: "Your edge, sharpened by AI." + supporting lines.
- __Voice & Personality__
  - Coach-like authority; premium yet approachable; plain language with clear guidance.
- __Visual Direction__
  - Dark-first UI; Inter type; minimal, high-contrast UI; accent color per product.
  - Tokens present in `tailwind.config.js` and `src/lib/brand.ts` (core + vertical accents).
- __Umbrella Model__
  - Masterbrand: Sharpened; Verticals: FeelSharper (health/performance), StudySharper (learning).
- __Product Signals__
  - FeelSharper: detailed scope in `FEATURES.md` (onboarding → analytics → coaching).
  - StudySharper: monorepo with `docs` and a `docs:toc` generator (doc conventions we can port/adapt).

## Gaps — What’s Missing

- __Formal Brand Architecture__
  - Naming rules, endorsement lines, taxonomy, and governance not codified.
- __Messaging System__
  - Positioning statement, competitive frame, RTBs and proof points not consolidated in 1 source.
- __Voice & Tone in-context__
  - Do/Don’t + examples by surface (site UI, docs, emails, social) need canonical guidance.
- __Design Tokens__
  - JSON tokens file (`design-tokens.json`) with palettes, spacing, radii, typography scale missing.
- __Decision Tracking__
  - No centralized tracker for proposed/approved decisions with owners/dates.
- __Docs Engine__
  - Auto indices, Open Questions roll-up, Decision extraction/validation, and Diff reports absent.
- __Review Bundle__
  - No one-click packaging of key docs for asynchronous review.

## Risks & Contradictions

- __Inconsistency Drift__
  - Without guardrails, verticals may diverge in voice, IA, and tokens.
- __Overreach vs Clarity__
  - Umbrella value prop can become too generic if not anchored by crisp vertical stories.
- __Asset Debt__
  - No canonical logo system specs, iconography rules, or motion principles.

## Prioritized Open Questions

- [ ] What brand model do we commit to in the near term? Masterbrand-led (A) vs Endorsed (B)?
- [ ] Single marketing domain vs product subdomains? URL structure impacts IA and SEO.
- [ ] What is the minimum viable press kit for v0 (logo pack, boilerplate, color specs)?
- [ ] Who is the owner and SLA for brand decision approvals? What cadence?
- [ ] What 2–3 KPIs define brand launch readiness (awareness, activation, NPS proxy)?

## First-Pass Brand Architecture (Mermaid)

```mermaid
graph TD
  A[Sharpened (Master Brand)] --> B[FeelSharper]
  A --> C[StudySharper]
  A -. future .-> D[WorkSharper]
  A -. future .-> E[MindSharper]
  A -. future .-> F[SkillSharper]

  subgraph Shared Infrastructure
    G[Auth & Profiles]
    H[AI Provider Abstraction]
    I[Metrics & Progress Engine]
    J[Design System]
    K[Data Viz Toolkit]
  end

  A --> G
  A --> H
  A --> I
  A --> J
  A --> K
```

## Decision Blocks

### [Decision] Brand Model (Masterbrand vs Endorsed)
- Options:
  - A) Masterbrand-led (Sharpened > FeelSharper/StudySharper)
  - B) Endorsed brands (FeelSharper by Sharpened)
  - C) House of brands
- Pros/Cons:
  - A) +Cohesion/+Equity transfer/−Less autonomy
  - B) +Balance/+Focus/−Governance overhead
  - C) +Freedom/−Expensive/−Equity fragmentation
- Recommendation: Start with A; revisit B if divergence grows.
- STATUS: Proposed
- Owner: TBD
- Due: TBD

### [Decision] Domain & URL Strategy
- Options:
  - A) Single domain with product routes (sharpened.ai/feel)
  - B) Subdomains (feel.sharpened.ai)
  - C) Separate domains per product
- Pros/Cons: A) +SEO consolidation; B) +Clarity per vertical; C) +Max autonomy − brand split.
- Recommendation: A or B; start with A.
- STATUS: Proposed
- Owner: TBD
- Due: TBD
