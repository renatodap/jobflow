# Iconoir Icon Mapping for AI-Daily

## Core Icon Set (40 Curated Icons)

### Content Types
- **T1 Framework:** `cpu`, `grid-4`, `layer-3d`, `git-branch`
- **T2 Recipe:** `list`, `clipboard-check`, `numbered-list-left`, `tasks`
- **T3 Synthesis:** `scales`, `git-compare`, `git-merge`, `union-horiz-alt`
- **T4 Field Notes:** `journal-page`, `edit-pencil`, `doc-star`, `notes`
- **T5 Validation:** `check-circle`, `flask`, `graph-up`, `verified-badge`

### Actions & Concepts
- **Time/Speed:** `clock`, `timer`, `calendar`, `fast-arrow-right`, `lightning-bolt`
- **Money/Cost:** `dollar`, `credit-card`, `wallet`, `coin`, `piggy-bank`
- **Quality:** `star`, `award`, `trophy`, `crown`, `medal`
- **Analysis:** `magnifying-glass`, `microscope`, `eye`, `scan-barcode`
- **Growth:** `trending-up`, `rocket`, `arrow-up-circle`, `stats-report`

### Technical Icons
- **Code:** `code`, `terminal`, `code-brackets`, `github`, `git-fork`
- **AI/ML:** `brain`, `cpu`, `microchip`, `neural-network`, `robot`
- **Data:** `database`, `server`, `cloud`, `hard-drive`, `archive`
- **API:** `plug`, `link`, `api`, `webhook`, `network`
- **Security:** `lock`, `shield-check`, `key`, `fingerprint`, `privacy-policy`

### UI/UX Elements
- **Navigation:** `arrow-right`, `arrow-left`, `menu`, `home`, `search`
- **Actions:** `play`, `pause`, `stop`, `refresh`, `download`
- **Feedback:** `info-circle`, `warning-triangle`, `error-404`, `check`, `x-mark`
- **Social:** `share`, `thumbs-up`, `message`, `bell`, `user`

### Platform Icons
- **Blog:** `article`, `page`, `bookmark`, `rss-feed`
- **Video:** `play-circle`, `video-camera`, `youtube`, `media-video`
- **Social:** `twitter`, `linkedin`, `instagram`, `facebook`
- **Email:** `mail`, `send`, `inbox`, `attachment`

## Semantic Aliases (For Easy Discovery)

```javascript
const iconAliases = {
  // Concepts → Icons
  'save-time': ['clock', 'timer', 'fast-arrow-right'],
  'save-money': ['dollar', 'piggy-bank', 'coin'],
  'improve': ['trending-up', 'arrow-up-circle', 'graph-up'],
  'compare': ['scales', 'git-compare', 'union-horiz-alt'],
  'learn': ['brain', 'book', 'graduation-cap'],
  'automate': ['robot', 'gear', 'cpu'],
  'measure': ['ruler', 'graph-up', 'stats-report'],
  'secure': ['lock', 'shield-check', 'key'],
  'connect': ['link', 'plug', 'network'],
  'organize': ['folder', 'archive', 'grid-4'],
  
  // Actions → Icons
  'start': ['play', 'arrow-right', 'rocket'],
  'stop': ['stop', 'pause', 'x-mark'],
  'check': ['check-circle', 'verified-badge', 'thumbs-up'],
  'warn': ['warning-triangle', 'info-circle', 'bell'],
  'search': ['magnifying-glass', 'search', 'eye'],
  'edit': ['edit-pencil', 'pen', 'notes'],
  'delete': ['trash', 'x-mark', 'minus-circle'],
  'add': ['plus-circle', 'add-square', 'plus'],
  'settings': ['gear', 'settings', 'tune'],
  'help': ['question-mark-circle', 'info-circle', 'life-buoy'],
  
  // States → Icons
  'success': ['check-circle', 'thumbs-up', 'star'],
  'error': ['x-circle', 'error-404', 'warning-triangle'],
  'loading': ['refresh', 'clock', 'hourglass'],
  'empty': ['inbox', 'folder-empty', 'no-entry'],
  'new': ['sparkles', 'star', 'plus-circle']
};
```

## Usage Guidelines

### Size Standards
- **Hero icons:** 120px (Instagram), 60px (Blog)
- **Inline icons:** 24px base, 20px small, 32px large
- **Button icons:** 20px standard, 16px compact
- **Navigation:** 24px

### Color Application
- **Primary:** Inherit from parent or use brand colors
- **Monochrome:** `#0F172A` on light, `#F8FAFC` on dark
- **Accent:** Only use Lime-400 for CTAs
- **Gradient:** Never apply gradient to icons directly

### Stroke Consistency
- Always use ~1.8px stroke weight
- Scale stroke proportionally with size
- Never mix stroke weights in same context
- Maintain consistent corner radius

## Icon Combinations

### Effective Pairings
- **Time + Money:** `clock` + `dollar` = ROI focus
- **Brain + Lightning:** `brain` + `lightning-bolt` = Fast AI
- **Lock + Check:** `lock` + `check-circle` = Verified secure
- **Graph + Arrow:** `graph-up` + `trending-up` = Growth metrics
- **Code + Robot:** `code` + `robot` = AI automation

### Layout Patterns
```
[Icon] Title Text           // Left-aligned
     Title Text [Icon]      // Right-aligned
    [Icon Above]           // Centered stack
     Title Text
[I] [I] [I] [I]           // Icon row
```

## Platform-Specific Usage

### Instagram Carousel
- Slide 1: Large hero icon (120px)
- Slides 2-8: Small accent icons (40px)
- Slide 9: Brand icon or logo

### Blog Posts
- Hero: Single icon (60px) on gradient
- Inline: 20px icons in text
- Callouts: 32px icon + text

### Email
- Section headers: 24px icons
- Bullet replacements: 16px icons
- CTAs: 20px icon + text

## Accessibility Notes
- Always include `aria-label` for icon-only buttons
- Decorative icons: `aria-hidden="true"`
- Ensure 3:1 contrast ratio minimum
- Provide text alternatives

## Icon Don'ts
- ❌ Mix icon libraries (Iconoir only)
- ❌ Use filled/solid variants
- ❌ Apply shadows or effects
- ❌ Rotate arbitrarily
- ❌ Stack more than 2 icons
- ❌ Use as bullet points in body text
- ❌ Stretch or distort proportions

## Quick Reference Card

### Most Used (Top 10)
1. `clock` - Time-saving
2. `dollar` - Cost/pricing
3. `check-circle` - Success/complete
4. `arrow-right` - Continue/next
5. `brain` - AI/intelligence
6. `code` - Technical/development
7. `trending-up` - Growth/improvement
8. `warning-triangle` - Caution/pitfall
9. `lightning-bolt` - Speed/fast
10. `star` - Quality/favorite

### By Post Type
- **T1:** `layer-3d`, `grid-4`
- **T2:** `numbered-list-left`, `tasks`
- **T3:** `scales`, `git-compare`
- **T4:** `journal-page`, `notes`
- **T5:** `flask`, `verified-badge`

---

*Remember: Consistency > Variety. Use the same icon for the same concept throughout.*