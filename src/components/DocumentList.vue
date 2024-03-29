<template>
<div>
  <v-card v-if="!$store.state.viewSettings.grid" outlined>
    <v-list class="py-0">
      <template
        v-for="(doc, index) in docs"
      >
        <v-list-item
          :key="doc.identifier"
          :to="`./doc/${doc.identifier}?s=${$store.getters.server.url}`"
          class="px-0"
        >
          <v-row no-gutters>
            <v-col cols="auto" class="ma-2 do-expand">
              <div class="text-truncate">
                {{ doc.title }}
                <i v-if="!doc.title">Untitled Document</i>
              </div>
            </v-col>
            <v-col v-if="doc.tags.length" cols="auto" class="mr-2 no-expand cv">
              <div class="py-2 wrapper">
                <v-spacer/>
                <v-progress-circular
                  v-if="doc.tags[0].label === '..'"
                  indeterminate
                  :color="$vuetify.theme.dark ? 'grey darken-3' : 'grey lighten-2'"
                />
                <v-chip
                  v-else
                  class="mr-1"
                  v-for="tag in doc.tags"
                  :key="tag.label + (tag.parameter ? tag.parameter.value : '')"
                  label
                  :small="$store.state.viewSettings.dense"
                >
                  <span>{{ tag.label }}</span>
                  <v-divider class="mx-3" vertical v-if="tag.parameter"></v-divider>
                  <strong v-if="tag.parameter">
                    <span v-if="tag.parameter.type === 'http://www.w3.org/2001/XMLSchema#decimal'">{{ tag.parameter.value }}</span>
                    <local-time v-else :datetime="tag.parameter.value">{{ tag.parameter.value }}</local-time>
                  </strong>
                </v-chip>
                  </div>
            </v-col>
            <v-col cols="auto" class="ma-2 cv">
              <div>
                <time-ago :datetime="doc.created" :format="$vuetify.breakpoint.smAndUp || 'micro'" style="white-space: nowrap;" class="mr-2">
                  {{ doc.created }}
                </time-ago>
                <v-tooltip bottom open-delay="500" v-if="doc.comments && doc.comments.length">
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on" class="mr-2 text--disabled">
                      {{ doc.comments.length }}
                      <v-icon disabled>mdi-comment-outline</v-icon>
                    </span>
                  </template>
                  {{ doc.comments.length }} Comments
                </v-tooltip>
                <v-tooltip bottom open-delay="500" v-if="$vuetify.breakpoint.smAndUp">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      icon
                      v-bind="attrs"
                      v-on="on"
                      @click.prevent.stop="download(doc.identifier)"
                      :loading="downloading[doc.identifier]"
                      :disabled="downloading[doc.identifier]"
                    >
                      <v-icon>mdi-download</v-icon>
                    </v-btn>
                  </template>
                  Download
                </v-tooltip>
                <v-tooltip bottom open-delay="500" v-if="$vuetify.breakpoint.smAndUp">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      icon
                      color="primary"
                      v-bind="attrs"
                      v-on="on"
                      :href="`./doc/${doc.identifier}?s=${$store.getters.server.url}`"
                      @click.prevent.stop="/**/"
                    >
                      <v-icon>mdi-file-eye-outline</v-icon>
                    </v-btn>
                  </template>
                  Open
                </v-tooltip>
              </div>
            </v-col>
          </v-row>
        </v-list-item>
        <v-divider
          v-if="index < docs.length - 1"
          :key="index"
        />
      </template>
    </v-list>
  </v-card>
  <v-list v-else class="grid py-0">
    <v-card
      v-for="doc in docs"
      :key="doc.identifier"
      outlined
      :to="`./doc/${doc.identifier}?s=${$store.getters.server.url}`"
      class="pa-0 v-list-item v-list-item--link"
    >
      <thumbnail :id="doc.identifier" />
      <v-divider/>
      <v-card-title class="text-truncate">
        {{ doc.title }}
        <i v-if="!doc.title">Untitled Document</i>
      </v-card-title>
      <v-card-subtitle class="text-truncate">
        <time-ago :datetime="doc.created">
          {{ doc.created }}
        </time-ago>
      </v-card-subtitle>
      <v-divider/>
      <v-card-actions>
        <div class="cv flex-auto">
          <v-tooltip bottom open-delay="500" v-if="doc.comments && doc.comments.length">
            <template v-slot:activator="{ on, attrs }">
              <span v-bind="attrs" v-on="on" class="mr-2 text--disabled">
                {{ doc.comments.length }}
                <v-icon disabled>mdi-comment-outline</v-icon>
              </span>
            </template>
            {{ doc.comments.length }} Comments
          </v-tooltip>
        </div>
        <div v-if="doc.tags.length" cols="auto" class="my-n2 no-expand cv">
          <div class="wrapper">
            <v-progress-circular
              v-if="doc.tags[0].label === '..'"
              indeterminate
              :color="$vuetify.theme.dark ? 'grey darken-3' : 'grey lighten-2'"
            />
            <v-chip
              v-else
              class="mr-1"
              v-for="tag in doc.tags"
              :key="tag.label + (tag.parameter ? tag.parameter.value : '')"
              label
              :small="$store.state.viewSettings.dense"
            >
              <span>{{ tag.label }}</span>
              <v-divider class="mx-3" vertical v-if="tag.parameter"></v-divider>
              <strong v-if="tag.parameter">
                <span v-if="tag.parameter.type === 'http://www.w3.org/2001/XMLSchema#decimal'">{{ tag.parameter.value }}</span>
                <local-time v-else :datetime="tag.parameter.value">{{ tag.parameter.value }}</local-time>
              </strong>
            </v-chip>
          </div>
        </div>
        <v-spacer/>
        <v-tooltip bottom open-delay="500" class="cv ml-2" v-if="$vuetify.breakpoint.smAndUp">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
              @click.prevent.stop="download(doc.identifier)"
              :loading="downloading[doc.identifier]"
              :disabled="downloading[doc.identifier]"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </template>
          Download
        </v-tooltip>
      </v-card-actions>
    </v-card>
  </v-list>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import Thumbnail from '@/components/Thumbnail.vue'

import '@/global-types.ts'

@Component({
  components: {
    Thumbnail,
  }
})
export default class DocumentsList extends Vue {
  @Prop() docs!: tdDocMeta[];
  @Prop() list!: boolean;
  @Prop() loading!: boolean;

  downloading: { [id: string]: boolean } = {}

  download (identifier: string) {
    Vue.set(this.downloading, identifier, true)
    const url = ((this.$store.getters.server.url.startsWith('https://') || this.$store.getters.server.url.startsWith('http://')) ? this.$store.getters.server.url : 'https://' + this.$store.getters.server.url) + '/doc/' + identifier
    const options = {
      headers: {
        Authorization: this.$store.getters.server.server.headers.get('Authorization')
      }
    }

    fetch(url, options)
      .then(r => r.blob())
      .then(b => {
        Vue.set(this.downloading, identifier, false)
        const link = document.createElement('a')
        link.href = URL.createObjectURL(b)
        link.download = this.docs.find(d => d.identifier === identifier)?.title || identifier
        link.click();
      })
  }
}
</script>

<style scoped lang="scss">
// LIST
.row.no-gutters {
  flex-wrap: nowrap;
  max-width: 100%;
}

.no-expand {
  min-width: 10ch;
  flex: 0 5 auto;

  & .wrapper {
    display: flex;
    overflow-x: auto;

    & > * {
      flex: 0 0 auto;

      &:last-child {
        margin-right: 0 !important;
      }
    }
  }
}

.v-chip {
  max-width: unset;
}

.do-expand {
  flex-shrink: 1;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.text-truncate {
  max-width: 100%;
  display: block;
}

.cv {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

// GRID

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-gap: 1rem;
  background: none;

  .no-expand {
    min-width: 0;
  }
}

.v-list-item {
  display: block;
}

.v-card__actions {
  height: 52px;
}

.flex-auto {
  flex: 0 0 auto;
}
</style>
