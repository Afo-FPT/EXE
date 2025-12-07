@echo off
echo 🔄 Restarting application on EC2...
echo.
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "pm2 restart exe-project"
echo.
echo ✅ Application restarted!
pause

