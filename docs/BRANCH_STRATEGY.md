# 🌳 BRANCH STRATEGY - SHARPENED MONOREPO

**Clean branches. Clear ownership. Continuous deployment.**

---

## 🎯 BRANCH STRUCTURE

```
main (protected)
├── product/feelsharper      → deploys to feelsharper.vercel.app
├── product/studysharper     → deploys to studysharper.vercel.app  
├── product/jabocafe         → deploys to jabocafe.vercel.app
├── product/ai-tennis        → deploys to ai-tennis.vercel.app
├── product/personal-site    → deploys to renatodap.com
└── develop                  → integration testing
```

---

## 📋 BRANCH RULES

### Main Branch (Protected)
- **Purpose:** Production-ready code only
- **Merges:** Only from product branches after tests pass
- **Direct commits:** BLOCKED
- **Requirements:** All CI/CD checks must pass

### Product Branches
- **Naming:** `product/{product-name}`
- **Purpose:** Active development for each product
- **Deploys:** Automatically to staging/preview
- **Merges to main:** Via PR with checks

### Feature Branches
- **Naming:** `feature/{product}/{feature-name}`
- **Example:** `feature/feelsharper/stripe-integration`
- **Lifecycle:** Create → Develop → PR → Merge → Delete
- **Max lifetime:** 3 days (ship fast!)

---

## 🚀 WORKFLOW

### Starting New Feature
```bash
# 1. Switch to product branch
git checkout product/feelsharper

# 2. Pull latest
git pull origin product/feelsharper

# 3. Create feature branch
git checkout -b feature/feelsharper/new-feature

# 4. Work and commit
git add .
git commit -m "feat: add new feature"

# 5. Push and create PR
git push origin feature/feelsharper/new-feature
```

### Deploying to Production
```bash
# 1. Ensure product branch is updated
git checkout product/feelsharper
git pull origin product/feelsharper

# 2. Create PR to main
gh pr create --base main --head product/feelsharper

# 3. After approval and checks
gh pr merge --auto --squash
```

---

## 🤖 AUTOMATION

### Auto-Deploy on Push
```yaml
# Each product branch auto-deploys to preview
product/feelsharper → feelsharper-preview.vercel.app
product/studysharper → studysharper-preview.vercel.app

# Main branch deploys to production
main → {product}.com (production domains)
```

### Branch Protection (GitHub Settings)
```json
{
  "main": {
    "require_pr": true,
    "require_reviews": false,  // Solo developer
    "require_status_checks": true,
    "checks": ["build", "typecheck", "test"],
    "dismiss_stale_reviews": true,
    "enforce_admins": false
  }
}
```

---

## 📁 MONOREPO STRUCTURE

```
sharpened-monorepo/
├── .github/
│   └── workflows/
│       ├── feelsharper-deploy.yml
│       ├── studysharper-deploy.yml
│       └── main-deploy.yml
├── apps/
│   ├── feelsharper/         # product/feelsharper
│   ├── studysharper/        # product/studysharper
│   ├── jabocafe/           # product/jabocafe
│   ├── ai-tennis/          # product/ai-tennis
│   └── personal-site/      # product/personal-site
├── packages/               # Shared code
│   ├── ui/                # Shared components
│   ├── utils/             # Shared utilities
│   └── config/            # Shared configs
└── scripts/
    └── branch-setup.sh    # Automated setup
```

---

## 🔄 DAILY WORKFLOW

### Morning
```bash
# Update all product branches
./scripts/update-all-branches.sh

# Check CI/CD status
gh run list

# Pick product to work on
git checkout product/feelsharper
```

### During Development
```bash
# Quick feature branch
git checkout -b feature/feelsharper/quick-fix
# ... make changes ...
git commit -m "fix: resolve issue"
git push

# Create PR
gh pr create --fill
```

### End of Day
```bash
# Merge completed features
gh pr merge --auto

# Clean up old branches
git branch -d feature/feelsharper/completed-feature

# Check deployments
vercel list
```

---

## 🚨 EMERGENCY PROCEDURES

### Rollback Production
```bash
# Quick revert
git checkout main
git revert HEAD
git push

# Or use Vercel instant rollback
vercel rollback [deployment-url]
```

### Fix Critical Bug
```bash
# Hotfix branch from main
git checkout main
git checkout -b hotfix/critical-bug
# ... fix ...
git push
gh pr create --base main --label "hotfix"
gh pr merge --admin
```

---

## 📊 BRANCH STATUS DASHBOARD

| Product | Branch | Last Commit | Deploy Status | Revenue |
|---------|--------|-------------|---------------|---------|
| FeelSharper | `product/feelsharper` | 2 hours ago | ✅ Live | $0 |
| StudySharper | `product/studysharper` | 1 day ago | ⚠️ Building | $0 |
| JaboCafe | `product/jabocafe` | 3 days ago | ❌ Failed | $0 |
| AI Tennis | `product/ai-tennis` | 1 week ago | 🔄 Preview | $0 |

---

## 🎯 IMPLEMENTATION CHECKLIST

### Immediate Actions
- [ ] Create product branches for each app
- [ ] Set up branch protection on main
- [ ] Configure Vercel for branch deploys
- [ ] Create GitHub Actions workflows
- [ ] Update team workflow docs

### Today
- [ ] Migrate current work to branches
- [ ] Test automated deployments
- [ ] Set up monitoring

### This Week
- [ ] Full CI/CD pipeline
- [ ] Automated testing on branches
- [ ] Branch cleanup automation

---

## 💡 BENEFITS

1. **Parallel Development** - Work on multiple products simultaneously
2. **Safe Experimentation** - Break things in branches, not production
3. **Clear History** - Each product's changes are isolated
4. **Easy Rollbacks** - Revert product-specific changes
5. **Automated Deployments** - Push to deploy, no manual work

---

## 🚀 QUICK COMMANDS

```bash
# Setup all branches (run once)
./scripts/setup-branches.sh

# Daily update
./scripts/update-branches.sh

# Create feature
./scripts/new-feature.sh feelsharper "stripe-integration"

# Deploy to production
./scripts/deploy-to-prod.sh feelsharper

# Emergency rollback
./scripts/rollback.sh feelsharper
```

---

**REMEMBER:** Branches = Isolation = Safety = Speed

**"Ship to branches fast, promote to main when ready"**