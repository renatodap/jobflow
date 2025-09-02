# Feel Sharper 🏋️‍♂️

A comprehensive, dark-first fitness tracker for logging food, workouts, and weight with intelligent analytics and progress tracking.

[![Deploy](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/renatodap/feelsharper)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm or pnpm
- Git

### One-Command Setup

**Windows (PowerShell):**
```powershell
# Clone and setup
git clone https://github.com/renatodap/feelsharper.git
cd feelsharper
./scripts/bootstrap.ps1
```

**macOS/Linux:**
```bash
# Clone and setup  
git clone https://github.com/renatodap/feelsharper.git
cd feelsharper
./scripts/bootstrap.sh
```

### Manual Setup

1. **Clone and install:**
   ```bash
   git clone https://github.com/renatodap/feelsharper.git
   cd feelsharper
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your keys (see Environment Variables below)
   ```

3. **Database setup:**
   ```bash
   # If using local Supabase
   npx supabase start
   npm run db:migrate
   npm run db:seed
   
   # If using hosted Supabase
   npm run db:push
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the app!

---

## 🛠️ Development

### Core Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript validation
npm test             # Run tests
npm run test:e2e     # End-to-end tests
```

### Database Commands
```bash
npm run db:migrate   # Run migrations
npm run db:reset     # Reset local database
npm run db:seed      # Seed with sample data
npm run db:types     # Generate TypeScript types
```

### Documentation
```bash
npm run docs:expand  # Auto-generate/update docs
npm run docs:serve   # Serve documentation locally
```

---

## 🏗️ Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 (dark-first design)
- **Database:** Supabase (PostgreSQL with RLS)
- **Auth:** Supabase Auth
- **Deployment:** Vercel
- **Testing:** Jest + Playwright
- **Linting:** ESLint + Prettier
- **CI/CD:** GitHub Actions

---

## 🌍 Environment Variables

Create `.env.local` based on `.env.example`:

### Required for Production
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Features (Optional)
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
```

### Development Only
```bash
# Local development
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

---

## 🎯 Features

Feel Sharper includes comprehensive fitness tracking capabilities:

### ✅ Core Features
- **Food Logging:** USDA database with 8000+ verified foods
- **Workout Tracking:** AI-powered exercise parser and logging
- **Weight Tracking:** Quick daily weight and measurement entry
- **Progress Analytics:** Charts, trends, and goal tracking
- **Dark Mode:** Beautiful dark-first design system

### 🚧 Coming Soon
- Wearable integrations (Apple Health, Garmin, etc.)
- Social features and squad challenges
- Advanced coaching and meal planning
- Comprehensive health integrations

See [FEATURES.md](./FEATURES.md) for the complete roadmap.

---

## 🧪 Testing

### Unit Tests
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

### End-to-End Tests
```bash
npm run test:e2e           # Run E2E tests
npm run test:e2e:ui        # Interactive mode
```

### Database Tests
```bash
npm run test:db            # Test RLS policies
npm run test:migrations    # Test migration safety
```

---

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [Database Schema](./docs/database/schema.md)
- [API Documentation](./docs/api/README.md)
- [Feature Specifications](./docs/features/README.md)
- [Deployment Guide](./docs/deploy.md)

---

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect repository:** Import to Vercel dashboard
2. **Set environment variables:** Add all production env vars
3. **Deploy:** Automatic on main branch pushes

### Manual Deployment
```bash
npm run build              # Build production bundle
npm run start              # Start production server
```

### Health Checks
- **Health:** `/api/health` - Service status
- **Version:** `/api/version` - Build information

---

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Standards
- **Conventional Commits:** Use semantic commit messages
- **TypeScript:** All code must be typed
- **Tests:** Add tests for new features
- **Linting:** Code must pass ESLint and Prettier
- **Documentation:** Update docs for user-facing changes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/renatodap/feelsharper/issues)
- **Discussions:** [GitHub Discussions](https://github.com/renatodap/feelsharper/discussions)
- **Documentation:** [docs/](./docs/)

---

## 🙏 Acknowledgments

- **USDA FoodData Central** for nutrition database
- **Supabase** for backend infrastructure
- **Vercel** for deployment platform
- **Tailwind CSS** for styling system

---

*Feel Sharper - Track smarter, progress faster* ⚡# Trigger deployment - Tue, Aug 12, 2025 10:55:07 PM
