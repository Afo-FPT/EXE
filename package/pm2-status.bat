@echo off
echo 📊 Checking PM2 status on EC2...
echo.
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "pm2 status"
pause

