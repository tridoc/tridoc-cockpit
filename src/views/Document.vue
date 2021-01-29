<template>
<v-app>
  <v-app-bar app color="primary" class="py-0">
    <v-toolbar flat dark color="primary" class="col-md-5 col-12 pa-0">
      <v-tooltip bottom open-delay="500">
        <template v-slot:activator="{ on, attrs }">
          <v-app-bar-nav-icon
            v-bind="attrs"
            v-on="on"
            @click.stop="$router.go(-1)"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-app-bar-nav-icon>
        </template>
        Go Back
      </v-tooltip>
      <v-toolbar-title>
        <span v-if="meta">{{ meta.title }}</span>
        <code v-else>{{ id }}</code>
      </v-toolbar-title>
      <v-spacer/>
      <v-tooltip bottom open-delay="500" v-if="meta">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            icon
            dark
            @click="openDocument(id)"
          >
            <v-icon>mdi-open-in-new</v-icon>
          </v-btn>
        </template>
        Open PDF in New Tab
      </v-tooltip>
      <v-tooltip bottom open-delay="500" v-if="meta">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
            icon
            dark
            color="red accent-1"
            @click="deleteDocument(id)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
        Delete This Document
      </v-tooltip>

      <v-progress-linear
        :active="!meta"
        indeterminate
        absolute
        bottom
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
        :indeterminate="numPages === 0"
        :active="this.loading < this.numPages"
        :value="(this.loading / this.numPages) * 100"
        absolute
        bottom
      />
    </v-toolbar>
  </v-app-bar>

  <v-main app :class="$vuetify.breakpoint.mdAndUp ? '' : 'expand'">
    <v-row class="layout ma-0">
      <v-col :class="$vuetify.breakpoint.mdAndUp ? 'col' : ''" cols="12" md="5">

        <div class="pb-3">
          <code>{{ id }}</code>
        </div>

        <div v-if="meta">
          <v-text-field
            outlined
            label="Title"
            v-model="meta.title"
            @change="updateTitle"
          />

          <v-chip-group column class="mb-8">
            <tag-adder
              :id="id"
              :meta="meta"
              @update:meta="m => $emit('update:docMeta', m)"
            />
            <v-chip
              v-for="tag in meta.tags"
              :key="tag.label + (tag.parameter ? tag.parameter.value : '')"
              label
            >
              <v-icon v-if="tag.label === '..'">mdi-sync</v-icon>
              <span v-else>{{ tag.label }}</span>
              <v-divider class="mx-3" vertical v-if="tag.parameter"></v-divider>
              <strong v-if="tag.parameter">{{ tag.parameter.type === 'http://www.w3.org/2001/XMLSchema#decimal' ? tag.parameter.value : calculateDatestamp(tag.parameter.value) }}</strong>
            </v-chip>
          </v-chip-group>

          <comments-list
            :id="id"
            :meta="meta"
            @update:meta="m => $emit('update:docMeta', m)"
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
          :indeterminate="numPages === 0"
          :active="this.loading < this.numPages"
          :value="(this.loading / this.numPages) * 100"
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
</v-app>
</template>

<script lang="ts">
import type Server from '@tridoc/frontend'
import { Component, Prop, Vue } from 'vue-property-decorator'
import TagAdder from '@/components/TagAdder.vue'
import CommentsList from '@/components/CommentsList.vue'
import pdfvuer from 'pdfvuer'

import { inspect } from 'util'

@Component({
  components: {
    pdf: pdfvuer,
    TagAdder,
    CommentsList,
  }
})
export default class DocumentDetails extends Vue {
  @Prop() id!: string;
  meta: tdDocMeta | null = null;

  page = 1
  numPages = 0
  pdfdata = undefined as undefined|Promise<any>
  errors = []
  scale = 'page-width' as string | number
  loading = 0
  resize = true

  pdfsrc () {
    if (this.meta) {
      return {
        url: ((this.$store.getters.server.url.startsWith('https://') || this.$store.getters.server.url.startsWith('http://')) ? this.$store.getters.server.url : 'https://' + this.$store.getters.server.url) + '/doc/' + this.id,
        httpHeaders: { Authorization: this.$store.getters.server.server.headers.get('Authorization') }
      }
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

  openDocument (identifier: string) {
    const url =
      (this.$store.getters.server.url.startsWith('https://') || this.$store.getters.server.url.startsWith('http://'))
        ? this.$store.getters.server.url : 'https://' + this.$store.getters.server.url
    window.open(url + '/doc/' + identifier, '_blank');
  }

  deleteDocument (identifier: string) {
    if (confirm('Are you sure you want to delete this Document?')) {
      const cs = this.$store.getters.server.server as Server
      if (cs && this.meta) {
        cs.deleteDocument(identifier)
          .then(r => {
            if ('error' in r) {
              alert(r)
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

  loadingChange (b: boolean) {
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
    });
  }

  mounted () {
    if (this.$route.query.s) {
      this.$store.commit('selectServer', { url: this.$route.query.s })
    }
    if (!this.$store.getters.server) {
      alert('No Server')
      alert('Servers: ' + inspect(this.$store.state.servers))
    }
    const cs = this.$store.getters.server.server as Server
    if (cs) {
      cs.getMeta(this.id).then(r => {
        if ('error' in r) {
          alert(r)
        } else {
          this.meta = r
        }
      })
    }
    this.getPdf()
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
