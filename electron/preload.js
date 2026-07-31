/**
 * Electron Preload Script (ContextBridge IPC Bridge)
 */

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  exportDatabaseFile: (dataString) => ipcRenderer.invoke('export-db-file', dataString),
  importDatabaseFile: () => ipcRenderer.invoke('import-db-file'),
  printReceipt: (options) => ipcRenderer.invoke('print-receipt', options),
  isElectron: true,
  platform: process.platform,
});

