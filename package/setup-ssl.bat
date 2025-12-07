@echo off
echo 🔒 Setting up SSL certificate for kyvuongsuytam.site...
echo.
echo ⚠️  IMPORTANT: Before running this script, ensure:
echo    1. Domain kyvuongsuytam.site DNS A record points to 47.130.211.9
echo    2. Security Group allows port 80 and 443
echo.
pause

echo.
echo 📤 Uploading SSL setup script to EC2...
scp -i "D:\FPTU\exe\EXE1.pem" "%~dp0setup-ssl.sh" ubuntu@47.130.211.9:/tmp/setup-ssl.sh

echo.
echo 🚀 Running SSL setup on EC2...
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "chmod +x /tmp/setup-ssl.sh && bash /tmp/setup-ssl.sh"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SSL setup completed successfully!
    echo 🌐 Your site: https://kyvuongsuytam.site
) else (
    echo.
    echo ❌ SSL setup failed!
    echo    Please check the output above for errors.
)

pause

