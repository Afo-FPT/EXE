@echo off
echo Quick Check - Testing website...
echo.

echo Testing HTTP connection...
curl -I http://47.130.211.9 --max-time 5 2>nul | findstr "200 OK" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Website is accessible!
    echo 🌐 Open in browser: http://47.130.211.9
) else (
    echo ⏳ Website not ready yet or still deploying...
    echo    This is normal if deployment is still in progress.
    echo    Deploy usually takes 5-10 minutes.
)

echo.
echo Testing HTTPS (if SSL is setup)...
curl -I https://kyvuongsuytam.site --max-time 5 2>nul | findstr "200 OK" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ HTTPS is accessible!
    echo 🔒 Open in browser: https://kyvuongsuytam.site
) else (
    echo ⚠️  HTTPS not ready (SSL not setup yet)
)

echo.
echo ========================================
echo Quick check completed!
echo.
echo If website is not accessible, deployment may still be in progress.
echo Normal deployment time: 5-10 minutes
echo ========================================
pause



