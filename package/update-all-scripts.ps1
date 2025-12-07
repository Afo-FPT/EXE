# Script to update all EC2 scripts with new IP and PEM
$oldIP = "47.130.211.9"
$newIP = "47.130.211.9"
$oldPEM = "EXE1.pem"
$newPEM = "EXE1.pem"
$oldPEMPath = "D:\\FPTU\\exe\\EXE1.pem"
$newPEMPath = "D:\\FPTU\\exe\\EXE1.pem"

$files = Get-ChildItem -Path . -Include *.bat,*.ps1,*.md -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $updated = $content -replace [regex]::Escape($oldIP), $newIP
        $updated = $updated -replace [regex]::Escape($oldPEM), $newPEM
        $updated = $updated -replace [regex]::Escape($oldPEMPath), $newPEMPath
        if ($updated -ne $content) {
            Set-Content -Path $file.FullName -Value $updated -NoNewline
            Write-Host "Updated: $($file.Name)" -ForegroundColor Green
        }
    }
}

Write-Host "All scripts updated!" -ForegroundColor Cyan

