# Create Sharpened Monorepo Migration Script
# This script consolidates three projects into a single monorepo

# Configuration
$ProjectsDir = "C:\Users\pradord\Documents\Projects"
$SrcWebsite = Join-Path $ProjectsDir "Sharpened\sharpened-website"
$SrcFeel = Join-Path $ProjectsDir "feelsharper"
$SrcStudy = Join-Path $ProjectsDir "studysharper"
$DestRoot = Join-Path $ProjectsDir "sharpened-monorepo"  # Using different name to avoid conflict
$BackupDir = Join-Path $ProjectsDir "_backup_$(Get-Date -Format 'yyyyMMdd-HHmm')"

# Display plan
Write-Host "`n=== SHARPENED MONOREPO MIGRATION PLAN ===" -ForegroundColor Cyan
Write-Host "Source directories:"
Write-Host "  - Website: $SrcWebsite" -ForegroundColor Yellow
Write-Host "  - FeelSharper: $SrcFeel" -ForegroundColor Yellow
Write-Host "  - StudySharper: $SrcStudy" -ForegroundColor Yellow
Write-Host "`nDestination: $DestRoot" -ForegroundColor Green
Write-Host "Backup location: $BackupDir" -ForegroundColor Gray
Write-Host "=========================================`n"

# Confirmation
$confirm = Read-Host "Do you want to proceed? Type 'YES' to continue"
if ($confirm -ne "YES") {
    Write-Host "Migration cancelled." -ForegroundColor Red
    exit
}

# Step 1: Create backup
Write-Host "`n[1/7] Creating backup..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
Copy-Item -Path $SrcWebsite -Destination (Join-Path $BackupDir "sharpened-website") -Recurse -Force
Copy-Item -Path $SrcFeel -Destination (Join-Path $BackupDir "feelsharper") -Recurse -Force
Copy-Item -Path $SrcStudy -Destination (Join-Path $BackupDir "studysharper") -Recurse -Force
Write-Host "✓ Backup created at $BackupDir" -ForegroundColor Green

# Step 2: Create monorepo structure
Write-Host "`n[2/7] Creating monorepo structure..." -ForegroundColor Cyan
$directories = @(
    "$DestRoot",
    "$DestRoot\apps",
    "$DestRoot\apps\website",
    "$DestRoot\apps\feelsharper",
    "$DestRoot\apps\studysharper",
    "$DestRoot\packages",
    "$DestRoot\packages\ui",
    "$DestRoot\packages\config",
    "$DestRoot\packages\tooling",
    "$DestRoot\packages\prompts",
    "$DestRoot\infra",
    "$DestRoot\infra\supabase",
    "$DestRoot\infra\vercel",
    "$DestRoot\infra\n8n",
    "$DestRoot\docs",
    "$DestRoot\brand",
    "$DestRoot\.github",
    "$DestRoot\.github\workflows",
    "$DestRoot\.github\ISSUE_TEMPLATE",
    "$DestRoot\.github\PULL_REQUEST_TEMPLATE"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}
Write-Host "✓ Directory structure created" -ForegroundColor Green

# Step 3: Create root workspace files
Write-Host "`n[3/7] Creating workspace configuration files..." -ForegroundColor Cyan

# Root package.json
@"
{
  "name": "sharpened",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "format": "prettier --write .",
    "clean": "turbo run clean",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.3.3",
    "@types/node": "^20.0.0",
    "typescript": "^5.5.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
"@ | Out-File -Encoding UTF8 "$DestRoot\package.json"

# pnpm-workspace.yaml
@"
packages:
  - 'apps/*'
  - 'packages/*'
"@ | Out-File -Encoding UTF8 "$DestRoot\pnpm-workspace.yaml"

# turbo.json
@"
{
  "`$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "clean": {
      "cache": false
    }
  }
}
"@ | Out-File -Encoding UTF8 "$DestRoot\turbo.json"

# .gitignore
@"
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage
*.lcov
.nyc_output

# Next.js
.next/
out/
build
dist

# Production
*.production

# Misc
.DS_Store
*.pem
.idea

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# Turborepo
.turbo

# TypeScript
*.tsbuildinfo
"@ | Out-File -Encoding UTF8 "$DestRoot\.gitignore"

# .env.example
@"
# Sharpened Monorepo Environment Variables
# Copy this file to .env.local and fill in your values

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Anthropic Claude
ANTHROPIC_API_KEY=

# Vercel (for deployment)
VERCEL_URL=
VERCEL_ENV=

# Application
NODE_ENV=development
"@ | Out-File -Encoding UTF8 "$DestRoot\.env.example"

# README.md
@"
# Sharpened Monorepo

Unified workspace for the Sharpened ecosystem of fitness and productivity applications.

## Structure

\`\`\`
sharpened/
├── apps/
│   ├── website/        # Marketing & distribution site
│   ├── feelsharper/    # Core fitness tracking product
│   └── studysharper/   # Study & productivity tools
├── packages/
│   ├── ui/            # Shared UI components
│   ├── config/        # Shared configurations
│   ├── tooling/       # Build & dev tools
│   └── prompts/       # AI prompt engineering
├── infra/
│   ├── supabase/      # Database & auth
│   ├── vercel/        # Deployment configs
│   └── n8n/           # Automation workflows
└── docs/              # Documentation
\`\`\`

## Quick Start

\`\`\`bash
# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies
pnpm install

# Run all apps in development
pnpm dev

# Build all apps
pnpm build

# Run type checking
pnpm typecheck

# Run linting
pnpm lint
\`\`\`

## Apps

### FeelSharper (Priority)
The core fitness tracking application with AI-powered insights.
- **Port**: 3000
- **Stack**: Next.js 15, Supabase, Claude AI

### Website
Marketing and distribution site for the Sharpened ecosystem.
- **Port**: 3001
- **Stack**: Next.js 15, Tailwind CSS

### StudySharper
Study and productivity tools (currently parked).
- **Port**: 3002
- **Stack**: Next.js 15, Supabase

## Development

Each app can be run independently:

\`\`\`bash
# Run specific app
pnpm --filter feelsharper dev
pnpm --filter website dev
pnpm --filter studysharper dev
\`\`\`

## Deployment

All apps are deployed via Vercel with automatic preview deployments for PRs.

Production deployments happen on merge to main branch.

## License

MIT
"@ | Out-File -Encoding UTF8 "$DestRoot\README.md"

Write-Host "✓ Workspace configuration files created" -ForegroundColor Green

# Step 4: Move projects to apps directory
Write-Host "`n[4/7] Moving projects to apps directory..." -ForegroundColor Cyan

# Copy projects (excluding .git directories)
robocopy $SrcWebsite "$DestRoot\apps\website" /E /XD .git node_modules .next .turbo /XF .env .env.local
robocopy $SrcFeel "$DestRoot\apps\feelsharper" /E /XD .git node_modules .next .turbo /XF .env .env.local
robocopy $SrcStudy "$DestRoot\apps\studysharper" /E /XD .git node_modules .next .turbo /XF .env .env.local

Write-Host "✓ Projects moved to apps directory" -ForegroundColor Green

# Step 5: Create shared packages
Write-Host "`n[5/7] Creating shared packages..." -ForegroundColor Cyan

# packages/config/package.json
@"
{
  "name": "@sharpened/config",
  "version": "0.0.0",
  "private": true,
  "main": "index.js",
  "files": [
    "eslint",
    "typescript"
  ]
}
"@ | Out-File -Encoding UTF8 "$DestRoot\packages\config\package.json"

# packages/config/typescript/base.json
New-Item -ItemType Directory -Force -Path "$DestRoot\packages\config\typescript" | Out-Null
@"
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "jsx": "preserve",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "incremental": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true
  },
  "exclude": ["node_modules"]
}
"@ | Out-File -Encoding UTF8 "$DestRoot\packages\config\typescript\base.json"

# packages/config/typescript/nextjs.json
@"
{
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{"name": "next"}],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
"@ | Out-File -Encoding UTF8 "$DestRoot\packages\config\typescript\nextjs.json"

# packages/ui/package.json
@"
{
  "name": "@sharpened/ui",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.5.0"
  }
}
"@ | Out-File -Encoding UTF8 "$DestRoot\packages\ui\package.json"

# packages/ui/src/index.ts
New-Item -ItemType Directory -Force -Path "$DestRoot\packages\ui\src" | Out-Null
@"
// Shared UI components will be exported from here
export * from './components';
"@ | Out-File -Encoding UTF8 "$DestRoot\packages\ui\src\index.ts"

# packages/ui/src/components/index.ts
New-Item -ItemType Directory -Force -Path "$DestRoot\packages\ui\src\components" | Out-Null
@"
// Export shared components
export {};
"@ | Out-File -Encoding UTF8 "$DestRoot\packages\ui\src\components\index.ts"

Write-Host "✓ Shared packages created" -ForegroundColor Green

# Step 6: Initialize git repository
Write-Host "`n[6/7] Initializing git repository..." -ForegroundColor Cyan
Set-Location $DestRoot
git init
git add .
git commit -m "chore: initialize sharpened monorepo - consolidate three apps into unified workspace"

Write-Host "✓ Git repository initialized" -ForegroundColor Green

# Step 7: Install dependencies
Write-Host "`n[7/7] Installing dependencies..." -ForegroundColor Cyan
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm install
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "! pnpm not found. Install it with: npm install -g pnpm" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "✅ MONOREPO MIGRATION COMPLETE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "`nMonorepo created at: $DestRoot" -ForegroundColor White
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. cd '$DestRoot'"
Write-Host "  2. pnpm install"
Write-Host "  3. Copy .env.local files from backup to each app"
Write-Host "  4. pnpm dev"
Write-Host "`nBackup saved at: $BackupDir" -ForegroundColor Gray
Write-Host "`nNote: Original repositories remain untouched." -ForegroundColor Gray