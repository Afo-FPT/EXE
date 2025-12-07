# Fix PEM key permissions for SSH
$pemPath = "D:\FPTU\exe\EXE1.pem"

Write-Host "Fixing PEM key permissions..." -ForegroundColor Cyan

if (-not (Test-Path $pemPath)) {
    Write-Host "PEM file not found at: $pemPath" -ForegroundColor Red
    exit 1
}

# Remove inheritance and set permissions
$acl = Get-Acl $pemPath
$acl.SetAccessRuleProtection($true, $false)

# Remove all access rules
$acl.Access | ForEach-Object { $acl.RemoveAccessRule($_) | Out-Null }

# Add access rule for current user only
$currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$permission = $currentUser, "Read", "Allow"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
$acl.SetAccessRule($accessRule)

# Apply the ACL
Set-Acl -Path $pemPath -AclObject $acl

Write-Host "PEM key permissions fixed!" -ForegroundColor Green
Write-Host "File: $pemPath" -ForegroundColor Gray
Write-Host "Owner: $currentUser" -ForegroundColor Gray
