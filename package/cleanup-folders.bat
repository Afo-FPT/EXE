@echo off
echo 🧹 Bắt đầu dọn dẹp folders...
echo.

REM Chạy PowerShell script
powershell -ExecutionPolicy Bypass -File "cleanup-folders.ps1"

echo.
echo ✅ Hoàn thành! Nhấn phím bất kỳ để thoát...
pause >nul
