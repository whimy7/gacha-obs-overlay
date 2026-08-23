@echo off
title Gacha OBS Overlay
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Please install Node.js 18 or newer from https://nodejs.org/
  pause
  exit /b 1
)
if not exist node_modules echo Preparing the project for first use...
if not exist node_modules call npm install
echo.
echo The server is starting. Keep this window open while using OBS.
echo Control panel: http://127.0.0.1:3000/control
echo OBS overlay:   http://127.0.0.1:3000/overlay
echo.
call npm start
pause
