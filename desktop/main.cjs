const { app, BrowserWindow, shell } = require('electron');
const path = require('node:path');

const gameFile = path.join(__dirname, '..', 'index.html');

function createGameWindow() {
  const window = new BrowserWindow({
    title: '火柴人魔法亂鬥',
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0b0e1d',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', (event, url) => {
    if (url !== window.webContents.getURL()) {
      event.preventDefault();
      if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    }
  });
  window.loadFile(gameFile);
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.ninjaplay.desktop');
  createGameWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createGameWindow();
  });
});

app.on('window-all-closed', () => app.quit());
