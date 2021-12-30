import Server from "https://tridoc.me/tridoc-frontend/src/server.ts";

import "./components/settings.ts";
import "./components/switch.ts";

const HCServer = new Server("http://127.0.0.1:8000", "tridoc", "pw123");

HCServer.getDocuments().then(console.log);

// ELEMENTS

const filtersSheet = document.getElementById("filters")!;
const filtersButton = document.getElementById("filters-button")!;
const filtersCloseButton = document.getElementById("filters-close-button")!;
const settingsSheet = document.getElementById("settings")!;
const settingsButton = document.getElementById("settings-button")!;
const settingsCloseButton = document.getElementById("settings-close-button")!;

// OPEN/CLOSE FILTERS

filtersButton.addEventListener("click", (_) => {
  filtersSheet.classList.toggle("closed");
  settingsSheet.classList.add("closed");
});
filtersCloseButton.addEventListener("click", (_) => {
  filtersSheet.classList.add("closed");
  settingsSheet.classList.add("closed");
});

// OPEN/CLOSE SETTINGS
settingsButton.addEventListener("click", (_) => {
  filtersSheet.classList.add("closed");
  settingsSheet.classList.toggle("closed");
});
settingsCloseButton.addEventListener("click", (_) => {
  filtersSheet.classList.add("closed");
  settingsSheet.classList.add("closed");
});
