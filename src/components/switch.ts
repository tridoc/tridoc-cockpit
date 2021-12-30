import { e } from "../domHelper.ts";

class ToggleSwitch extends HTMLButtonElement {
  #button: HTMLButtonElement;

  constructor() {
    super();
    this.attachShadow({ mode: "open" }); // sets and returns 'this.shadowRoot'
    this.#button = e("button", [], {
      role: "switch",
      disabled: this.getAttribute("disabled") || undefined,
      "aria-checked": this.getAttribute("aria-checked") || "false",
      "aria-label": this.slot,
    }) as HTMLButtonElement;

    this.#button.addEventListener("click", (_) => {
      if (this.#button.getAttribute("aria-checked") === "true") {
        this.#button.setAttribute("aria-checked", "false");
      } else {
        this.#button.setAttribute("aria-checked", "true");
      }
    });

    this.shadowRoot!.append(
      this.#button,
      e("link", [], { rel: "stylesheet", href: "reset.css" }),
      e(
        "style",
        `[role="switch"] {
        border-radius: 12px;
        border: none;
        display: grid;
        height: 24px;
        gap: 11px;
        grid: "I O" / 1fr 1fr;
        /* margin: 4px; */
        padding: 6px;
        width: 48px;
      }
      
      [role="switch"]:focus-visible {
        outline: 2px solid var(--secondary);
        outline-offset: 2px;
      }
      
      [role="switch"]::before {
        content: '';
        border-radius: 6px;
      }
      
      [role="switch"][aria-checked="false"] {
        background: var(--secondary-container);
      }
      
      [role="switch"][aria-checked="false"]::before {
        background: var(--secondary-container-text);
        box-shadow: 0px 1px 4px -1px #888888;
        display: block;
      }
      
      [role="switch"][aria-checked="true"] {
        background: var(--secondary-container-text);
      }
      
      [role="switch"][aria-checked="true"]::before {
        background: var(--secondary-container);
        box-shadow: 0px 1px 4px -1px #888888;
        display: block;
        grid-area: 1 / 2;
      }
      
      [role="switch"][disabled] {
        background: var(--surface-container);
        border: 1px dotted var(--surface-container-text);
        padding: 5px;
      }
      
      [role="switch"][disabled]::before {
        background: var(--surface-container-text);
        box-shadow: 0px 1px 4px -1px #888888;
        display: block;
      }`,
      ),
    );
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    console.log("Custom square element attributes changed.");
    this.#button.setAttribute(name, newValue);
  }
}

customElements.define("toggle-switch", ToggleSwitch, { extends: "button" });
