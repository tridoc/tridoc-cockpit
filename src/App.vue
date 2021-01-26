<template>
  <router-view/>
</template>

<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator'

import '@/global-types.ts'

@Component({})
export default class App extends Vue {
  @Watch('$store.state.viewSettings.darkMode')
  changeDarkmode (n: boolean) {
    this.$vuetify.theme.dark = n
  }

  created () {
    this.$store.dispatch('restore')
  }
}
</script>

<style lang="scss">
* {
  will-change: auto !important;
}

code,
pre,
kbd {
  font-family: 'Roboto Mono', monospace;
}

.v-application .error--text.text--accent-1 {
    color: #ab1407 !important;
    caret-color: #ab1407 !important;
}

.theme--dark.v-navigation-drawer .theme--dark.v-card {
  background-color: #363636;
}
</style>
