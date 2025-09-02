@echo off
echo ========================================
echo Starting n8n Automation Platform
echo ========================================
echo.
echo This will start n8n on http://localhost:5678
echo.
echo First time setup may take 2-3 minutes to download.
echo.
cd n8n-workflows
echo Starting n8n...
npx --yes n8n start
pause