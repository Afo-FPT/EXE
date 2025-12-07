# PowerShell script với các lệnh thường dùng cho EC2
# Sử dụng: .\ec2-commands.ps1 [command]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("connect", "status", "logs", "restart", "stop", "start", "nginx-status", "nginx-restart", "check", "help")]
    [string]$Command
)

$PEMPath = "D:\FPTU\exe\EXE1.pem"
$EC2Host = "47.130.211.9"
$EC2User = "ubuntu"

# Check SSH
$sshCmd = Get-Command ssh.exe -ErrorAction SilentlyContinue
if (-not $sshCmd) {
    if (Test-Path "C:\Windows\System32\OpenSSH\ssh.exe") {
        $sshCmd = Get-Item "C:\Windows\System32\OpenSSH\ssh.exe"
    } else {
        Write-Host "SSH not found. Install OpenSSH Client." -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path $PEMPath)) {
    Write-Host "PEM file not found at: $PEMPath" -ForegroundColor Red
    exit 1
}

$sshArgs = "-i", "`"$PEMPath`"", "${EC2User}@${EC2Host}"

switch ($Command) {
    "connect" {
        Write-Host "🔌 Connecting to EC2..." -ForegroundColor Cyan
        & $sshCmd.Path $sshArgs
    }
    "status" {
        Write-Host "📊 PM2 Status:" -ForegroundColor Cyan
        & $sshCmd.Path $sshArgs "pm2 status"
    }
    "logs" {
        Write-Host "📋 PM2 Logs (Press Ctrl+C to exit):" -ForegroundColor Cyan
        & $sshCmd.Path $sshArgs "pm2 logs exe-project"
    }
    "restart" {
        Write-Host "🔄 Restarting application..." -ForegroundColor Cyan
        & $sshCmd.Path $sshArgs "pm2 restart exe-project"
        Write-Host "✅ Application restarted!" -ForegroundColor Green
    }
    "stop" {
        Write-Host "⏹️ Stopping application..." -ForegroundColor Cyan
        & $sshCmd.Path $sshArgs "pm2 stop exe-project"
        Write-Host "✅ Application stopped!" -ForegroundColor Green
    }
    "start" {
        Write-Host "▶️ Starting application..." -ForegroundColor Cyan
        & $sshCmd.Path $sshArgs "pm2 start exe-project"
        Write-Host "✅ Application started!" -ForegroundColor Green
    }
    "nginx-status" {
        Write-Host "🌐 Nginx Status:" -ForegroundColor Cyan
        & $sshCmd.Path $sshArgs "sudo systemctl status nginx"
    }
    "nginx-restart" {
        Write-Host "🔄 Restarting Nginx..." -ForegroundColor Cyan
        & $sshCmd.Path $sshArgs "sudo systemctl restart nginx"
        Write-Host "✅ Nginx restarted!" -ForegroundColor Green
    }
    "check" {
        Write-Host "🔍 Checking server status..." -ForegroundColor Cyan
        Write-Host "`n[1] PM2 Status:" -ForegroundColor Yellow
        & $sshCmd.Path $sshArgs "pm2 status"
        Write-Host "`n[2] Nginx Status:" -ForegroundColor Yellow
        & $sshCmd.Path $sshArgs "sudo systemctl status nginx | head -n 10"
        Write-Host "`n[3] Application Port:" -ForegroundColor Yellow
        & $sshCmd.Path $sshArgs "netstat -tlnp | grep :3000 || echo 'Port 3000 not listening'"
        Write-Host "`n[4] Disk Usage:" -ForegroundColor Yellow
        & $sshCmd.Path $sshArgs "df -h /"
    }
    "help" {
        Write-Host @"
EC2 Management Commands:
  connect         - SSH vào EC2 instance
  status          - Xem trạng thái PM2
  logs            - Xem logs của ứng dụng
  restart         - Restart ứng dụng
  stop            - Dừng ứng dụng
  start           - Khởi động ứng dụng
  nginx-status    - Xem trạng thái Nginx
  nginx-restart   - Restart Nginx
  check           - Kiểm tra tổng thể server
  help            - Hiển thị help này

Usage:
  .\ec2-commands.ps1 [command]

Examples:
  .\ec2-commands.ps1 connect
  .\ec2-commands.ps1 status
  .\ec2-commands.ps1 logs
"@ -ForegroundColor Cyan
    }
}

