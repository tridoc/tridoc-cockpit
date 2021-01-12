import { Component, Watch, Vue } from 'vue-property-decorator'
import Server from '@tridoc/frontend'
import SettingsDrawer from '@/components/Settings.vue'
import HelpDrawer from '@/components/Help.vue'
import ErrorDialog from '@/components/Error.vue'
import TagCreator from '@/components/TagCreator.vue'
import TagFilter from '@/components/TagFilter.vue'
import DocumentDetails from '@/components/DocumentDetails.vue'

import '@/global-types.ts'

import { inspect } from 'util'

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
    SettingsDrawer,
    HelpDrawer,
    ErrorDialog,
    TagCreator,
    TagFilter,
    DocumentDetails,
  }
})
export default class App extends Vue {
  error: { message: string; title?: string; color?: string } | null = null

  console = console;
  inspect = inspect;

  settingsOpen = false;

  viewSettings = {
    darkMode: this.$vuetify.theme.dark,
    dense: false,
  }

  helpOpen = false;

  @Watch('viewSettings.darkMode') changeDarkmode (n: boolean) {
    this.$vuetify.theme.dark = n
  }

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

  search: Search = {
    text: '',
    tags: [],
    nottags: []
  }

  clearTags () {
    this.search.tags = []
    this.search.nottags = []
    this.getDocuments()
  }

  clearSearch () {
    this.search.tags = []
    this.search.nottags = []
    this.search.text = ''
    this.getDocuments()
  }

  drawer = null

  /* DOC LIST STUFF */

  docs: tdDocMeta[] = []
  open = ''
  count= 0

  headers = [
    { text: 'Title', value: 'title' },
    { text: 'Tags', value: 'tags' },
    { text: 'Created', value: 'created', align: 'end' },
    { text: '', value: 'actions', width: 1 },
  ];

  loading = true
  options = {
    page: 1,
    itemsPerPage: 10,
  }

  paginationFirst () {
    this.options.page = 1
    this.getDocuments()
  }

  paginationPrev () {
    this.options.page -= 1
    this.getDocuments()
  }

  paginationNext () {
    this.options.page += 1
    this.getDocuments()
  }

  paginationLast () {
    this.options.page = Math.ceil(this.count / this.options.itemsPerPage)
    this.$nextTick().then(this.getDocuments)
  }

  docscounter () {
    return `${Math.min((this.options.page - 1) * this.options.itemsPerPage + 1, this.count)}—${Math.min(this.options.page * this.options.itemsPerPage, this.count)} of ${this.count}`
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
    const cs = this.currentserver()
    if (cs) {
      this.loading = true
      cs.countDocuments(this.search.text, this.search.tags, this.search.nottags)
        .then((r) => {
          if (typeof r === 'number') {
            this.count = r
            this.options.page = Math.min(this.options.page, Math.ceil(this.count / this.options.itemsPerPage))
            if (r === 0) {
              this.loading = false
            }
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
      cs.getDocuments(this.search.text, this.search.tags, this.search.nottags, ipp, offset)
        .then((r) => {
          if ('error' in r) {
            // console.log(r)
            this.error = { ...r }
            this.loading = false
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
    } else {
      this.error = {
        title: 'No server configured',
        message: 'Please add one via the settings.\nIf you’re new here, have a look at the help.',
        color: 'warning darken-1',
      }
      this.loading = false
    }
  }

  updateDoc (m: tdDocMeta) {
    this.docs.splice(this.docs.findIndex(d => d.identifier === m.identifier), 1, m)
  }

  /* DOC UPLOAD STUFF */

  uploadDocs: TFile[] = []

  uploadHeaders = [
    { text: 'Name', value: 'file.name' },
    { text: '', value: 'actions', align: 'end' },
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

  /* TAGS STUFF */

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

  /* -------------- */

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
    const storedServers = JSON.parse(localStorage.getItem('servers') || 'false');
    const storedCurrent = parseInt(localStorage.getItem('currentserver') || '0', 10);
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
