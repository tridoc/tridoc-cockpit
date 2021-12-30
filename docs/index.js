class Server {
    url;
    headers;
    postHeaders;
    constructor(url, username, password){
        if (url.startsWith("http")) {
            this.url = url;
        } else {
            this.url = "https://" + url;
        }
        this.headers = new Headers();
        this.headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));
        this.postHeaders = new Headers();
        this.postHeaders.set('Authorization', this.headers.get('Authorization'));
        this.postHeaders.set('Content-Type', 'application/json');
    }
    addComment(id, content) {
        let body = {
            'text': content
        };
        return fetch(this.url + "/doc/" + id + "/comment", {
            method: "POST",
            headers: this.postHeaders,
            body: JSON.stringify(body)
        }).then((r)=>r.json()
        );
    }
    addTag(id, label, type, value) {
        let body = {
            'label': label
        };
        if (type && value) {
            body.parameter = {
                "type": "http://www.w3.org/2001/XMLSchema#" + type,
                "value": value
            };
        }
        return fetch(this.url + "/doc/" + id + "/tag", {
            method: "POST",
            headers: this.postHeaders,
            body: JSON.stringify(body)
        }).then((r)=>r.json()
        );
    }
    countDocuments(query = '', tags = [], notTags = []) {
        let params = new URLSearchParams();
        params.append('text', query);
        tags.forEach((t)=>{
            if (Array.isArray(t)) {
                const min = t[1] ? t[1].toString() : '';
                const max = t[2] ? t[2].toString() : '';
                params.append('tag', `${t[0]};${min};${max}`);
            } else {
                params.append('tag', t);
            }
        });
        notTags.forEach((t)=>{
            if (Array.isArray(t)) {
                const min = t[1] ? t[1].toString() : '';
                const max = t[2] ? t[2].toString() : '';
                params.append('nottag', `${t[0]};${min};${max}`);
            } else {
                params.append('nottag', t);
            }
        });
        return fetch(this.url + "/count?" + params, {
            headers: this.headers
        }).then((r)=>r.json()
        );
    }
    createTag(label, type) {
        let body = {
            'label': label
        };
        if (type) {
            body.parameter = {
                "type": "http://www.w3.org/2001/XMLSchema#" + type
            };
        }
        return fetch(this.url + "/tag", {
            method: "POST",
            headers: this.postHeaders,
            body: JSON.stringify(body)
        }).then((r)=>r.json()
        );
    }
    deleteDocument(id) {
        return fetch(this.url + "/doc/" + id, {
            method: "DELETE",
            headers: this.headers
        });
    }
    deleteTag(label) {
        return fetch(this.url + "/tag/" + encodeURIComponent(label), {
            method: "DELETE",
            headers: this.headers
        }).then((r)=>r.json()
        );
    }
    getComments(id) {
        return fetch(this.url + "/doc/" + id + "/comment", {
            method: "GET",
            headers: this.headers
        }).then((r)=>r.json()
        );
    }
    getDocuments(query = '', tags = [], notTags = [], limit = '', offset = '') {
        let params = new URLSearchParams();
        params.append('text', query);
        tags.forEach((t)=>{
            if (Array.isArray(t)) {
                const min = t[1] ? t[1].toString() : '';
                const max = t[2] ? t[2].toString() : '';
                params.append('tag', `${t[0]};${min};${max}`);
            } else {
                params.append('tag', t);
            }
        });
        notTags.forEach((t)=>{
            if (Array.isArray(t)) {
                const min = t[1] ? t[1].toString() : '';
                const max = t[2] ? t[2].toString() : '';
                params.append('nottag', `${t[0]};${min};${max}`);
            } else {
                params.append('nottag', t);
            }
        });
        params.append('limit', '' + limit);
        params.append('offset', '' + offset);
        return fetch(this.url + "/doc?" + params, {
            headers: this.headers
        }).then((r)=>r.json()
        );
    }
    getTags(id) {
        return id ? fetch(this.url + "/doc/" + id + "/tag", {
            headers: this.headers
        }).then((r)=>r.json()
        ) : fetch(this.url + "/tag", {
            headers: this.headers
        }).then((r)=>r.json()
        );
    }
    getMeta(id) {
        return fetch(this.url + "/doc/" + id + "/meta", {
            headers: this.headers
        }).then((r)=>r.json()
        );
    }
    getVersion() {
        return fetch(this.url + "/version", {
            method: "GET",
            headers: this.headers
        }).then((r)=>r.json()
        );
    }
    removeTag(id, label) {
        return fetch(this.url + "/doc/" + id + "/tag/" + label, {
            method: "DELETE",
            headers: this.headers
        });
    }
    setDocumentTitle(id, title) {
        let body = {
            'title': title
        };
        return fetch(this.url + "/doc/" + id + "/title", {
            method: "PUT",
            headers: this.postHeaders,
            body: JSON.stringify(body)
        }).then((r)=>r.text() || {
                statusCode: 0,
                error: 'Unknown error occured while setting title',
                message: 'Recieved following response from server: ' + r
            }
        );
    }
    uploadFile(file) {
        if (file.type != "application/pdf") {
            return Promise.reject("Please provide a pdf document");
        } else {
            let pdfHeaders = new Headers();
            pdfHeaders.set('Authorization', this.headers.get('Authorization'));
            pdfHeaders.set('Content-Type', 'application/pdf');
            return fetch(this.url + "/doc", {
                method: "POST",
                headers: pdfHeaders,
                body: file
            }).then((r)=>{
                if (r.status >= 400) {
                    return r.json();
                } else {
                    return {
                        success: true,
                        location: r.headers.get("Location")
                    };
                }
            }).then((json)=>{
                if (json.error) {
                    throw "Server responded with " + json.statusCode + ": " + json.error;
                } else {
                    return json;
                }
            });
        }
    }
}
function e(name, contents = [], options) {
    const el = document.createElement(name);
    if (options) {
        for(const property in options){
            if (options[property] !== undefined && Object.prototype.hasOwnProperty.call(options, property)) {
                el.setAttribute(property, options[property]);
            }
        }
    }
    if (typeof contents === "string") contents = [
        contents
    ];
    if (contents.length > 0) el.append(...contents);
    return el;
}
class SettingsPage extends HTMLElement {
    constructor(){
        super();
        this.attachShadow({
            mode: "open"
        });
        this.shadowRoot.append(e("div", [
            e("h2", "Settings", {
                class: "not-mobile heading row"
            }),
            e("div", [
                "Dense View",
                e("toggle-switch", "Dense View", {
                    disabled: "disabled"
                }), 
            ], {
                class: "row"
            }),
            e("div", [
                "Connections",
                e("button", [
                    e("div", "Add", {
                        class: "label"
                    })
                ], {
                    class: "action"
                }), 
            ], {
                class: "heading row"
            }), 
        ]), e("link", [], {
            rel: "stylesheet",
            href: "index.css"
        }), e("link", [], {
            rel: "stylesheet",
            href: "reset.css"
        }));
    }
}
customElements.define("settings-page", SettingsPage);
class ToggleSwitch extends HTMLButtonElement {
    #button;
    constructor(){
        super();
        this.attachShadow({
            mode: "open"
        });
        this.#button = e("button", [], {
            role: "switch",
            disabled: this.getAttribute("disabled") || undefined,
            "aria-checked": this.getAttribute("aria-checked") || "false",
            "aria-label": this.slot
        });
        this.#button.addEventListener("click", (_)=>{
            if (this.#button.getAttribute("aria-checked") === "true") {
                this.#button.setAttribute("aria-checked", "false");
            } else {
                this.#button.setAttribute("aria-checked", "true");
            }
        });
        this.shadowRoot.append(this.#button, e("link", [], {
            rel: "stylesheet",
            href: "reset.css"
        }), e("style", `[role="switch"] {
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
      }`));
    }
    attributeChangedCallback(name, _oldValue, newValue) {
        console.log("Custom square element attributes changed.");
        this.#button.setAttribute(name, newValue);
    }
}
customElements.define("toggle-switch", ToggleSwitch, {
    extends: "button"
});
const HCServer = new Server("http://127.0.0.1:8000", "tridoc", "pw123");
HCServer.getDocuments().then(console.log);
const filtersSheet = document.getElementById("filters");
const filtersButton = document.getElementById("filters-button");
const filtersCloseButton = document.getElementById("filters-close-button");
const settingsSheet = document.getElementById("settings");
const settingsButton = document.getElementById("settings-button");
const settingsCloseButton = document.getElementById("settings-close-button");
filtersButton.addEventListener("click", (_)=>{
    filtersSheet.classList.toggle("closed");
    settingsSheet.classList.add("closed");
});
filtersCloseButton.addEventListener("click", (_)=>{
    filtersSheet.classList.add("closed");
    settingsSheet.classList.add("closed");
});
settingsButton.addEventListener("click", (_)=>{
    filtersSheet.classList.add("closed");
    settingsSheet.classList.toggle("closed");
});
settingsCloseButton.addEventListener("click", (_)=>{
    filtersSheet.classList.add("closed");
    settingsSheet.classList.add("closed");
});
