<template>
<v-app>
  <v-navigation-drawer
    v-model="drawer"
    :clipped="$vuetify.breakpoint.mdAndUp"
    app width="288"
  >
    <v-list nav dense>
      <v-subheader>TAGS</v-subheader>
      <v-list-item-group color="secondary">

        <tag-creator
          :server="currentserver()"
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
          :currentserver="currentserver"
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

      </v-list-item-group>
    </v-list>
    <template v-slot:append>
      <v-divider />
      <v-list nav dense>
        <template v-for="item in navItems">
          <v-list-group
            :disabled="item.disabled"
            v-if="item.children"
            :key="item.text"
            v-model="item.model"
            :prepend-icon="item.icon || ' '"
            no-action
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item
              dense
              v-for="(child, i) in item.children"
              :disabled="child.disabled"
              :key="i"
              :href="child.href"
              link
            >
              <v-list-item-action v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ child.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item
            v-else-if="!item.hide"
            :disabled="item.disabled"
            :key="item.text"
            :href="item.href"
            link
          >
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <v-list-item disabled v-if="currentserver()" stwo-line>
          <v-list-item-content>
            <v-list-item-subtitle>{{ currentserver().url }}</v-list-item-subtitle>
            <!--<v-list-item-subtitle>with version: {{ version() }}</v-list-item-subtitle>-->
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>

  <settings-drawer
    :open.sync="settingsOpen"
    :view.sync="viewSettings"
    :servers="servers"
    :current="current()"
    @save="serverchange"
    @delete="serverremove"
  />

  <v-app-bar :clipped-left="true" app color="primary" :flat="$vuetify.breakpoint.mdAndUp" dark>
    <v-app-bar-nav-icon @click.stop="settingsOpen = !settingsOpen">
      <v-icon >mdi-cog</v-icon>
    </v-app-bar-nav-icon>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer">
      <v-icon>mdi-tag-multiple</v-icon>
    </v-app-bar-nav-icon>
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
    <v-btn icon
        @click="reload"
      >
      <v-icon>mdi-refresh</v-icon>
    </v-btn>
    <v-spacer/>
    <v-btn icon
        @click="$vuetify.theme.dark = !$vuetify.theme.dark"
      >
      <v-icon>mdi-invert-colors</v-icon>
    </v-btn>
  </v-app-bar>

  <v-content app>
    <v-container class="sfill-height" fluid @drag.stop.prevent @dragstart.stop.prevent @dragend.stop.prevent @dragover.stop.prevent @dragenter.stop.prevent @dragleave.stop.prevent @drop.stop.prevent="addFile">
      <v-row align="start">
        <v-col cols="12">
          <v-card outlined>
            <document-details
              v-for="item in docs"
              :key="item.identifier"
              :server="currentserver"
              :docMeta="item"
              @update:docMeta="updateDoc"
              :error="error"
              @change="reload"
              :open="open === item.identifier"
              @update:open="open = ''"
            />
            <v-data-table
              disable-sort
              disable-filtering
              :headers="headers"
              :items="docs"
              :options="options"
              :server-items-length="count"
              :loading="loading"
              item-key="identifier"
              no-data-text="No documents found"
              hide-default-footer
              @click:row="i => open = i.identifier"
            >
              <template v-slot:item.title="{ item }">
                {{ item.title }}
                <i v-if="!item.title">Untitled Document</i>
              </template>
              <template v-slot:item.tags="{ item }">
                <div :style="$vuetify.breakpoint.mdAndUp ? 'max-width:40vw;' : 'max-width:80vw;'">
                  <v-chip-group
                    :show-arrows="$vuetify.breakpoint.mdAndUp"
                    :dcolumn="!$vuetify.breakpoint.mdAndUp"
                    column
                  >
                    <v-chip
                      v-for="tag in item.tags"
                      :key="tag.label + (tag.parameter ? tag.parameter.value : '')"
                      label
                    >
                      <v-icon v-if="tag.label === '..'">mdi-sync</v-icon>
                      <span v-else>{{ tag.label }}</span>
                      <v-divider class="mx-3" vertical v-if="tag.parameter"></v-divider>
                      <strong v-if="tag.parameter">{{ tag.parameter.type === 'http://www.w3.org/2001/XMLSchema#decimal' ? tag.parameter.value : calculateDatestamp(tag.parameter.value) }}</strong>
                    </v-chip>
                  </v-chip-group>
                </div>
              </template>
              <template v-slot:item.created="{ item }">
                {{ calculateTimestamp(item.created) }}
              </template>
              <template v-slot:item.identifier="{ item }">
                <pre>{{ item.identifier }}</pre>
              </template>
              <template v-slot:item.actions="{ item }">
                <div class="d-flex ml-n7 mr-n3">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        class="ma-1"
                        outlined text small
                        color="primary darken-1"
                        @click.stop="openDocument(item.identifier)"
                        link
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon small>mdi-open-in-new</v-icon>
                      </v-btn>
                    </template>
                    <small>Open document directly<br>Opens in new Tab</small>
                  </v-tooltip>
                  <v-btn
                    class="ma-1"
                    small
                    color="primary"
                    @click.stop="open = item.identifier"
                  >
                    <v-icon small :left="!$vuetify.breakpoint.sm">mdi-file-eye-outline</v-icon>
                    <span :hidden="$vuetify.breakpoint.sm">Open</span>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card>
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
  </v-content>

  <error-dialog :error="error" :close="() => error = null" />
</v-app>
</template>

<script lang="ts" src="./App.ts" />

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

<style lang="scss">
code,
pre,
kbd {
  font-family: 'Roboto Mono', monospace;
}

.v-application .error--text.text--accent-1 {
    color: #ab1407 !important;
    caret-color: #ab1407 !important;
}
</style>
