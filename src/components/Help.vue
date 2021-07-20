<template>
<v-navigation-drawer
  v-model="show"
  app
  mobile-breakpoint="0"
  class="top"
  :width="$vuetify.breakpoint.smAndUp ? 432 : '100vw'"
  temporary right absolute
>
  <v-app-bar fixed dark color="primary" flat elevate-on-scroll>
    <v-toolbar-title>Help & About</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <v-btn icon dark @click="show = false">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar-items>
  </v-app-bar>

  <v-main class="scroll">
    <v-container
      class="px-4"
      fluid
    >
      <h2 class="mb-3">Help</h2>
      <h3>Server</h3>
      <p>
        Set your server in the settings.
        They’re accessible via the cog icon in the top right corner (only visible after closing this window).
        If you haven’t access to any server, <a href="https://github.com/tridoc/tridoc-backend/blob/master/README.md">learn how to set one up</a>.
      </p>
      <h3>Tags and Filters</h3>
      <p>
        Tridoc has an advanced tagging system with two kinds of tags:
        normal tags which behave as you’d expect
        and “parameterizable” tags which allow either a number or date to be set when adding them to documents.
        This allows for more specific filtering for certain ranges of values.
        The tag filters can be either in- or exclusive and are added together:
        A document must fulfil all filters to show up in the results.
      </p>
      <p>
        The search bar searches in document texts and titles.
        For this purpose, the server tries to do OCR (character recognition) on all documents which don’t already contain text metadata.
      </p>
      <h3>Comments</h3>
      <p>
        There exists the ability to add comments to documents.
        Currently, there is no way of deleting or editing comments.
      </p>
      <v-divider/>
      <h2 class="my-3">About Tridoc</h2>
      <p>
        Tridoc aims to provide easy document management for individuals and small teams.
      </p>
      <p>
        On the server-side, Tridoc runs using hapijs in node and fuseki.
        <a href="https://github.com/tridoc/tridoc-backend">View the repository of the backend.</a>
      </p>
      <p>
        There also exists <a href="https://github.com/tridoc/tridoc-folder">a native program</a> for easy upload from a folder on your computer.
        It doesn’t, however, provide any graphical user interface (yet).
      </p>
      <p>
        If you’ve been using Evernote before, you can import your notebooks’ PDFs to tridoc with our <a href="https://github.com/tridoc/tridoc-enex-importer">Enex importer</a>.
      </p>
      <v-btn block href="https://github.com/tridoc/tridoc-cockpit">
        <v-icon left>mdi-github</v-icon>
        View the repository on Github
      </v-btn>
    </v-container>
  </v-main>
</v-navigation-drawer>
</template>

<script lang="ts">
import { Component, PropSync, Vue } from 'vue-property-decorator'

@Component({})
export default class HelpDrawer extends Vue {
  @PropSync('open') show !: boolean;
}
</script>

<style lang="scss" scoped>
.top {
  z-index: 900;
  position: fixed;
  top: 0;
  right: 0;
  max-height: 100vh;
}

.scroll {
  padding-left: 0 !important;
  padding-right: 0 !important;
  // margin-top: 56px;
  // max-height: calc(100vh - 56px);
  overflow-y: auto;
}
</style>
