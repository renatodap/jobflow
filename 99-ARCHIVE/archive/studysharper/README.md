# StudySharper

> AI-powered study assistant that transforms learning through personalized study plans, intelligent spaced repetition, and data-driven insights.

## 🚀 Quick Start

### Prerequisites (Windows)

1. **Node.js 18+** and **pnpm**:
   ```bash
   # Install pnpm globally
   npm install -g pnpm
   ```

2. **Supabase CLI**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   ```

3. **Ollama** (optional, for local AI):
   - Download from [ollama.ai](https://ollama.ai/download)
   - Install and run: `ollama serve`
   - Pull models: `ollama pull llama3.1:8b && ollama pull nomic-embed-text`

### Installation

```bash
# Clone and install dependencies
git clone <your-repo>
cd studysharper
pnpm install

# Start Supabase (Docker required)
supabase start

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your keys
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add to `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```
5. In Supabase dashboard → Authentication → Providers → Google → Enable

### Development

```bash
# Start development server (web + database)
pnpm dev

# Or individually:
pnpm dev:web        # Next.js app on localhost:3000
supabase start      # Database on localhost:54321
```

## 🏗️ Architecture

### Monorepo Structure
```
studysharper/
├── apps/
│   └── web/                 # Next.js application
├── packages/
│   ├── ai/                  # AI provider abstraction
│   └── core/                # Domain models and utilities
├── supabase/
│   ├── migrations/          # Database schema
│   └── seeds/              # Development data
├── docs/                   # Comprehensive documentation
└── tools/                  # Development scripts
```

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: OpenRouter (primary) + Ollama (fallback)
- **State**: TanStack Query, Zustand
- **Testing**: Vitest, Playwright

## 🧠 Core Features

### ✅ Implemented
- [x] Google OAuth authentication
- [x] Multi-tenant database with RLS
- [x] AI provider abstraction (OpenRouter/Ollama)
- [x] Spaced repetition system (SM-2)
- [x] Comprehensive documentation library

### 🚧 In Progress
- [ ] Course and subject management
- [ ] Note ingestion and RAG pipeline
- [ ] AI study plan generation
- [ ] Calendar integration
- [ ] Performance analytics

### 📋 Roadmap
- [ ] Mobile PWA
- [ ] Collaborative study groups
- [ ] Advanced AI tutoring
- [ ] Integration ecosystem

## 🗄️ Database

### Core Models
- **Users** → **Schools** → **Terms** → **Courses** → **Subjects**
- **Tasks** (linked to assessments, with dependencies)
- **Notes** (with embeddings for RAG)
- **Cards/Reviews** (spaced repetition)
- **StudyPlans/Blocks/Sessions** (AI-generated scheduling)

### Commands
```bash
# Apply migrations
pnpm db:push

# Reset database
pnpm db:reset

# Seed development data
pnpm db:seed

# Generate TypeScript types
pnpm db:types
```

## 🤖 AI System

### Providers
- **OpenRouter**: Primary (Claude 3 Haiku, text-embedding-3-small)
- **Ollama**: Local fallback (llama3.1:8b, nomic-embed-text)

### Capabilities
- Study plan generation with reasoning
- Q&A on uploaded notes/documents
- Spaced repetition optimization
- Performance insights and recommendations

### Usage
```bash
# Check AI provider status
pnpm ai:swap status

# Switch between OpenRouter ↔ Ollama
pnpm ai:swap
```

## 📚 Documentation

> **150+ markdown files** covering every aspect of development

```bash
# Generate table of contents
pnpm docs:toc
```

**Key Documents**:
- [**Stack Decisions**](docs/02-decisions/stack.md) - Technology choices and rationale
- [**Database ERD**](docs/06-domain-model/erd.md) - Complete data model
- [**AI Architecture**](docs/08-ai/architecture.md) - RAG pipeline and algorithms
- [**RLS Policies**](docs/07-rls/policies.md) - Security implementation
- [**Next Steps**](docs/16-autonomy/next-steps.md) - Implementation roadmap

## 🧪 Testing

```bash
# Type checking (run before commits)
pnpm typecheck

# Unit tests
pnpm test

# End-to-end tests
pnpm test:e2e

# Linting
pnpm lint
```

## 🚢 Deployment

### Environment Variables
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI (choose one)
OPENROUTER_API_KEY=          # Primary
ANTHROPIC_API_KEY=           # Alternative
```

### Build
```bash
# Production build
pnpm build

# Start production server
pnpm start
```

## 🤝 Contributing

### Development Workflow
1. Read relevant docs in `docs/` directory
2. Create feature branch
3. Write code with tests
4. Run `pnpm typecheck && pnpm lint`
5. Submit PR with clear description

### Code Standards
- **TypeScript**: Strict mode, comprehensive types
- **React**: Hooks, server components, no class components
- **Database**: All queries use RLS, no raw SQL in frontend
- **AI**: Provider abstraction, graceful fallbacks
- **Security**: No secrets in code, validate all inputs

## 📊 Metrics

### Success Criteria
- 40% improvement in long-term retention vs control
- 25% reduction in study hours for same performance
- 80% user retention after 30 days
- <2s AI response times

### Analytics
- Study session tracking
- Spaced repetition performance
- AI recommendation effectiveness
- User engagement patterns

## 🔒 Security

- **Multi-tenant isolation** via Row Level Security
- **No secrets in repository** (use .env.local)
- **Input validation** with Zod schemas
- **HTTPS everywhere** in production
- **Privacy by design** - minimal data collection

## 📈 Performance

- **Database**: Optimized indexes, connection pooling
- **Frontend**: Code splitting, image optimization
- **AI**: Response caching, provider failover
- **CDN**: Static assets via Vercel edge network

## 🆘 Troubleshooting

### Common Issues

**Database connection failed**:
```bash
supabase status        # Check if running
supabase restart      # Restart services
```

**AI provider errors**:
```bash
pnpm ai:swap status   # Check provider availability
pnpm ai:swap          # Switch providers
```

**TypeScript errors**:
```bash
pnpm db:types         # Regenerate database types
pnpm typecheck        # Check all files
```

**OAuth not working**:
- Verify Google Console redirect URIs
- Check Supabase auth provider settings
- Ensure environment variables are set

## 📞 Support

- **Documentation**: `docs/` directory
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

---

**Built with ❤️ for learners everywhere**