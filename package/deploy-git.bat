@echo off
echo Deploying via Git to EC2...
echo.

REM Check if Git repo URL is provided
if "%1"=="" (
    set REPO_URL=https://github.com/Afo-FPT/MLN.git
    set BRANCH=main
    echo Using default repository: %REPO_URL%
) else (
    set REPO_URL=%1
    set BRANCH=%2
    if "%BRANCH%"=="" set BRANCH=main
)

echo Repository: %REPO_URL%
echo Branch: %BRANCH%
echo.

echo Uploading setup script to EC2...
scp -i "D:\FPTU\exe\EXE1.pem" "%~dp0setup-git-deploy.sh" ubuntu@47.130.211.9:/tmp/setup-git-deploy.sh
scp -i "D:\FPTU\exe\EXE1.pem" "%~dp0deploy-from-git.sh" ubuntu@47.130.211.9:/tmp/deploy-from-git.sh

echo.
echo Running setup on EC2...
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "chmod +x /tmp/setup-git-deploy.sh /tmp/deploy-from-git.sh && bash /tmp/setup-git-deploy.sh %REPO_URL% %BRANCH%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Git deployment setup completed!
    echo.
    echo To deploy updates in the future:
    echo   1. Push code to Git
    echo   2. Run: ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "bash /home/ubuntu/exe-project/deploy-from-git.sh"
    echo.
    echo Or use the quick deploy script:
    echo   deploy-git-quick.bat
) else (
    echo.
    echo Setup failed! Check the output above.
)

pause

