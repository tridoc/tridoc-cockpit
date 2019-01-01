export default class Server {
    constructor(url,username,password) {
        if (url.startsWith("http")) {
            this.url = url;
        } else {
            this.url = "https://" + url;
        }

        this.headers = new Headers();
        if (username && password) {
            this.headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));
        }
        this.postHeaders = new Headers();
        this.postHeaders.set('Authorization', this.headers.get('Authorization'));
        this.postHeaders.set('Content-Type', 'application/json');
    }

    addTag(id, label, type, value) {
        let body = {
            'label': label
        };
        if (type) {
            body.parameter = {
                "type":"http://www.w3.org/2001/XMLSchema#"+type,
                "value":value
            };
        }
        return fetch(this.url + "/doc/"+id+"/tag", {
            method: "POST",
            headers: this.postHeaders,
            body: JSON.stringify(body)
        }).then(r => r.json());
    }

    countDocuments(query,tagsQuery,notTagsQuery) {
        return fetch(this.url + "/count?text=" + encodeURIComponent(query) + tagsQuery + notTagsQuery, {headers: this.headers}).then(r => r.json());
    }

    createTag(label, type) {
        let body = {
            'label': label
        };
        if (type) {
            body.parameter = {"type":"http://www.w3.org/2001/XMLSchema#"+type};
        }
        return fetch(this.url + "/tag", {
            method: "POST",
            headers: this.postHeaders,
            body: JSON.stringify(body)
        }).then(r => r.json());
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
        }).then(r => r.json());
    }

    getDocuments(query,tagsQuery,notTagsQuery,limit,offset) {
        return fetch(this.url + "/doc?text=" + encodeURIComponent(query) + tagsQuery + notTagsQuery + "&limit=" + limit + "&offset=" + offset,
            {headers: this.headers}).then(r => r.json());
    }

    getTags(id) {
        return id ? fetch(this.url + "/doc/"+id+"/tag", {headers: this.headers}).then(r => r.json()) : fetch(this.url + "/tag", {headers: this.headers}).then(r => r.json());
    }

    removeTag(id,label) {
        return fetch(this.url + "/doc/" + id +"/tag/" + label, {
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
        })
    }

    uploadFile(file) {
        if (file.type != "application/pdf") {
            return Promise.reject("Please provide a pdf document")
        } else {
            let pdfHeaders = new Headers();
            pdfHeaders.set('Authorization', this.headers.get('Authorization'));
            pdfHeaders.set('Content-Type', 'application/pdf');
            return fetch(this.url + "/doc", {
                method: "POST",
                headers: pdfHeaders,
                body: file
            }).then(r => {
                if (r.status >= 400) {
                    return r.json();
                } else {
                    return {
                        success: true,
                        location: r.headers.get("Location")
                    };
                }
            }).then(json => {
                if (json.error) {
                    throw ("Server responded with " + json.statusCode + ": " + json.error);
                } else {
                    return json;
                }
            });
        }
    }
}