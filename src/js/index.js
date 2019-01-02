import Server from './server';
import TextLayerBuilder from 'pdfjs-dist/lib/web/text_layer_builder.js';
const pdfjsLib = require('pdfjs-dist');
pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.943/pdf.worker.min.js';

const urlInput = document.getElementById("server-url");
const usernameInput = document.getElementById("server-username");
const passwordInput = document.getElementById("server-password");

const storage = localStorage;

if (storage.getItem("server")) {
    urlInput.value = storage.getItem("server");
} else {
    urlInput.value = "http://localhost:8000";
}

if (storage.getItem("username")) {
    usernameInput.value = storage.getItem("username");
}

if (storage.getItem("password")) {
    passwordInput.value = storage.getItem("password");
}

let server = new Server(urlInput.value, usernameInput.value, passwordInput.value);

const render = id => {
    let url = server.url + "/doc/" + id;
    console.log("Getting Document");
    pdfjsLib.getDocument({
        url: url,
        httpHeaders: {
            "Authorization": server.postHeaders.get("Authorization")
        }
    }).then(function (pdfDocument) {
        console.log("Got Document");
        // Request a first page
        return pdfDocument.getPage(1).then(function (pdfPage) {
            console.log("Got Page");
            // Display page on the existing canvas with 100% scale.
            var viewport = pdfPage.getViewport({
                scale: 1.0,
            });
            console.log(viewport);
            var canvas = document.getElementById('pdf-canvas');
            canvas.width = viewport.width || viewport.viewBox[2];
            canvas.height = viewport.height || viewport.viewBox[3];
            var ctx = canvas.getContext('2d');
            ctx.scale(1,1);
            console.log(ctx);

            var renderTask = pdfPage.render({
                canvasContext: ctx,
                viewport: viewport,
            });
            pdfPage.getTextContent().then(function (textContent) {
                console.log("Got Text")
                let page_num = 1;
                var textLayerDiv = document.getElementById('pdf-text-layer');
                textLayerDiv.style.height = viewport.height + 'px';
                textLayerDiv.style.width = viewport.width + 'px';
                var textLayer = TextLayerBuilder({
                    textLayerDiv: textLayerDiv,
                    pageIndex: page_num - 1,
                    viewport: viewport
                });

                textLayer.setTextContent(textContent);
                textLayer.render();
            }).catch(e => console.log(e));
            return renderTask.promise;
        }).then(() => {
            console.log("Rendered Page");
        });
    }).catch(e => console.log(e));
}

render("IanWviMO0ZIb0_2K1GXFO");

function fillout() {
    let documentTitle = this.innerHTML;
    let id = this.getAttribute("data-document-id");
    if (documentTitle != id) {
        let title = document.getElementById("current-title")
        title.innerHTML = documentTitle;
    }
    render(id);
}
const searchDocuments = (page) => {
    let query = "";
    let dest = document.getElementById("document-list");
    let tags = "";
    let notTags = "";
    let tagsQuery = "";
    if (tags.length > 0) {
        encodeURIComponent(tags);
        tagsQuery = "&tag=" + tags.replace(/\s?,\s?/, "&tag=");
    }
    let notTagsQuery = "";
    if (notTags.length > 0) {
        encodeURIComponent(notTags);
        notTagsQuery = "&nottag=" + notTags.replace(/\s?,\s?/, "&nottag=");
    }
    if (isNaN(page)) {
        page = 0
    }
    let limit = ((storage.getItem("limit") > 0) ? storage.getItem("limit") : '');
    let offset = page * limit;
    let to = 0;

    server.getDocuments(query, tagsQuery, notTagsQuery, limit, offset).then(array => {
        let list = '';
        if (array.error) {
            dest.innerHTML = e;
        } else if (array.length > 0) {
            array.forEach(a => {
                let label = a.title ? a.title : a.identifier;
                list = list + `<button class='list-item list-item-flexible fillout-button' data-document-id="${a.identifier}">${label}</button>`;
            });
            dest.innerHTML = list;
            if (list != "") {
                document.querySelectorAll(".fillout-button").forEach(element => element.addEventListener("click", fillout));
            }
        } else {
            let label1 = query ? " Nothing Found" : " Documents will appear here";
            let label2 = query ? "You can try another query" : "Upload something";
            list = "<div class=''>" +
                "" +
                "<div class='list-content'>" +
                "<h3 class='mdc-typography--headline5'><span class='material-icons'>blur_off</span>" + label1 + "</h3>" +
                "<span class='mdc-typography--subtitle1'>" + label2 + "</span>" +
                "</div>" +
                "</div>";
            dest.innerHTML = list;
        }
        document.querySelectorAll(".page-switch").forEach(element => element.addEventListener("click", () => {
            searchDocuments(element.getAttribute("data-pagination-target"));
        }));
    }).catch(e => {
        console.log(e);
    });
}

const saveServer = () => {
    let serverAddress = urlInput.value;
    server = new Server(serverAddress, usernameInput.value, passwordInput.value);
    try {
        storage.setItem("server", serverAddress);
        storage.setItem("username", usernameInput.value);
        storage.setItem("password", passwordInput.value);
    } catch (error) {
        console.log(error)
    }
    searchDocuments();
}

/* -- */

document.getElementById("server-save").addEventListener("click", saveServer);

/* -- */

searchDocuments();