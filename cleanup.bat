@echo off
echo Performing aggressive cleanup...

REM Kill all related processes
taskkill /F /IM "electron.exe" >nul 2>&1
taskkill /F /IM "Hermas Label Maker.exe" >nul 2>&1
taskkill /F /IM "HermasLabelMaker.exe" >nul 2>&1
taskkill /F /IM "app-builder.exe" >nul 2>&1
taskkill /F /IM "node.exe" >nul 2>&1

REM Wait for processes to terminate
timeout /t 5 /nobreak >nul

REM Clean directories
rd /s /q "dist" 2>nul
rd /s /q "build" 2>nul
rd /s /q "HermasLabelGenerator_v01" 2>nul
rd /s /q ".electron-builder" 2>nul
rd /s /q "node_modules\.cache" 2>nul

REM Remove temp files
del /f /q "*.log" 2>nul
del /f /q "*.spec.failed" 2>nul
