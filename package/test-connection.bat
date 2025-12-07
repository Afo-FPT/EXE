@echo off
echo 🔍 Testing EC2 connection...

REM Test SSH connection
echo Testing SSH connection to EC2...
ssh -i "D:\FPTU\exe\V2 - EC2\EXEkey.pem" ubuntu@13.237.124.97 "echo 'SSH connection successful!'"

if %ERRORLEVEL% EQU 0 (
    echo ✅ SSH connection successful!
) else (
    echo ❌ SSH connection failed!
    echo Please check:
    echo - EC2 instance is running
    echo - Security Group allows SSH (port 22)
    echo - PEM file path is correct
    echo - PEM file permissions are correct
    pause
    exit /b 1
)

REM Test HTTP connection
echo.
echo Testing HTTP connection...
curl -I http://13.237.124.97 2>nul | findstr "200 OK" >nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ HTTP connection successful!
) else (
    echo ⚠️  HTTP connection failed (this is normal before deployment)
    echo The application will be accessible after deployment
)

echo.
echo 🎉 Connection test completed!
pause


