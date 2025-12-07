@echo off
echo ⏹️ Stopping application on EC2...
echo.
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "pm2 stop exe-project"
echo.
echo ✅ Application stopped!
pause

