const {
  app,
  BrowserWindow,
  ipcMain
} = require('electron');
const path = require('path');
const {
  workFlow,
  stopProccess
} = require('./bot/main');

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
    webPreferences: {
      devTools: !app.isPackaged,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  app.isPackaged && Menu.setApplicationMenu(null);
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