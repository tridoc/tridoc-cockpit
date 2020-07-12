<template>
  <v-list nav dense>
    <v-subheader>TAGS</v-subheader>
    <v-list-item-group color="secondary">

      <tag-creator
        :server="currentserver()"
        @tagcreated="reload"
        @error="error({ title: r.error, message: r.message })"
      />

      <v-list-item
        v-for="(tag) in tags"
        :key="tag.label"
      >
        <v-list-item-icon>
          <v-icon v-text="tag['type-icon'] || tag.icon"></v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title v-text="tag.label"></v-list-item-title>
        </v-list-item-content>
        <v-menu
          absolute
          offset-y
          max-width="600px"
        >
          <template v-slot:activator="{ on }">
            <v-list-item-action v-on="on">
              <v-icon small>mdi-dots-vertical</v-icon>
            </v-list-item-action>
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
      </v-list-item>

    </v-list-item-group>
  </v-list>
</template>

<script lang="ts">
import Server from '@tridoc/frontend'
import { Component, Prop, Vue, PropSync, Watch } from 'vue-property-decorator'
import TagCreator from '@/components/TagCreator.vue'

interface Tag {
  'icon': string;
  'label': string;
  'type-icon'?: string;
}

@Component({
  components: {
    TagCreator,
  }
})
export default class TagList extends Vue {
  @Prop() reload!: () => void
  @Prop() getDocuments!: () => void
  @Prop() error!: ({ title, message }: { title: string; message: string }) => void
  @Prop() deleteTag!: (label: string) => void
  @Prop() currentserver!: () => Server | null
  @Prop() tags!: Tag[]

  @Prop() search!: string;
  searchstring = this.search;

  @Watch('search')
  chSearch (val: string) {
    this.searchstring = val
  }

  @Watch('searchstring')
  chSearchstring (val: string) {
    this.$emit('update:search', val);
  }

  menu: {[key: string]: boolean} = {}
  x = 0
  y = 0

  pretty (j: any) {
    console.log(j)
    return JSON.stringify(j) + ' ←'
  }

  showMenu (activator: any, e: MouseEvent) {
    activator.value = true
    this.x = e.clientX
    this.x = e.clientY
  }

  addToSearch (tag: string) {
    if (this.searchstring) {
      this.searchstring = this.searchstring.replace(new RegExp('(^|[^\\\\])##?' + tag + '\\b', 'g'), '') // remove tag and notTag from search
      this.searchstring += ' #' + tag
    } else {
      this.searchstring = '#' + tag
    }
    this.$nextTick(this.getDocuments)
  }

  excludeFromSearch (tag: string) {
    if (this.searchstring) {
      this.searchstring = this.searchstring.replace(new RegExp('(^|[^\\\\])##?' + tag + '\\b', 'g'), '') // remove tag and notTag from search
      this.searchstring += ' ##' + tag
    } else {
      this.searchstring = '##' + tag
    }
    this.$nextTick(this.getDocuments)
  }

  tagActions = [
    {
      name: 'Add to search',
      fn: (t: Tag) => this.addToSearch(t.label)
    },
    {
      name: 'Exclude from search',
      fn: (t: Tag) => this.excludeFromSearch(t.label)
    },
    {
      name: 'Delete',
      fn: (t: Tag) => this.deleteTag(t.label)
    },
  ]
}
</script>
