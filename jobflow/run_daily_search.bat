@echo off
echo ========================================
echo JobFlow Daily Automation
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    pause
    exit /b 1
)

echo Starting daily job search...
echo.

REM Run the daily automation immediately
python daily_automation.py --now

echo.
echo ========================================
echo Daily search complete!
echo Check data/daily_reports/ for your report
echo ========================================
pause