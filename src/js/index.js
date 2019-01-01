import Server from './server';
let server = new Server(/******************************/);
const storage = localStorage;

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
                let label = a.title ? a.title : "Untitled document";
                list = list + "<div class='list-item list-item-flexible' data-document-id=\"" + a.identifier + "\">" +
                "    <h3 class='mdc-typography--headline5'>" + label + "</h3>" +
                    "  <div class='list-content'>" +
                    "    <div class='tags-here'></div>" +
                    "    <span class='standard-mono mdc-typography--subtitle1'>" + a.identifier + "</span>" +
                    "  </div>" +
                    "  <div class='mdc-card__actions'>" +
                    "    " +
                    "    <button class='mdc-button mdc-button--unelevated mdc-card__action mdc-card__action--button document-edit'>Edit</button>" +
                    "    <a class='mdc-button mdc-card__action mdc-card__action--button' href='" + server.url + "/doc/" + a.identifier + "' target='_blank'><i class='material-icons mdc-button__icon' aria-hidden='true'>open_in_new</i>Open</a>" +
                    "  </div>" +
                    "</div>";
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

/* -- */

count();
searchDocuments();