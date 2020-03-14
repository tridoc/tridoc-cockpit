import { Component, Vue } from 'vue-property-decorator'
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
      icon: 'mdi-filter-remove',
      text: 'Show all',
      disabled: true,
    },
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
