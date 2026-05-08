const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

const SERVER_PORT = 18432;
let serverProcess = null;
let mainWindow = null;

function getServerPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "server", "index.mjs");
  }
  return path.join(__dirname, "..", "artifacts", "api-server", "dist", "index.mjs");
}

function getFrontendPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "public");
  }
  return path.join(__dirname, "..", "artifacts", "minecraft-bot", "dist", "public");
}

function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = getServerPath();

    serverProcess = spawn(process.execPath, [serverPath], {
      env: {
        ...process.env,
        PORT: String(SERVER_PORT),
        BASE_PATH: "/",
        NODE_ENV: "production",
        DATABASE_URL: process.env.DATABASE_URL || `sqlite:${path.join(app.getPath("userData"), "minecraft-bot.db")}`,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    serverProcess.stdout.on("data", (data) => {
      console.log("[server]", data.toString().trim());
    });

    serverProcess.stderr.on("data", (data) => {
      console.error("[server error]", data.toString().trim());
    });

    serverProcess.on("error", reject);
    serverProcess.on("exit", (code) => {
      console.log(`Server exited with code ${code}`);
    });

    // Poll until server is ready
    let attempts = 0;
    const maxAttempts = 60;
    const interval = setInterval(() => {
      attempts++;
      http.get(`http://localhost:${SERVER_PORT}/api/healthz`, (res) => {
        if (res.statusCode === 200) {
          clearInterval(interval);
          resolve();
        }
      }).on("error", () => {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error("Server did not start in time"));
        }
      });
    }, 500);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "MC Bot Manager",
    backgroundColor: "#0a0a0f",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    frame: true,
    show: false,
    icon: path.join(__dirname, "assets", "icon.png"),
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // In packaged mode serve frontend from the server
  mainWindow.loadURL(`http://localhost:${SERVER_PORT}/`);

  // Open external links in default browser, not in Electron window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    console.log("Starting backend server...");
    await startServer();
    console.log("Server ready, opening window");
    createWindow();
  } catch (err) {
    console.error("Failed to start server:", err);
    app.quit();
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});

ipcMain.handle("get-app-version", () => app.getVersion());
ipcMain.handle("get-platform", () => process.platform);
