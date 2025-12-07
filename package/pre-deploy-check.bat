@echo off
echo ========================================
echo 🔍 KIỂM TRA TRƯỚC KHI DEPLOY
echo ========================================
echo.

set PEM_PATH=D:\FPTU\exe\EXE1.pem
set EC2_HOST=47.130.211.9
set EC2_USER=ubuntu

echo [1] Kiểm tra file PEM key...
if exist "%PEM_PATH%" (
    echo ✅ PEM key tồn tại: %PEM_PATH%
) else (
    echo ❌ PEM key KHÔNG tồn tại: %PEM_PATH%
    echo    Vui lòng kiểm tra đường dẫn!
    pause
    exit /b 1
)
echo.

echo [2] Kiểm tra SSH có sẵn...
where ssh.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ SSH đã được cài đặt
) else (
    echo ❌ SSH không tìm thấy. Vui lòng cài OpenSSH Client
    pause
    exit /b 1
)
echo.

echo [3] Kiểm tra kết nối đến EC2...
echo    Đang thử kết nối SSH (có thể mất vài giây)...
ssh -i "%PEM_PATH%" -o ConnectTimeout=10 -o StrictHostKeyChecking=no %EC2_USER%@%EC2_HOST% "echo 'Connection successful'" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Kết nối SSH thành công!
) else (
    echo ❌ KHÔNG thể kết nối SSH đến EC2
    echo.
    echo Có thể do:
    echo   - EC2 instance chưa khởi động
    echo   - Security Group chưa mở port 22
    echo   - IP address không đúng
    echo   - PEM key không đúng
    echo.
    pause
    exit /b 1
)
echo.

echo [4] Kiểm tra thông tin EC2...
echo    OS và thông tin cơ bản:
ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_HOST% "uname -a && echo '---' && free -h | head -n 2 && echo '---' && df -h / | tail -n 1" 2>nul
echo.

echo [5] Kiểm tra các công cụ đã cài đặt...
echo    Node.js:
ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_HOST% "node --version 2>/dev/null || echo 'Chưa cài đặt (sẽ tự động cài khi deploy)'"
echo    PM2:
ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_HOST% "pm2 --version 2>/dev/null || echo 'Chưa cài đặt (sẽ tự động cài khi deploy)'"
echo    Nginx:
ssh -i "%PEM_PATH%" %EC2_USER%@%EC2_HOST% "nginx -v 2>/dev/null || echo 'Chưa cài đặt (sẽ tự động cài khi deploy)'"
echo.

echo ========================================
echo ✅ KIỂM TRA HOÀN TẤT
echo ========================================
echo.
echo 📝 LƯU Ý QUAN TRỌNG:
echo.
echo 1. Security Group trên AWS Console:
echo    - Port 22 (SSH) - BẮT BUỘC
echo    - Port 80 (HTTP) - BẮT BUỘC để truy cập web
echo    - Port 443 (HTTPS) - Tùy chọn nếu có SSL
echo.
echo 2. Script deploy sẽ TỰ ĐỘNG cài đặt:
echo    - Node.js 18 (nếu chưa có)
echo    - PM2 (nếu chưa có)
echo    - Nginx (nếu chưa có)
echo.
echo 3. Bạn KHÔNG cần chạy gì trên EC2 trước.
echo    Chỉ cần đảm bảo Security Group đã mở port!
echo.
echo Bạn có muốn tiếp tục deploy không? (Y/N)
set /p CONTINUE=
if /i "%CONTINUE%" NEQ "Y" (
    echo Đã hủy.
    pause
    exit /b 0
)

echo.
echo 🚀 Bắt đầu deploy...
echo.
call deploy-ec2.bat

