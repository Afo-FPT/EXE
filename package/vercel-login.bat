@echo off
chcp 65001 >nul
echo ========================================
echo   Vercel Login
echo ========================================
echo.
echo Đang mở trình duyệt để đăng nhập Vercel...
echo.
echo Nếu trình duyệt không tự động mở, vui lòng:
echo 1. Truy cập: https://vercel.com/login
echo 2. Đăng nhập vào tài khoản Vercel
echo 3. Quay lại terminal này
echo.
echo.
vercel login
echo.
if %ERRORLEVEL% EQU 0 (
    echo ✅ Đăng nhập thành công!
    echo.
    echo Bây giờ bạn có thể chạy deploy-vercel.bat để deploy ứng dụng.
) else (
    echo ❌ Đăng nhập thất bại!
    echo Vui lòng thử lại.
)
echo.
pause

