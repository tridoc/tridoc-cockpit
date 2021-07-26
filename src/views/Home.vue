<template>
<v-app>
  <v-navigation-drawer
    v-model="drawer"
    :clipped="$vuetify.breakpoint.mdAndUp"
    app width="288"
  >
    <div class="pa-3">
      <v-subheader>TAGS</v-subheader>
      <tag-creator
        @tagcreated="reload"
        @error="onError({ title: r.error, message: r.message })"
      />
      <tag-filter
        v-for="(tag) in tags"
        :key="tag.label"
        :tag="tag"
        :reload="reload"
        :getDocuments="getDocuments"
        :error="onError"
        :deleteTag="deleteTag"
        :tags="tags"
        :search.sync="search"
      />
      <v-btn
        block outlined text small
        class="my-2"
        color="error accent-1"
        @click="clearTags"
      >
        Clear Tag Filters
      </v-btn>
      <v-btn
        block outlined text small
        class="my-2"
        color="error accent-1"
        @click="clearSearch"
      >
        Clear All Filters
      </v-btn>
    </div>
    <template v-slot:append>
      <v-divider />
      <v-list nav dense>
        <v-list-item disabled v-if="$store.getters.server">
          <v-list-item-content>
            <v-list-item-subtitle>{{ $store.getters.server.url }}</v-list-item-subtitle>
            <!--<v-list-item-subtitle>with version: {{ version() }}</v-list-item-subtitle>-->
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>

  <settings-drawer
    :open.sync="settingsOpen"
    @save="serverchange"
    @delete="serverremove"
  />

  <help-drawer :open.sync="helpOpen"/>

  <v-app-bar clipped-left app color="primary" elevate-on-scroll dark>
    <v-tooltip bottom open-delay="500">
      <template v-slot:activator="{ on, attrs }">
        <v-app-bar-nav-icon
          v-bind="attrs"
          v-on="on"
          @click.stop="drawer = !drawer"
        >
          <v-icon>mdi-tag-multiple</v-icon>
        </v-app-bar-nav-icon>
      </template>
      Tag filters
    </v-tooltip>
    <v-toolbar-title style="width: 300px" class="hidden-sm-and-down">
      <strong>tridoc</strong>
    </v-toolbar-title>
    <v-spacer/>
    <v-text-field
      v-model="search.text"
      @change="getDocuments"
      flat
      solo-inverted
      hide-details
      clearable
      dclear-icon="mdi-filter-remove"
      @click:clear="search.text = ''; reload()"
      prepend-inner-icon="mdi-magnify"
      label="Search"
    />
    <v-tooltip bottom open-delay="500">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          v-bind="attrs"
          v-on="on"
          @click="reload"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </template>
      Refresh
    </v-tooltip>
    <v-tooltip bottom open-delay="500">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon disabled
          v-bind="attrs"
          v-on="on"
          @click="listView = !listView"
        >
          <v-icon v-if="listView">mdi-view-module</v-icon>
          <v-icon v-else>mdi-view-list</v-icon>
        </v-btn>
      </template>
      {{ listView ? 'Grid View' : 'List View' }}
    </v-tooltip>
    <v-spacer/>
    <v-tooltip bottom open-delay="500">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          v-bind="attrs"
          v-on="on"
          @click.stop="helpOpen = !helpOpen"
        >
          <v-icon>mdi-help-circle</v-icon>
        </v-btn>
      </template>
      Help & About
    </v-tooltip>
    <v-tooltip bottom open-delay="500">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          icon
          v-bind="attrs"
          v-on="on"
          @click.stop="settingsOpen = !settingsOpen"
        >
          <v-icon >mdi-cog</v-icon>
        </v-btn>
      </template>
      Settings
    </v-tooltip>
  </v-app-bar>

  <v-main app>
    <v-container class="sfill-height" fluid @drag.stop.prevent @dragstart.stop.prevent @dragend.stop.prevent @dragover.stop.prevent @dragenter.stop.prevent @dragleave.stop.prevent @drop.stop.prevent="addFile">
      <v-row v-if="welcome" align="start">
        <v-col cols="12">
          <v-card outlined>
            <v-card-title>Welcome</v-card-title>
            <v-card-text>
              It looks like there’s no server configured. If this is your first time using Tridoc, <a class="text-decoration-underline" @click.stop="helpOpen = true">have a look at “Help & About”</a>.
            </v-card-text>
            <v-card-text class="pt-0">
              This message will disappear as soon as you <a class="text-decoration-underline" @click.stop="settingsOpen = true">connect to a server in the settings</a>.
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row align="start">
        <v-col class="py-0" cols="12">
          <error-dialog :error="error" :close="() => error = null" />
        </v-col>
      </v-row>
      <v-row class="mt-3" align="start">
        <v-col cols="12">
          <document-list
            :docs="docs"
            :list="listView"
            :loading="loading"
          />
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="auto" align="center">
          <v-btn
            class="ma-2"
            :disabled="options.page < 2"
            @click="paginationFirst()"
            outlined text fab small>
            <v-icon>mdi-page-first</v-icon>
          </v-btn>
          <v-btn
            class="ma-2"
            :disabled="options.page < 2"
            @click="paginationPrev()"
            outlined text fab small>
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <span class="ma-2">
            {{ docscounter() }}
          </span>
          <span class="ma-2">
            page {{ pagecounter() }}
          </span>
          <v-btn
            class="ma-2"
            :disabled="options.page * options.itemsPerPage >= count"
            @click="paginationNext()"
            outlined text fab small>
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn
            class="ma-2"
            :disabled="options.page * options.itemsPerPage >= count"
            @click="paginationLast()"
            outlined text fab small>
            <v-icon>mdi-page-last</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row align="start">
        <v-col cols="12">
          <v-card outlined>
            <v-data-table
              disable-sort
              disable-filtering
              :headers="uploadHeaders"
              :items="uploadDocs"
              item-key="file.name"
              disable-pagination
              hide-default-footer
              hide-default-header
              no-data-text="Drop documents here to upload"
            >
              <template v-slot:item.actions="{ item }">
                <div class="mr-n3">
                  <v-btn
                    class="ma-1"
                    small
                    text
                    outlined
                    color="error accent-1"
                    @click="removeUploadDocument(item)"
                  >
                    <v-icon small :left="!$vuetify.breakpoint.sm">mdi-close</v-icon>
                    <span :hidden="$vuetify.breakpoint.sm">Cancel</span>
                  </v-btn>
                  <v-btn
                    class="ma-1"
                    small
                    color="primary"
                    @click="uploadDocument(item)"
                    :loading="item.loading"
                  >
                    <v-icon small :left="!$vuetify.breakpoint.sm">mdi-upload</v-icon>
                    <span :hidden="$vuetify.breakpoint.sm">Upload</span>
                  </v-btn>
                </div>
              </template>
              <template v-slot:footer>
                <v-divider />
                <div class="d-flex">
                  <v-btn
                    class="ma-2"
                    outlined small text
                    color="primary"
                  >
                    <span>Add File</span>
                    <input @change="addFileInput" type="file"/>
                  </v-btn>
                  <v-spacer />
                  <v-btn
                    class="ma-2"
                    outlined small text
                    color="primary"
                    @click="uploadAll"
                    :disabled="uploadDocs.length === 0"
                  >
                    <v-icon left>mdi-upload</v-icon>
                    <span>Upload All</span>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</v-app>
</template>

<script lang="ts" src="./Home.ts" />

<style scoped lang="scss">
input[type=file] {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  margin: 0;
  padding: 0;
  cursor: pointer;
  opacity: 0;
}
</style>
