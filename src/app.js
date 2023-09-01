const fs = require("fs")
const {exec} = require("child_process")
const {app} = require("@electron/remote")
const icns = require("electron-icns-ex")
const {getMacOSApplications, getApplicationWindow, endSession} = require("../src/util.js")

const applications = getMacOSApplications()
const $search = document.getElementById("search")
const $results = document.getElementById("results")

function updateResults() {
  const query = $search.value.toLowerCase()

  // Reset the results if the query is empty.
  if (query === "") {
    setResults([])

    return
  }

  const results = applications.filter(
    application => application.toLowerCase().includes(query)
  )

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

  $result.addEventListener("dblclick", () => openResult())

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

  // Update the window's height to match the height of the results list.
  // Since the window uses transparency, this is required to prevent
  // the initial window size from being too large, and thus taking up
  // 'ghost' space on the screen where clicks will be intercepted by
  // the window, and not the application behind it.
  const appWindow = getApplicationWindow()

  appWindow.setSize(appWindow.getSize()[0], document.body.clientHeight)
}

window.onload = () => {
  // Hide the application when the window loses focus.
  // The user can always quickly summon it again using the
  // configured hotkey.
  app.on("browser-window-blur", () => endSession())

  // Fixes the issue where when the session ends while the
  // search input isn't focused (ie. one of the results is),
  // when the application is shown again, the search input
  // isn't focused.
  window.addEventListener("focus", () => $search.focus())

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
    else if (e.key === "Backspace" && !isSearchFocused) {
      $search.value = $search.value.slice(0, -1)
      $search.focus()
      updateResults()
    }
  })

  $search.addEventListener("keyup", (_event) => updateResults())
}
