#!/bin/bash

# 🏗️ ORGANIZE MONOREPO - Transform current structure into proper monorepo
# This script reorganizes your existing projects into a clean monorepo structure

echo "🚀 Organizing Sharpened Monorepo Structure..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Create monorepo structure
echo -e "${BLUE}📁 Creating monorepo directories...${NC}"
mkdir -p apps
mkdir -p packages/ui
mkdir -p packages/utils  
mkdir -p packages/config
mkdir -p .github/workflows

# Move products to apps directory
echo -e "${BLUE}🚚 Moving products to apps directory...${NC}"

# FeelSharper
if [ -d "feelsharper" ]; then
    mv feelsharper apps/
    echo -e "${GREEN}✅ Moved feelsharper to apps/${NC}"
fi

# StudySharper
if [ -d "StudySharper" ] || [ -d "studysharper" ]; then
    mv [Ss]tudy[Ss]harper apps/studysharper 2>/dev/null
    echo -e "${GREEN}✅ Moved studysharper to apps/${NC}"
fi

# JaboCafe
if [ -d "JaboCafe" ]; then
    mv JaboCafe apps/jabocafe
    echo -e "${GREEN}✅ Moved jabocafe to apps/${NC}"
fi

# Personal Website
if [ -d "PersonalWebsite" ]; then
    mv PersonalWebsite apps/personal-site
    echo -e "${GREEN}✅ Moved personal-site to apps/${NC}"
fi

# AI Tennis projects (consolidate multiple directories)
echo -e "${YELLOW}🎾 Consolidating AI Tennis projects...${NC}"
mkdir -p apps/ai-tennis
for dir in ai-tennis*; do
    if [ -d "$dir" ]; then
        cp -r "$dir"/* apps/ai-tennis/ 2>/dev/null
        echo -e "${GREEN}  ✅ Merged $dir${NC}"
    fi
done

# Automation Empire
if [ -d "automation-empire" ]; then
    mv automation-empire apps/
    echo -e "${GREEN}✅ Moved automation-empire to apps/${NC}"
fi

# Create root configuration files
echo -e "${BLUE}📝 Creating root configuration files...${NC}"

# Root package.json
cat > package.json << 'EOF'
{
  "name": "sharpened-monorepo",
  "version": "1.0.0",
  "private": true,
  "description": "Monorepo for all Sharpened products",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean",
    "deploy:feelsharper": "turbo run build --filter=feelsharper",
    "deploy:studysharper": "turbo run build --filter=studysharper",
    "deploy:all": "turbo run build"
  },
  "devDependencies": {
    "turbo": "latest",
    "prettier": "latest",
    "eslint": "latest",
    "typescript": "latest"
  },
  "packageManager": "pnpm@8.0.0",
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
EOF
echo -e "${GREEN}✅ Created package.json${NC}"

# pnpm workspace configuration
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF
echo -e "${GREEN}✅ Created pnpm-workspace.yaml${NC}"

# Turbo configuration
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": ["NODE_ENV", "NEXT_PUBLIC_*", "STRIPE_*", "SUPABASE_*"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "env": ["NODE_ENV", "NEXT_PUBLIC_*", "STRIPE_*", "SUPABASE_*"]
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": [],
      "env": ["NODE_ENV"]
    },
    "clean": {
      "cache": false
    }
  }
}
EOF
echo -e "${GREEN}✅ Created turbo.json${NC}"

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Next.js
.next/
out/
build/
dist/

# Production
*.production

# Misc
.DS_Store
*.pem
.vscode/
.idea/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# Turbo
.turbo

# TypeScript
*.tsbuildinfo
EOF
echo -e "${GREEN}✅ Created .gitignore${NC}"

# Create README for the monorepo
cat > README.md << 'EOF'
# 🚀 Sharpened Monorepo

**All products. One repository. Infinite possibilities.**

## 📁 Structure

```
apps/
├── feelsharper/        # Health & fitness tracker
├── studysharper/       # Study companion
├── jabocafe/          # Automation package
├── ai-tennis/         # Tennis coach
├── automation-empire/ # Automation products
└── personal-site/     # Portfolio site
```

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run all products in dev
pnpm dev

# Run specific product
pnpm dev --filter=feelsharper

# Build all
pnpm build

# Deploy specific
pnpm deploy:feelsharper
```

## 🌳 Branches

- `main` - Production
- `product/feelsharper` - FeelSharper development
- `product/studysharper` - StudySharper development
- Feature branches: `feature/{product}/{name}`

## 📊 Status

| Product | Status | Revenue | URL |
|---------|--------|---------|-----|
| FeelSharper | 🚀 Live | $0 | TBD |
| StudySharper | 🔧 Dev | $0 | TBD |
| JaboCafe | 📦 Ready | $0 | TBD |
| AI Tennis | 🎾 Beta | $0 | TBD |
EOF
echo -e "${GREEN}✅ Created README.md${NC}"

# Create Vercel configuration
cat > vercel.json << 'EOF'
{
  "buildCommand": "pnpm turbo run build",
  "installCommand": "pnpm install",
  "ignoreCommand": "npx turbo-ignore"
}
EOF
echo -e "${GREEN}✅ Created vercel.json${NC}"

# Create GitHub Actions workflow
mkdir -p .github/workflows
cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [main, develop, 'product/**']
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
          
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
      - run: pnpm lint
      - run: pnpm typecheck
EOF
echo -e "${GREEN}✅ Created GitHub Actions workflow${NC}"

# Clean up old files
echo -e "${BLUE}🧹 Cleaning up old structure...${NC}"
# Move documentation to proper location
mkdir -p docs
mv *.md docs/ 2>/dev/null
mv START_HERE.md . 2>/dev/null  # Keep START_HERE in root

# Summary
echo -e "\n${GREEN}🎉 Monorepo Organization Complete!${NC}"
echo -e "${BLUE}📊 Summary:${NC}"
echo "  ✅ Created apps/ directory with all products"
echo "  ✅ Created packages/ for shared code"
echo "  ✅ Added monorepo configuration files"
echo "  ✅ Set up build tooling (Turbo, pnpm)"
echo "  ✅ Created CI/CD workflow"

echo -e "\n${YELLOW}📋 Next Steps:${NC}"
echo "1. Install pnpm: npm install -g pnpm"
echo "2. Install dependencies: pnpm install"
echo "3. Create GitHub repo: gh repo create sharpened-monorepo --public"
echo "4. Push to GitHub: git add . && git commit -m 'feat: monorepo structure' && git push"
echo "5. Run branch setup: bash scripts/setup-branches.sh"

echo -e "\n${BLUE}🚀 Quick Commands:${NC}"
echo "  Development:     pnpm dev"
echo "  Build all:       pnpm build"
echo "  Specific app:    pnpm dev --filter=feelsharper"

echo -e "\n${GREEN}✨ Your monorepo is ready for greatness!${NC}"