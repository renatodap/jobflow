# 🏗️ MONOREPO SETUP GUIDE

**Transform your projects into an organized, branch-based monorepo**

---

## 🎯 CURRENT STATUS

- ✅ Branch strategy documented
- ✅ Setup scripts created
- ⚠️ Git repository initialized (not connected to remote)
- ⏳ Need to set up remote repository
- ⏳ Products need to be organized

---

## 📋 SETUP STEPS

### 1. Create GitHub Repository
```bash
# Option A: Use GitHub CLI
gh repo create sharpened-monorepo --public --clone

# Option B: Manual
# 1. Go to https://github.com/new
# 2. Name: sharpened-monorepo
# 3. Create repository
# 4. Add remote:
git remote add origin https://github.com/YOUR_USERNAME/sharpened-monorepo.git
```

### 2. Organize Products into Apps Directory
```bash
# Create monorepo structure
mkdir -p apps
mkdir -p packages/ui packages/utils packages/config

# Move products to apps
mv feelsharper apps/
mv StudySharper apps/studysharper
mv JaboCafe apps/jabocafe
mv ai-tennis-* apps/ai-tennis
mv PersonalWebsite apps/personal-site
```

### 3. Set Up Package Manager (pnpm)
```bash
# Install pnpm
npm install -g pnpm

# Create workspace config
cat > pnpm-workspace.yaml << EOF
packages:
  - 'apps/*'
  - 'packages/*'
EOF

# Create root package.json
cat > package.json << EOF
{
  "name": "sharpened-monorepo",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
EOF
```

### 4. Configure Turbo
```bash
cat > turbo.json << EOF
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {},
    "test": {
      "dependsOn": ["build"]
    }
  }
}
EOF
```

### 5. Run Branch Setup
```bash
# After organizing files
bash scripts/setup-branches.sh
```

---

## 🌳 BRANCH WORKFLOW

### For Each Product
```bash
# 1. Create product branch
git checkout -b product/feelsharper

# 2. Add product files
git add apps/feelsharper
git commit -m "feat: add feelsharper to monorepo"

# 3. Push branch
git push -u origin product/feelsharper

# 4. Set up Vercel deployment
# - Connect Vercel to product branch
# - Set root directory: apps/feelsharper
# - Deploy on push to product/feelsharper
```

---

## 🚀 VERCEL CONFIGURATION

### Per-Product Deployment
1. **Import Project** in Vercel
2. **Configure Build Settings:**
   - Root Directory: `apps/{product-name}`
   - Build Command: `pnpm build`
   - Output Directory: `.next`
3. **Set Branch:**
   - Production: `product/{product-name}`
   - Preview: Feature branches

### Environment Variables (Each Product)
```
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
```

---

## 📁 FINAL STRUCTURE

```
sharpened-monorepo/
├── apps/
│   ├── feelsharper/        # Health & fitness tracker
│   ├── studysharper/       # Study companion
│   ├── jabocafe/          # Automation package
│   ├── ai-tennis/         # Tennis coach
│   └── personal-site/     # Portfolio site
├── packages/
│   ├── ui/               # Shared components
│   ├── utils/            # Shared utilities
│   └── config/           # Shared configs
├── scripts/
│   ├── setup-branches.sh
│   ├── update-branches.sh
│   ├── new-feature.sh
│   └── deploy-to-prod.sh
├── .github/
│   └── workflows/        # CI/CD pipelines
├── turbo.json           # Turbo config
├── pnpm-workspace.yaml  # Workspace config
└── package.json         # Root package.json
```

---

## 🎯 IMMEDIATE ACTIONS

### Do Right Now:
1. **Create GitHub repo:** `gh repo create sharpened-monorepo --public`
2. **Organize products:** Move to `apps/` directory
3. **Initial commit:** `git add . && git commit -m "init: monorepo structure"`
4. **Push:** `git push -u origin main`
5. **Run setup:** `bash scripts/setup-branches.sh`

### Today:
1. Set up Vercel for each product
2. Configure environment variables
3. Test deployments on branches

### This Week:
1. Migrate all products to monorepo
2. Set up CI/CD pipelines
3. Configure shared packages

---

## 💡 BENEFITS OF THIS SETUP

1. **Single Repository** - All products in one place
2. **Independent Deployments** - Each product deploys separately
3. **Shared Code** - Reuse components across products
4. **Parallel Development** - Work on multiple products
5. **Easy Management** - One place for all configuration

---

## 🚨 COMMON ISSUES & FIXES

### Issue: Vercel not detecting monorepo
**Fix:** Set root directory in Vercel settings

### Issue: Dependencies not installing
**Fix:** Use pnpm workspaces: `pnpm install`

### Issue: Build failing
**Fix:** Check turbo.json pipeline configuration

### Issue: Branch protection not working
**Fix:** Apply rules in GitHub Settings > Branches

---

## 📊 SUCCESS METRICS

- [ ] All products in monorepo
- [ ] Each product has own branch
- [ ] Automated deployments working
- [ ] Shared packages created
- [ ] CI/CD pipeline active

---

**NEXT STEP:** Create GitHub repository and start migration!

**"One repo to rule them all, organized branches to deploy them all"**