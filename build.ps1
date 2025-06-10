Write-Host "Cleaning up previous builds..."
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "HermasLabelGenerator_v01" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Building Electron app..."
npm install

Write-Host "Building standalone backend with PyInstaller..."
pyinstaller HermasLabelMaker.spec

Write-Host "Moving backend executable..."
if (-not (Test-Path "dist\HermasLabelMaker")) {
    New-Item -ItemType Directory -Path "dist\HermasLabelMaker" -Force
}
Move-Item -Path "dist\HermasLabelMaker\HermasLabelMaker.exe" -Destination "dist\HermasLabelMaker\" -Force

Write-Host "Building the installer..."
npm run build

Write-Host "Done!"
pause
