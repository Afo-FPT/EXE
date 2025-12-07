@echo off
echo 🔒 SSL Certificate Management
echo.
echo [1] Setup SSL certificate (first time)
echo [2] Renew certificate manually
echo [3] Check certificate status
echo [4] View certificate info
echo [5] Test certificate renewal
echo.
set /p choice="Chọn (1-5): "

if "%choice%"=="1" (
    call setup-ssl.bat
) else if "%choice%"=="2" (
    echo 🔄 Renewing certificate...
    ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "sudo certbot renew"
) else if "%choice%"=="3" (
    echo 📊 Checking certificate status...
    ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "sudo certbot certificates"
) else if "%choice%"=="4" (
    echo 📜 Certificate information:
    ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "sudo openssl x509 -in /etc/letsencrypt/live/kyvuongsuytam.site/cert.pem -text -noout | grep -E '(Subject:|Issuer:|Not Before|Not After)'"
) else if "%choice%"=="5" (
    echo 🧪 Testing certificate renewal...
    ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "sudo certbot renew --dry-run"
) else (
    echo ❌ Invalid choice
)

pause

