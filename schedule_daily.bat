@echo off
echo ========================================
echo JobFlow Daily Scheduler Setup
echo ========================================
echo.
echo This will schedule JobFlow to run automatically every day.
echo.

set /p hour="Enter hour to run (0-23, e.g., 9 for 9 AM): "
set /p minute="Enter minute (0-59, default 0): "

if "%minute%"=="" set minute=0

echo.
echo Scheduling JobFlow to run daily at %hour%:%minute%
echo Press Ctrl+C to stop the scheduler
echo.

python daily_automation.py --schedule %hour% %minute%