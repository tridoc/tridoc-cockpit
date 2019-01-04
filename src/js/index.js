import Server from './server';
import pdfjsLib from 'pdfjs-dist';
/*// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';*/

const saveIcon = '<svg viewBox="0 0 24 24"><path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"/></svg>';
const editIcon = '<svg viewBox="0 0 24 24"><path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" /></svg>';

const urlInput = document.getElementById('server-url');
const usernameInput = document.getElementById('server-username');
const passwordInput = document.getElementById('server-password');
const saveButton = document.getElementById('server-save');

const searchInput = document.getElementById('search-documents');
const searchLoader = document.createElement('div');
searchLoader.classList.add('loader');

const main = document.getElementById('main');

const documentContainer = document.getElementById('document');
const documentText = document.getElementById('pdf-text');
const documentLoader = document.createElement('div');
documentLoader.classList.add('loader');

const currentTitle = document.getElementById('current-title');
const editTitleButton = document.getElementById('edit-title');

const storage = localStorage;

if (storage.getItem('server')) {
    urlInput.value = storage.getItem('server');
} else {
    urlInput.value = 'http://localhost:8000';
}

if (storage.getItem('username')) {
    usernameInput.value = storage.getItem('username');
}

if (storage.getItem('password')) {
    passwordInput.value = storage.getItem('password');
}

let server = new Server(urlInput.value, usernameInput.value, passwordInput.value);

const generateError = e => {
    const errorElem = document.createElement('div');
    errorElem.classList = 'error';
    errorElem.textContent = e.status ? `Error ${e.status}: ${e.message ? e.message : e}` : e;
    return errorElem;
}

const renderPages = (pdf, pageNumber = 1, max = -1, container = documentContainer) => {
    const nopreview = container === documentContainer;
    pdf.getPage(pageNumber).then(page => {
        console.log(`Page ${pageNumber} loaded`);

        const canvas = document.createElement('canvas');
        canvas.classList.add('pdf-canvas');

        let unscaledViewport = page.getViewport(1);

        unscaledViewport.height = unscaledViewport.height || unscaledViewport.viewBox[3]
        unscaledViewport.width = unscaledViewport.width || unscaledViewport.viewBox[2];

        const scaledWidth = container.offsetWidth;
        const scale = scaledWidth / unscaledViewport.width;
        const scaledHeight = unscaledViewport.height * scale;

        let scaledViewport = page.getViewport(scale);

        // Prepare canvas using PDF page dimensions
        var context = canvas.getContext('2d');
        canvas.height = scaledHeight;
        canvas.width = scaledWidth;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: context,
            viewport: scaledViewport
        };
        var renderTask = page.render(renderContext);
        renderTask.promise.then(() => {
            if (documentLoader.parentNode && nopreview) documentLoader.parentNode.removeChild(documentLoader);
            container.appendChild(canvas);
            console.log(`Page ${pageNumber} of ${max > -1 ? max : pdf.numPages} rendered`);
            if (pageNumber < pdf.numPages && (max === -1 || pageNumber < max)) {
                if (nopreview) container.appendChild(documentLoader);
                renderPages(pdf, pageNumber + 1, max, container);
            } else console.log('Finished rendering PDF');
        });
    });
}

const render = (id) => {
    documentContainer.innerHTML = '';
    documentContainer.appendChild(documentLoader);

    const url = server.url + '/doc/' + id;
    console.log(`Rendering ${url}`);
    var loadingTask = pdfjsLib.getDocument({
        url: url,
        httpHeaders: {
            'Authorization': server.headers.get('Authorization')
        }
    });
    loadingTask.promise.then(pdf => {
        console.log('PDF loaded');
        renderPages(pdf);
    }, reason => {
        if (documentLoader.parentNode) documentLoader.parentNode.removeChild(documentLoader);
        documentContainer.appendChild(generateError(reason));
    });
}

const renderPreview = (element) => {
    const id = element.getAttribute('data-document-id');
    const url = server.url + '/doc/' + id;
    console.log(`Rendering preview of ${url}`);
    var loadingTask = pdfjsLib.getDocument({
        url: url,
        httpHeaders: {
            'Authorization': server.headers.get('Authorization')
        }
    });
    loadingTask.promise.then(pdf => {
        console.log('PDF loaded');
        renderPages(pdf, 1, 1, element);
    }, reason => {
        // PDF loading error
        console.error(reason);
    });
}

const getTags = () => {
    document.querySelectorAll('.s__th').forEach((dest) => {
        const id = dest.closest('.s__id').getAttribute('data-document-id');
        if (!id) return;
        if (!dest.getElementsByClassName("loader")[0]) {
            const loader = document.createElement("div")
            loader.classList = 'loader loader-small inline'
            dest.appendChild(loader);
        }
        server.getTags(id).then(array => {
            let list = '';
            if (array.error) {
                dest.innerHTML = 'Error: ' + array.error;
            } else if (array.length > 0) {
                array.sort((a, b) => {
                    return a.label.localeCompare(b.label);
                })
                array.forEach(a => {
                    let type = 'simple';
                    let icon = 'mi-tag';
                    let value;
                    if (a.parameter) {
                        value = a.parameter.value;
                        if (a.parameter.type == 'http://www.w3.org/2001/XMLSchema#decimal') {
                            type = 'decimal';
                            icon = 'mi-num';
                        } else if (a.parameter.type == 'http://www.w3.org/2001/XMLSchema#date') {
                            type = 'date';
                            icon = 'mi-cal';
                        }
                    }
                    const valueIndicator = value ? '<span class="tag-value">' + value + '</span>' : '';
                    list = list + `<div class='tag' data-tag-type='${type}' data-tag-label='${a.label}'>
                        <i class='tag-icon ${icon}'>${type}</i>
                        <span class="tag-text">${a.label}</span>
                        ${valueIndicator}
                        </div>`;
                });
                dest.innerHTML = list;
                /*if (list != '') {
                    document.querySelectorAll('.tag').forEach(element => element.addEventListener('click', tagFillout));
                }*/
            } else {
                list = '<i>No Tags</i>';
                dest.innerHTML = list;
            }
        }).catch(e => {
            dest.innerHTML = 'Error: ' + e;
        });
    });
}

const resetEditButton = () => {
    currentTitle.contentEditable = false;
    editTitleButton.innerHTML = editIcon;
    editTitleButton.removeEventListener('click', saveTitle);
    editTitleButton.addEventListener('click', editTitle);
}

const saveTitle = () => {
    resetEditButton();
    const id = main.getAttribute('data-document-id');
    const title = currentTitle.innerHTML;
    server.setDocumentTitle(id, title).then(r => searchDocuments());
}
const editTitle = () => {
    currentTitle.contentEditable = true;
    currentTitle.innerHTML = main.getAttribute('data-document-title') || '';
    editTitleButton.innerHTML = saveIcon;
    editTitleButton.removeEventListener('click', editTitle);
    editTitleButton.addEventListener('click', saveTitle);
}

const fillout = (element) => {
    resetEditButton();
    const titleElement = element.getElementsByClassName('s__t')[0];
    let documentTitle = element.getAttribute('data-document-title');
    let id = element.getAttribute('data-document-id');
    currentTitle.innerHTML = documentTitle || `<i>Untitled Document <code>${id}<code></i>`;
    main.setAttribute('data-document-id', id);
    main.setAttribute('data-document-title', element.getAttribute('data-document-title'));
    getTags();
    render(id);
}

const regx = (re, string, join = ', ') => {
    const match = re.exec(string);
    return match ? join + match[1] + regx(re, string, join) : '';
}

const searchDocuments = (page) => {
    let dest = document.getElementById('document-list');
    dest.innerHTML = '';
    dest.appendChild(searchLoader);
    const value = ' ' + searchInput.value;
    const tagsregex = /[^!#\\\b]\B#([^\s"',;:]+?(?=\s|$))/g;
    const nottagsregex = /[^#\\]\B!#([^\s"',;:]+?(?=\s|$))/g;
    const query = value ? encodeURIComponent(value.replace(tagsregex, '').replace(nottagsregex, '').replace(/^ /, '').replace(/\\/, '')) : '';
    const tags = regx(tagsregex, value, '&tag=');
    let notTags = regx(nottagsregex, value, '&nottag=');
    let tagsQuery = tags ? tags : '';
    let notTagsQuery = notTags ? notTags : '';
    if (isNaN(page)) {
        page = 0
    }
    let limit = ((storage.getItem('limit') > 0) ? storage.getItem('limit') : '');
    let offset = page * limit;
    let to = 0;

    server.getDocuments(query, tagsQuery, notTagsQuery, limit, offset).then(array => {
        let list = '';
        if (array.error) {
            dest.innerHTML = array.error;
        } else if (array.length > 0) {
            array.forEach(a => {
                let label = a.title ? a.title : a.identifier;
                const documentListEntry = document.createElement('button');
                documentListEntry.classList = 'list-item list-item-flexible fillout-button s__id';
                documentListEntry.setAttribute('data-document-id', a.identifier);
                documentListEntry.setAttribute('data-document-title', a.title)
                const title = document.createElement('h2');
                title.classList = 's__t';
                title.innerHTML = label;
                documentListEntry.appendChild(title);
                const tagsHere = document.createElement('div');
                tagsHere.classList = 's__th';
                documentListEntry.appendChild(tagsHere);
                documentListEntry.addEventListener('click', filloutFromEvent);
                //renderPreview(documentListEntry); currently crashes browser
                searchLoader.parentNode.removeChild(searchLoader);
                dest.appendChild(documentListEntry);
                dest.appendChild(searchLoader);
            });
            searchLoader.parentNode.removeChild(searchLoader);
            fillout(dest.firstChild);
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
        document.querySelectorAll('.page-switch').forEach(element => element.addEventListener('click', () => {
            searchDocuments(element.getAttribute('data-pagination-target'));
        }));
        getTags();
    }).catch(e => {
        console.log(e);
    });
}

const saveServer = () => {
    let serverAddress = urlInput.value;
    server = new Server(serverAddress, usernameInput.value, passwordInput.value);
    try {
        storage.setItem('server', serverAddress);
        storage.setItem('username', usernameInput.value);
        storage.setItem('password', passwordInput.value);
    } catch (error) {
        console.log(error)
    }
    searchDocuments();
}

/* - EVENT LISTENERS - */

saveButton.addEventListener('click', saveServer);
searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchDocuments()
});

function filloutFromEvent() {
    fillout(this);
}

editTitleButton.addEventListener('click', editTitle)

/* - ON LOAD - */

searchDocuments();