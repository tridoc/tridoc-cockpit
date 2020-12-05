<template>
<v-card outlined class="my-2">
  <div class="top">
    <div>
      <v-icon v-text="tag['type-icon'] || tag.icon"/>
      {{ tag.label }}
    </div>
    <div>
      <v-btn
        icon small
        :color="status[0].indexOf(tag.label) !== -1 ? 'primary' : ''"
        @click="includeTag"
      >
        <v-icon>{{ status[0].indexOf(tag.label) !== -1 ? 'mdi-checkbox-marked' : 'mdi-check-box-outline' }}</v-icon>
      </v-btn>
      <v-btn
        icon small
        :color="status[2].indexOf(tag.label) !== -1 ? 'primary' : ''"
        @click="excludeTag"
      >
        <v-icon>{{ status[2].indexOf(tag.label) !== -1 ? 'mdi-close-box' : 'mdi-close-box-outline' }}</v-icon>
      </v-btn>
    </div>
  </div>
  <div class="bottom" v-if="tag['type-icon']">
    <v-btn outlined text small>Add Range Filter</v-btn>
    <v-divider/>
    <span>{{ status }}</span>
  </div>
  <!-- <v-divider/>
  <v-icon>mdi-check-box-outline</v-icon>
  <v-icon>mdi-close-box-outline</v-icon>
  <v-icon>mdi-checkbox-blank-outline</v-icon>
  <v-icon>mdi-plus-box-outline</v-icon>
  <v-icon>mdi-minus-box-outline</v-icon>
  <v-icon>mdi-checkbox-blank-outline</v-icon> -->
</v-card>
</template>

<script lang="ts">
import Server from '@tridoc/frontend'
import { Component, Prop, PropSync, Vue, Watch } from 'vue-property-decorator'

import '@/global-types.ts'

@Component({})
export default class TagFilter extends Vue {
  @Prop() reload!: () => void
  @Prop() getDocuments!: () => void
  @Prop() error!: ({ title, message }: { title: string; message: string }) => void
  @Prop() deleteTag!: (label: string) => void
  @Prop() currentserver!: () => Server | null
  @Prop() tag!: Tag
  @PropSync('search') dnsearch!: Search

  // status: [string[], [string, number, number][], string[], [string, number, number][]] = [[], [], [], []]

  get status () {
    const yes = this.dnsearch.tags.filter(t => {
      return t[0] === this.tag.label && t[1] === undefined && t[2] === undefined
    }).map(t => t[0])
    const no = this.dnsearch.nottags.filter(t => {
      return t[0] === this.tag.label && t[1] === undefined && t[2] === undefined
    }).map(t => t[0])
    const yesR = this.dnsearch.tags.filter(t => {
      return t[0] === this.tag.label
    })
    const noR = this.dnsearch.nottags.filter(t => {
      return t[0] === this.tag.label
    })
    return [yes, yesR, no, noR]
  }

  includeTag () {
    const ntIndex = this.dnsearch.nottags.findIndex(t => {
      return t[0] === this.tag.label && t[1] === undefined && t[2] === undefined
    })
    if (ntIndex > -1) {
      this.dnsearch.nottags.splice(ntIndex, 1)
    }
    const tIndex = this.dnsearch.tags.findIndex(t => {
      return t[0] === this.tag.label && t[1] === undefined && t[2] === undefined
    })
    if (tIndex > -1) {
      this.dnsearch.tags.splice(tIndex, 1) // Remove from tags if already present
    } else {
      this.dnsearch.tags.push([this.tag.label, undefined, undefined]) // Add it otherwise
    }
    this.getDocuments()
  }

  excludeTag () {
    const tIndex = this.dnsearch.tags.findIndex(t => {
      return t[0] === this.tag.label && t[1] === undefined && t[2] === undefined
    })
    if (tIndex > -1) {
      this.dnsearch.tags.splice(tIndex, 1)
    }
    const ntIndex = this.dnsearch.nottags.findIndex(t => {
      return t[0] === this.tag.label && t[1] === undefined && t[2] === undefined
    })
    if (ntIndex > -1) {
      this.dnsearch.nottags.splice(ntIndex, 1) // Remove from nottags if already present
    } else {
      this.dnsearch.nottags.push([this.tag.label, undefined, undefined]) // Add it otherwise
    }
    this.getDocuments()
  }
}
</script>

<style lang="scss" scoped>
.top {
  display: flex;
  justify-content: space-between;
}
</style>
