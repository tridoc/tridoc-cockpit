<template>
<v-dialog
  :value="!!error"
>
  <v-card color="error" dark>
    <v-card-title class="headline">{{ title }}</v-card-title>

    <v-card-text>{{ message }}</v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        text
        @click="close"
      >
        Close
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({

})
export default class ErrorDialog extends Vue {
  @Prop() error!: { message: string; title?: string } | null
  @Prop() close!: () => void

  get title () {
    if (this.error !== null) {
      return this.error.title || 'An Error Occured'
    }
    return '...'
  }

  get message () {
    if (this.error !== null) {
      return this.error.message || 'Unknown error'
    }
    return '...'
  }
}
</script>
