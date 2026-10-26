/**
 * Electron Main Process Entry Point for Grocery POS Desktop (.exe)
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let sqliteDb = null;

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
        webSecurity: true, // Keep Chromium's web security protections enabled.
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
    try {
      const databasePath = path.join(app.getPath('userData'), 'grocery-pos.sqlite');
      sqliteDb = new Database(databasePath);
      sqliteDb.pragma('journal_mode = WAL');
      sqliteDb.pragma('foreign_keys = ON');
      sqliteDb.exec('CREATE TABLE IF NOT EXISTS app_storage (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
    } catch (error) {
      dialog.showErrorBox('Database initialization failed', String(error));
      app.quit();
      return;
    }

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

// Synchronous key/value persistence bridge. Values are JSON strings stored in a real SQLite file.
ipcMain.on('storage-get', (event, key) => {
  try {
    if (!sqliteDb || typeof key !== 'string' || !/^grocery_pos_[a-z0-9_]+$/.test(key)) { event.returnValue = null; return; }
    const row = sqliteDb.prepare('SELECT value FROM app_storage WHERE key = ?').get(key);
    event.returnValue = row ? row.value : null;
  } catch (error) { console.error('SQLite read failed:', error); event.returnValue = null; }
});

ipcMain.on('storage-set', (event, key, value) => {
  try {
    if (!sqliteDb || typeof key !== 'string' || !/^grocery_pos_[a-z0-9_]+$/.test(key) || typeof value !== 'string') { event.returnValue = false; return; }
    sqliteDb.prepare('INSERT INTO app_storage (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP').run(key, value);
    event.returnValue = true;
  } catch (error) { console.error('SQLite write failed:', error); event.returnValue = false; }
});

// Native IPC Listeners for Desktop File Backup & Printing
app.on('before-quit', () => {
  if (sqliteDb && sqliteDb.open) sqliteDb.close();
});

ipcMain.handle('export-db-file', async (event, dataString) => {
  if (!mainWindow) return { success: false };
  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Export Grocery POS JSON Backup',
    defaultPath: `grocery_pos_backup_${new Date().toISOString().split('T')[0]}.json`,
    filters: [
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
    title: 'Import Grocery POS JSON Backup',
    properties: ['openFile'],
    filters: [
      { name: 'JSON Backup', extensions: ['json'] },
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

