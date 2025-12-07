@echo off
echo 🌐 Checking Nginx status on EC2...
echo.
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "sudo systemctl status nginx"
pause

