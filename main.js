const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let flaskProcess = null;
let mainWindow = null;

function getBackendExePath() {
  // If running packaged, __dirname points to the asar-unpacked directory
  let exePath = path.join(process.resourcesPath, 'app', 'dist', 'HermasLabelMaker', 'HermasLabelMaker.exe');
  // For development, fallback to local path
  if (!require('fs').existsSync(exePath)) {
    exePath = path.join(__dirname, 'dist', 'HermasLabelMaker', 'HermasLabelMaker.exe');
  }
  return exePath;
}

function getBackendCwd() {
  let cwd = path.join(process.resourcesPath, 'app', 'dist', 'HermasLabelMaker');
  if (!require('fs').existsSync(cwd)) {
    cwd = path.join(__dirname, 'dist', 'HermasLabelMaker');
  }
  return cwd;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    icon: path.join(__dirname, 'static', 'Project-Hermas-logo.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadURL('http://localhost:8000');

  // Exit fullscreen on ESC
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'Escape' && mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
      event.preventDefault();
    }
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
    if (flaskProcess) flaskProcess.kill();
  });
}

app.whenReady().then(() => {
  // Start the backend exe (built with PyInstaller)
  flaskProcess = spawn(
    getBackendExePath(),
    [],
    { cwd: getBackendCwd() }
  );

  flaskProcess.stdout && flaskProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });
  flaskProcess.stderr && flaskProcess.stderr.on('data', (data) => {
    console.error(`Backend error: ${data}`);
  });

  setTimeout(createWindow, 1500);
});

app.on('window-all-closed', function () {
  if (flaskProcess) flaskProcess.kill();
  app.quit();
});
