<template>
  <v-list nav dense>
    <v-subheader>TAGS</v-subheader>
    <v-list-item-group color="secondary">

      <tag-creator
        :server="currentserver()"
        @tagcreated="reload"
        @error="error({ title: r.error, message: r.message })"
      />

      <v-menu
        v-for="(tag) in tags"
        :key="tag.label"
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
</template>

<script lang="ts">
import Server from '@tridoc/frontend'
import { Component, Prop, Vue } from 'vue-property-decorator'
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
  @Prop() error!: ({ title, message }: { title: string; message: string }) => void
  @Prop() deleteTag!: (label: string) => void
  @Prop() currentserver!: () => Server | null
  @Prop() tags!: Tag[]

  tagActions = [
    {
      name: 'Delete',
      fn: (t: Tag) => this.deleteTag(t.label)
    },
  ]
}
</script>
