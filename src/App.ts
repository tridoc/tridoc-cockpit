import { Component, Watch, Vue } from 'vue-property-decorator'
import Server from '@tridoc/frontend'
import SettingsDialog from '@/components/Settings.vue'
import ErrorDialog from '@/components/Error.vue'
import TagList from '@/components/TagList.vue'
import DocumentDetails from '@/components/DocumentDetails.vue'

interface Tag {
  'icon': string;
  'label': string;
  'type-icon'?: string;
}

interface TFile {
  loading: boolean;
  file: File;
}

@Component({
  components: {
    SettingsDialog,
    ErrorDialog,
    TagList,
    DocumentDetails,
  }
})
export default class App extends Vue {
  error: { message: string; title?: string } | null = null

  console = console;

  servers: {
      server: Server;
      password: string;
      url: string;
    }[] = []

  private _current = 0

  current () {
    if (this._current >= this.servers.length) {
      this._current = this.servers.length - 1
    }
    return this._current
  }

  setCurrent (c: number) {
    this._current = c
  }

  currentserver () {
    if (this.servers.length === 0) {
      return null
    }
    return this.servers[this.current()].server
  }

  search = ''

  drawer = null
  navItems = [
    {
      text: 'More',
      model: false,
      children: [
        {
          icon: 'mdi-package-down',
          text: 'Export',
          disabled: true,
        },
        {
          icon: 'mdi-github',
          text: 'Code on GitHub',
          href: 'https://github.com/tridoc/tridoc-cockpit'
        },
        {
          icon: 'mdi-help-circle',
          text: 'Help',
          disabled: true,
        },
      ],
    }
  ]

  /* DOC LIST STUFF */

  docs: tdDocMeta[] = []
  open = ''
  count= 0

  headers = [
    { text: 'Title', value: 'title' },
    { text: 'Tags', value: 'tags' },
    { text: 'Created', value: 'created', align: 'end' },
    // { text: 'Identifier', value: 'identifier', width: 1 },
    { text: '', value: 'actions', width: 1 },
  ];

  loading = true
  options = {
    page: 1,
    itemsPerPage: 10,
  }

  pagination = {
    first: () => {
      this.options.page = 1
      this.getDocuments()
    },
    prev: () => {
      this.options.page -= 1
      this.getDocuments()
    },
    next: () => {
      this.options.page += 1
      this.getDocuments()
    },
    last: () => {
      this.options.page = Math.ceil(this.count / this.options.itemsPerPage)
      this.$nextTick().then(this.getDocuments)
    },
  }

  /* @Watch('options')
  onTableOptionsChange (o: any) {
    alert('reloading: ' + o.page)
    this.getDocuments()
  } */

  docscounter () {
    return `${(this.options.page - 1) * this.options.itemsPerPage + 1}—${Math.min(this.options.page * this.options.itemsPerPage, this.count)} of ${this.count}`
  }

  pagecounter () {
    return `${this.options.page} of ${Math.ceil(this.count / this.options.itemsPerPage)}`
  }

  openDocument (identifier: string) {
    const url =
      (this.servers[this.current()].url.startsWith('https://') || this.servers[this.current()].url.startsWith('http://'))
        ? this.servers[this.current()].url : 'https://' + this.servers[this.current()].url
    window.open(url + '/doc/' + identifier, '_blank');
  }

  calculateTimestamp (isoString: string) {
    const date = new Date(isoString)
    const year = date.getFullYear().toString().padStart(4, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    switch (daysDiff) {
      case 0:
        return `Today ${hours}:${minutes}`
      case 1:
        return `Yesterday ${hours}:${minutes}`
      default:
        return `${year}-${month}-${day} ${hours}:${minutes}`
    }
  }

  calculateDatestamp (isoString: string) {
    const date = new Date(isoString)
    const year = date.getFullYear().toString().padStart(4, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    switch (daysDiff) {
      case 0:
        return 'Today'
      case 1:
        return 'Yesterday'
      default:
        return `${year}-${month}-${day}`
    }
  }

  getDocuments () {
    this.loading = true
    const cs = this.currentserver()
    if (cs) {
      let query = ''
      const tags: string[] = []
      const notTags: string[] = []
      if (this.search) {
        [...this.search.matchAll(/(^|[^\\#])#([^#\s/\\#"',;:?]+)\b/g)].forEach(nt => tags.push(nt[2]));
        [...this.search.matchAll(/(^|[^\\])##([^#\s/\\#"',;:?]+)\b/g)].forEach(nt => notTags.push(nt[2]));
        query = this.search.replace(/((^|[^\\#])#|(^|[^\\])##)[^#\s/\\#"',;:?]+\b/g, ' ').replace(/\s+/, ' ').replace(/\\#/, '#').trim()
      }

      cs.countDocuments(query, tags, notTags)
        .then((r) => {
          if (typeof r === 'number') {
            this.count = r
          } else {
            // console.log(r)
            this.error = { ...r }
          }
        })

      let ipp: number|undefined;
      let offset: number|undefined;
      if (this.options.itemsPerPage > 0) {
        ipp = this.options.itemsPerPage
        offset = (this.options.page - 1) * ipp
      }
      cs.getDocuments(query, tags, notTags, ipp, offset)
        .then((r) => {
          if ('error' in r) {
            // console.log(r)
            this.error = { ...r }
          } else {
            this.docs = r.map(({ identifier, title, created }: { identifier: string; title?: string; created: string }) => {
              title = title || ''
              return { identifier, title, created, tags: [{ label: '..' }] }
            })
            this.docs.forEach(doc => {
              cs.getTags(doc.identifier)
                .then(r => {
                  if ('error' in r) {
                    this.error = { title: r.error, ...r }
                  } else {
                    doc.tags = r
                  }
                  this.loading = false
                })
            });
          }
        })
    }
  }

  updateDoc (m: tdDocMeta) {
    this.docs.splice(this.docs.findIndex(d => d.identifier === m.identifier), 1, m)
  }

  /* DOC UPLOAD STUFF */

  uploadDocs: TFile[] = []

  uploadHeaders = [
    { text: 'Name', value: 'file.name' },
    { text: '', value: 'actions', width: 1 },
  ];

  addFile (e: DragEvent) {
    const droppedFiles = e.dataTransfer?.files;
    if (!droppedFiles) return;
    ([...droppedFiles]).forEach(f => {
      if (f.type === 'application/pdf') {
        this.uploadDocs.push({ loading: false, file: f })
      }
    });
  }

  addFileInput (e: InputEvent) {
    const files = (e.target as HTMLInputElement).files;
    if (!files) return;
    ([...files]).forEach(f => {
      if (f.type === 'application/pdf') {
        this.uploadDocs.push({ loading: false, file: f })
      }
    });
    (e.target as HTMLInputElement).value = '';
    (e.target as HTMLInputElement).files = null
  }

  uploadAll () {
    this.uploadDocs.forEach(this.uploadDocument)
  }

  uploadDocument (file: TFile) {
    const cs = this.currentserver()
    if (cs) {
      file.loading = true
      cs.uploadFile(file.file).then(r => {
        if ('error' in r) {
          this.error = { title: 'Could upload document', message: r.error }
        } else {
          cs.setDocumentTitle(
            r.location.substring(r.location.lastIndexOf('/') + 1),
            file.file.name.replace(/\.pdf$/, '')
          ).then(r2 => {
            if (typeof r2 !== 'string' && r2.error) {
              this.error = { title: 'Could not set title', message: r2.error }
            }
            this.reload()
            this.removeUploadDocument(file)
          })
        }
      }, e => {
        this.error = { title: e.error || e, message: e.message || e };
      }).finally(() => {
        file.loading = false
      })
    }
  }

  removeUploadDocument (file: TFile) {
    this.uploadDocs = this.uploadDocs.filter(f => {
      return f !== file;
    });
  }

  /* -------------- */

  tags: Tag[] = [];

  deleteTag (label: string) {
    const cs = this.currentserver()
    if (cs) {
      cs.deleteTag(label)
        .then((r) => {
          if (r.error) {
            // console.log(r)
            this.error = { message: r.error, ...r }
          } else {
            this.reload()
          }
        })
    }
  }

  serverchange ({ index, url, password }: { index: number; url: string; password: string }) {
    this.servers[index] = {
      url,
      password,
      server: new Server(url, 'tridoc', password)
    };
    this.setCurrent(index);
    this.store()
    this.reload()
  }

  serverremove (index: number) {
    this.servers.splice(index, 1)
    this.store()
    this.reload()
  }

  reload () {
    this.reset()
    this.getDocuments()
    const cs = this.currentserver()
    if (cs) {
      cs.getTags()
        .then((r) => {
          if ('error' in r) {
            this.error = { title: r.error, message: r.message, ...r }
          } else {
            this.tags = r.map(e => {
              const result = {
                icon: 'mdi-tag',
                label: e.label,
                'type-icon': ''
              }
              if (e.parameter) {
                switch (e.parameter.type) {
                  case 'http://www.w3.org/2001/XMLSchema#decimal':
                    result['type-icon'] = 'mdi-pound'
                    break;
                  case 'http://www.w3.org/2001/XMLSchema#date':
                    result['type-icon'] = 'mdi-calendar'
                    break;
                  default:
                    break;
                }
              }
              return result
            });
            this.tags.sort((a, b) => {
              const labelA = a.label.toUpperCase();
              const labelB = b.label.toUpperCase();
              if (labelA < labelB) {
                return -1;
              }
              if (labelA > labelB) {
                return 1;
              }
              return 0;
            })
          }
        }, (e: any) => {
          if (e instanceof Error) {
            this.error = { title: 'A ' + e.name + ' occurred', message: e.message }
          } else {
            this.error = { message: e, ...e }
          }
        })
    }
  }

  reset () {
    this.tags = []
    this.docs = []
  }

  restore () {
    const storedServers = JSON.parse(localStorage.getItem('servers') || '');
    const storedCurrent = parseInt(localStorage.getItem('currentserver') || '0');
    if (storedServers) {
      this.servers = storedServers.map(({ password, url }: { password: string; url: string }) => ({
        password,
        url,
        server: new Server(url, 'tridoc', password)
      }))
    }
    this.setCurrent(storedCurrent)
    // This will collect stored data from toolbox
    const storedUrl = localStorage.getItem('server')
    const storedPassword = localStorage.getItem('password')
    if (storedUrl && storedPassword) {
      this.servers.push({
        password: storedPassword,
        url: storedUrl,
        server: new Server(storedUrl, 'tridoc', storedPassword)
      })
    }
  }

  store () {
    localStorage.setItem('currentserver', this.current().toString())
    localStorage.setItem(
      'servers',
      JSON.stringify(this.servers.map(({ password, url }) => ({
        password,
        url
      })))
    )
  }

  created () {
    this.restore()
    this.reload()
  }

  onError ({ title, message }: { title: string; message: string }) {
    this.error = { title, message }
  }
}
