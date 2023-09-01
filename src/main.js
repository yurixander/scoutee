const {app} = require("@electron/remote")
const util = require("../src/util.js")

const $search = document.getElementById("search")
const $results = document.getElementById("results")

function updateResults() {
  const query = $search.value.toLowerCase()

  // Reset the results if the query is empty.
  if (query === "") {
    renderEntries([])

    return
  }

  const filteredAppEntries = util.getMacOSAppEntries()
    .filter(entry => entry.name.toLowerCase().includes(query))

  renderEntries([filteredAppEntries, util.getAuxEntries(), util.getMetaEntries()])
}

function $createEntry(entry, tabIndex) {
  const $result = document.createElement("li")
  const $icon = document.createElement("img")
  const $name = document.createElement("span")
  const $label = document.createElement("span")

  $result.setAttribute("tabindex", tabIndex)
  $icon.setAttribute("src", entry.icon)
  $name.textContent = entry.name
  $label.textContent = entry.label
  $label.classList.add("label")
  $result.appendChild($icon)
  $result.appendChild($name)
  $result.appendChild($label)

  const invokeHandler = () => {
    entry.handler($search.value)
    util.endSession()
  }

  $result.addEventListener("dblclick", () => invokeHandler())

  $result.addEventListener("keyup", (e) => {
    if (e.key === "Enter")
      invokeHandler()
  })

  return $result
}

function $createSeparator() {
  return document.createElement("hr")
}

function transformEntries(entries) {
  return entries.map(entry => {
    return {
      ...entry,
      name: entry.name.replace("{query}", $search.value),
    }
  })
}

function renderEntries(entryGroups) {
  $results.innerHTML = ""
  let isFirstGroup = true

  for (const entryGroup of entryGroups) {
    if (entryGroup.length === 0)
      continue
    else if (!isFirstGroup)
      $results.appendChild($createSeparator())

    appendEntries(entryGroup)
    isFirstGroup = false
  }

  // TODO: Need to apply apply border radius to search bar when there are and aren't results.
  // Hide the results list completely if there are no results.
  $results.style.display = entryGroups.length > 0 ? "block" : "none"

  // Update the window's height to match the height of the results list.
  // Since the window uses transparency, this is required to prevent
  // the initial window size from being too large, and thus taking up
  // 'ghost' space on the screen where clicks will be intercepted by
  // the window, and not the application behind it.
  const appWindow = util.getApplicationWindow()

  appWindow.setSize(appWindow.getSize()[0], document.body.clientHeight)
}

function appendEntries(entries) {
  const transformedEntries = transformEntries(entries)

  for (const [index, entry] of transformedEntries.entries())
    $results.appendChild($createEntry(entry, index))
}

window.onload = () => {
  // Hide the application when the window loses focus.
  // The user can always quickly summon it again using the
  // configured hotkey.
  app.on("browser-window-blur", () => util.endSession())

  // Fixes the issue where when the session ends while the
  // search input isn't focused (ie. one of the results is),
  // when the application is shown again, the search input
  // isn't focused.
  window.addEventListener("focus", () => $search.focus())

  window.addEventListener("keyup", (e) => {
    const isSearchFocused = document.activeElement === $search
    const isPossibleHotkey = e.ctrlKey || e.metaKey || e.altKey

    if (e.key === "Escape")
      util.endSession()
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

  $search.addEventListener("keyup", (_e) => updateResults())
}
