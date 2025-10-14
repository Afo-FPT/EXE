# EXE Project Backend Startup Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting EXE Project Backend..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if port 5000 is already in use
$portInUse = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️  Warning: Port 5000 is already in use" -ForegroundColor Yellow
    Write-Host "Please stop any application using port 5000" -ForegroundColor Yellow
    Write-Host ""
}

# Set environment variables
$env:PORT = "5000"
$env:DB_URI = "mongodb://localhost:27017/exe_project"
$env:JWT_SECRET = "exe_project_secret_key_2024"
$env:FRONTEND_URL = "http://localhost:3000"

Write-Host "🔧 Environment variables set:" -ForegroundColor Blue
Write-Host "   PORT=$env:PORT" -ForegroundColor White
Write-Host "   DB_URI=$env:DB_URI" -ForegroundColor White
Write-Host "   JWT_SECRET=$env:JWT_SECRET" -ForegroundColor White
Write-Host "   FRONTEND_URL=$env:FRONTEND_URL" -ForegroundColor White
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Blue
    @"
PORT=5000
DB_URI=mongodb://localhost:27017/exe_project
JWT_SECRET=exe_project_secret_key_2024
FRONTEND_URL=http://localhost:3000
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host ""
}

# Start the backend server
Write-Host "🚀 Starting Express server on port $env:PORT..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Server will be available at:" -ForegroundColor Blue
Write-Host "   http://localhost:$env:PORT" -ForegroundColor White
Write-Host "   http://localhost:$env:PORT/health" -ForegroundColor White
Write-Host "   http://localhost:$env:PORT/api/health" -ForegroundColor White
Write-Host "   http://localhost:$env:PORT/api/banners/active" -ForegroundColor White
Write-Host "   http://localhost:$env:PORT/api/mystery-box/*" -ForegroundColor White
Write-Host ""

# Start the server
node --experimental-modules server.js
