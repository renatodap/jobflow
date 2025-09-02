# FeelSharper Deployment Instructions

## Prerequisites
- Vercel account (free tier works)
- Supabase account with a project created
- GitHub repository (optional but recommended)

## Step 1: Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Save your project URL and anon key

2. **Apply Database Migrations**
   Run these SQL migrations in order in Supabase SQL Editor:
   ```sql
   -- Run each file in supabase/migrations/ folder in numerical order:
   -- 0001_init.sql
   -- 0002_simplified_fitness.sql
   -- 0003_custom_foods.sql
   -- 0004_enhanced_food_logging.sql
   -- 0005_workout_program_system.sql
   -- 0006_body_metrics_dashboard.sql
   -- 0007_ai_coaching_system.sql
   -- 0008_viral_features.sql
   ```

3. **Seed Food Database**
   ```sql
   -- Run scripts/seed-foods.sql to populate the USDA food database
   ```

## Step 2: Vercel Deployment

### Option A: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# In project directory
vercel

# Follow prompts and add environment variables when asked
```

### Option B: Deploy via GitHub
1. Push code to GitHub repository
2. Go to https://vercel.com
3. Import project from GitHub
4. Configure environment variables (see below)

## Step 3: Environment Variables (Required in Vercel)

```env
# Supabase (from your Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]

# App Defaults
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_DEFAULT_UNITS_WEIGHT=kg
NEXT_PUBLIC_DEFAULT_UNITS_DISTANCE=km

# Optional: OpenAI for AI features
OPENAI_API_KEY=[YOUR_OPENAI_KEY]

# Optional: Anthropic for AI coaching
ANTHROPIC_API_KEY=[YOUR_ANTHROPIC_KEY]
```

## Step 4: Post-Deployment Setup

1. **Configure Authentication**
   - In Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel domain to Redirect URLs:
     ```
     https://your-app.vercel.app/**
     ```

2. **Enable Row Level Security**
   - Already configured in migrations
   - Verify in Supabase Dashboard → Database → Tables

3. **Test Core Features**
   - Sign up at `/sign-up`
   - Create profile at `/onboarding`
   - Log food at `/food/add`
   - Track workout at `/workouts/add`
   - View progress at `/insights`

## Step 5: Production Optimizations

1. **Enable Vercel Analytics**
   ```bash
   npm install @vercel/analytics
   ```

2. **Set up Monitoring**
   - Enable Vercel Web Vitals
   - Configure error tracking (optional)

3. **Configure Caching**
   - Already optimized in next.config.ts
   - Static pages are cached automatically

## Quick Deploy Command

For fastest deployment:
```bash
# One-liner deployment
vercel --prod --env NEXT_PUBLIC_SUPABASE_URL=[URL] --env NEXT_PUBLIC_SUPABASE_ANON_KEY=[KEY]
```

## Domain Setup (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add custom domain
3. Configure DNS as instructed

## Troubleshooting

- **Build fails**: Check TypeScript errors with `npm run typecheck`
- **Auth not working**: Verify Supabase redirect URLs
- **No data**: Run seed scripts in Supabase
- **Slow performance**: Enable Vercel Edge Functions

## Support

For issues, check:
- `/docs` folder for technical documentation
- Supabase logs for database errors
- Vercel logs for runtime errors

## Revenue Features to Add Post-Deploy

1. **Stripe Integration** (for $29/$49 tiers)
   - Add Stripe webhook endpoint
   - Configure pricing in Stripe Dashboard
   - Update `/api/checkout` route

2. **Analytics**
   - Add PostHog or Mixpanel
   - Track conversion events
   - Monitor user engagement

Ready to deploy! The app is production-ready with all TypeScript errors fixed.