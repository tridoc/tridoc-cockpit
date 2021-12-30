import { e } from "../domHelper.ts";

class SettingsPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }); // sets and returns 'this.shadowRoot'
    this.shadowRoot!.append(
      e("div", [
        e("h2", "Settings", { class: "not-mobile" }),
        e("div", [
          e("div", [
            "Dense View",
            e("toggle-switch", "Dense View", {
              disabled: "disabled",
            }),
          ], { class: "row" }),
        ], { class: "list" }),
      ]),
      e("link", [], { rel: "stylesheet", href: "index.css" }),
      e("link", [], { rel: "stylesheet", href: "reset.css" }),
    );
  }
}

customElements.define("settings-page", SettingsPage);
