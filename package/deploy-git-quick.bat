@echo off
echo Quick Git Deploy - Pulling latest changes from Git...
echo.

ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "bash /home/ubuntu/exe-project/deploy-from-git.sh %1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Deployment completed successfully!
    echo Application: https://kyvuongsuytam.site
) else (
    echo.
    echo Deployment failed! Check the output above.
)

pause

