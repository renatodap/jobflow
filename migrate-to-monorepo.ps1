# Sharpened Monorepo Migration Script
# Creates a new monorepo structure and copies existing projects

$ErrorActionPreference = "Stop"

# Configuration
$ProjectsDir = "C:\Users\pradord\Documents\Projects"
$DestRoot = Join-Path $ProjectsDir "sharpened-monorepo"
$BackupDir = Join-Path $ProjectsDir "_backup_$(Get-Date -Format 'yyyyMMdd-HHmm')"

Write-Host "`n=== SHARPENED MONOREPO MIGRATION ===" -ForegroundColor Cyan
Write-Host "Destination: $DestRoot" -ForegroundColor Green

# Check if destination already exists
if (Test-Path $DestRoot) {
    Write-Host "WARNING: $DestRoot already exists. Delete it first or choose a different name." -ForegroundColor Red
    exit 1
}

$confirm = Read-Host "Type YES to proceed with migration"
if ($confirm -ne "YES") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

# Create backup
Write-Host "`n[1/6] Creating backup..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
Copy-Item -Path "$ProjectsDir\Sharpened\sharpened-website" -Destination "$BackupDir\sharpened-website" -Recurse
Copy-Item -Path "$ProjectsDir\feelsharper" -Destination "$BackupDir\feelsharper" -Recurse
Copy-Item -Path "$ProjectsDir\studysharper" -Destination "$BackupDir\studysharper" -Recurse
Write-Host "Backup created at: $BackupDir" -ForegroundColor Green

# Create directory structure
Write-Host "`n[2/6] Creating monorepo structure..." -ForegroundColor Cyan
$dirs = @(
    "$DestRoot",
    "$DestRoot\apps",
    "$DestRoot\apps\website",
    "$DestRoot\apps\feelsharper",
    "$DestRoot\apps\studysharper",
    "$DestRoot\packages",
    "$DestRoot\packages\ui",
    "$DestRoot\packages\config",
    "$DestRoot\infra",
    "$DestRoot\docs",
    "$DestRoot\.github"
)
foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

# Create workspace files
Write-Host "`n[3/6] Creating workspace files..." -ForegroundColor Cyan

# package.json
@"
{
  "name": "sharpened",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "turbo": "latest"
  },
  "packageManager": "pnpm@9.0.0"
}
"@ | Set-Content "$DestRoot\package.json"

# pnpm-workspace.yaml
@"
packages:
  - 'apps/*'
  - 'packages/*'
"@ | Set-Content "$DestRoot\pnpm-workspace.yaml"

# turbo.json
@"
{
  "`$schema": "https://turbo.build/schema.json",
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
    "typecheck": {}
  }
}
"@ | Set-Content "$DestRoot\turbo.json"

# .gitignore
@"
node_modules
.next
.turbo
dist
.env
.env.local
*.log
"@ | Set-Content "$DestRoot\.gitignore"

# README.md
@"
# Sharpened Monorepo

## Apps
- **website**: Marketing site
- **feelsharper**: Core fitness product
- **studysharper**: Study tools

## Quick Start
\`\`\`bash
pnpm install
pnpm dev
\`\`\`
"@ | Set-Content "$DestRoot\README.md"

Write-Host "Workspace files created" -ForegroundColor Green

# Copy projects
Write-Host "`n[4/6] Copying projects..." -ForegroundColor Cyan
robocopy "$ProjectsDir\Sharpened\sharpened-website" "$DestRoot\apps\website" /E /XD .git node_modules .next /NFL /NDL /NJH /NJS /NC /NS
robocopy "$ProjectsDir\feelsharper" "$DestRoot\apps\feelsharper" /E /XD .git node_modules .next /NFL /NDL /NJH /NJS /NC /NS
robocopy "$ProjectsDir\studysharper" "$DestRoot\apps\studysharper" /E /XD .git node_modules .next /NFL /NDL /NJH /NJS /NC /NS
Write-Host "Projects copied" -ForegroundColor Green

# Initialize git
Write-Host "`n[5/6] Initializing git..." -ForegroundColor Cyan
Push-Location $DestRoot
git init
git add .
git commit -m "chore: initialize monorepo"
Pop-Location
Write-Host "Git initialized" -ForegroundColor Green

# Install pnpm if needed
Write-Host "`n[6/6] Checking pnpm..." -ForegroundColor Cyan
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
}

Write-Host "`n✅ MIGRATION COMPLETE!" -ForegroundColor Green
Write-Host "`nNext steps:"
Write-Host "  cd $DestRoot"
Write-Host "  pnpm install"
Write-Host "  pnpm dev"
Write-Host "`nBackup: $BackupDir" -ForegroundColor Gray