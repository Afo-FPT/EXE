@echo off
echo Deploying via Git (SSH) to EC2...
echo.

REM Convert HTTPS URL to SSH URL
set REPO_SSH=git@github.com:Afo-FPT/MLN.git
set BRANCH=%1
if "%BRANCH%"=="" set BRANCH=main

echo Repository: %REPO_SSH%
echo Branch: %BRANCH%
echo.

echo Uploading setup script to EC2...
scp -i "D:\FPTU\exe\EXE1.pem" "%~dp0setup-git-deploy.sh" ubuntu@47.130.211.9:/tmp/setup-git-deploy.sh
scp -i "D:\FPTU\exe\EXE1.pem" "%~dp0deploy-from-git.sh" ubuntu@47.130.211.9:/tmp/deploy-from-git.sh

echo.
echo Running setup on EC2...
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "chmod +x /tmp/setup-git-deploy.sh /tmp/deploy-from-git.sh && bash /tmp/setup-git-deploy.sh %REPO_SSH% %BRANCH%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Git deployment setup completed!
    echo.
    echo To deploy updates in the future, run:
    echo   deploy-git-quick.bat
) else (
    echo.
    echo Setup failed! 
    echo.
    echo If you see SSH authentication error, run:
    echo   setup-git-auth.bat
    echo   Then choose option 1 to setup SSH key
)

pause

