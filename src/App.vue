<template>
<v-app>
  <v-navigation-drawer
    v-model="drawer"
    :clipped="$vuetify.breakpoint.lgAndUp"
    app
    bottom
  >
    <tag-list />
    <v-divider />
    <v-list nav>
      <template v-for="item in items">
        <v-list-group
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
          <v-list-item dense v-for="(child, i) in item.children" :key="i" link>
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

  <v-app-bar :clipped-left="true" app color="blue darken-3" dark>
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
    <!--<v-btn icon>
      <v-icon>mdi-invert-colors</v-icon>
    </v-btn>-->
  </v-app-bar>
  <v-content app>
    <v-container class="fill-height" fluid>
    </v-container>
  </v-content>
  <!--<v-btn bottom color="pink" dark fab fixed right @click="dialog = !dialog">
    <v-icon>mdi-plus</v-icon>
  </v-btn>
  <v-dialog v-model="dialog" width="800px">
    <v-card>
      <v-card-title class="grey darken-2">Create contact</v-card-title>
      <v-container>
        <v-row class="mx-2">
          <v-col class="align-center justify-space-between" cols="12">
            <v-row align="center" class="mr-0">
              <v-avatar size="40px" class="mx-3">
                <img src="//ssl.gstatic.com/s2/oz/images/sge/grey_silhouette.png" alt />
              </v-avatar>
              <v-text-field placeholder="Name" />
            </v-row>
          </v-col>
          <v-col cols="6">
            <v-text-field prepend-icon="mdi-account-card-details-outline" placeholder="Company" />
          </v-col>
          <v-col cols="6">
            <v-text-field placeholder="Job title" />
          </v-col>
          <v-col cols="12">
            <v-text-field prepend-icon="mdi-mail" placeholder="Email" />
          </v-col>
          <v-col cols="12">
            <v-text-field type="tel" prepend-icon="mdi-phone" placeholder="(000) 000 - 0000" />
          </v-col>
          <v-col cols="12">
            <v-text-field prepend-icon="mdi-text" placeholder="Notes" />
          </v-col>
        </v-row>
      </v-container>
      <v-card-actions>
        <v-btn text color="primary">More</v-btn>
        <v-spacer />
        <v-btn text color="primary" @click="dialog = false">Cancel</v-btn>
        <v-btn text @click="dialog = false">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>-->
</v-app>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import TagList from '@/components/TagList'

@Component({
  components: {
    TagList
  }
})
export default class App extends Vue {
  drawer = null
  items = [
    {
      icon: 'mdi-filter-remove',
      text: 'Show all',
      hide: true
    },
    { icon: 'mdi-cog', text: 'Settings' },
    { icon: 'mdi-help-circle', text: 'Help' },
    {
      icon: 'mdi-chevron-up',
      'icon-alt': 'mdi-chevron-down',
      text: 'More',
      model: false,
      children: [
        { icon: 'mdi-package-down', text: 'Export' }
      ],
    }
  ]
}
</script>
