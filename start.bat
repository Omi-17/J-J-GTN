@echo off
title Anaplan Project Hub
cd /d "%~dp0"
echo Starting Anaplan Project Hub...
start "" http://localhost:4173
node server.js
pause
