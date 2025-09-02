@echo off
echo ========================================
echo    GITHUB REPOSITORY SETUP
echo ========================================
echo.
echo STEP 1: Create GitHub Repository
echo --------------------------------
echo Please go to: https://github.com/new
echo.
echo Repository name: sharpened-website
echo Description: Premium dark-mode landing page for Sharpened
echo Make it PUBLIC
echo DO NOT initialize with README
echo.
pause
echo.
echo STEP 2: Push Your Code
echo ----------------------
echo Running push commands...
echo.

git remote remove origin 2>nul
git remote add origin https://github.com/pradord/sharpened-website.git
git branch -M main
git push -u origin main

echo.
echo ========================================
echo    PUSH COMPLETE!
echo ========================================
echo.
echo Your site is now on GitHub!
echo View at: https://github.com/pradord/sharpened-website
echo.
echo Next: Deploy to Vercel
echo Run: npm i -g vercel && vercel
echo.
pause