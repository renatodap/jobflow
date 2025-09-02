---
status: DRAFT
owner: TBD
lastUpdated: 2025-08-12
---

# 06 — Visual Identity

## Palette
- Core: Charcoal #0D0D0D; Deep Gray #1A1A1A; White #FFFFFF; Electric Blue #1479FF
- Accents: Feel (Red #FF4A4A), Study (Cyan #00D0FF), Work (Amber #FFC93C), Mind (Teal #00BFA6), Skill (Green #22C55E)

## Typography
- Inter as primary; bold for headings; regular for body; UI labels medium.
- Suggested scale: 12, 14, 16, 18, 20, 24, 32, 40, 56, 72.

## Layout & Spacing
- Grid: 12-col; gutter 24 desktop / 16 mobile.
- Spacing: 4px base → 4, 8, 16, 24, 32, 48, 64.

## Motion
- Subtle gradient, float, and pulse animations; avoid distracting loops.

## Accessibility
- Target contrast: 4.5:1 body, 3:1 large text/icons.
- Verify accent-on-dark contrast per usage.

## Design Tokens
- Source of truth: `docs/brand/design-tokens.json` (generated/maintained alongside Tailwind).

## Usage Do / Don’t
- Do: ample whitespace; accent for highlights and CTAs; consistent cards.
- Don’t: overuse gradients; low-contrast text; mixed font stacks.

## Decision Blocks

### [Decision] Token Source of Truth
- Options: A) JSON → Tailwind sync; B) Tailwind → JSON export; C) Single TS constants
- Recommendation: A; generate TS/SCSS from JSON later.
- STATUS: Proposed
- Owner: TBD
- Due: TBD

## Open Questions
- [ ] Do we lock Inter or allow an alternative (e.g., Geist/Space Grotesk) with similar metrics?
- [ ] Which icon set rules (stroke width, corner radius, sizes)?
