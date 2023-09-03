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

  // TODO: Need to access `main.js`'s `renderEntries` function, but simply importing it would cause a circular dependency problem.
  console.log("Clearing results is not yet implemented")

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
  return [
    {
      name: "Shutdown",
      label: "Shutdown the computer",
      icon: "https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/eaebd9208547ca9316da47f98b0ddf12_CuaBNbopgF.png",
      handler: (_query) => exec("shutdown now")
    }
  ]
}

function getMetaEntries() {
  return [
    {
      name: "Web search for {query}",
      label: "Search the web with DuckDuckGo",
      icon: "https://duckduckgo.com/favicon.ico",
      // TODO: Open a browser window with the query.
      handler: (query) => exec(`open "https://duckduckgo.com/?q=${query}"`)
    },
    {
      name: "Run {query}",
      label: "Execute a command in the terminal",
      icon: "https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/6b14ea01f5623788cd2828d59755425f_4M3jQW9cFG.png",
      handler: (query) => exec(query)
    }
  ]
}

module.exports = {
  getMacOSAppEntries,
  getAuxEntries,
  getMetaEntries,
  getApplicationWindow,
  endSession
}
