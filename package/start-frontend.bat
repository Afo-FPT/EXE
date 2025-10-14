@echo off
echo 🚀 Starting EXE Project Frontend...
echo.
echo 📁 Current directory: %CD%
echo.
echo 📦 Installing dependencies...
call npm install
echo.
echo 🚀 Starting Next.js development server...
call npm run dev
echo.
pause

