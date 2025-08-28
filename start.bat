@echo off
REM JobFlow Clean - Quick Start Script for Windows

echo =========================================
echo JobFlow Clean - Starting Services
echo =========================================

REM Check if .env.local exists
if not exist .env.local (
    echo ERROR: .env.local not found!
    echo Please copy .env.local.example to .env.local and fill in your values
    pause
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install
pip install -r backend\requirements.txt

REM Start services
echo Starting services...

REM Start Next.js
echo Starting frontend on http://localhost:3000...
start cmd /k "npm run dev"

REM Wait a moment
timeout /t 5 /nobreak >nul

echo.
echo =========================================
echo Services Started!
echo =========================================
echo.
echo Frontend: http://localhost:3000
echo Admin Panel: http://localhost:3000/admin
echo Settings: http://localhost:3000/settings
echo.
echo To run email delivery test:
echo python run_email_delivery.py --test
echo.
echo Close this window to stop services
echo =========================================

pause