@echo off
echo 🔧 Setting up file permissions...

REM Set PEM file permissions (required for SSH)
echo Setting PEM file permissions...
if exist "D:\FPTU\exe\V2 - EC2\EXEkey.pem" (
    icacls "D:\FPTU\exe\V2 - EC2\EXEkey.pem" /inheritance:r /grant:r "%USERNAME%:F"
    echo ✅ PEM file permissions set successfully!
) else (
    echo ⚠️  PEM file not found at: D:\FPTU\exe\V2 - EC2\EXEkey.pem
    echo    Please check the path.
)

echo.
echo ✅ Permissions setup completed!
echo.
echo 📋 Next steps:
echo 1. Run: .\test-connection.bat (to test EC2 connection)
echo 2. Run: .\deploy-ec2.bat (to deploy your application)
echo 3. After deployment, setup Nginx on EC2
echo.
echo ⚠️  Note: Make sure OpenSSH Client is installed:
echo    Settings ^> Apps ^> Optional Features ^> Add OpenSSH Client
echo.
pause
