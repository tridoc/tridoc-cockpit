<template>
  <v-card v-if="!!error" color="error" class="elevation-0 mt-3 pa-3" dark>
    <v-row class="ma-0">
      <div>
        <strong>{{ title }}</strong>
        <br>
        {{ message }}
      </div>
      <v-spacer></v-spacer>
      <div class="vert">
        <v-btn
          color="error darken-3"
          @click="close"
        >
          Dismiss
        </v-btn>
      </div>
    </v-row>
  </v-card>
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

<style lang="scss" scoped>
.vert {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
