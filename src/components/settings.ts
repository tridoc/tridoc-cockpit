import { e, icon } from "../domHelper.ts";

import type { ServerSettings } from "./server-settings.ts";

class SettingsPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }); // sets and returns 'this.shadowRoot'

    const serverSettings = document.createElement(
      "server-settings",
    ) as ServerSettings;
    serverSettings.data = {
      url: "http://localhost:8000",
      password: "pw123",
      selected: true,
    };

    this.shadowRoot!.append(
      e("div", [
        e("h2", "Settings", { class: "not-mobile heading row" }),
        e("div", [
          "Dense View",
          e("toggle-switch", "Dense View", {
            disabled: "disabled",
          }),
        ], { class: "row" }),
        e("div", [
          "Connections",
          e("button", [
            icon("mdiPlus"),
            e("div", "Add", { class: "label" }),
          ], {
            class: "action",
          }),
        ], { class: "heading row" }),
        serverSettings,
      ]),
      e("link", [], { rel: "stylesheet", href: "index.css" }),
      e("link", [], { rel: "stylesheet", href: "reset.css" }),
    );
  }
}

customElements.define("settings-page", SettingsPage);
