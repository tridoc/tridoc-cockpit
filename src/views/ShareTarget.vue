<template>
  <v-app>
    <v-app-bar app color="primary" class="py-0">
      <v-toolbar flat dark color="primary" class="col-md-5 col-12 pa-0">
        <v-tooltip bottom open-delay="500">
          <template v-slot:activator="{ on, attrs }">
            <v-app-bar-nav-icon v-bind="attrs" v-on="on" @click.stop="$router.go(-1), $router.push('/')">
              <v-icon>mdi-arrow-left</v-icon>
            </v-app-bar-nav-icon>
          </template>
          Go Back
        </v-tooltip>
        <v-toolbar-title>
        </v-toolbar-title>
        <v-spacer />
      </v-toolbar>
    </v-app-bar>
    <v-main app>
      <!-- <object id="doc" :data="doc"></object> -->
      <div v-if="uploaded">
        The document has been uploaded. <a @click.stop="$router.replace({path: docPath})">{{ docPath }}</a>
      </div>
      <div v-else>
        Document temporarily stored by service worker: <a :href="tmpDoc">{{ tmpDoc }}</a>.
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import Server from '@tridoc/frontend'

@Component({
  components: {
  }
})
export default class ShareTarget extends Vue {
  uploaded = false;
  tmpDoc = '/ipfs/' + this.$route.query.file
  docPath: string | undefined;
  async mounted () {
    if (!this.$store.getters.server?.server) {
      throw new Error('No store configured!')
    }
    const cs = this.$store.getters.server?.server as Server
    const fetchResponse = await fetch(this.tmpDoc)
    const blob = await fetchResponse.blob()
    const uploadResult = await cs.uploadFile(blob as File)
    // TODO less horrible type handling
    if ((uploadResult as { location: string }).location) {
      this.uploaded = true
      this.docPath = (uploadResult as { location: string }).location
      await fetch(this.tmpDoc, { method: 'DELETE' })
    } else {
      throw uploadResult
    }
  }
}

</script>
