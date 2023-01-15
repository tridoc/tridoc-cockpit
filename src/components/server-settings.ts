import { e, icon } from "../domHelper.ts";

type data = {
  url?: string;
  password?: string;
  color?: string;
  selected?: boolean;
};

export class ServerSettings extends HTMLElement {
  #ref: {
    checkedInput: HTMLInputElement;
    container: HTMLDivElement;
    nameIndicator: HTMLDivElement;
  };

  colors = ["#123123", "#ffffff", "#456456", "#fff000"];

  #data: data = {
    url: "",
    password: "",
    color: undefined,
    selected: false,
  };

  #dataHandler: ProxyHandler<data> = {
    // deno-lint-ignore no-explicit-any
    get(target: ServerSettings, prop: PropertyKey, receiver?: any) {
      target.updateData();
      return Reflect.get(target.#data, prop, receiver);
    },
  };

  data: data = new Proxy(this, this.#dataHandler);

  constructor() {
    super();
    this.attachShadow({ mode: "open" }); // sets and returns 'this.shadowRoot'

    const checkedInput = e("input", [], {
      type: "checkbox",
      class: "fill",
    }) as HTMLInputElement;

    const nameIndicator = e("div") as HTMLDivElement;

    const collapsedBar = e("div", [
      checkedInput,
      e("div", [
        icon("mdiShieldAlertOutline"),
        nameIndicator,
      ], { class: "row minimal" }),
      icon("mdiPencilOutline"),
    ], { class: "row colored" });

    this.#ref = {
      checkedInput,
      container: e("div", [collapsedBar], {
        id: "container",
      }) as HTMLDivElement,
      nameIndicator,
    };

    this.shadowRoot!.append(
      this.#ref.container,
      e("link", [], { rel: "stylesheet", href: "index.css" }),
      e("link", [], { rel: "stylesheet", href: "reset.css" }),
      e(
        "style",
        `.colored {
          background: var(--secondary-container);
          border-radius: 6px;
          color: var(--secondary-container-text);
          /* margin: 4px 0; */
          padding: 6px;
        }

        #container {
          width: 100%;
        }

        input.fill {
          border-right: 1px solid var(--surface);
          border-radius: 6px 0 0 6px;
          height: 36px;
          width: 36px;
          margin: -6px 6px -6px -6px;
        }`,
      ),
    );
  }

  updateData() {
    console.log(this.data);
    this.#ref.checkedInput.checked = !!this.data.selected;
    this.#ref.nameIndicator.innerText = this.data.url!.replace(
      /^https?:\/\//,
      "",
    );
    this.changeColors();
  }

  changeColors() {
    this.colors = [
      this.data.color ?? "123123",
      "#ffffff",
      "#456456",
      "#fff000",
    ];
    this.#ref.container.setAttribute(
      "style",
      `--secondary: ${this.colors[0]};
      --secondary-text: ${this.colors[1]};
      --secondary-container: ${this.colors[2]};
      --secondary-container-text: ${this.colors[3]};`,
    );
  }
}

customElements.define("server-settings", ServerSettings);
