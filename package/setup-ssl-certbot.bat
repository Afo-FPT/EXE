@echo off
echo Setting up SSL Certificate with Certbot...
echo.
echo This will:
echo - Install Certbot
echo - Obtain SSL certificate for kyvuongsuytam.site
echo - Configure Nginx with SSL
echo - Setup auto-renewal
echo.
echo IMPORTANT: Make sure domain kyvuongsuytam.site DNS A record points to 47.130.211.9
echo.
pause

echo.
echo Uploading SSL setup script to EC2...
scp -i "D:\FPTU\exe\EXE1.pem" "%~dp0setup-ssl-certbot.sh" ubuntu@47.130.211.9:/tmp/setup-ssl-certbot.sh

echo.
echo Running SSL setup on EC2...
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "chmod +x /tmp/setup-ssl-certbot.sh && bash /tmp/setup-ssl-certbot.sh"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ SSL setup completed successfully!
    echo 🌐 Your site: https://kyvuongsuytam.site
) else (
    echo.
    echo ❌ SSL setup failed!
    echo    Please check the output above for errors.
    echo.
    echo Common issues:
    echo - DNS not pointing to 47.130.211.9
    echo - Security Group not allowing port 80
)

pause

