# Sharpened Monorepo Setup
param(
    [switch]$SkipBackup,
    [switch]$Force
)

$ProjectsDir = "C:\Users\pradord\Documents\Projects"
$Dest = "$ProjectsDir\sharpened-monorepo"

if ((Test-Path $Dest) -and -not $Force) {
    Write-Host "ERROR: $Dest already exists. Use -Force to overwrite." -ForegroundColor Red
    exit 1
}

Write-Host "Creating Sharpened Monorepo..." -ForegroundColor Cyan

# Backup
if (-not $SkipBackup) {
    $backup = "$ProjectsDir\_backup_$(Get-Date -Format 'yyyyMMdd-HHmm')"
    Write-Host "Creating backup at $backup..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $backup | Out-Null
    Copy-Item -Path "$ProjectsDir\Sharpened\sharpened-website" -Destination "$backup\website" -Recurse
    Copy-Item -Path "$ProjectsDir\feelsharper" -Destination "$backup\feelsharper" -Recurse
    Copy-Item -Path "$ProjectsDir\studysharper" -Destination "$backup\studysharper" -Recurse
}

# Remove existing if Force
if ($Force -and (Test-Path $Dest)) {
    Remove-Item -Path $Dest -Recurse -Force
}

# Create structure
New-Item -ItemType Directory -Force -Path "$Dest\apps\website" | Out-Null
New-Item -ItemType Directory -Force -Path "$Dest\apps\feelsharper" | Out-Null
New-Item -ItemType Directory -Force -Path "$Dest\apps\studysharper" | Out-Null
New-Item -ItemType Directory -Force -Path "$Dest\packages\ui" | Out-Null
New-Item -ItemType Directory -Force -Path "$Dest\packages\config" | Out-Null

# Copy projects (exclude git and node_modules)
Write-Host "Copying projects..." -ForegroundColor Cyan
robocopy "$ProjectsDir\Sharpened\sharpened-website" "$Dest\apps\website" /E /XD .git node_modules .next .turbo /XF .env .env.local /NFL /NDL /NJH /NJS /NC /NS /NP
robocopy "$ProjectsDir\feelsharper" "$Dest\apps\feelsharper" /E /XD .git node_modules .next .turbo /XF .env .env.local /NFL /NDL /NJH /NJS /NC /NS /NP
robocopy "$ProjectsDir\studysharper" "$Dest\apps\studysharper" /E /XD .git node_modules .next .turbo /XF .env .env.local /NFL /NDL /NJH /NJS /NC /NS /NP

# Create root files
Write-Host "Creating workspace configuration..." -ForegroundColor Cyan

# Simple file creation
Set-Content -Path "$Dest\package.json" -Value '{
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
}'

Set-Content -Path "$Dest\pnpm-workspace.yaml" -Value "packages:
  - 'apps/*'
  - 'packages/*'"

Set-Content -Path "$Dest\turbo.json" -Value '{
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
    "typecheck": {}
  }
}'

Set-Content -Path "$Dest\.gitignore" -Value "node_modules
.next
.turbo
dist
.env
.env.local
*.log
.DS_Store"

Set-Content -Path "$Dest\README.md" -Value "# Sharpened Monorepo

Unified workspace for Sharpened apps.

## Structure
- apps/website - Marketing site
- apps/feelsharper - Core fitness product
- apps/studysharper - Study tools

## Setup
pnpm install
pnpm dev"

# Initialize git
Write-Host "Initializing git repository..." -ForegroundColor Cyan
Push-Location $Dest
git init
git add .
git commit -m "Initial monorepo setup"
Pop-Location

Write-Host "`nSUCCESS! Monorepo created at:" -ForegroundColor Green
Write-Host $Dest -ForegroundColor Yellow
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  cd $Dest"
Write-Host "  pnpm install"
Write-Host "  pnpm dev"