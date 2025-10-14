@echo off
echo ========================================
echo Starting EXE Project Backend...
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

REM Check if port 5000 is already in use
netstat -an | findstr :5000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Warning: Port 5000 is already in use
    echo Please stop any application using port 5000
    echo.
)

REM Set environment variables
set PORT=5000
set DB_URI=mongodb://localhost:27017/exe_project
set JWT_SECRET=exe_project_secret_key_2024
set FRONTEND_URL=http://localhost:3000

echo 🔧 Environment variables set:
echo    PORT=%PORT%
echo    DB_URI=%DB_URI%
echo    JWT_SECRET=%JWT_SECRET%
echo    FRONTEND_URL=%FRONTEND_URL%
echo.

REM Check if .env file exists
if not exist ".env" (
    echo 📝 Creating .env file...
    echo PORT=5000 > .env
    echo DB_URI=mongodb://localhost:27017/exe_project >> .env
    echo JWT_SECRET=exe_project_secret_key_2024 >> .env
    echo FRONTEND_URL=http://localhost:3000 >> .env
    echo ✅ .env file created
    echo.
)

REM Start the backend server
echo 🚀 Starting Express server on port %PORT%...
echo.
echo 📍 Server will be available at:
echo    http://localhost:%PORT%
echo    http://localhost:%PORT%/health
echo    http://localhost:%PORT%/api/health
echo    http://localhost:%PORT%/api/banners/active
echo    http://localhost:%PORT%/api/mystery-box/*
echo.

node --experimental-modules server.js

pause
