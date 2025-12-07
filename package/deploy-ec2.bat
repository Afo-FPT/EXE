@echo off
echo 🚀 Deploying to AWS EC2...

REM Run PowerShell deployment script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0deploy-ec2.ps1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Deployment completed successfully!
    echo 🌐 Your application is accessible at: http://47.130.211.9
    echo.
    echo 📊 To check application status:
    echo    ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "pm2 status"
    echo.
    echo 🔧 To setup Nginx and SSL:
    echo    ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "bash /home/ubuntu/exe-project/setup-nginx.sh"
) else (
    echo ❌ Deployment failed!
)

pause
