@echo off
echo 📋 Viewing PM2 logs (Press Ctrl+C to exit)...
echo.
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "pm2 logs exe-project"

