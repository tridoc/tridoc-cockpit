<template>
<v-dialog v-model="show" scrollable fullscreen>
    <template v-slot:activator="{ on }">
      <v-btn
        class="ma-1"
        text small outlined
        v-on="on"
        color="primary"
        @click="/**/"
      >
        <v-icon small :left="!$vuetify.breakpoint.sm">mdi-pencil</v-icon>
        <span :hidden="$vuetify.breakpoint.sm">Edit</span>
      </v-btn>
    </template>
    <v-card tile>
      <v-toolbar dark color="primary" flat elevate-on-scroll>
        <v-btn icon dark @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>{{ meta.title || meta.identifier }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <!--<v-toolbar-items>-->
          <v-btn
            :icon="$vuetify.breakpoint.smAndDown"
            text
            dark
            @click="openDocument(meta.identifier)"
          >
            <v-icon :left="!$vuetify.breakpoint.smAndDown">mdi-open-in-new</v-icon>
            <span :hidden="$vuetify.breakpoint.smAndDown">Open in new tab</span>
          </v-btn>
          <v-btn
            :icon="$vuetify.breakpoint.smAndDown"
            text
            dark
            color="red accent-1"
            @click="deleteDocument(meta.identifier)"
          >
            <v-icon :left="!$vuetify.breakpoint.smAndDown">mdi-delete</v-icon>
            <span :hidden="$vuetify.breakpoint.smAndDown">Delete this document</span>
          </v-btn>
        <!--</v-toolbar-items>-->
      </v-toolbar>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="5">
            <v-chip-group column>
              <v-chip
                v-for="tag in meta.tags"
                :key="tag.label"
                label
              >
                <v-icon v-if="tag.label === '..'">mdi-sync</v-icon>
                <span v-else>{{ tag.label }}</span>
                <v-divider class="mx-3" vertical v-if="tag.parameter"></v-divider>
                <strong v-if="tag.parameter">{{ tag.parameter.type === 'http://www.w3.org/2001/XMLSchema#decimal' ? tag.parameter.value : calculateDatestamp(tag.parameter.value) }}</strong>
              </v-chip>
            </v-chip-group>
            <v-progress-linear
              v-if="loading"
              indeterminate
              rounded
              height="6"
            />
          </v-col>

          <v-col cols="12" md="7">
            <v-toolbar dense>
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
                clearable
                @click:clear="scaleOff"
                suffix="%"
                type="number"
                step="10"
                class="narrow"
              />
              <v-btn icon @click="scaleUp">
                <v-icon>mdi-magnify-plus-outline</v-icon>
              </v-btn>

              <!--
              <v-btn icon disabled/>

              <v-btn icon @click="page > 1 ? page-- : 1">
                <v-icon>mdi-chevron-left</v-icon>
              </v-btn>
              <v-text-field
                hide-details
                dense
                single-line
                outlined
                v-model="page"
                :suffix="`/${ numPages ? numPages : '∞' }`"
                type="number"
                step="1"
              />
              <v-btn icon @click="page < numPages ? page++ : 1">
                <v-icon>mdi-chevron-right</v-icon>
              </v-btn>
              -->
              <v-spacer/>
            </v-toolbar>

            <pdf
              :src="pdfsrc()"
              v-for="i in numPages"
              :key="i"
              :id="i"
              :page="i"
              :scale.sync="scale"
              :resize="resize"
              @loading="loadingChange"
              class="pdf"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Server from '@tridoc/frontend'
import { Component, Prop, Vue, PropSync } from 'vue-property-decorator'

import pdfvuer from 'pdfvuer'

@Component({
  components: {
    pdf: pdfvuer
  }
})
export default class DocumentDetails extends Vue {
  @Prop() server!: () => Server;
  @PropSync('docMeta') meta!: tdDocMeta;
  @PropSync('error') err!: { message: string; title?: string } | null;

  show = false

  page = 1
  numPages = 0
  pdfdata = undefined as undefined|Promise<any>
  errors = []
  scale = 'page-width' as string|number
  loading = false
  resize = true

  pdfsrc () {
    return {
      url: ((this.server().url.startsWith('https://') || this.server().url.startsWith('http://')) ? this.server().url : 'https://' + this.server().url) + '/doc/' + this.meta.identifier,
      httpHeaders: { Authorization: this.server().headers.get('Authorization') }
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
      (this.server().url.startsWith('https://') || this.server().url.startsWith('http://'))
        ? this.server().url : 'https://' + this.server().url
    window.open(url + '/doc/' + identifier, '_blank');
  }

  deleteDocument (identifier: string) {
    if (confirm('Are you sure you want to delete this Document?')) {
      this.show = false
      const cs = this.server()
      if (cs) {
        cs.deleteDocument(identifier)
          .then(r => {
            if ('error' in r) {
              this.err = { title: r.error, message: r.message, ...r }
            } else {
              this.$emit('change')
            }
          })
      }
    }
  }

  loadingChange (b: boolean) {
    if (!b || b) {
      const cv = document.getElementsByTagName('canvas')
      for (let i = 0; i < cv.length; i++) {
        cv[i].classList.add('elevation-4')
      }
    }
  }

  scaleDown () {
    this.resize = false
    this.scale = parseFloat('' + this.scale)
    if (this.scale > 0.1) {
      this.scale = (this.scale - 0.1).toFixed(1)
    } else {
      this.scale = 0.1
    }
  }

  scaleUp () {
    this.resize = false
    this.scale = parseFloat('' + this.scale)
    if (this.scale < 1.9) {
      this.scale = (this.scale + 0.1).toFixed(1)
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
    this.scale = v / 100
  }

  getPdf () {
    const url = (
      (this.server().url.startsWith('https://') || this.server().url.startsWith('http://'))
        ? this.server().url : 'https://' + this.server().url) + '/doc/' + this.meta.identifier
    this.pdfdata = pdfvuer.createLoadingTask({ url, httpHeaders: { Authorization: this.server().headers.get('Authorization') } });
    (this.pdfdata as Promise<any>).then(pdf => {
      this.numPages = pdf.numPages;
    });
  }

  mounted () {
    this.getPdf()
  }
}
</script>

<style lang="scss">
.scroll-x {
  max-width: 100%;
  overflow-x: auto;
}

.narrow {
  flex-grow: 0;
  flex-basis: 7em;
}

.pdf {
  width: 100%;
  margin: 20px auto;
}
</style>
