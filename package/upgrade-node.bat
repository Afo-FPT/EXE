@echo off
echo Upgrading Node.js to version 20 on EC2...
echo.
echo This will:
echo - Stop the application
echo - Upgrade Node.js from 18 to 20
echo - Rebuild the application
echo - Restart the application
echo.
pause

echo Uploading upgrade script...
scp -i "D:\FPTU\exe\EXE1.pem" "%~dp0upgrade-node.sh" ubuntu@47.130.211.9:/tmp/upgrade-node.sh

echo.
echo Running upgrade on EC2...
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "chmod +x /tmp/upgrade-node.sh && bash /tmp/upgrade-node.sh"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Node.js upgrade completed successfully!
) else (
    echo.
    echo Upgrade failed! Check the output above.
)

pause

