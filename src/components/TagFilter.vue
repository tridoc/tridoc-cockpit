<template>
<v-card outlined class="my-2">
  <div class="top">
    <div class="label ml-2">{{ tag.label }}</div>
    <v-spacer/>
    <div class="buttons">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon small
            class="ma-1"
            color="red accent-1"
            @click="askDeleteTag"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </template>
        <small>Delete this tag</small>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon small
            class="my-1"
            :color="status[0].indexOf(tag.label) !== -1 ? 'primary' : ''"
            @click="includeTag"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>{{ status[0].indexOf(tag.label) !== -1 ? 'mdi-checkbox-marked' : 'mdi-check-box-outline' }}</v-icon>
          </v-btn>
        </template>
        <small>Show only Documents with this tag</small>
      </v-tooltip>
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            icon small
            class="my-1 mr-1"
            :color="status[1].indexOf(tag.label) !== -1 ? 'primary' : ''"
            @click="excludeTag"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>{{ status[1].indexOf(tag.label) !== -1 ? 'mdi-close-box' : 'mdi-close-box-outline' }}</v-icon>
          </v-btn>
        </template>
        <small>Show only Documents without this tag</small>
      </v-tooltip>
    </div>
  </div>
  <div v-if="tag['type-icon']">
    <range-input
      v-for="(t,i) in status[2]"
      :key="(t[3] ? 'y' : 'n' ) + '_' + i"
      :minimum.sync="t[1]"
      :maximum.sync="t[2]"
      :include.sync="t[3]"
      :remove="removeRange"
      :toggle="toggleRange"
      :change="getDocuments"
      :type="tag['type-icon'] === 'mdi-pound' ? 'number' : 'date'"
    />
    <!-- Note that these min and max values above don’t get synced upwards themselfes, but as they’re passed by reference it seems to work. (I think) -->
    <v-divider/>
    <v-btn
      text small block
      @click="addRange"
    >
      <v-icon small left>{{ tag['type-icon'] }}</v-icon>
      Add Range Filter
    </v-btn>
  </div>
</v-card>
</template>

<script lang="ts">
import Server from '@tridoc/frontend'
import { Component, Prop, PropSync, Vue, Watch } from 'vue-property-decorator'
import RangeInput from '@/components/RangeInput.vue'

import '@/global-types.ts'

@Component({
  components: {
    RangeInput,
  }
})
export default class TagFilter extends Vue {
  @Prop() reload!: () => void
  @Prop() getDocuments!: () => void
  @Prop() error!: ({ title, message }: { title: string; message: string }) => void
  @Prop() deleteTag!: (label: string) => void
  @Prop() tag!: Tag
  @PropSync('search') dnsearch!: Search

  get status () {
    const yes = this.dnsearch.tags.filter(t => {
      return t[0] === this.tag.label && (t[1] === undefined || t[1] === '') && (t[2] === undefined || t[2] === '')
    }).map(t => t[0])
    const no = this.dnsearch.nottags.filter(t => {
      return t[0] === this.tag.label && (t[1] === undefined || t[1] === '') && (t[2] === undefined || t[2] === '')
    }).map(t => t[0])
    const yesR: [string, (string|number|undefined), (string|number|undefined), true|undefined][] = this.dnsearch.tags.filter(t => {
      return t[0] === this.tag.label
    }).map((e: any) => { e[3] = true; return e })
    const noR = this.dnsearch.nottags.filter(t => {
      return t[0] === this.tag.label
    }).map((e: any) => { e[3] = false; return e })
    return [yes, no, yesR.concat(noR)]
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

  addRange () {
    this.dnsearch.tags.push([this.tag.label, undefined, undefined])
    this.getDocuments()
  }

  removeRange (min: (string|number|undefined), max: (string|number|undefined), include: boolean) {
    if (include) {
      this.dnsearch.tags.splice(this.dnsearch.tags.indexOf([this.tag.label, min, max]), 1)
    } else {
      this.dnsearch.nottags.splice(this.dnsearch.nottags.indexOf([this.tag.label, min, max]), 1)
    }
    this.getDocuments()
  }

  toggleRange (min: (string|number|undefined), max: (string|number|undefined), wasInclude: boolean) {
    if (wasInclude) {
      this.dnsearch.tags.splice(this.dnsearch.tags.indexOf([this.tag.label, min, max]), 1)
      this.dnsearch.nottags.push([this.tag.label, min, max])
    } else {
      this.dnsearch.nottags.splice(this.dnsearch.nottags.indexOf([this.tag.label, min, max]), 1)
      this.dnsearch.tags.push([this.tag.label, min, max])
    }
    this.getDocuments()
  }

  askDeleteTag () {
    if (confirm(`Delete Tag “${this.tag.label}”?\nThis action cannot be undone.`)) {
      this.deleteTag(this.tag.label)
      this.reload()
    }
  }
}
</script>

<style lang="scss" scoped>
.top {
  display: flex;
  justify-content: space-between;
}

.buttons {
  display: flex;
  flex-wrap: nowrap;
}

.label {
  // height: 36px;
  line-height: 36px;
  white-space: nowrap;
  overflow-x: auto;
}
</style>
