const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

app.disableHardwareAcceleration();
console.log('Loading URL:', `file://${path.join(__dirname, 'dist/index.html')}`);

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        fullscreen: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Use preload script
            contextIsolation: true,
        },
    });

    // Load the index.html from the dist directory
    mainWindow.loadURL(`file://${path.join(__dirname, 'dist/index.html')}`);

    mainWindow.on('closed', function () {
        app.quit();
    });
}

app.on('ready', () => {
    createWindow();

    // Register a shortcut to exit fullscreen with Escape
    globalShortcut.register('Escape', () => {
        const win = BrowserWindow.getFocusedWindow();
        if (win.isFullScreen()) {
            win.setFullScreen(false);
        }
    });
});

ipcMain.on('close-window', () => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
        focusedWindow.close();
    }
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
