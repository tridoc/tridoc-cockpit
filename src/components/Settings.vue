<template>
<v-navigation-drawer
  v-model="show"
  app
  mobile-breakpoint="0"
  class="top"
  :width="$vuetify.breakpoint.smAndUp ? 432 : '100vw'"
  temporary right absolute
>
  <v-app-bar fixed dark color="primary" flat elevate-on-scroll>
    <v-toolbar-title>Settings</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <v-btn icon dark @click="show = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar-items>
  </v-app-bar>

  <v-main class="scroll">
    <v-container
      class="px-4 pb-0"
      fluid
    >
      <v-row>
        <v-col class="pt-4">
          <v-label for="dmswitch">
            Dark Mode
          </v-label>
        </v-col>
        <v-col cols="auto">
          <v-switch
            id="dmswitch"
            v-model="viewSettingsDark"
            class="my-0 ml-2 mr-n3"
            inset hide-details
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="pt-4">
          <v-label for="gridswitch">
            Use Grid View
          </v-label>
        </v-col>
        <v-col cols="auto">
          <v-switch
            id="gridswitch"
            v-model="viewSettingsGrid"
            class="my-0 ml-2 mr-n3"
            inset hide-details
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="pt-4">
          <v-label for="denseswitch">
            Dense
          </v-label>
        </v-col>
        <v-col cols="auto">
          <v-switch
            id="denseswitch"
            v-model="viewSettingsDense"
            class="my-0 ml-2 mr-n3"
            inset hide-details
          />
        </v-col>
      </v-row>

      <v-row><v-col><v-divider/></v-col></v-row>

      <v-row class="mb-4">
        <v-col>
          <v-btn color="primary" block @click="addRow">Add Server</v-btn>
        </v-col>
      </v-row>
      <v-form
        v-model="server.valid"
        v-for="(server, i) in iservers"
        :key="server.id"
        :ref="(server.id + 1) * 1000 + i + 1"
      >
        <v-row dense class="mx-n3">
          <v-col cols="auto">
            <v-tooltip bottom open-delay="500">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  v-bind="attrs"
                  v-on="on"
                  :color="(i === $store.state.currentServer) || isModified(server, i) ? 'primary darken-1' : ''"
                  class="m"
                  @click="save(i, server)"
                >
                  <v-icon v-if="isModified(server, i)">mdi-content-save</v-icon>
                  <v-icon v-else-if="i === $store.state.currentServer">mdi-checkbox-marked-circle-outline</v-icon>
                  <v-icon v-else>mdi-checkbox-blank-circle-outline</v-icon>
                </v-btn>
              </template>
              <span v-if="isModified(server, i)">Save changes</span>
              <span v-else-if="i === $store.state.currentServer">Selected</span>
              <span v-else>Select</span>
            </v-tooltip>
          </v-col>
          <v-col>
            <v-text-field
              outlined
              v-model="server.url"
              :rules="urlRules"
              label="Server URL"
              required
            />
          </v-col>
          <v-col>
            <v-text-field
              outlined
              :type="server.show ? 'text' : 'password'"
              v-model="server.password"
              :rules="passwordRules"
              :append-icon="server.show ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
              @click:append="server.show = !server.show"
              label="Password"
              required
            />
          </v-col>
          <v-col cols="auto">
            <v-menu
              bottom
              left
              :close-on-content-click="false"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  v-bind="attrs"
                  v-on="on"
                  class="m"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list>
                <div class="text-caption px-4 py-2">{{ server.url }}</div>
                <v-list-item @click="remove(i)">
                  <v-list-item-icon class="mr-4"><v-icon color="red accent-1">mdi-delete</v-icon></v-list-item-icon>
                  <v-list-item-title>Remove Server</v-list-item-title>
                </v-list-item>
                <v-list-item
                  @click="downloadBackup(server.url)"
                  :disabled="downloadingBackup[server.url] || !server.valid"
                >
                  <v-list-item-icon class="mr-4">
                    <v-progress-circular
                      indeterminate
                      :color="$vuetify.theme.dark ? 'grey lighten-2' : 'grey darken-2'" size="24" width="3"
                      v-if="downloadingBackup[server.url]"
                    />
                    <v-icon v-else>mdi-package-down</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>Download Backup (ZIP)</v-list-item-title>
                </v-list-item>
                <v-list-item
                  @click="downloadRDF(server.url)"
                  :disabled="downloadingRDF[server.url] || !server.valid"
                >
                  <v-list-item-icon class="mr-4">
                    <v-progress-circular
                      indeterminate
                      :color="$vuetify.theme.dark ? 'grey lighten-2' : 'grey darken-2'" size="24" width="3"
                      v-if="downloadingRDF[server.url]"
                    />
                    <v-icon v-else>mdi-semantic-web</v-icon>
                  </v-list-item-icon>
                  <v-list-item-title>Download RDF Metadata</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </v-form>

      <v-row v-if="installable"><v-col><v-divider/></v-col></v-row>

      <v-row class="mb-3">
        <v-col>
          <v-btn block v-if="installable" @click="install">
            <v-icon left>mdi-plus-circle-outline</v-icon>
            Add to Homescreen
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</v-navigation-drawer>
</template>

<script lang="ts">
import { Component, PropSync, Vue, Watch } from 'vue-property-decorator'

const validateUrl = (string = '') => {
  if (!string.startsWith('http://') || !string.startsWith('https://')) {
    string = 'https://' + string
  }
  try {
    const url = new URL(string);
    return url.href.replace(/\/$/, '')
  } catch (_) {
    return false
  }
}

const counterhelper = (() => {
  let i = 0
  return () => i++
})()

@Component({})
export default class SettingsDrawer extends Vue {
  @PropSync('open') show !: boolean;

  // If Vetur was working correctly, the following two `: { password: string; url: string }` would be unnecceasiry. Added them to soothe vs-code’s concerns.
  iservers = this.$store.state.servers.map(({ password, url }: { password: string; url: string }) => ({ id: this.counter(), valid: false, show: false, password, url }));

  onServersChanged () {
    this.iservers = this.$store.state.servers.map(({ password, url }: { password: string; url: string }) => ({ id: this.counter(), valid: false, password, url }));
  }

  counter () {
    return counterhelper()
  }

  urlRules: FormRule[] = [
    v => !!v || 'URL is required',
    v => {
      const temp = validateUrl(v)
      if (temp) {
        return true
      }
      return 'URL has to be valid'
    },
  ]

  passwordRules: FormRule[] = [
    v => !!v || 'Password is required',
  ]

  save (index: number, { url, password, valid }: { url: string; password: string; valid: true }) {
    // console.log(index, url, valid)
    if (valid) {
      this.$emit('save', { index, url, password })
    }
  }

  remove (index: number) {
    this.$emit('delete', index)
  }

  addRow () {
    this.iservers.push({
      id: this.counter(),
      password: '',
      url: '',
      valid: false
    })
  }

  isModified (server: { id: number; valid: boolean; password: string; url: string }, i: number) {
    return (!this.$store.state.servers[i] || !this.$store.state.servers[i].url || !this.$store.state.servers[i].password || this.$store.state.servers[i].url !== server.url || this.$store.state.servers[i].password !== server.password)
  }

  get viewSettingsDark () {
    return this.$store.state.viewSettings.darkMode
  }

  set viewSettingsDark (v: boolean) {
    this.$store.commit('viewSettings', { darkMode: v })
  }

  get viewSettingsGrid () {
    return this.$store.state.viewSettings.grid
  }

  set viewSettingsGrid (v: boolean) {
    this.$store.commit('viewSettings', { grid: v })
  }

  get viewSettingsDense () {
    return this.$store.state.viewSettings.dense
  }

  set viewSettingsDense (v: boolean) {
    this.$store.commit('viewSettings', { dense: v })
  }

  downloadingBackup: { [url: string]: [boolean, boolean] } = {}
  downloadingRDF: { [url: string]: [boolean, boolean] } = {}

  downloadBackup (serverUrl: string) {
    Vue.set(this.downloadingBackup, serverUrl, true)
    const url = ((serverUrl.startsWith('https://') || serverUrl.startsWith('http://')) ? serverUrl : 'https://' + serverUrl) + '/raw/zip'
    const options = {
      headers: {
        Authorization: this.$store.getters.server.server.headers.get('Authorization')
      }
    }

    fetch(url, options)
      .then(r => r.blob())
      .then(b => {
        Vue.set(this.downloadingBackup, serverUrl, false)
        const link = document.createElement('a')
        link.href = URL.createObjectURL(b)
        link.download = 'tridoc_backup_' + Date.now() + '.zip'
        link.click();
      })
  }

  downloadRDF (serverUrl: string) {
    Vue.set(this.downloadingRDF, serverUrl, true)
    const url = ((serverUrl.startsWith('https://') || serverUrl.startsWith('http://')) ? serverUrl : 'https://' + serverUrl) + '/raw/rdf'
    const options = {
      headers: {
        Authorization: this.$store.getters.server.server.headers.get('Authorization')
      }
    }

    fetch(url, options)
      .then(r => r.blob())
      .then(b => {
        Vue.set(this.downloadingRDF, serverUrl, false)
        const link = document.createElement('a')
        link.href = URL.createObjectURL(b)
        link.download = 'tridoc_backup_' + Date.now() + '.ttl'
        link.click();
      })
  }

  // PWA INSTALLATION
  installable: (Event|false) = false

  install () {
    (this.installable as any).prompt();
    (this.installable as any).userChoice.then((r: any) => {
      if (r.outcome === 'accepted') {
        this.installable = false
      }
    })
  }

  mounted () {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.installable = e
    })
  }
}
</script>

<style lang="scss" scoped>
.top {
  z-index: 900;
  position: fixed;
  top: 0;
  right: 0;
  max-height: 100vh;
}

.scroll {
  padding-left: 0 !important;
  padding-right: 0 !important;
  // margin-top: 56px;
  // max-height: calc(100vh - 56px);
  overflow-y: auto;
}

.m {
  margin-top: 10px;
}
</style>
