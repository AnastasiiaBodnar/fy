const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const moduleAlias = require('module-alias');

moduleAlias.addAliases({
  '@workua/core': path.join(__dirname, '../../packages/core/index.js'),
  '@workua/store': path.join(__dirname, '../../packages/store/index.js'),
  '@workua/api': path.join(__dirname, '../../packages/api/index.js'),
  '@workua/utils': path.join(__dirname, '../../packages/utils/index.js'),
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    resizable: true,
    backgroundColor: '#f5f7fa',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const { WorkUaParser } = require('@workua/core');
const axios = require('axios');

ipcMain.handle('fetch-jobs', async () => {
  try {
    const parser = new WorkUaParser();
    const response = await axios.get('https://www.work.ua/jobs-react/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = response.data;
    const jobs = parser.parseVacancyList(html);
    return { success: true, jobs };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fetch-job-details', async (event, url) => {
  try {
    const parser = new WorkUaParser();
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = response.data;
    const details = parser.parseVacancyDetails(html);
    return { success: true, details };
  } catch (error) {
    console.error('Error fetching job details:', error);
    return { success: false, error: error.message };
  }
});