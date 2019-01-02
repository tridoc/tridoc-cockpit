import Server from './server';
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

        // Fetch the first page
        var pageNumber = 1;
        pdf.getPage(pageNumber).then(function (page) {
            console.log('Page loaded');

            var scale = 1.5;
            var viewport = page.getViewport({
                scale: scale
            });

            // Prepare canvas using PDF page dimensions
            var canvas = document.getElementById('pdf-canvas');
            var context = canvas.getContext('2d');
            canvas.height = viewport.height ||viewport.viewBox[3];
            canvas.width = viewport.width || viewport.viewBox[2];

            // Render PDF page into canvas context
            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            var renderTask = page.render(renderContext);
            renderTask.promise.then(function () {
                console.log('Page rendered');
            });
        });
    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });
}

render("gv8wIv~j~Y2gSKV4Npai2");

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