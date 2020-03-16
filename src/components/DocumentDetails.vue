<template>
<v-dialog v-model="show" :fullscreen="$vuetify.breakpoint.smAndDown">
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
    <v-card :tile="$vuetify.breakpoint.smAndDown">
      <v-toolbar dark color="primary" flat elevate-on-scroll v-if="$vuetify.breakpoint.smAndDown">
        <v-btn icon dark @click="show = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>{{ meta.title || meta.identifier }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn dark text @click="show = false">Close</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-card-title>
        <span class="headline" v-if="$vuetify.breakpoint.mdAndUp">{{ meta.title || meta.identifier }}</span>
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

@Component({

})
export default class DocumentDetails extends Vue {
  @Prop() server!: () => Server;
  @PropSync('docMeta') meta!: tdDocMeta;
  @PropSync('error') err!: { message: string; title?: string } | null;

  show = false

  calculateDatestamp (isoString: string) {
    const date = new Date(isoString)
    const year = date.getFullYear().toString().padStart(4, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const dayI = date.getDate()
    const day = dayI.toString().padStart(2, '0')
    const nowDate = (new Date()).getDate()
    const daysDiff = nowDate - dayI
    switch (daysDiff) {
      case 0:
        return 'Today'
      case 1:
        return 'Yesterday'
      default:
        return `${year}-${month}-${day}`
    }
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

  mounted () {
    this.show = this.meta.identifier === '0cticPtEmeDbLYJEpS2~t'
  }
}
</script>
