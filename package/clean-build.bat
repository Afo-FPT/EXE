@echo off
echo Cleaning build artifacts...
if exist ".next" (
    echo Removing .next folder...
    rmdir /s /q .next
)
if exist "node_modules\.cache" (
    echo Removing node_modules cache...
    rmdir /s /q "node_modules\.cache"
)
echo Done! You can now try building again.

