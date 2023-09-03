const {app, screen, globalShortcut, BrowserWindow} = require("electron")
const remote = require("@electron/remote/main")

const config = {
  globalSummonHotkey: "Shift+Space"
}

function createWindow() {
  const window = new BrowserWindow({
    width: 600,
    height: 500,
    resizable: false,
    transparent: true,
    skipTaskbar: true,
    movable: false,
    frame: false,
    alwaysOnTop: true,
    show: false,
    backgroundMaterial: "acrylic",
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
  window.loadFile("windows/main.html").then(() =>
    globalShortcut.register(config.globalSummonHotkey, () => {
      const cursorScreenPoint = screen.getCursorScreenPoint()
      const activeDisplay = screen.getDisplayNearestPoint(cursorScreenPoint)

      // Set the window's position to the top-left corner of the
      // active display, and then center it. This will ensure that
      // the application is always shown on the active display.
      window.setPosition(activeDisplay.bounds.x, activeDisplay.bounds.y)
      window.center()
      window.show()
    })
  )
}

app.whenReady().then(() => createWindow())
