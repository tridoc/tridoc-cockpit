<template>
  <v-sheet
    :color="$vuetify.theme.dark ? 'grey darken-3' : 'grey lighten-2'"
    :style="$store.state.viewSettings.dense ? 'height : 40px;' : 'height: 120px;'"
    class="thumb"
  >
    <v-row
      v-if="loading"
      class="fill-height ma-0"
      align="center"
      justify="center"
    >
      <v-progress-circular
        indeterminate
        color="grey"
      />
    </v-row>
    <img v-else-if="url" :src="url" class="elevation-4">
    <v-sheet class="noimg" elevation="4" tile :color="$vuetify.theme.dark ? 'grey darken-4' : 'white'"/>
  </v-sheet>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class Thumbnail extends Vue {
  @Prop() id!: string

  url = ''
  loading = true

  mounted () {
    const url = ((this.$store.getters.server.url.startsWith('https://') || this.$store.getters.server.url.startsWith('http://')) ? this.$store.getters.server.url : 'https://' + this.$store.getters.server.url) + '/doc/' + this.id + '/thumb'
    const options = {
      headers: {
        Authorization: this.$store.getters.server.server.headers.get('Authorization')
      }
    }

    fetch(url, options)
      .then(r => r.blob())
      .then(b => {
        this.loading = false
        this.url = URL.createObjectURL(b)
      }).catch(() => {
        this.loading = false
      })
  }
}
</script>

<style lang="scss" scoped>
$margin: 8px;

.thumb {
  overflow: hidden;

  img,
  .noimg {
    display: block;
    margin: $margin;
    width: calc(100% - calc(2 * #{$margin}));
  }

  .noimg {
    height: calc(100% - #{$margin});
  }
}
</style>
