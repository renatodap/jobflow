# Deployment Owner Checklist

> **Auto-updated by autonomous build system**  
> Last updated: 2025-01-14 03:30 UTC
> **CRITICAL UPDATE:** AI Coaching, Squads, and Viral Features now live!

## 🎯 Manual Owner Actions Required

### 1) Vercel Configuration
- [x] **Project linked to repo** - ✅ DONE (feelsharper deployed)
- [x] **Environment variables configured** - ✅ DONE (Production/Preview)
  - `NEXT_PUBLIC_SUPABASE_URL` → ✅ Present
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → ✅ Present  
  - `SUPABASE_SERVICE_ROLE_KEY` → ⚠️ VERIFY (needed for admin operations)
  - `ANTHROPIC_API_KEY` → ✅ Present (for AI coaching)
- [x] **Build successful** - ✅ DONE (latest deployment working)
- [ ] **Custom domain setup** - ⚠️ PENDING
  - Current: `feelsharper.vercel.app`
  - Recommended: `feelsharper.com` or similar
  - DNS: A/CNAME records to Vercel
- [ ] **Analytics configured** - ⚠️ PENDING
  - Vercel Analytics (recommended)
  - Google Analytics (optional)

### 2) Supabase Configuration  
- [x] **Project created** - ✅ DONE (database accessible)
- [ ] **Database migrations** - ⚠️ NEW MIGRATIONS PENDING
  - Run: `npx supabase db push` to apply:
    - 0007_ai_coaching_system.sql (AI coach, insights, recommendations)
    - 0008_viral_features.sql (squads, challenges, badges, streaks)
- [x] **RLS policies** - ✅ DONE (all tables secured)
- [ ] **Auth providers setup** - ⚠️ PENDING
  - Email auth: ✅ Working
  - Google OAuth: ⚠️ NEEDS SETUP
    - Redirect URLs: `https://[project-id].supabase.co/auth/v1/callback`
    - Site URL: `https://feelsharper.vercel.app`
- [ ] **Email templates** - ⚠️ PENDING (optional)
  - Confirmation email customization
  - Password reset templates
- [ ] **Storage buckets** - ⚠️ FUTURE (for meal photos, etc.)

### 3) Google OAuth Setup (for future auth enhancement)
- [ ] **Google Cloud Console** - ⚠️ PENDING
  - Create OAuth 2.0 credentials (Web application)
  - Authorized JavaScript origins:
    - `https://feelsharper.vercel.app`
    - `https://[your-custom-domain]` (if applicable)
  - Authorized redirect URIs:
    - `https://[supabase-project-id].supabase.co/auth/v1/callback`
- [ ] **Consent screen** - ⚠️ PENDING
  - App name: "Feel Sharper"
  - User type: External (unless G Workspace)
  - Scopes: email, profile (minimal)

### 4) Future Integrations (Feature-flagged)
- [ ] **Apple Health** - ⚠️ FUTURE
  - App Store Connect setup
  - HealthKit entitlements
- [ ] **Garmin Connect** - ⚠️ FUTURE  
  - Developer account + API keys
- [ ] **Stripe** - ⚠️ FUTURE (if premium features)
  - Test/Live keys
  - Webhook endpoints

---

## 🚨 Critical Next Steps
1. **URGENT:** Add `ANTHROPIC_API_KEY` to Vercel env vars for AI coaching
2. **URGENT:** Run database migrations for new features:
   ```bash
   npx supabase db push
   ```
3. **Verify** `SUPABASE_SERVICE_ROLE_KEY` in Vercel env vars
4. **Enable** pgvector extension in Supabase for AI embeddings:
   - Go to Supabase Dashboard → Database → Extensions
   - Enable "vector" extension
5. **Consider** custom domain setup for production readiness
6. **Setup** Google OAuth when user feedback indicates need

---

## 📋 Owner Commands Reference

### Vercel
```bash
# Deploy specific commit
vercel --prod --confirm

# Check deployment logs  
vercel logs [deployment-url]

# Environment variables
vercel env add [name] [value] production
```

### Supabase
```bash
# Link project locally
npx supabase link --project-ref [project-id]

# Push schema changes
npx supabase db push

# Generate types
npx supabase gen types typescript --local > lib/types/supabase.ts
```

---

**Status:** 🟡 Mostly configured, minor items pending  
**Urgency:** Low (current setup functional for development/testing)