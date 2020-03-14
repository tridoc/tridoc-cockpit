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
      flat
      solo-inverted
      hide-details
      prepend-inner-icon="mdi-magnify"
      label="Search"
    />
    <v-spacer/>
    <v-btn icon>
      <v-icon
        @click="$vuetify.theme.dark = !$vuetify.theme.dark"
      >mdi-invert-colors</v-icon>
    </v-btn>
  </v-app-bar>

  <v-content app>
    <v-container class="fill-height" fluid>
    </v-container>
  </v-content>

  <error-dialog :error="error" :close="() => error = null" />
</v-app>
</template>

<script lang="ts" src="./App.ts" />
