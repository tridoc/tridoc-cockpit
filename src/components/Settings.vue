<template>
<v-dialog v-model="show" :fullscreen="$vuetify.breakpoint.smAndDown">
  <template v-slot:activator="{ on }">
    <v-list-item v-on="on">
      <v-list-item-icon>
        <v-icon >mdi-cog</v-icon>
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title>Settings</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </template>
  <v-card :tile="$vuetify.breakpoint.smAndDown">
    <v-toolbar dark color="primary" flat elevate-on-scroll v-if="$vuetify.breakpoint.smAndDown">
      <v-btn icon dark @click="show = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-toolbar-title>Settings</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn dark text @click="show = false">Close</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-card-title>
      <span class="headline" v-if="$vuetify.breakpoint.mdAndUp">Settings</span>
    </v-card-title>
    <v-card-text>
      <v-expansion-panels
        accordion
        v-model="icurrent"
      >
        <v-expansion-panel
          v-for="(server, i) in iservers"
          :key="server.id"
          :ref="(server.id + 1) * 1000 + i + 1"
        >
          <v-expansion-panel-header :disable-icon-rotate="i === current">
            {{ i + 1 }}: {{ server.url }}
            <template
              v-if="i === current"
              v-slot:actions
            >
              <v-icon color="primary">mdi-check-circle</v-icon>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-form v-model="server.valid">
              <v-row>
                <v-col sm="12" md="6">
                  <v-text-field
                    outlined
                    full-width
                    v-model="server.url"
                    :rules="urlRules"
                    label="Server URL"
                    required
                  />
                </v-col>
                <v-col sm="12" md="6">
                  <v-text-field
                    outlined
                    full-width
                    v-model="server.password"
                    :rules="passwordRules"
                    label="Password"
                    required
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-spacer />
                <v-col sm="auto">
                  <v-btn color="secondary darken-1" text @click="remove(i)">Delete</v-btn>
                </v-col>
                <v-col sm="auto">
                  <v-btn color="primary" @click="save(i, server)">Save</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-row>
        <v-spacer />
        <v-col sm="auto">
          <v-btn color="primary darken-1" text @click="addRow">Add</v-btn>
        </v-col>
      </v-row>
      <v-divider></v-divider>
      </v-card-text>
      <v-card-actions v-if="$vuetify.breakpoint.mdAndUp">
        <v-spacer></v-spacer>
        <v-btn color="secondary darken-1" text @click="show = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Server from '@tridoc/frontend'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

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
export default class SettingsDialog extends Vue {
  @Prop() servers !: {
      server: Server;
      password: string;
      url: string;
    }[];

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

  show = false
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
    // console.log(index, url, password)
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
    this.icurrent = this.iservers.length - 1
    this.save(this.icurrent, { password: '', url: '', valid: true })
  }
}
</script>
