@echo off
echo ▶️ Starting application on EC2...
echo.
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "pm2 start exe-project"
echo.
echo ✅ Application started!
pause

