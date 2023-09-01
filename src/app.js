const fs = require("fs")
const path = require("path")
const {exec} = require("child_process")
const icns = require("electron-icns-ex")
const {app} = require("@electron/remote")

const applications = getMacOSApplications()
const $search = document.getElementById("search")
const $results = document.getElementById("results")

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

function updateResults() {
  const query = $search.value.toLowerCase()

  // Reset the results if the query is empty.
  if (query === "") {
    setResults([])

    return
  }

  const results = applications.filter(application => application.toLowerCase().includes(query))

  setResults(results)
}

function createApplicationEntry(name, tabIndex) {
  const $result = document.createElement("li")
  const $icon = document.createElement("img")
  const $name = document.createElement("span")
  const $label = document.createElement("span")
  const appResourcesPath = `/Applications/${name}.app/Contents/Resources`

  const firstIcon = fs.readdirSync(appResourcesPath)
    .find(file => file.endsWith(".icns"))

  const iconPath = `${appResourcesPath}/${firstIcon}`
  const iconBase64 = icns.parseIcnsToBase64Sync(iconPath)

  $result.setAttribute("tabindex", tabIndex)
  $icon.setAttribute("src", iconBase64)
  $name.textContent = name
  $label.textContent = "macOS application (.app)"
  $label.classList.add("label")
  $result.appendChild($icon)
  $result.appendChild($name)
  $result.appendChild($label)

  const openResult = () => {
    exec(`open -a "${name}"`)
    endSession()
  }

  $result.addEventListener("click", () => openResult())

  $result.addEventListener("keyup", (e) => {
    if (e.key === "Enter")
      openResult()
  })

  return $result
}

function setResults(results) {
  $results.innerHTML = ""

  for (const [index, result] of results.entries())
    $results.appendChild(createApplicationEntry(result, index))

  // TODO: Need to apply apply border radius to search bar when there are and aren't results.
  // Hide the results list completely if there are no results.
  $results.style.display = results.length > 0 ? "block" : "none"
}

window.onload = () => {
  window.addEventListener("keyup", (e) => {
    const isSearchFocused = document.activeElement === $search
    const isPossibleHotkey = e.ctrlKey || e.metaKey || e.altKey

    if (e.key === "Escape")
      endSession()
    // If the key is alphanumeric, focus the search input,
    // and append the key to its value.
    else if (!isSearchFocused && !isPossibleHotkey && e.key.match(/^[a-z0-9]$/i)) {
      $search.value += e.key
      $search.focus()
      updateResults()
    }
  })

  $search.addEventListener("keyup", (_event) => updateResults())
}
