# Feel Sharper - Claude Code Instructions

## Project Overview
Dark-first, free fitness tracker for logging food, workouts, and weight with progress graphs.

## Core Tech Stack
- Next.js 15.4.5 + React 19.1.0 + TypeScript
- Supabase (auth + database)
- Tailwind CSS 4 (dark-first design system)
- Jest + Testing Library (testing)

## Essential Commands
```bash
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm run typecheck    # TypeScript validation
npm run lint         # ESLint validation
npm test             # Jest tests
npm run seed         # Database seeding
```

## Brand System (ONLY These Colors)
- **Navy**: `#0B2A4A` (primary brand)
- **Black**: `#0A0A0A` (background)
- **White**: `#FFFFFF` (text primary)
- **Grays**: `#C7CBD1` (secondary), `#8B9096` (muted)
- **NO** purple, indigo, pink, or other colors

## Core Features (Implemented)
1. **Food Logging** (`/food`, `/food/add`) - USDA verified food database
2. **Workout Tracking** (`/workouts`, `/workouts/add`) - Deterministic AI parser
3. **Weight Logging** (`/weight`) - One-tap weight entry
4. **Progress Graphs** (`/insights`) - Recharts visualizations
5. **Today Dashboard** (`/today`) - Quick action hub

## Database Architecture
- `foods` table (USDA verified, 8000+ entries)
- `workouts` table (sets/reps/weight tracking)
- `body_weight` table (daily weight logs)
- Row-Level Security enabled for multi-tenant safety

## Key File Locations
- **Pages**: `app/[route]/page.tsx` (Next.js App Router)
- **Components**: `components/[feature]/` organized by domain
- **Database**: `supabase/migrations/` for schema changes
- **Types**: `lib/types/` for TypeScript definitions
- **Styles**: `app/globals.css` + Tailwind utilities

## Development Rules
1. **Always dark-first** - Default to dark theme, black backgrounds
2. **No fake content** - Only real, verified data
3. **No fluff text** - Simple, clear, functional copy only
4. **Test everything** - Write Jest tests for new features
5. **Type everything** - Full TypeScript coverage required

## Testing Strategy
- Component tests in `__tests__/components/`
- Page tests in `__tests__/pages/`
- Utility tests in `__tests__/lib/`
- All tests must pass before deployment

## Common Tasks
### Fix styling issues:
1. Check `tailwind.config.ts` for color definitions
2. Verify `app/globals.css` for global styles
3. Ensure components use dark-first classes

### Add new feature:
1. Create route in `app/[feature]/page.tsx`
2. Add database migration in `supabase/migrations/`
3. Create component in `components/[feature]/`
4. Write tests in `__tests__/`
5. Update navigation in `lib/navigation/routes.ts`

### Database changes:
1. Create migration: `supabase/migrations/XXXX_description.sql`
2. Update types in `lib/types/`
3. Add RLS policies for security
4. Update seed script if needed

## Deployment Checklist
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in production
- [ ] Database migrations applied
- [ ] Environment variables configured

## Troubleshooting
- **White backgrounds**: Check for missing `bg-bg` or `bg-surface` classes
- **Type errors**: Ensure all imports have proper types
- **Test failures**: Update test assertions for new content
- **Build failures**: Check for unused imports or type mismatches

## Performance Notes
- Images optimized with Next.js Image component
- Bundle splitting enabled for code optimization
- Database queries use efficient RLS policies
- Minimal dependencies for fast load times