<template>
  <v-card v-if="!!error" :color="color" class="elevation-0 mt-3 pa-3" dark>
    <v-row class="ma-0 nowrap">
      <div>
        <strong>{{ title }}</strong>
        <br>
        <span>{{ message }}</span>
      </div>
      <v-spacer></v-spacer>
      <div class="vert">
        <v-btn
          :color="color+ ' darken-3'"
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
  @Prop() error!: { message: string; title?: string; color?: string } | null
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

  get color () {
    if (this.error !== null) {
      return this.error.color || 'error'
    }
    return '...'
  }
}
</script>

<style lang="scss" scoped>
.nowrap {
  flex-wrap: nowrap;
  span {
    white-space: pre-line;
  }
}
.vert {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
