const fs = require("fs")
const path = require("path")
const {BrowserWindow} = require("@electron/remote")

function getApplicationWindow() {
  // FIXME: Find a method to get the main window without using `getAllWindows`.
  return BrowserWindow.getAllWindows()[0]
}

function endSession() {
  $search.value = ""
  setResults([])
  app.hide()
}

function getMacOSApplications() {
  const applicationFolderContents = fs.readdirSync("/Applications")

  return applicationFolderContents
    .filter(application => application.endsWith(".app"))
    .map(application => path.basename(application, ".app"))
}

module.exports = {
  getMacOSApplications,
  getApplicationWindow,
  endSession
}
