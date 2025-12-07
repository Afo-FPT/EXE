@echo off
chcp 65001 >nul
echo ========================================
echo   Deploying to Vercel
echo ========================================
echo.

REM Change to package directory
cd /d "%~dp0"

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [1/4] Vercel CLI not found. Installing...
    call npm install -g vercel
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install Vercel CLI
        pause
        exit /b 1
    )
    echo ✅ Vercel CLI installed
) else (
    echo [1/4] ✅ Vercel CLI found
)

echo.
echo [2/4] Installing dependencies...
call npm install --legacy-peer-deps
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo [3/4] Building application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build completed

echo.
echo [4/4] Checking Vercel login status...
vercel whoami >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  Chưa đăng nhập Vercel!
    echo.
    echo 📝 Vui lòng chạy lệnh sau để đăng nhập:
    echo    vercel login
    echo.
    echo Sau khi đăng nhập xong, chạy lại script này.
    echo.
    pause
    exit /b 1
)

echo ✅ Đã đăng nhập Vercel
echo.
echo [5/5] Deploying to Vercel...
vercel --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ Deployment completed successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   ❌ Deployment failed!
    echo ========================================
)

echo.
pause

