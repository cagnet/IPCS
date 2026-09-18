@echo off
setlocal
title IPCS - Lanceur
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Lancer-IPCS.ps1"
endlocal
