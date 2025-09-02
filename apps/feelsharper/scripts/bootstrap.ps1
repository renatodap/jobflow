#!/usr/bin/env pwsh

# Feel Sharper Bootstrap Script for Windows
# This script sets up the development environment in one command

Write-Host "🏋️‍♂️ Feel Sharper Bootstrap (Windows)" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 20+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm" -ForegroundColor Red
    exit 1
}

# Check Git
try {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found. Please install Git from https://git-scm.com" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Setup environment
Write-Host "`n🔧 Setting up environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local from template" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env.local with your API keys" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Setup git hooks
Write-Host "`n🪝 Setting up git hooks..." -ForegroundColor Yellow
try {
    npm run prepare 2>$null
    Write-Host "✅ Git hooks configured" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Git hooks setup skipped (husky not configured)" -ForegroundColor Yellow
}

# Type check
Write-Host "`n🔍 Running type check..." -ForegroundColor Yellow
npm run typecheck
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript compilation successful" -ForegroundColor Green
} else {
    Write-Host "⚠️  TypeScript errors found - please fix before proceeding" -ForegroundColor Yellow
}

# Test build
Write-Host "`n🏗️  Testing build..." -ForegroundColor Yellow
npm run build 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful" -ForegroundColor Green
} else {
    Write-Host "⚠️  Build failed - check configuration" -ForegroundColor Yellow
}

# Success message
Write-Host "`n🎉 Bootstrap completed!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Edit .env.local with your API keys" -ForegroundColor White
Write-Host "  2. Set up Supabase: npx supabase start" -ForegroundColor White
Write-Host "  3. Run migrations: npm run db:migrate" -ForegroundColor White
Write-Host "  4. Start development: npm run dev" -ForegroundColor White
Write-Host "`n🚀 Happy coding!" -ForegroundColor Cyan