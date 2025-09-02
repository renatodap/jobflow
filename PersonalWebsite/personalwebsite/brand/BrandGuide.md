# AI-Daily Brand Guide

## Core Identity
**Mission:** Daily, practical AI for real people. Curate, synthesize, decide. No hype, no BS.  
**Voice:** Minimal, decisive, practical. Like a smart friend who respects your time.  
**Persona:** The friend who actually tests things before recommending them.

## Color Palette

### Primary Colors
- **Teal-300:** `#2DD4BF` - Light accent, optimism
- **Teal-500:** `#14B8A6` - Primary brand, trust
- **Indigo-500:** `#6366F1` - Secondary, intelligence
- **Indigo-700:** `#4338CA` - Deep secondary, authority
- **Deep Indigo:** `#312E81` - Darkest brand color

### Neutral Colors
- **Charcoal:** `#0F172A` - Primary text, backgrounds
- **Off-white:** `#F8FAFC` - Light backgrounds, reversed text

### Accent Color
- **Lime-400:** `#A3E635` - ONLY for "Do this today" CTAs and "Keep/Ditch" stamps

## Gradients

### G1: Hero Gradient
- Start: Teal-500 `#14B8A6`
- End: Indigo-700 `#4338CA`
- Angle: 18°
- Usage: Main hero sections, primary CTAs

### G2: Vertical Flow
- Start: Teal-300 `#2DD4BF`
- End: Indigo-500 `#6366F1`
- Direction: Top to bottom
- Usage: Card backgrounds, section dividers

### G3: Subtle Radial
- Center: Indigo-500 `#6366F1`
- Edge: Deep Indigo `#312E81`
- Type: Radial, 40% center
- Usage: Blog heroes, LinkedIn backgrounds

## Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Headings
- **H1:** 600 weight (Semibold), 2.5rem mobile, 3.5rem desktop
- **H2:** 600 weight, 2rem mobile, 2.5rem desktop
- **H3:** 600 weight, 1.5rem mobile, 1.875rem desktop

### Body Text
- **Regular:** 400 weight, 1rem base
- **Line Height:** 1.6 for body, 1.2 for headings
- **Max Width:** 65ch for optimal reading

### Special Use
- **Metrics/Numbers:** Optional `Space Mono` monospace
- **Code Blocks:** System mono stack

## Icons

### Primary Icon Library
**Iconoir only** - Consistent geometric style
- Stroke Width: ~1.8px
- Size: 24px base, scale proportionally
- Color: Inherit from parent, or brand colors

### Icon Categories & Aliases
```
Framework → cpu, grid, layers
Recipe → list, clipboard-check, tasks
Synthesis → scales, compare, merge
Field Notes → notebook, pen, document
Validation → check-circle, flask, chart
Time → clock, timer, calendar
Cost → dollar, credit-card, wallet
Quality → star, award, diamond
Speed → lightning, rocket, fast-forward
```

## Cover Images

### Instagram Carousel (1080×1350)
- Top 40%: Gradient block (G1 or G2)
- Center: Single Iconoir icon (120px, white)
- Bottom 40%: Title text (4-6 words max, Semibold)
- Optional: Lime accent stamp for "Do this today"

### Blog Hero (1200×630)
- Left 60%: Gradient (G3 subtle radial)
- Right 40%: Title + icon composition
- Safe zone: 100px padding all sides
- Text: High contrast white on gradient

## Writing Style

### Headlines
- Outcome-first, not feature-first
- 4-8 words ideal
- No questions unless rhetorical
- Active voice, present tense

### Body Copy
- One idea per paragraph
- Bullet points > long paragraphs
- Numbers spelled out if <10
- Technical terms explained on first use

### CTAs
- Imperative mood: "Get the guide" not "You can get"
- Specific benefit: "Save 2 hours weekly"
- No generic "Click here" or "Learn more"

## Component Patterns

### Cards
- White background, subtle shadow
- 16px padding mobile, 24px desktop
- Teal-500 accent line (2px top or left)
- Hover: Slight gradient overlay (G2, 5% opacity)

### Buttons
- Primary: G1 gradient background, white text
- Secondary: Indigo-500 border, transparent fill
- Hover: 10% darker gradient
- Padding: 12px 24px
- Border radius: 8px

### Stamps/Badges
- "Do this today": Lime-400 background, Charcoal text
- "Keep": Teal-500 background, white text
- "Ditch": Charcoal background, white text
- "New": Indigo-500 background, white text

## Don'ts

### Never Do
- ❌ Use quotes or testimonials
- ❌ Add emojis in body text
- ❌ Use gradient text (poor accessibility)
- ❌ Mix icon libraries
- ❌ Use Lime accent for anything except CTAs
- ❌ Create busy backgrounds
- ❌ Use script or decorative fonts
- ❌ Add drop shadows to text

### Avoid
- ⚠️ Animation longer than 300ms
- ⚠️ More than 2 fonts per page
- ⚠️ Centered body text (headers OK)
- ⚠️ Pure black (#000000)
- ⚠️ Images without alt text
- ⚠️ Gradient angles other than defined

## Accessibility

### Minimum Requirements
- WCAG AA contrast ratios
- Focus states on all interactive elements
- Alt text on all images
- Semantic HTML structure
- Skip links for navigation

### Testing
- Check with WAVE tool
- Test with keyboard only
- Verify with screen reader
- Check at 200% zoom

## Application Examples

### Email Signature
```
Renato Dansieri de Almeida Prado
AI-Daily | Practical AI, No Hype
renatodap.me/blog
```

### Social Bio
```
Daily AI insights for real people.
Curate → Synthesize → Decide.
No quotes. No hype. Just what works.
```

### Meta Description
```
Practical AI insights delivered daily. 
Real tests, real numbers, real applications. 
Skip the hype, get the value.
```

---

*This guide ensures consistent brand application across all touchpoints.*