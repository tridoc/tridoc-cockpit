<template>
<v-navigation-drawer
  v-model="show"
  class="top"
  width="432"
  temporary
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

  <v-content class="scroll">
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
            v-model="viewSettings.darkMode"
            class="my-0 ml-2 mr-n3"
            inset hide-details
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="pt-4">
          <v-label for="dmswitch">
            Dense
          </v-label>
        </v-col>
        <v-col cols="auto">
          <v-switch
            id="dmswitch"
            v-model="viewSettings.dense"
            class="my-0 ml-2 mr-n3"
            inset hide-details
          />
        </v-col>
      </v-row>

      <v-row><v-col><v-divider/></v-col></v-row>

      <v-row class="mb-4 mx-6">
        <v-col>
          <v-btn color="primary darken-1" block outlined @click="addRow">Add Server</v-btn>
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
            <v-btn :color="(i === current) || (!servers[i] || !servers[i].url || !servers[i].password || servers[i].url !== server.url || servers[i].password !== server.password) ? 'primary darken-1' : ''" class="m" icon @click="save(i, server)">
              <v-icon v-if="i === current">mdi-checkbox-marked-circle-outline</v-icon>
              <v-icon v-else-if="!servers[i] || !servers[i].url || !servers[i].password || servers[i].url !== server.url || servers[i].password !== server.password">mdi-content-save</v-icon>
              <v-icon v-else>mdi-checkbox-blank-circle-outline</v-icon>
            </v-btn>
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
            <v-btn color="red accent-1" class="m" icon text @click="remove(i)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-form>

      <v-row><v-col><v-divider/></v-col></v-row>

      <v-row class="mb-3">
        <v-col>
          <v-btn block outlined disabled>
            <v-icon left>mdi-package-down</v-icon>
            Export Backup
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-content>
</v-navigation-drawer>
</template>

<script lang="ts">
import Server from '@tridoc/frontend'
import { Component, Prop, PropSync, Vue, Watch } from 'vue-property-decorator'

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

@Component({

})
export default class SettingsDrawer extends Vue {
  @Prop() servers !: {
      server: Server;
      password: string;
      url: string;
    }[];

  @PropSync('open') show !: boolean;
  @PropSync('view') viewSettings !: {
    darkMode: boolean;
    dense: boolean;
  };

  iservers = this.servers.map(({ password, url }) => ({ id: this.counter(), valid: false, password, url }));

  @Watch('servers', { deep: true })
  onServersChanged () {
    this.iservers = this.servers.map(({ password, url }) => ({ id: this.counter(), valid: false, password, url }));
  }

  @Prop() current !: number;

  counter () {
    return counterhelper()
  }

  icurrent = this.current
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
}
</script>

<style lang="scss" scoped>
.top {
  z-index: 900;
  position: fixed;
  top: 0;
  left: 0;
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
