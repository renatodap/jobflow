# Stack Decision

## Purpose
Define the complete technology stack for StudySharper with rationale for each choice under hard cost constraints.

## Scope
All infrastructure, frontend, backend, AI, and deployment decisions.

## Decisions

### Auth + Database: Supabase
**Choice**: Supabase (Postgres + RLS + Google OAuth + pgvector)
**Rationale**: 
- Free tier includes 500MB database, 50MB file storage, 2GB bandwidth
- Built-in Google OAuth eliminates custom auth complexity
- PostgreSQL with RLS provides enterprise-grade multi-tenant security
- pgvector extension supports AI embeddings natively
- Real-time subscriptions for collaborative features
- Edge functions for serverless compute

### Frontend Stack
- **Next.js 14** (App Router): React 18+ with server components, excellent DX
- **TypeScript**: Full type safety, better refactoring, IDE support
- **Tailwind CSS**: Utility-first, small bundle, consistent design system
- **shadcn/ui**: Accessible components, Radix primitives, customizable
- **TanStack Query**: Server state management, caching, optimistic updates
- **Zod**: Runtime validation, type inference, form validation
- **React Hook Form**: Performant forms with minimal re-renders

### AI Provider Strategy
**Primary**: OpenRouter (cheap models, pay-per-use)
**Fallback**: Ollama (local, free, offline capability)
**Abstraction**: Provider interface in packages/ai for runtime switching

Models:
- Chat: Anthropic Claude 3 Haiku via OpenRouter ($0.25/1M tokens)
- Embeddings: text-embedding-3-small via OpenRouter ($0.02/1M tokens)
- Local fallback: llama3.1:8b via Ollama

### Vector Store
pgvector in Supabase Postgres with upgrade path to dedicated vector DB if needed.

### Jobs/Scheduling
- Supabase Edge Functions + pg_cron for scheduled tasks
- Fallback: GitHub Actions cron for critical background jobs

### Analytics
PostHog free tier (1M events/month) with custom event schema.

### Testing
- **Vitest**: Fast unit tests, excellent TypeScript support
- **Playwright**: E2E testing with multiple browsers
- **@testing-library/react**: Component testing best practices

### Documentation
VitePress for public docs site (fast, Markdown-based, good SEO).

## Acceptance Criteria
- [ ] All services have free tier or local alternative
- [ ] Stack supports 1000+ concurrent users on free tiers
- [ ] Full TypeScript coverage
- [ ] Multi-tenant security with RLS
- [ ] AI provider failover working
- [ ] Sub-100ms p95 response times

## Risks
- Supabase free tier limits (mitigated by monitoring)
- OpenRouter API limits (mitigated by Ollama fallback)
- Vector search performance at scale (mitigated by indexing strategy)

## Open Questions
None - all decisions made with sensible defaults.

## Done means...
All stack components selected, documented, and integrated in working application.