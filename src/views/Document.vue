<template>
<v-app>
  <v-app-bar app color="primary" class="py-0">
    <v-toolbar flat dark color="primary" class="col-md-5 col-12 pa-0">
      <v-tooltip bottom open-delay="500">
        <template v-slot:activator="{ on, attrs }">
          <v-app-bar-nav-icon
            v-bind="attrs"
            v-on="on"
            @click.stop="$router.go(-1), $router.push('/')"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-app-bar-nav-icon>
        </template>
        Go Back
      </v-tooltip>
      <v-toolbar-title>
        <span v-if="meta">{{ meta.title }}</span>
      </v-toolbar-title>
      <v-spacer/>
      <v-tooltip bottom open-delay="500">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            v-on="on"
            @click.prevent.stop="download"
            :loading="downloading"
            :disabled="downloading"
          >
            <v-icon>mdi-download</v-icon>
          </v-btn>
        </template>
        Download
      </v-tooltip>
      <v-tooltip bottom open-delay="500" v-if="meta">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            icon
            @click="deleteDocument(id)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        Delete This Document
      </v-tooltip>

      <v-progress-linear
        :active="loadingMeta"
        indeterminate
        absolute
        bottom
        color="white"
      />
    </v-toolbar>

    <v-toolbar
      v-if="$vuetify.breakpoint.mdAndUp"
      flat
      class="col-7 pa-0"
    >
      <v-spacer/>
      <v-btn icon @click="scaleDown">
        <v-icon>mdi-magnify-minus-outline</v-icon>
      </v-btn>
      <v-text-field
        hide-details
        dense right
        single-line
        outlined
        :value="getScale()"
        @input="setScale"
        suffix="%"
        type="number"
        step="10"
        class="narrow mx-1"
      />
      <v-btn icon @click="scaleOff">
        <v-icon>mdi-arrow-expand-horizontal</v-icon>
      </v-btn>
      <v-btn icon @click="scaleUp">
        <v-icon>mdi-magnify-plus-outline</v-icon>
      </v-btn>

      <v-spacer/>

      {{ numPages }} Pages

      <v-progress-linear
        :indeterminate="numPages === 0 || loading === 0"
        :active="loading < numPages"
        :value="(loading / numPages) * 100"
        absolute
        bottom
      />
    </v-toolbar>
  </v-app-bar>

  <v-main app :class="$vuetify.breakpoint.mdAndUp ? '' : 'expand'">
    <v-row class="layout ma-0">
      <v-col :class="$vuetify.breakpoint.mdAndUp ? 'col' : ''" cols="12" md="5">

        <div class="pb-3">
          <code>{{ id }}</code> <code><time-ago v-if="meta" :datetime="meta.created">{{ meta.created }}</time-ago></code>
        </div>

        <div v-if="meta">
          <v-text-field
            outlined
            label="Title"
            v-model="meta.title"
            @change="updateTitle"
          />

          <tag-adder
            :id="id"
            :meta.sync="meta"
            @update:meta="reloadTags"
          />

          <comments-list
            :id="id"
            :meta.sync="meta"
          />
        </div>
      </v-col>

      <v-toolbar class="tools" short v-if="$vuetify.breakpoint.smAndDown">
        <v-spacer/>
        <v-btn icon @click="scaleDown">
          <v-icon>mdi-magnify-minus-outline</v-icon>
        </v-btn>
        <v-text-field
          hide-details
          dense
          single-line
          outlined
          :value="getScale()"
          @input="setScale"
          suffix="%"
          type="number"
          step="5"
          class="narrow"
        />
        <v-btn icon @click="scaleOff">
          <v-icon>mdi-arrow-expand-horizontal</v-icon>
        </v-btn>
        <v-btn icon @click="scaleUp">
          <v-icon>mdi-magnify-plus-outline</v-icon>
        </v-btn>

        <v-spacer/>

        {{ numPages }} Pages

        <v-progress-linear
          :indeterminate="numPages === 0 || loading === 0"
          :active="loading < numPages"
          :value="(loading / numPages) * 100"
          absolute
          bottom
        />
      </v-toolbar>

      <v-col :class="$vuetify.breakpoint.mdAndUp ? 'col pa-0' : 'pa-0'" cols="12" md="7">
        <v-sheet :color="this.$vuetify.theme.dark ? 'grey darken-3' : 'grey lighten-2'" :class="($vuetify.breakpoint.mdAndUp ? 'col ' : '') + (resize ? 'y pa-0' : 'x y pa-0')">
          <div :class="resize ? 'px-3' : 'fit px-3'">
            <pdf
              :src="pdfsrc()"
              v-for="i in numPages"
              :key="i"
              :id="i"
              :page="i"
              :scale.sync="scale"
              :resize="resize"
              annotation
              @loading="loadingChange"
              class="pdf"
            />
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </v-main>
  <v-dialog
    transition="dialog-top-transition"
    v-model="dialog.open"
    persistent
    max-width="600px"
  >
    <v-card>
      <v-card-title>
        <span class="headline">{{ error ? 'An Error Occurred' : 'Set Server and Password' }}</span>
      </v-card-title>
      <v-card-text class="pb-0">
        <v-alert outlined type="error" class="ma-1">
          <v-simple-table dense style="color: inherit;">
            <template v-slot:default>
              <tbody>
                <tr
                  v-for="(value, name) in error"
                  :key="name"
                >
                  <td>{{ name }}</td>
                  <td>{{ value }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-alert>
        <v-container>
          <v-form v-model="dialog.valid" ref="form">
            <v-row dense class="mx-n3">
              <v-col>
                <v-text-field
                  outlined
                  v-model="dialog.url"
                  :rules="dialog.urlRules"
                  label="Server URL"
                  required
                />
              </v-col>
              <v-col>
                <v-text-field
                  outlined
                  type="password"
                  v-model="dialog.pw"
                  :rules="dialog.pwRules"
                  label="Password"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
          <v-row dense class="mx-n3">
            <v-col>
              {{ error ? 'A different server URL or password may be' : ($route.query.s ? 'A password is' : 'Server URL and password are') }} required to view this document.
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click.stop="$router.go(-1), $router.push('/')">
          Go Back
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!dialog.valid || loadingMeta"
          :loading="loadingMeta"
          @click="closeDialog"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</v-app>
</template>

<script lang="ts">
import type Server from '@tridoc/frontend'
import { Component, Prop, Vue } from 'vue-property-decorator'
import TagAdder from '@/components/TagAdder.vue'
import CommentsList from '@/components/CommentsList.vue'
import pdfvuer from 'pdfvuer'

import { inspect } from 'util'

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

@Component({
  components: {
    pdf: pdfvuer,
    TagAdder,
    CommentsList,
  }
})
export default class DocumentDetails extends Vue {
  @Prop() id!: string;
  meta: tdDocMeta | null = null
  loadingMeta = false
  page = 1
  numPages = 0
  pdfdata = undefined as undefined|Promise<any>
  error: false | any = false
  scale = 'page-width' as string | number
  loading = 0
  resize = true
  downloading = false

  dialog = {
    open: false,
    url: '',
    pw: '',
    valid: false,
    urlRules: [
      v => !!v || 'URL is required',
      v => {
        const temp = validateUrl(v)
        if (temp) {
          return true
        }
        return 'URL has to be valid'
      },
    ] as FormRule[],
    pwRules: [
      v => !!v || 'Password is required',
    ] as FormRule[],
  }

  pdfsrc () {
    if (this.meta) {
      return {
        url: ((this.$store.getters.server.url.startsWith('https://') || this.$store.getters.server.url.startsWith('http://')) ? this.$store.getters.server.url : 'https://' + this.$store.getters.server.url) + '/doc/' + this.id,
        httpHeaders: { Authorization: this.$store.getters.server.server.headers.get('Authorization') }
      }
    }
  }

  download () {
    if (!this.meta) return;
    this.downloading = true
    const url = ((this.$store.getters.server.url.startsWith('https://') || this.$store.getters.server.url.startsWith('http://')) ? this.$store.getters.server.url : 'https://' + this.$store.getters.server.url) + '/doc/' + this.id
    const options = {
      headers: {
        Authorization: this.$store.getters.server.server.headers.get('Authorization')
      }
    }
    fetch(url, options)
      .then(r => r.blob())
      .then(b => {
        this.downloading = false
        const link = document.createElement('a')
        link.href = URL.createObjectURL(b)
        link.download = this.meta?.title || this.id
        link.click();
      })
  }

  deleteDocument (identifier: string) {
    if (confirm('Are you sure you want to delete this Document?')) {
      const cs = this.$store.getters.server.server as Server
      if (cs && this.meta) {
        cs.deleteDocument(identifier)
          .then(r => {
            if ('error' in r) {
              alert(inspect(r))
            } else {
              this.$router.go(-1)
            }
          })
      }
    }
  }

  updateTitle () {
    const cs = this.$store.getters.server.server as Server
    if (cs && this.meta) {
      cs.setDocumentTitle(this.id, this.meta.title || '')
    }
  }

  loadingChange () {
    const cv = document.getElementsByTagName('canvas')
    this.loading = cv.length
    for (let i = 0; i < cv.length; i++) {
      cv[i].classList.add('elevation-4')
    }
  }

  scaleDown () {
    this.resize = false
    this.scale = Math.round(parseFloat('' + this.scale) * 20) / 20
    if (this.scale > 0.15) {
      this.scale = (this.scale - 0.05)
    } else {
      this.scale = 0.1
    }
  }

  scaleUp () {
    this.resize = false
    this.scale = Math.round(parseFloat('' + this.scale) * 20) / 20
    if (this.scale < 1.95) {
      this.scale = (this.scale + 0.05)
    } else {
      this.scale = 2
    }
  }

  scaleOff () {
    this.scale = 'page-width'
    this.resize = true
  }

  getScale () {
    return parseInt('' + (+this.scale * 100))
  }

  setScale (v: number) {
    this.resize = false
    this.scale = v / 100
  }

  getPdf () {
    const url = (
      (this.$store.getters.server.url.startsWith('https://') || this.$store.getters.server.url.startsWith('http://'))
        ? this.$store.getters.server.url : 'https://' + this.$store.getters.server.url) + '/doc/' + this.id
    this.pdfdata = pdfvuer.createLoadingTask({ url, httpHeaders: { Authorization: this.$store.getters.server.server.headers.get('Authorization') } });
    (this.pdfdata as Promise<any>).then(pdf => {
      this.numPages = pdf.numPages;
    }).catch(e => { this.error = e });
  }

  mounted () {
    if (this.$route.query.s) {
      this.$store.commit('selectServer', { url: this.$route.query.s })
    }
    if (!this.$store.getters.server) {
      const s = this.$route.query.s ? (Array.isArray(this.$route.query.s) ? this.$route.query.s[0] || '' : this.$route.query.s) : ''
      this.dialog.open = true;
      this.dialog.url = s
    } else {
      this.finishSetup()
    }
  }

  closeDialog () {
    this.$store.commit('selectServer', { url: this.dialog.url, password: this.dialog.pw })
    this.finishSetup()
  }

  finishSetup () {
    this.loadingMeta = true
    const cs = this.$store.getters.server?.server as Server
    if (cs) {
      cs.getMeta(this.id).then(r => {
        this.loadingMeta = false
        if ('error' in r) {
          this.error = r
          this.dialog.url = this.$route.query.s ? (Array.isArray(this.$route.query.s) ? this.$route.query.s[0] || '' : this.$route.query.s) : ''
          this.dialog.open = true
        } else {
          this.dialog.open = false
          this.meta = r
        }
      })
    }
    this.getPdf()
  }

  reloadTags () {
    this.loadingMeta = true
    const cs = this.$store.getters.server?.server as Server
    if (cs) {
      cs.getTags(this.id).then(r => {
        this.loadingMeta = false
        if (!('error' in r) && this.meta) {
          // We're being lenient with errors here as nothing much hinges on this
          this.meta.tags = r
        }
      })
    }
  }
}
</script>

<style lang="scss">
@media screen and (min-width: 960px) {
  html {
    overflow-y: hidden;
  }
}

.py-0>.v-toolbar__content {
  padding-left: 0;
  padding-right: 0;
}

.pdf {
  max-width: 100%;
  margin: 12px auto;
}

pdf.resize {
  width: fit-content;
}

.pdf .page {
  margin-left: auto;
  margin-right: auto;
}
</style>

<style lang="scss" scoped>
.tools {
  position: sticky;
  top: 56px;
  z-index: 1;
}

@media screen and (min-width: 960px) {
  .tools {
    top: 68px;
  }

  .layout {
    height: 100%;
  }

  .col {
    height: 100%;
    overflow-y: auto;
  }

  .col,
  .v-main {
    max-height: 100vh;
  }

  .grey.x {
    border-left: 1px solid #e0e0e0;
  }
}

.narrow {
  flex-grow: 0;
  flex-basis: 9ch;

  & * {
    text-align: end;
  }
}

.x {
  overflow-x: auto;
}

.y {
  overflow-y: auto;
}

.fit {
  min-width: fit-content;
  min-height: fit-content;
}

.expand {
  max-height: unset;
}

// This seems neccesary to fix side-by-side layout on smaller screen, a weird problem only happening when building for production
.layout {
  flex-wrap: wrap;
}
</style>
