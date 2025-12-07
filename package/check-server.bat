@echo off
echo 🔍 Checking server status...
echo.
echo [1] PM2 Status:
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "pm2 status"
echo.
echo [2] Nginx Status:
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "sudo systemctl status nginx | head -n 10"
echo.
echo [3] Application Port:
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "netstat -tlnp | grep :3000 || echo 'Port 3000 not listening'"
echo.
echo [4] Disk Usage:
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "df -h /"
echo.
pause

