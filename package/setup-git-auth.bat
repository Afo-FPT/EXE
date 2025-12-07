@echo off
echo Git Authentication Setup
echo.
echo Choose authentication method:
echo [1] SSH Key (Recommended - More secure)
echo [2] Personal Access Token (Easier setup)
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Setting up SSH key...
    scp -i "D:\FPTU\exe\EXE1.pem" "%~dp0setup-git-ssh.sh" ubuntu@47.130.211.9:/tmp/setup-git-ssh.sh
    ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "chmod +x /tmp/setup-git-ssh.sh && bash /tmp/setup-git-ssh.sh"
    
    echo.
    echo After adding SSH key to GitHub, run:
    echo   deploy-git-ssh.bat
) else if "%choice%"=="2" (
    echo.
    set /p GITHUB_USER="Enter GitHub username: "
    set /p GITHUB_TOKEN="Enter Personal Access Token: "
    
    echo.
    echo Setting up with token...
    scp -i "D:\FPTU\exe\EXE1.pem" "%~dp0setup-git-token.sh" ubuntu@47.130.211.9:/tmp/setup-git-token.sh
    ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "chmod +x /tmp/setup-git-token.sh && bash /tmp/setup-git-token.sh %GITHUB_USER% %GITHUB_TOKEN%"
    
    echo.
    echo After setup, run:
    echo   deploy-git-quick.bat
) else (
    echo Invalid choice!
    pause
    exit /b 1
)

pause

