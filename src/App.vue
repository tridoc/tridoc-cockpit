<template>
<v-app>
  <v-navigation-drawer
    v-model="drawer"
    :clipped="$vuetify.breakpoint.mdAndUp"
    app
  >
    <v-list nav dense>
      <v-subheader>TAGS</v-subheader>
      <v-list-item-group color="secondary">

        <tag-creator
          :server="currentserver()"
          @tagcreated="reload"
          @error="r => this.error = { title: r.error, message: r.message }"
        />

        <v-menu
          v-for="(tag, i) in tags"
          :key="i"
          absolute
          offset-y
          style="max-width: 600px"
        >
          <template v-slot:activator="{ on }">
            <v-list-item v-on="on">
              <v-list-item-icon>
                <v-icon v-text="tag.icon"></v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="tag.label"></v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-icon v-text="tag['type-icon']" small></v-icon>
              </v-list-item-action>
            </v-list-item>
          </template>
          <v-list>
            <v-list-item
              v-for="(item, index) in tagActions"
              :key="index"
              @click="() => item.fn(tag)"
            >
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>

      </v-list-item-group>
    </v-list>
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
          :prepend-icon="item.model ? item.icon : item['icon-alt']"
          append-icon
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
