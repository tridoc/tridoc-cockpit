<template>
  <v-list nav dense>
    <v-subheader>TAGS</v-subheader>
    <v-list-item-group color="secondary">

      <tag-creator
        :server="currentserver()"
        @tagcreated="reload"
        @error="error({ title: r.error, message: r.message })"
      />

      <tag-filter
        v-for="(tag) in tags"
        :key="tag.label"
        :tag="tag"
        :reload="reload"
        :getDocuments="getDocuments"
        :error="error"
        :deleteTag="deleteTag"
        :currentserver="currentserver"
        :tags="tags"
        :search.sync="dnsearch"
      />

    </v-list-item-group>
  </v-list>
</template>

<script lang="ts">
import Server from '@tridoc/frontend'
import { Component, Prop, Vue, PropSync, Watch } from 'vue-property-decorator'
import TagCreator from '@/components/TagCreator.vue'
import TagFilter from '@/components/TagFilter.vue'

@Component({
  components: {
    TagCreator,
    TagFilter,
  }
})
export default class TagList extends Vue {
  @Prop() reload!: () => void
  @Prop() getDocuments!: () => void
  @Prop() error!: ({ title, message }: { title: string; message: string }) => void
  @Prop() deleteTag!: (label: string) => void
  @Prop() currentserver!: () => Server | null
  @Prop() tags!: Tag[]
  @PropSync('dnsearch') search!: Search
  dnsearch: Search = { text: '', tags: [], nottags: [] }
}
</script>
