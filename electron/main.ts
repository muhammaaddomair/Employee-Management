import 'dotenv/config';
import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { initDatabase } from '../database';
import { registerEmployeeIpcHandlers } from './ipc/employees.ipc';
import { registerPayslipIpcHandlers } from './ipc/payslip.ipc';

const isDev = process.argv.includes('--dev');

const createMainWindow = (): void => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#f1f5f9',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../../dist-renderer/index.html'));
  }
};

app.whenReady().then(() => {
  const dbPath = path.join(app.getPath('userData'), 'payroll.db');
  initDatabase(dbPath);
  registerEmployeeIpcHandlers();
  registerPayslipIpcHandlers();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

