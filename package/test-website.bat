@echo off
echo Testing website accessibility...
echo.

echo Testing HTTPS (kyvuongsuytam.site)...
curl -I https://kyvuongsuytam.site 2>nul | findstr "200 OK" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ HTTPS is accessible!
) else (
    echo ❌ HTTPS not accessible
)

echo.
echo Testing HTTP (47.130.211.9)...
curl -I http://47.130.211.9 2>nul | findstr "200 OK" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ HTTP is accessible!
) else (
    echo ❌ HTTP not accessible
)

echo.
echo Testing port 3000 (direct app)...
curl -I http://47.130.211.9:3000 2>nul | findstr "200 OK" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Application is running on port 3000!
) else (
    echo ❌ Application not responding on port 3000
)

echo.
echo ========================================
echo Open in browser:
echo   https://kyvuongsuytam.site
echo   http://47.130.211.9
echo ========================================
pause

