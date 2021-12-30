class SettingsPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }); // sets and returns 'this.shadowRoot'
    const content = document.createElement("div");
    content.textContent = `Hi!`;
    this.shadowRoot!.append(content);
  }
}

customElements.define("settings-page", SettingsPage);
