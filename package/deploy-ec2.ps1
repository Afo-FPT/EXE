# PowerShell Deployment Script for AWS EC2
# This script doesn't require WSL

param(
    [string]$PEMPath = "D:\FPTU\exe\EXE1.pem",
    [string]$EC2Host = "47.130.211.9",
    [string]$EC2User = "ubuntu"
)

$ErrorActionPreference = "Stop"

Write-Host "Starting deployment to AWS EC2..." -ForegroundColor Cyan

# Resolve ssh/scp paths (compatible with older PowerShell)
$sshCmd = $null
$scpCmd = $null
$sshLookup = Get-Command ssh.exe -ErrorAction SilentlyContinue
if ($sshLookup) { $sshCmd = $sshLookup.Path }
$scpLookup = Get-Command scp.exe -ErrorAction SilentlyContinue
if ($scpLookup) { $scpCmd = $scpLookup.Path }
if (-not $sshCmd -and (Test-Path "C:\Windows\System32\OpenSSH\ssh.exe")) { $sshCmd = "C:\Windows\System32\OpenSSH\ssh.exe" }
if (-not $scpCmd -and (Test-Path "C:\Windows\System32\OpenSSH\scp.exe")) { $scpCmd = "C:\Windows\System32\OpenSSH\scp.exe" }

if (-not $sshCmd) { Write-Host "SSH not found. Install OpenSSH Client." -ForegroundColor Red; exit 1 }
if (-not $scpCmd) { Write-Host "SCP not found. Install OpenSSH Client." -ForegroundColor Red; exit 1 }

# Check PEM
if (-not (Test-Path $PEMPath)) { Write-Host ("PEM file not found at: {0}" -f $PEMPath) -ForegroundColor Red; exit 1 }

# Skip local build - will build on EC2 instead (faster and avoids Windows permission issues)
Write-Host "Skipping local build - will build on EC2..." -ForegroundColor Cyan
Write-Host "This is faster and avoids Windows file permission issues." -ForegroundColor Gray

Write-Host "Creating deployment package..." -ForegroundColor Cyan

# Create temporary directory
$tempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
$appDir = Join-Path $tempDir "exe-project"

# Remove .next folder first to avoid permission issues
Write-Host "Cleaning .next folder..." -ForegroundColor Gray
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
}

# Copy only necessary files (exclude build artifacts and large files)
$excludeItems = @(
    "node_modules",
    ".next",              # Build folder - will rebuild on EC2
    ".next\cache",
    ".git",
    ".vercel",
    "*.log",
    ".env.local",
    ".env.development",
    "*.swp",
    "*.swo",
    "*~",
    ".DS_Store",
    "Thumbs.db",
    "*.bat",              # Windows batch files not needed on Linux
    "*.ps1",              # PowerShell scripts not needed on EC2
    "*.md",               # Documentation files
    "Dockerfile",
    "docker-compose.yml",
    ".dockerignore",
    "fly.toml",
    "vercel.json",
    "TROUBLESHOOTING*.md",
    "UPLOAD_FEATURE.md",
    "OPTIMIZE_DEPLOY.md",
    "PRE_DEPLOY_CHECKLIST.md",
    "SSL_SETUP_GUIDE.md",
    "QUICK_START.md",
    "DEPLOYMENT_GUIDE.md",
    "GIT_DEPLOYMENT_GUIDE.md",
    "NEW_INSTANCE_SETUP.md",
    "check-ec2-status.md",
    "check-dns-and-ssl.md",
    "*.sh",               # Shell scripts (sẽ upload riêng nếu cần)
    "figma file",          # Figma files không cần trên server
    "public\uploads"      # Upload files - sẽ tạo lại trên server (78MB+)
)

# Copy files, ignoring errors for locked files
Write-Host "Copying files..." -ForegroundColor Gray
$ErrorActionPreference = "SilentlyContinue"
Copy-Item -Path . -Destination $appDir -Recurse -Force -Exclude $excludeItems -ErrorAction SilentlyContinue
$ErrorActionPreference = "Stop"

# Remove excluded items that might have been copied
Remove-Item -Path (Join-Path $appDir "node_modules") -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path (Join-Path $appDir ".next") -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path (Join-Path $appDir ".git") -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path (Join-Path $appDir ".vercel") -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path (Join-Path $appDir "public\uploads") -Recurse -Force -ErrorAction SilentlyContinue

# Show package size
$packageSize = (Get-ChildItem -Path $appDir -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host ("Package size: {0:N2} MB" -f $packageSize) -ForegroundColor Cyan

# Create archive (prefer tar.gz)
$archivePath = Join-Path $tempDir "exe-project.tar.gz"
$tarSucceeded = $false
try {
    Set-Location $tempDir
    tar -czf "exe-project.tar.gz" -C $tempDir "exe-project" 2>$null
    $tarSucceeded = $true
} catch {}

if (-not $tarSucceeded) {
    Set-Location -Path (Split-Path $PSCommandPath)
    $zipFile = Join-Path $tempDir "exe-project.zip"
    Compress-Archive -Path $appDir -DestinationPath $zipFile -Force
    $archivePath = $zipFile
}

Set-Location -Path (Split-Path $PSCommandPath)

Write-Host "Uploading to EC2..." -ForegroundColor Cyan
$remoteFile = if ($archivePath.ToLower().EndsWith('.tar.gz')) { "/tmp/exe-project.tar.gz" } else { "/tmp/exe-project.zip" }
& $scpCmd -i "$PEMPath" "$archivePath" "${EC2User}@${EC2Host}:$remoteFile"
if ($LASTEXITCODE -ne 0) { Write-Host "Upload failed!" -ForegroundColor Red; exit 1 }

Write-Host "Setting up on EC2..." -ForegroundColor Cyan

# Create deployment script on EC2 (single-quoted here-string to avoid interpolation)
$deployScript = @'
#!/bin/bash
set -e

# Update system
sudo apt update -y

# Install Node.js 18 if not installed
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
  sudo npm install -g pm2
fi

# Install nginx if not installed
if ! command -v nginx &> /dev/null; then
  sudo apt install -y nginx
fi

# Install unzip if needed
if ! command -v unzip &> /dev/null; then
  sudo apt install -y unzip
fi

# Stop the application if running
pm2 stop exe-project 2>/dev/null || true
pm2 delete exe-project 2>/dev/null || true

# Remove old deployment
rm -rf /home/ubuntu/exe-project

# Extract new deployment
cd /tmp
if [ -f "exe-project.tar.gz" ]; then
  tar -xzf exe-project.tar.gz
  mv exe-project /home/ubuntu/
elif [ -f "exe-project.zip" ]; then
  unzip -q exe-project.zip -d /tmp
  mv /tmp/exe-project /home/ubuntu/
fi

cd /home/ubuntu/exe-project

# Create uploads directories (excluded from package to reduce size)
mkdir -p public/uploads/collections
mkdir -p public/uploads/products
mkdir -p public/uploads/reviews
mkdir -p public/uploads/models

# Copy environment file if it exists
if [ -f "env.production" ]; then
  cp env.production .env.production
fi

# Install dependencies (including dev dependencies for build)
npm install --legacy-peer-deps

# Build the application on EC2 (faster than uploading .next folder)
echo "Building application..."
npm run build -- --no-lint

# Start the application with PM2
pm2 start npm --name "exe-project" -- start
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Setup Nginx
if [ -f "nginx.conf" ]; then
  sudo cp nginx.conf /etc/nginx/sites-available/exe-project
  sudo ln -sf /etc/nginx/sites-available/exe-project /etc/nginx/sites-enabled/
  sudo rm -f /etc/nginx/sites-enabled/default
  sudo nginx -t && sudo systemctl restart nginx
fi

# Clean up
rm -f /tmp/exe-project.tar.gz /tmp/exe-project.zip

echo "Application deployed successfully!"
echo "Application is running on port 3000"
'@

# Write script to temp file with Unix line endings and upload
$scriptPath = Join-Path $tempDir "deploy.sh"
# Convert to Unix line endings (LF only)
$deployScript = $deployScript -replace "`r`n", "`n" -replace "`r", "`n"
$deployScript | Out-File -FilePath $scriptPath -Encoding UTF8 -NoNewline
Add-Content -Path $scriptPath -Value "`n" -NoNewline

& $scpCmd -i "$PEMPath" "$scriptPath" "${EC2User}@${EC2Host}:/tmp/deploy.sh"
if ($LASTEXITCODE -ne 0) { Write-Host "Failed to upload remote script" -ForegroundColor Red; exit 1 }

# Execute deployment script on EC2
Write-Host "Executing deployment on EC2..." -ForegroundColor Gray

# Convert CRLF to LF on EC2 without extra packages and execute
$remoteCmd = @"
set -e
tr -d '\r' < /tmp/deploy.sh > /tmp/deploy_unix.sh || true
mv /tmp/deploy_unix.sh /tmp/deploy.sh || true
chmod +x /tmp/deploy.sh
bash /tmp/deploy.sh
"@

& $sshCmd -i "$PEMPath" "${EC2User}@${EC2Host}" "$remoteCmd"

if ($LASTEXITCODE -eq 0) {
    Write-Host ("Deployment completed successfully! App: http://{0}" -f $EC2Host) -ForegroundColor Green
    Write-Host ("Check status: ssh -i {0} {1}@{2} pm2 status" -f $PEMPath, $EC2User, $EC2Host)
} else {
    Write-Host "Deployment failed! Check the output above for errors." -ForegroundColor Red
}

# Cleanup
Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Done." -ForegroundColor Green
