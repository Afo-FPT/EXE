# Script dọn dẹp folder .next và node_modules
# Chạy script này khi cần giảm kích thước dự án

Write-Host "🧹 Bắt đầu dọn dẹp folders..." -ForegroundColor Green

# Dừng các process Node.js đang chạy
Write-Host "⏹️ Dừng các process Node.js..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*next*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Kiểm tra kích thước trước khi dọn dẹp
if (Test-Path '.next') {
    $nextSizeBefore = (Get-ChildItem -Path '.next' -Recurse | Where-Object {!$_.PSIsContainer} | Measure-Object Length -Sum).Sum
    Write-Host "📊 Kích thước .next trước dọn dẹp: $([math]::Round($nextSizeBefore/1MB,2)) MB" -ForegroundColor Cyan
}

if (Test-Path 'node_modules') {
    $nodeSizeBefore = (Get-ChildItem -Path 'node_modules' -Recurse | Where-Object {!$_.PSIsContainer} | Measure-Object Length -Sum).Sum
    Write-Host "📊 Kích thước node_modules trước dọn dẹp: $([math]::Round($nodeSizeBefore/1MB,2)) MB" -ForegroundColor Cyan
}

# Dọn dẹp folder .next
Write-Host "🗑️ Xóa folder .next..." -ForegroundColor Yellow
Remove-Item -Path '.next' -Recurse -Force -ErrorAction SilentlyContinue

# Dọn dẹp node_modules (chỉ xóa file không cần thiết)
Write-Host "🧹 Dọn dẹp node_modules..." -ForegroundColor Yellow

# Xóa documentation files
Get-ChildItem -Path 'node_modules' -Recurse -Include '*.md', '*.txt', '*.markdown', 'CHANGELOG*', 'LICENSE*', 'README*' | Remove-Item -Force -ErrorAction SilentlyContinue

# Xóa test folders
Get-ChildItem -Path 'node_modules' -Recurse -Include 'test', 'tests', '__tests__', 'spec', 'specs' -Directory | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# Xóa source maps
Get-ChildItem -Path 'node_modules' -Recurse -Include '*.map' | Remove-Item -Force -ErrorAction SilentlyContinue

# Xóa TypeScript source files (giữ lại .d.ts)
Get-ChildItem -Path 'node_modules' -Recurse -Include '*.ts' | Where-Object {$_.Name -notlike '*.d.ts'} | Remove-Item -Force -ErrorAction SilentlyContinue

# Xóa example folders
Get-ChildItem -Path 'node_modules' -Recurse -Include 'examples', 'example', 'demo', 'demos' -Directory | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

# Chạy npm prune
Write-Host "🔧 Chạy npm prune..." -ForegroundColor Yellow
npm prune --silent

# Kiểm tra kích thước sau khi dọn dẹp
Write-Host "📊 Kết quả sau dọn dẹp:" -ForegroundColor Green

if (Test-Path '.next') {
    $nextSizeAfter = (Get-ChildItem -Path '.next' -Recurse | Where-Object {!$_.PSIsContainer} | Measure-Object Length -Sum).Sum
    Write-Host "✅ .next: $([math]::Round($nextSizeAfter/1MB,2)) MB" -ForegroundColor Green
} else {
    Write-Host "✅ .next: 0 MB (đã xóa)" -ForegroundColor Green
}

if (Test-Path 'node_modules') {
    $nodeSizeAfter = (Get-ChildItem -Path 'node_modules' -Recurse | Where-Object {!$_.PSIsContainer} | Measure-Object Length -Sum).Sum
    $saved = $nodeSizeBefore - $nodeSizeAfter
    Write-Host "✅ node_modules: $([math]::Round($nodeSizeAfter/1MB,2)) MB (tiết kiệm $([math]::Round($saved/1MB,2)) MB)" -ForegroundColor Green
}

Write-Host "🎉 Dọn dẹp hoàn thành!" -ForegroundColor Green
Write-Host "💡 Lưu ý: Folder .next sẽ được tái tạo khi chạy 'npm run dev' hoặc 'npm run build'" -ForegroundColor Yellow
