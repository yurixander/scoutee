const {app, globalShortcut, BrowserWindow} = require("electron")
const remote = require("@electron/remote/main")

const GLOBAL_SUMMON_HOTKEY = "CommandOrControl+X"

function createWindow() {
  const window = new BrowserWindow({
    width: 700,
    height: 500,
    resizable: false,
    transparent: true,
    skipTaskbar: true,
    movable: false,
    frame: false,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  })

  remote.initialize()
  remote.enable(window.webContents)

  // Exit the application when the user tries to open a second
  // instance of it.
  app.addListener("second-instance", () => app.exit())

  // After the index file's content has been loaded, register the
  // global shortcut which allows the user to summon the application.
  window.loadFile("index.html").then(() =>
    globalShortcut.register(GLOBAL_SUMMON_HOTKEY, () => window.show())
  )
}

app.whenReady().then(() => createWindow())
