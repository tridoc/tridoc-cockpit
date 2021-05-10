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
          <v-label disabled for="dmswitch">
            Dense
          </v-label>
        </v-col>
        <v-col cols="auto">
          <v-switch
            id="dmswitch"
            v-model="viewSettingsDense"
            class="my-0 ml-2 mr-n3"
            inset hide-details disabled
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
              type="password"
              v-model="server.password"
              :rules="passwordRules"
              label="Password"
              required
            />
          </v-col>
          <v-col cols="auto">
            <v-tooltip bottom open-delay="500">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  v-bind="attrs"
                  v-on="on"
                  color="red accent-1"
                  class="m"
                  @click="remove(i)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              Remove
            </v-tooltip>
          </v-col>
        </v-row>
      </v-form>

      <v-row><v-col><v-divider/></v-col></v-row>

      <v-row class="mb-3">
        <v-col>
          <v-btn block disabled>
            <v-icon left>mdi-package-down</v-icon>
            Export Backup
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
  iservers = this.$store.state.servers.map(({ password, url }: { password: string; url: string }) => ({ id: this.counter(), valid: false, password, url }));

  @Watch('servers', { deep: true })
  onServersChanged () {
    this.iservers = this.$store.state.servers.map(({ password, url }: { password: string; url: string }) => ({ id: this.counter(), valid: false, password, url }));
  }

  counter () {
    return counterhelper()
  }

  valid = false

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

  get viewSettingsDense () {
    return this.$store.state.viewSettings.dense
  }

  set viewSettingsDense (v: boolean) {
    this.$store.commit('viewSettings', { dense: v })
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
