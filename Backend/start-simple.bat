@echo off
echo ========================================
echo Starting Simple Backend Server...
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo.

REM Set environment variables
set PORT=5000

echo 🔧 Environment variables set:
echo    PORT=%PORT%
echo.

REM Start the simple backend server
echo 🚀 Starting Simple Express server on port %PORT%...
echo.
echo 📍 Server will be available at:
echo    http://localhost:%PORT%
echo    http://localhost:%PORT%/health
echo    http://localhost:%PORT%/api/health
echo.
echo 🔐 Test credentials:
echo    Email: admin@exe.com
echo    Password: admin123
echo.

node simple-server.js

pause
