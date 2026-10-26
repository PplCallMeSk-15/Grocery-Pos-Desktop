/**
 * Electron Preload Script (ContextBridge IPC Bridge)
 */

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  exportDatabaseFile: (dataString) => ipcRenderer.invoke('export-db-file', dataString),
  importDatabaseFile: () => ipcRenderer.invoke('import-db-file'),
  getStorageItem: (key) => ipcRenderer.sendSync('storage-get', key),
  setStorageItem: (key, value) => ipcRenderer.sendSync('storage-set', key, value),
  printReceipt: (options) => ipcRenderer.invoke('print-receipt', options),
  isElectron: true,
  platform: process.platform,
});

