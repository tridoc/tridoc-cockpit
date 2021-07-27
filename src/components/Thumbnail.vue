<template>
  <div class="thumb">
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
    <img :src="url" v-else class="elevation-4">
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class Thumbnail extends Vue {
  @Prop() id!: string

  url = './thumb.png'
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
.thumb {
  height: 150px;
  overflow: hidden;

  img {
    display: block;
    margin: 1rem;
    width: calc(100% - 2rem)

  }
}
</style>
