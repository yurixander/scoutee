const fs = require("fs")
const path = require("path")
const {BrowserWindow} = require("@electron/remote")
const icns = require("electron-icns-ex")
const {exec} = require("child_process")

function getApplicationWindow() {
  // FIXME: Find a method to get the main window without using `getAllWindows`.
  return BrowserWindow.getAllWindows()[0]
}

function endSession() {
  $search.value = ""
  setResults([])
  app.hide()
}

function getMacOSAppEntries() {
  const applicationFolderContents = fs.readdirSync("/Applications")
  const MACOS_APP_EXTENSION = ".app"

  const getAppIcon = (appName) => {
    const appResourcesPath = `/Applications/${appName}${MACOS_APP_EXTENSION}/Contents/Resources`

    const firstIcon = fs.readdirSync(appResourcesPath)
      .find(file => file.endsWith(".icns"))

    const iconPath = `${appResourcesPath}/${firstIcon}`

    return icns.parseIcnsToBase64Sync(iconPath)
  }

  return applicationFolderContents
    .filter(application => application.endsWith(MACOS_APP_EXTENSION))
    .map(application => {
      const appName = path.basename(application, MACOS_APP_EXTENSION)

      return {
        name: appName,
        label: "macOS application (.app)",
        icon: getAppIcon(appName),
        handler: (_query) => exec(`open -a "${appName}"`)
      }
    })
}

function getAuxEntries() {
  return []
}

function getMetaEntries() {
  return [{
    name: "{query}",
    label: "Search the web with DuckDuckGo",
    icon: "https://duckduckgo.com/favicon.ico",
    // TODO: Open a browser window with the query.
    handler: (query) => exec(`open "https://duckduckgo.com/?q=${query}"`)
  }]
}

module.exports = {
  getMacOSAppEntries,
  getAuxEntries,
  getMetaEntries,
  getApplicationWindow,
  endSession
}
