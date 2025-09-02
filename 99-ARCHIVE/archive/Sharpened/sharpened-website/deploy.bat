@echo off
echo Building Sharpened website...
call pnpm build

echo.
echo Build complete! Ready to deploy.
echo.
echo Next steps:
echo 1. Install Vercel CLI: npm i -g vercel
echo 2. Login: vercel login  
echo 3. Deploy: vercel
echo.
echo Or upload .next folder to any web host
pause