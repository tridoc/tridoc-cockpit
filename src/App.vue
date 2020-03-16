<template>
<v-app>
  <v-navigation-drawer
    v-model="drawer"
    :clipped="$vuetify.breakpoint.mdAndUp"
    app
  >
    <tag-list
      :reload="reload"
      :error="onError"
      :deleteTag="deleteTag"
      :currentserver="currentserver"
      :tags="tags"
    />
    <template v-slot:append>
      <v-divider />
      <v-list nav dense>
        <settings-dialog
          :servers="servers"
          :current="current()"
          @save="serverchange"
          @delete="serverremove"
        />
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
              :key="i"
              link
              :disabled="child.disabled"
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
      </v-list>
    </template>
  </v-navigation-drawer>

  <v-app-bar :clipped-left="true" app color="primary" :flat="$vuetify.breakpoint.mdAndUp" dark>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
    <v-toolbar-title style="width: 300px" class="hidden-sm-and-down">
      tridoc Cockpit
    </v-toolbar-title>
    <v-spacer/>
    <v-text-field
      disabled=""
      flat
      solo-inverted
      hide-details
      prepend-inner-icon="mdi-magnify"
      label="Search"
    />
    <v-btn icon
        disabled
      >
      <v-icon>mdi-filter-remove</v-icon>
    </v-btn>
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
    <v-container class="sfill-height" fluid>
      <v-row align="start">
        <v-col cols="12">
          <v-card outlined>
            <v-data-table
              disable-sort
              disable-filtering
              :headers="headers"
              :items="docs"
              :options.sync="options"
              :server-items-length="count"
              :loading="loading"
              item-key="identifier"
              :footer-props="{ showFirstLastPage: true }"
            >
              <template v-slot:item.tags="{ item }">
                <v-chip-group>
                  <v-chip
                    v-for="tag in item.tags"
                    :key="tag.label"
                    label
                  >
                    <v-icon v-if="tag.label === '..'">mdi-sync</v-icon>
                    <span v-else>{{ tag.label }}</span>
                    <v-divider class="mx-3" vertical v-if="tag.parameter"></v-divider>
                    <strong v-if="tag.parameter">{{ tag.parameter.type === 'http://www.w3.org/2001/XMLSchema#decimal' ? tag.parameter.value : calculateDatestamp(tag.parameter.value) }}</strong>
                  </v-chip>
                </v-chip-group>
              </template>
              <template v-slot:item.created="{ item }">
                {{ calculateTimestamp(item.created) }}
              </template>
              <template v-slot:item.identifier="{ item }">
                <pre>{{ item.identifier }}</pre>
              </template>
              <template v-slot:item.actions="{ item }">
                <div class="d-flex">
                  <v-btn
                    class="ma-1"
                    small
                    text
                    outlined
                    color="primary darken-1"
                    @click="openDocument(item.identifier)"
                  >
                    <v-icon small :left="!$vuetify.breakpoint.sm">mdi-open-in-new</v-icon>
                    <span :hidden="$vuetify.breakpoint.sm">Open</span>
                  </v-btn>
                  <document-details
                    :server="currentserver"
                    :docMeta.sync="item"
                    :error="error"
                    @change="reload"
                  />
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

<style scoped>
.container.fill-height > .row {
    max-width: unset;
}
</style>
