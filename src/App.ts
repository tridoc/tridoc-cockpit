import { Component, Watch, Vue } from 'vue-property-decorator'
import Server from '@tridoc/frontend'
import SettingsDialog from '@/components/Settings.vue'
import ErrorDialog from '@/components/Error.vue'
import TagList from '@/components/TagList.vue'

interface Tag {
  'icon': string;
  'label': string;
  'type-icon'?: string;
}

@Component({
  components: {
    SettingsDialog,
    ErrorDialog,
    TagList,
  }
})
export default class App extends Vue {
  error: { message: string; title?: string } | null = null

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
          icon: 'mdi-help-circle',
          text: 'Help',
          disabled: true,
        },
      ],
    }
  ]

  /* DOC LIST STUFF */

  docs: tdDocMeta[] = []
  count= 0

  headers = [
    { text: 'Title', value: 'title' },
    { text: 'Tags', value: 'tags' },
    { text: 'Created', value: 'created', align: 'end' },
    { text: 'Identifier', value: 'identifier' },
    { text: '', value: 'actions' },
  ];

  loading = true
  options = {
    page: 1,
    itemsPerPage: 10,
  }

  @Watch('options')
  onTableOptionsChange (oldO: { page: number; itemsPerPage: number }, newO: { page: number; itemsPerPage: number }) {
    if (oldO.page !== newO.page || oldO.itemsPerPage !== newO.itemsPerPage) {
      this.getDocuments()
    }
  }

  calculateTimestamp (isoString: string) {
    const date = new Date(isoString)
    const nowTimeStamp = (new Date()).getTime()
    const daysDiff = Math.floor((nowTimeStamp - date.getTime()) / (1000 * 60 * 60 * 24))
    const year = date.getFullYear().toString().padStart(4, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    switch (daysDiff) {
      case 0:
        return `Today ${hours}:${minutes}`
      case 1:
        return `Yesterday ${hours}:${minutes}`
      default:
        return `${year}-${month}-${day} ${hours}:${minutes}`
    }
  }

  getDocuments () {
    this.loading = true
    const cs = this.currentserver()
    if (cs) {
      cs.countDocuments('', '', '')
        .then((r) => {
          if (typeof r === 'number') {
            this.count = r
          } else {
            console.log(r)
            this.error = { message: r.error, ...r }
          }
        })
      let ipp: number | '' = ''
      if (this.options.itemsPerPage > 0) {
        ipp = this.options.itemsPerPage
      }
      cs.getDocuments('', '', '', ipp, ((this.options.page - 1) * ipp))
        .then((r) => {
          if ('error' in r) {
            console.log(r)
            this.error = { message: r.error, ...r }
          } else {
            this.docs = r.map(({ identifier, title, created }: { identifier: string; title?: string; created: string }) => {
              title = title || 'Document ' + identifier
              return { identifier, title, created }
            })
            this.loading = false
          }
        })
    }
  }

  deleteDocument (identifier: string) {
    if (confirm('Are you sure you want to delete this Document?')) {
      const cs = this.currentserver()
      if (cs) {
        cs.deleteDocument(identifier)
          .then(r => {
            if ('error' in r) {
              this.error = { title: r.error, message: r.message, ...r }
            }
            this.reload()
          })
      }
    }
  }

  /* -------------- */

  tags: Tag[] = [];

  deleteTag (label: string) {
    const cs = this.currentserver()
    if (cs) {
      cs.deleteTag(label)
        .then((r) => {
          if (r.error) {
            console.log(r)
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
