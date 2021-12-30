import { e, icon, ICONS } from "../domHelper.ts";

class SettingsPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }); // sets and returns 'this.shadowRoot'
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
            icon(ICONS.mdiPlus),
            e("div", "Add", { class: "label" }),
          ], {
            class: "action",
          } /* TODO: Icon-Button here please */),
        ], { class: "heading row" }),
      ]),
      e("link", [], { rel: "stylesheet", href: "index.css" }),
      e("link", [], { rel: "stylesheet", href: "reset.css" }),
    );
  }
}

customElements.define("settings-page", SettingsPage);
