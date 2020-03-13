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
    <!--<v-btn icon>
      <v-icon>mdi-invert-colors</v-icon>
    </v-btn>-->
  </v-app-bar>

  <v-content app>
    <v-container class="fill-height" fluid>
    </v-container>
  </v-content>

  <error-dialog :error="error" :close="() => error = null" />
</v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Server from '@tridoc/frontend'
import TagCreator from './components/TagCreator.vue'
import ErrorDialog from './components/Error.vue'

interface Tag {
  'icon': string;
  'label': string;
  'type-icon'?: string;
}

@Component({
  components: {
    TagCreator,
    ErrorDialog
  }
})
export default class App extends Vue {
  error: { message: string; title?: string } | null = null
  serverurl = 'http://192.168.1.6:8000'
  drawer = null
  navItems = [
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

  tags: Tag[] = [];

  tagActions = [
    {
      name: 'Delete',
      fn: (t: Tag) => this.deleteTag(t.label)
    },
  ]

  server = new Server(this.serverurl, 'tridoc', 'pw123')

  deleteTag (label: string) {
    this.server.deleteTag(label)
      .then((r: {error?: string}) => {
        if (r.error) {
          console.log(r)
          this.error = { message: r.error, ...r }
        } else {
          this.reload()
        }
      })
  }

  reload () {
    this.server.getTags()
      .then((r: { label: string; parameter?: { type: string }; error?: string }[]) => {
        if (r.error) {
          console.log(r)
          this.error = { message: r.error, ...r }
        } else {
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
        }
      })
  }

  mounted () {
    // this.server.countDocuments('', '', '').then((r: number) => alert('Documents found: ' + r))
    this.reload()
  }
}
</script>
