@echo off
echo ========================================
echo EXE Project Frontend Setup
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
    echo.
    echo Common solutions:
    echo 1. Clear npm cache: npm cache clean --force
    echo 2. Delete node_modules and package-lock.json, then run npm install
    echo 3. Check your internet connection
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully
echo.

REM Create .env.local file if it doesn't exist
if not exist ".env.local" (
    echo 📝 Creating .env.local file...
    echo # API Configuration > .env.local
    echo NEXT_PUBLIC_API_URL=http://localhost:5000/api >> .env.local
    echo. >> .env.local
    echo # NextAuth Configuration >> .env.local
    echo NEXTAUTH_URL=http://localhost:3000 >> .env.local
    echo NEXTAUTH_SECRET=exe_project_nextauth_secret_2024 >> .env.local
    echo. >> .env.local
    echo # Development >> .env.local
    echo NODE_ENV=development >> .env.local
    echo ✅ .env.local file created
    echo.
) else (
    echo ✅ .env.local file already exists
    echo.
)

REM Check if backend is running (optional)
echo 🔍 Checking backend connection...
curl -s http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running and accessible
    echo.
) else (
    echo ⚠️  Warning: Backend is not running or not accessible
    echo Please make sure the backend server is running on http://localhost:5000
    echo.
)

echo ========================================
echo ✅ Frontend setup completed successfully!
echo ========================================
echo.
echo 🚀 To start the frontend server, run:
echo    npm run dev
echo.
echo 📍 Frontend will be available at:
echo    http://localhost:3000
echo.
echo 📝 Next steps:
echo 1. Make sure the backend is running (http://localhost:5000)
echo 2. Run 'npm run dev' to start the frontend
echo 3. Open http://localhost:3000 in your browser
echo.
echo 🔧 Available scripts:
echo    npm run dev     - Start development server
echo    npm run build   - Build for production
echo    npm run start   - Start production server
echo    npm run lint    - Run ESLint
echo.
pause

