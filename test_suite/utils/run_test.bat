@echo off
echo.
echo ========================================
echo JobFlow Test Interface Launcher
echo ========================================
echo.

REM Check if .env.local exists
if not exist .env.local (
    echo ERROR: .env.local file not found!
    echo Please create .env.local with your API keys
    echo Copy .env.local.example to .env.local and fill in your keys
    pause
    exit /b 1
)

echo Starting test server for Renato's profile...
echo.
echo Once the server starts:
echo 1. Open test_job_search.html in your browser
echo 2. Enter search parameters or use defaults
echo 3. Click "Search Jobs" to test real API with your profile
echo 4. All generated content will be tailored to YOUR resume
echo.
echo Press CTRL+C to stop the server
echo.
echo ========================================
echo.

REM Try different Python commands
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python test_server.py
) else (
    where python3 >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        python3 test_server.py
    ) else (
        where py >nul 2>nul
        if %ERRORLEVEL% EQU 0 (
            py test_server.py
        ) else (
            echo ERROR: Python is not installed or not in PATH
            echo Please install Python 3.8+ and try again
            echo.
            echo You can also run the server manually:
            echo   py test_server.py
            echo   OR
            echo   python test_server.py
        )
    )
)

pause