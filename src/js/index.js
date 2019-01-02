import Server from './server';

// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

const urlInput = document.getElementById("server-url");
const usernameInput = document.getElementById("server-username");
const passwordInput = document.getElementById("server-password");
const saveButton = document.getElementById("server-save");

const searchInput = document.getElementById("search-documents");

const documentContainer = document.getElementById("document");
const documentText = document.getElementById("pdf-text");
const documentLoader = document.createElement("div");
documentLoader.classList.add("loader");

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

const renderPage = (pdf, pageNumber) => {
    pdf.getPage(pageNumber).then(function (page) {
        console.log(`Page ${pageNumber} loaded`);

        const canvas = document.createElement("canvas");
        canvas.classList.add("pdf-canvas");

        let unscaledViewport = page.getViewport({
            scale: 1
        });

        unscaledViewport.height = unscaledViewport.height || unscaledViewport.viewBox[3]
        unscaledViewport.width = unscaledViewport.width || unscaledViewport.viewBox[2];

        const scaledWidth = documentContainer.offsetWidth;
        console.log(scaledWidth);
        const scale = scaledWidth / unscaledViewport.width;
        const scaledHeight = unscaledViewport.height * scale;

        let scaledViewport = page.getViewport({
            scale: scale
        });

        // Prepare canvas using PDF page dimensions
        var context = canvas.getContext('2d');
        canvas.height = scaledHeight;
        canvas.width = scaledWidth;

        console.log(scaledViewport.width);

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: context,
            viewport: scaledViewport
        };
        var renderTask = page.render(renderContext);
        renderTask.promise.then(function () {
            documentContainer.appendChild(canvas);
            console.log(`Page ${pageNumber} rendered`);
            if (pageNumber < pdf.numPages) renderPage(pdf, pageNumber + 1);
            else {
                console.log(`PDF rendered`);
                documentLoader.parentNode.removeChild(documentLoader);
            }
        });
    });
}

const render = (id, page) => {
    documentContainer.appendChild(documentLoader);
    const documentCanvases = document.getElementsByClassName("pdf-canvas");
    for (const c of documentCanvases) c.parentNode.removeChild(c);

    console.log('Rendering');
    const url = server.url + "/doc/" + id;
    const pageNumber = page || 1;
    console.log(url);
    console.log("'Authorization': " + server.headers.get('Authorization'));
    var loadingTask = pdfjsLib.getDocument({
        url: url,
        httpHeaders: {
            'Authorization': server.headers.get('Authorization')
        }
    });
    loadingTask.promise.then(function (pdf) {
        console.log('PDF loaded');
        renderPage(pdf, 1);
    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });
}

function fillout() {
    console.log('Fillout');
    let documentTitle = this.innerHTML;
    let id = this.getAttribute("data-document-id");
    if (documentTitle != id) {
        let title = document.getElementById("current-title")
        title.innerHTML = documentTitle;
    }
    render(id);
}
const searchDocuments = (page) => {
    let query = searchInput.value ? encodeURIComponent(searchInput.value) : "";
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

    console.log('Searching for Documents' + query + " " + tagsQuery + " " + notTagsQuery + " " + limit + " " + offset)
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

/* - EVENT LISTENERS - */

saveButton.addEventListener("click", saveServer);
searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") searchDocuments()
});

/* - ON LOAD - */

render("gv8wIv~j~Y2gSKV4Npai2");
searchDocuments();