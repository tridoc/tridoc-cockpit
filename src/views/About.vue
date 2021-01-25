<template>
  <div class="about">
    <h1>This is <code>{{ id }}</code></h1>
    <pre>{{ message }}</pre>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { inspect } from 'util'

@Component({})
export default class ErrorDialog extends Vue {
  @Prop() id!: string

  message = '...'

  mounted () {
    this.message = inspect(this.$store)
  }
}
</script>
