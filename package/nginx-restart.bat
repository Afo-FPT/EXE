@echo off
echo 🔄 Restarting Nginx on EC2...
echo.
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "sudo systemctl restart nginx"
echo.
echo ✅ Nginx restarted!
pause

