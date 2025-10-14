@echo off
echo ========================================
echo EXE Project Backend Setup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo After installing Node.js, run this script again.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo.

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: npm is not available
    echo Please reinstall Node.js with npm included
    pause
    exit /b 1
)

echo ✅ npm version:
npm --version
echo.

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to install dependencies
    echo Please check your internet connection and try again
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully
echo.

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    echo # Database Configuration > .env
    echo DB_URI=mongodb://localhost:27017/exe_project >> .env
    echo. >> .env
    echo # Server Configuration >> .env
    echo PORT=5000 >> .env
    echo NODE_ENV=development >> .env
    echo. >> .env
    echo # Frontend URL for CORS >> .env
    echo FRONTEND_URL=http://localhost:3000 >> .env
    echo. >> .env
    echo # JWT Secret >> .env
    echo JWT_SECRET=exe_project_secret_key_2024 >> .env
    echo. >> .env
    echo # Admin Configuration >> .env
    echo ADMIN_EMAIL=admin@exe.com >> .env
    echo ADMIN_PASSWORD=admin123 >> .env
    echo ✅ .env file created
    echo.
) else (
    echo ✅ .env file already exists
    echo.
)

REM Check if MongoDB is running (optional)
echo 🔍 Checking MongoDB connection...
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/exe_project').then(() => { console.log('✅ MongoDB connection successful'); process.exit(0); }).catch(err => { console.log('⚠️  MongoDB connection failed:', err.message); console.log('Please make sure MongoDB is running on localhost:27017'); process.exit(1); });" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Warning: Could not connect to MongoDB
    echo Please make sure MongoDB is running on localhost:27017
    echo.
)

echo ========================================
echo ✅ Backend setup completed successfully!
echo ========================================
echo.
echo 🚀 To start the backend server, run:
echo    npm start
echo.
echo 📍 Server will be available at:
echo    http://localhost:5000
echo    http://localhost:5000/api/health
echo.
echo 📝 Next steps:
echo 1. Make sure MongoDB is running
echo 2. Run 'npm start' to start the server
echo 3. Open another terminal and setup the frontend
echo.
pause

