<template>
<v-app>
  <v-navigation-drawer
    v-model="drawer"
    :clipped="$vuetify.breakpoint.mdAndUp"
    app
  >
    <v-list nav dense>
      <v-subheader>TAGS</v-subheader>
      <v-list-item-group color="primary">
        <tag-creator
          :server="server"
          @tagcreated="reload"
        />
        <v-list-item
          v-for="(item, i) in tags"
          :key="i"
        >
          <v-list-item-icon>
            <v-icon v-text="item.icon"></v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.label"></v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-icon v-text="item['type-icon']" small></v-icon>
          </v-list-item-action>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <v-divider />
    <v-list nav dense>
      <template v-for="item in items">
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
import { Component, Vue } from 'vue-property-decorator'
import Server from '@tridoc/frontend'
import TagCreator from './components/TagCreator.vue'

@Component({
  components: {
    TagCreator
  }
})
export default class App extends Vue {
  drawer = null
  items = [
    {
      icon: 'mdi-filter-remove',
      text: 'Show all',
      hide: true,
      disabled: true,
    },
    {
      icon: 'mdi-cog',
      text: 'Settings',
      disabled: true,
    },
    {
      icon: 'mdi-help-circle',
      text: 'Help',
      disabled: true,
    },
    {
      icon: 'mdi-chevron-up',
      'icon-alt': 'mdi-chevron-down',
      text: 'More',
      model: false,
      children: [
        {
          icon: 'mdi-package-down',
          text: 'Export',
          disabled: true,
        }
      ],
    }
  ]

  tags: {'icon': string; 'label': string; 'type-icon'?: string}[] = [];

  server = new Server('http://localhost:8000', 'tridoc', 'pw123')

  reload () {
    this.server.getTags()
      .then((r: {label: string; parameter?: { type: string }}[]) => {
        this.tags = r.map(e => {
          const result = {
            icon: 'mdi-tag',
            label: e.label,
            'type-icon': ''
          }
          if (e.parameter) {
            switch (e.parameter.type) {
              case 'http://www.w3.org/2001/XMLSchema#decimal':
                result['type-icon'] = 'mdi-pound'
                break;
              case 'http://www.w3.org/2001/XMLSchema#date':
                result['type-icon'] = 'mdi-calendar'
                break;
              default:
                break;
            }
          }
          return result
        });
        this.tags.sort((a, b) => {
          const labelA = a.label.toUpperCase();
          const labelB = b.label.toUpperCase();
          if (labelA < labelB) {
            return -1;
          }
          if (labelA > labelB) {
            return 1;
          }
          return 0;
        })
      })
  }

  mounted () {
    // this.server.countDocuments('', '', '').then((r: number) => alert('Documents found: ' + r))
    this.reload()
  }
}
</script>
