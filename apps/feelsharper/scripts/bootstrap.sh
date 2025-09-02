#!/bin/bash

# Feel Sharper Bootstrap Script for Unix/Linux/macOS
# This script sets up the development environment in one command

set -e  # Exit on any error

echo "🏋️‍♂️ Feel Sharper Bootstrap (Unix/Linux/macOS)"
echo "=============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: ${NODE_VERSION}${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 20+ from https://nodejs.org${NC}"
    exit 1
fi

# Check npm
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: v${NPM_VERSION}${NC}"
else
    echo -e "${RED}❌ npm not found. Please install npm${NC}"
    exit 1
fi

# Check Git
if command -v git >/dev/null 2>&1; then
    GIT_VERSION=$(git --version)
    echo -e "${GREEN}✅ Git: ${GIT_VERSION}${NC}"
else
    echo -e "${RED}❌ Git not found. Please install Git from https://git-scm.com${NC}"
    exit 1
fi

# Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
npm ci
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Setup environment
echo -e "\n${YELLOW}🔧 Setting up environment...${NC}"
if [ ! -f ".env.local" ]; then
    cp ".env.example" ".env.local"
    echo -e "${GREEN}✅ Created .env.local from template${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env.local with your API keys${NC}"
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

# Setup git hooks
echo -e "\n${YELLOW}🪝 Setting up git hooks...${NC}"
if npm run prepare >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Git hooks configured${NC}"
else
    echo -e "${YELLOW}⚠️  Git hooks setup skipped (husky not configured)${NC}"
fi

# Type check
echo -e "\n${YELLOW}🔍 Running type check...${NC}"
if npm run typecheck >/dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript errors found - please fix before proceeding${NC}"
fi

# Test build
echo -e "\n${YELLOW}🏗️  Testing build...${NC}"
if npm run build >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${YELLOW}⚠️  Build failed - check configuration${NC}"
fi

# Make scripts executable
chmod +x scripts/*.sh scripts/*.ps1 2>/dev/null || true

# Success message
echo -e "\n${GREEN}🎉 Bootstrap completed!${NC}"
echo -e "${CYAN}==============================================${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "${WHITE}  1. Edit .env.local with your API keys${NC}"
echo -e "${WHITE}  2. Set up Supabase: npx supabase start${NC}"
echo -e "${WHITE}  3. Run migrations: npm run db:migrate${NC}"
echo -e "${WHITE}  4. Start development: npm run dev${NC}"
echo -e "\n${CYAN}🚀 Happy coding!${NC}"