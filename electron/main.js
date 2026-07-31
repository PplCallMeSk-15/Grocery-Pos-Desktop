/**
 * Electron Main Process Entry Point for Grocery POS Desktop (.exe)
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

// Ensure single instance lock for desktop application
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    const iconPath = path.join(__dirname, '../assets/icon.ico');
    const hasIcon = fs.existsSync(iconPath);

    mainWindow = new BrowserWindow({
      width: 1366,
      height: 768,
      minWidth: 1024,
      minHeight: 600,
      title: 'Grocery POS & Inventory Software',
      icon: hasIcon ? iconPath : undefined,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false, // Allow local file loading smoothly in production
      },
      autoHideMenuBar: true,
    });

    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      mainWindow.loadURL('http://localhost:3000');
    } else {
      const indexPath = path.join(__dirname, '../dist/index.html');
      mainWindow.loadFile(indexPath);
    }

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

// Native IPC Listeners for Desktop File Backup & Printing
ipcMain.handle('export-db-file', async (event, dataString) => {
  if (!mainWindow) return { success: false };
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Grocery Database Backup',
    defaultPath: `grocery_pos_backup_${new Date().toISOString().split('T')[0]}.sqlite`,
    filters: [
      { name: 'SQLite Database', extensions: ['sqlite', 'db'] },
      { name: 'JSON Backup', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (filePath) {
    fs.writeFileSync(filePath, dataString, 'utf-8');
    return { success: true, filePath };
  }
  return { success: false };
});

ipcMain.handle('import-db-file', async () => {
  if (!mainWindow) return { success: false };
  const { filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Grocery Database Backup',
    properties: ['openFile'],
    filters: [
      { name: 'Database & Backup', extensions: ['sqlite', 'db', 'json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (filePaths && filePaths.length > 0) {
    const content = fs.readFileSync(filePaths[0], 'utf-8');
    return { success: true, content, filePath: filePaths[0] };
  }
  return { success: false };
});

ipcMain.handle('print-receipt', async (event, options = {}) => {
  if (!mainWindow) return { success: false };
  return new Promise((resolve) => {
    mainWindow.webContents.print(
      {
        silent: options.silent || false,
        printBackground: true,
        deviceName: options.deviceName || '',
      },
      (success, failureReason) => {
        resolve({ success, failureReason });
      }
    );
  });
});

