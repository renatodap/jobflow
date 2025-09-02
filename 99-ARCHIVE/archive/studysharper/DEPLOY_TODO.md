# Deployment Checklist

## 1) Vercel
- [ ] Link project to repo (studysharper)
- [ ] Environment Variables (Prod/Preview/Dev):
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` → [copy from .env.local]
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` → [copy from .env.local]
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` → [copy from .env.local] (server only)
  - [ ] `GOOGLE_CLIENT_ID` → [copy from .env.local]
  - [ ] `GOOGLE_CLIENT_SECRET` → [copy from .env.local]
  - [ ] `ANTHROPIC_API_KEY` → [get from Anthropic console]
  - [ ] `OPENAI_API_KEY` → [get from OpenAI console]
  - [ ] `NEXT_PUBLIC_SITE_URL` → https://studysharper.vercel.app
- [ ] Build config / Node version (18+)
- [ ] Domain + DNS (studysharper.com when ready)

## 2) Supabase
- [x] Project created + DB URL/keys recorded
- [x] pgvector extension enabled
- [ ] Auth: redirect URLs updated for production
  - [ ] Add: https://studysharper.vercel.app/auth/callback
  - [ ] Add: https://studysharper.vercel.app/auth/confirm
- [x] Google OAuth provider enabled
- [x] RLS policies present & passing tests
- [x] Migrations applied in prod
- [ ] Storage buckets & policies (for PDF uploads)
- [ ] Edge Functions (if used): deployed & env set

## 3) Google OAuth
- [ ] Credentials (Web) created in Google Cloud Console
- [ ] Authorized origins set:
  - [ ] https://studysharper.vercel.app
  - [ ] https://sggsgkpwnjarfbghlqgh.supabase.co
- [ ] Authorized redirect URIs set:
  - [ ] https://sggsgkpwnjarfbghlqgh.supabase.co/auth/v1/callback
  - [ ] https://studysharper.vercel.app/auth/callback
- [ ] Consent screen configured (minimal scopes)
- [ ] Publishing status (External)

## 4) RAG/Embeddings
- [ ] Embedding model keys set (Anthropic Claude or OpenAI)
- [ ] Ingest job scheduled (docs/blog/uploads)
- [ ] Reindex command available: `pnpm reindex`
- [ ] Safety/PII filters configured
- [ ] Vector similarity search indexes created

## 5) Monitoring & Analytics
- [ ] Error tracking (Sentry or similar)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] User analytics events configured
- [ ] Database performance monitoring
- [ ] API rate limit monitoring

## Manual Steps Completed
- [x] Initial Vercel deployment
- [x] Supabase project setup
- [x] Basic authentication working
- [x] Database schema deployed with all content tables
- [x] Local development environment
- [x] **Content ingestion database migration applied**
- [x] **PDF processing dependencies installed**
- [x] **Academic structure fully implemented**

## Testing Before Production
- [ ] Authentication flow (Google + email)
- [ ] Academic structure CRUD operations
- [ ] PDF upload and processing
- [ ] RAG Q&A functionality
- [ ] Study plan generation
- [ ] Mobile responsiveness
- [ ] Performance benchmarks met
- [ ] Accessibility compliance