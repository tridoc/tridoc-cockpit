<template>
  <router-view/>
</template>

<script lang="ts">
import { Component, Watch, Vue } from 'vue-property-decorator'

import '@/global-types.ts'

@Component({})
export default class App extends Vue {
  restore () {
    const storedServers = JSON.parse(localStorage.getItem('servers') || 'false');
    const storedCurrent = parseInt(localStorage.getItem('currentserver') || '0', 10);
    if (storedServers) {
      storedServers.forEach(({ password, url }: { password: string; url: string }) => {
        this.$store.commit('addServer', { password, url })
      })
    }
    this.$store.commit('currentServer', { index: storedCurrent })
  }

  created () {
    this.restore()
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
