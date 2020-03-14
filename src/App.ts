import { Component, Vue } from 'vue-property-decorator'
import Server from '@tridoc/frontend'
import TagCreator from './components/TagCreator.vue'
import SettingsDialog from './components/Settings.vue'
import ErrorDialog from './components/Error.vue'
import DocumentList from './components/DocumentList.vue'

interface Tag {
  'icon': string;
  'label': string;
  'type-icon'?: string;
}

@Component({
  components: {
    TagCreator,
    SettingsDialog,
    ErrorDialog,
    DocumentList,
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
    console.log('gte current(): ', this._current, this.servers.length)
    if (this._current >= this.servers.length) {
      this._current = this.servers.length - 1
    }
    return this._current
  }

  setCurrent (c: number) {
    this._current = c
    console.log('this._current === c', this._current === c, c)
  }

  currentserver () {
    if (this.servers.length === 0) {
      return null
    }
    console.log('currentserver(): t.c', this.current())
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
      icon: 'mdi-help-circle',
      text: 'Help',
      disabled: true,
    },
    {
      icon: 'mdi-chevron-up',
      'icon-alt': 'mdi-chevron-down',
      text: 'More',
      model: false,
      children: [
        {
          icon: 'mdi-package-down',
          text: 'Export',
          disabled: true,
        }
      ],
    }
  ]

  tags: Tag[] = [];

  tagActions = [
    {
      name: 'Delete',
      fn: (t: Tag) => this.deleteTag(t.label)
    },
  ]

  deleteTag (label: string) {
    this.currentserver().deleteTag(label)
      .then((r: {error?: string}) => {
        if (r.error) {
          console.log(r)
          this.error = { message: r.error, ...r }
        } else {
          this.reload()
        }
      })
  }

  serverchange ({ index, url, password }: { index: number; url: string; password: string }) {
    this.servers[index] = {
      url,
      password,
      server: new Server(url, 'tridoc', password)
    };
    this.setCurrent(index);
    console.log('serverchange(): this.current() === index', this.current() === index)
    console.log('serverchange(): index/url/pwd', index, url, password)
    console.log('serverchange(): t.c', this.current())
    console.log('serverchange():t.c/cs.u/s[c].p}', this.current(), this.currentserver().url, this.servers[this.current()].password)
    this.store()
    this.reload()
  }

  serverremove (index: number) {
    console.log(index + 'removed')
    this.servers.splice(index, 1)
    this.store()
    this.reload()
  }

  reload () {
    this.reset()
    this.currentserver().getTags()
      .then((r: { label: string; parameter?: { type: string }; error?: string }[]) => {
        if (r.error) {
          this.error = { title: r.error, ...r }
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
      JSON.stringify(this.servers.map(({ password, url }: { password: string; url: string }) => ({
        password,
        url
      })))
    )
  }

  created () {
    this.restore()
    this.reload()
  }
}
