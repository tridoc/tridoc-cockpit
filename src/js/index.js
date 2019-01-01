import Server from './server';

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

const count = () => {
    server.countDocuments("", "", "")
        .then(count => {
            const counter = document.getElementById("counter");
            counter.innerHTML = count;
        });
}

const searchDocuments = (page) => {
    let query = "";
    let dest = document.getElementById("document-list");
    let tags = "";
    let notTags = "";
    let tagsQuery = "";
    if (tags.length > 0) {
        encodeURIComponent(tags);
        tagsQuery = "&tag=" + tags.replace(/\s?,\s?/,"&tag=");
    }
    let notTagsQuery = "";
    if (notTags.length > 0) {
        encodeURIComponent(notTags);
        notTagsQuery = "&nottag=" + notTags.replace(/\s?,\s?/,"&nottag=");
    }
    console.log(tagsQuery + notTagsQuery);
    if (isNaN(page)) { page = 0 }
    let limit = ((storage.getItem("limit") > 0) ? storage.getItem("limit") : '');
    let offset = page*limit;
    let to = 0;

    server.getDocuments(query,tagsQuery,notTagsQuery,limit,offset).then(array => {
        let list = '';
        if (array.error) {
            dest.innerHTML = e;
        } else if (array.length > 0) {
            array.forEach(a => {
                let label = a.title ? a.title : a.identifier;
                list = list + `<button class='list-item list-item-flexible' data-document-id="${a.identifier}">${label}</button>`;
            });
            dest.innerHTML = list;
            if (list != "") {
                document.querySelectorAll(".document-edit").forEach(element => element.addEventListener("click", fillout));
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
        } ));
        getTags();
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

document.querySelector("#server-save").addEventListener("click", saveServer);

/* -- */

count();
searchDocuments();