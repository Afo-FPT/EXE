@echo off
echo 🔧 Fixing PEM key permissions...
echo.
powershell.exe -ExecutionPolicy Bypass -File "%~dp0fix-pem-permissions.ps1"
echo.
pause

