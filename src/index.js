const {
  app,
  BrowserWindow,
  ipcMain,
  Menu
} = require('electron');
const path = require('path');
const {
  workFlow,
  stopProccess
} = require('./bot/main');
const {
  autoUpdater
} = require('electron-updater');
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 660,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#fff",
      symbolColor: "#198754",
    },
    icon: path.join(__dirname, './assets/traffic-3.ico'),
    webPreferences: {
      devTools: !app.isPackaged,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  app.isPackaged && Menu.setApplicationMenu(null);

  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('update_progress', progress.percent);
  });

  autoUpdater.checkForUpdatesAndNotify();
  autoUpdater.on('update-available', () => {
    updateCheckInProgress = false;
    mainWindow.webContents.send('update_available');
  });

  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
  });
};

app.on('ready', createWindow);

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

ipcMain.on("main-proccess", async (event, data) => {
  const logs = [];
  const prog = [];

  const log = (msg) => {
    logs.push(msg);
    event.sender.send("log", logs.join("\n"));
  };

  const proggress = (pros) => {
    prog.push(pros);
    event.sender.send('proggress', prog);
  };

  try {
    log("[INFO] Starting Proccess \n");
    event.sender.send("run");
    await workFlow(log, proggress, data);
    log("\n[INFO] Proccess Done ");
    event.sender.send("force");
  } catch (error) {
    log(error);
    event.sender.send("force");
  }
});

ipcMain.on('stop', (event) => {
  const logs = [];

  const log = (msg) => {
    logs.push(msg);
    event.sender.send("log", logs.join("\n"));
  };

  stopProccess(log);
  event.sender.send("force");
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', {
    version: app.getVersion()
  });
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});