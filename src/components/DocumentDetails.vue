<template>
<v-dialog v-model="show" scrollable :fullscreen="true /*$vuetify.breakpoint.smAndDown*/">
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
    <v-card :tile="true /*$vuetify.breakpoint.smAndDown*/">
      <v-toolbar dark color="primary" flat elevate-on-scroll v-if="true /*$vuetify.breakpoint.smAndDown*/">
        <v-btn icon dark @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>{{ meta.title || meta.identifier }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn dark text @click="show = false">Close</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-title v-if="false /*$vuetify.breakpoint.mdAndUp*/">
        <span class="headline">{{ meta.title || meta.identifier }}</span>
      </v-card-title>
      <v-card-text>
        <v-chip-group>
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
        <pdf
          :src="pdfsrc()"
          v-for="i in numPages"
          :key="i"
          :id="i"
          :page="i"
          :scale.sync="scale"
          resize
          style="width:100%;margin:20px auto;"
          @loading="(b) => {console.log(b); loading = b}"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text
          color="primary"
          @click="openDocument(meta.identifier)"
        >
          <v-icon left>mdi-open-in-new</v-icon>
          Open in new tab
        </v-btn>
        <v-btn
          text
          color="accent"
          @click="deleteDocument(meta.identifier)"
        >
          <v-icon left>mdi-delete</v-icon>
          Delete this document
        </v-btn>
        <v-btn v-if="$vuetify.breakpoint.mdAndUp" color="secondary darken-1" text @click="show = false">Close</v-btn>
      </v-card-actions>
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
  scale = 'page-width'
  loading = false

  console = console

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
