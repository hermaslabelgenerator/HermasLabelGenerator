@echo off
setlocal enabledelayedexpansion

REM Run cleanup
call cleanup.bat
timeout /t 2 /nobreak >nul

REM Set build environment
set ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true
set CSC_IDENTITY_AUTO_DISCOVERY=false
set NODE_ENV=production

echo Installing dependencies...
call npm install
python -m pip install -r requirements.txt
python -m pip install -r build_requirements.txt

echo Installing dependencies...
python -m pip install svglib
python -m pip install -r requirements.txt
python -m pip install -r build_requirements.txt
call npm install

echo Building Python executable...
python -m PyInstaller --noconfirm HermasLabelMaker.spec
timeout /t 5 /nobreak >nul

echo Building Electron app...
npx electron-builder --win portable --config.appId=com.hermas.labelmaker --config.productName="Hermas Label Maker" --config.asar=true --config.win.target=portable --config.win.icon=./static/Project-Hermas-logo.ico --config.npmRebuild=false --config.buildDependenciesFromSource=false

echo Building Electron app...
set ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true
call .\node_modules\.bin\electron-builder --win portable --config.win.signAndEditExecutable=false

echo Moving files to output folder...
if not exist "HermasLabelGenerator_v01" mkdir "HermasLabelGenerator_v01"
xcopy /s /y "dist\win-unpacked\*" "HermasLabelGenerator_v01\" >nul
move /y "dist\*.exe" "HermasLabelGenerator_v01\" >nul 2>nul

echo Done! Check the HermasLabelGenerator_v01 folder.
pause
