<template>
  <v-dialog v-model="show" :fullscreen="$vuetify.breakpoint.smAndDown" persistent max-width="600px">
    <template v-slot:activator="{ on }">
      <v-chip
        color="primary"
        label
        v-on="on">
          <v-icon left>mdi-tag-plus</v-icon>
          ADD
      </v-chip>
    </template>
    <v-card>
      <v-card-title class="headline">Manage Tags</v-card-title>
      <v-card-subtitle>
        {{ docMeta.title }}
        <kbd class="mx-2">{{ docMeta.identifier }}</kbd>
      </v-card-subtitle>
      <v-card-text>
        Has:
        <v-chip-group column>
          <v-chip
            v-for="tag in docMeta.tags"
            :key="tag.label + (tag.parameter ? tag.parameter.value : '')"
            label
          >
            <v-icon v-if="tag.label === '..'">mdi-sync</v-icon>
            <span v-else>{{ tag.label }}</span>
            <v-divider class="mx-3" vertical v-if="tag.parameter" />
            <strong v-if="tag.parameter">{{ tag.parameter.type === 'http://www.w3.org/2001/XMLSchema#decimal' ? tag.parameter.value : calculateDatestamp(tag.parameter.value) }}</strong>
          </v-chip>
        </v-chip-group>
        Avaliable:
        <v-chip-group column>
          <v-chip
            v-for="tag in allTags"
            :key="tag.label"
            label
            @click="label = tag.label"
          >
            <v-icon small class="mr-3" v-if="tag.parameter">{{ tag.parameter.type === 'http://www.w3.org/2001/XMLSchema#decimal' ? 'mdi-pound' : 'mdi-calendar' }}</v-icon>
            <v-icon v-if="tag.label === '..'">mdi-sync</v-icon>
            <span v-else>{{ tag.label }}</span>
          </v-chip>
        </v-chip-group>
        <v-divider class="mt-2 mb-3" />
        <v-form
          jlazy-validation
          v-model="valid"
          ref="form"
        >
          <v-container>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  outlined
                  v-model="label"
                  :rules="labelRules"
                  label="Label"
                  required
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  outlined
                  v-model="value"
                  :rules="valRules"
                  label="Value"
                  required
                  :disabled="this.type === 'simple'"
                  :messages="this.type === 'simple' ? 'Value will be ignored for simple tags' : ''"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" class="mt-0">
                <v-radio-group v-model="type" :disabled="fixed" class="mt-0">
                  <v-radio value="simple">
                    <template v-slot:label>
                      <v-icon small left>mdi-tag</v-icon> Not parameterizable
                    </template>
                  </v-radio>
                  <v-radio value="decimal">
                    <template v-slot:label>
                      <v-icon small left>mdi-pound</v-icon> Parameterizable with number / decimal
                    </template>
                  </v-radio>
                  <v-radio value="date">
                    <template v-slot:label>
                      <v-icon small left>mdi-calendar</v-icon> Parameterizable with date
                    </template>
                  </v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" text @click="clear">Cancel</v-btn>
          <v-btn color="primary" @click="save">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script lang="ts">
import Server from '@tridoc/frontend'
import { Component, Prop, PropSync, Vue, Watch } from 'vue-property-decorator'

@Component({})
export default class TagAdder extends Vue {
  @Prop() server !: () => Server
  @PropSync('meta') docMeta !: tdDocMeta
  allTags: tdTag[] = []
  show = false
  valid = false
  label = ''
  type: 'simple' | 'date' | 'decimal' = 'simple'
  value = ''
  fixed = false

  @Watch('label')
  change (l: string) {
    const exsists = this.allTags.find(t => t.label === l)
    if (exsists) {
      this.fixed = true
      this.type = exsists.parameter
        ? (exsists.parameter.type === 'http://www.w3.org/2001/XMLSchema#decimal'
          ? 'decimal'
          : 'date')
        : 'simple'
    } else {
      this.fixed = false
    }
  }

  labelRules: FormRule[] = [
    v => !!v || 'Label is required',
    v => !(/\s|\/|\\|#|"|'|,|;|:|\?/.test(v)) || 'The label must not contain any of the following: whitespace / \\ # " \' , ; : ?',
    v => !(/^[.]{1,2}$/.test(v)) || 'The label must not equal . (single dot) or .. (double dot)',
  ]

  getType () {
    return this.type
  }

  valRules: FormRule[] = [
    // v => (this.getType() === 'simple' && !v) || this.getType() !== 'simple' || 'Value will be ignored',
    v => (this.getType() === 'decimal' && !isNaN(+v)) || this.getType() !== 'decimal' || 'Must be a number',
    v => (this.getType() === 'date' && (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v).getTime()))) || this.getType() !== 'date' || 'Must be a date of format YYYY-MM-DD',
  ]

  clear () {
    this.show = false
    this.label = ''
    this.type = 'simple';
    (this.$refs.form as any).resetValidation()
  }

  async save () {
    this.valid = (this.$refs.form as any).validate()
    if (this.valid) {
      await this.reloadTags()
      if (
        this.allTags.findIndex(t => t.label === this.label) === -1 &&
        confirm('This tag doesn’t exist yet. Do you want to create it?')
      ) {
        alert('Not yet implemented, but working on it!\nPlease create Tag first via "Create Tag" Button in Sidebar.')
      }
      this.server().addTag(this.docMeta.identifier, this.label, this.type !== 'simple' ? this.type : undefined, this.type !== 'simple' ? this.value : undefined)
        .then((r: {error?: string}) => {
          if (r.error) {
            this.$emit('error', r)
            this.reload()
            // this.clear()
          } else {
            this.$emit('tagadded')
            this.reload();
            (this.$refs.form as any).reset()
          }
        })
    }
  }

  calculateDatestamp (isoString: string) {
    const date = new Date(isoString)
    const year = date.getFullYear().toString().padStart(4, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    switch (daysDiff) {
      case 0:
        return 'Today'
      case 1:
        return 'Yesterday'
      default:
        return `${year}-${month}-${day}`
    }
  }

  reloadTags () {
    return this.server().getTags()
      .then(r => {
        if (!('error' in r)) {
          this.allTags = r.filter(t => {
            return !!t.parameter || (this.docMeta.tags || []).findIndex(mt => mt.label === t.label) === -1
          })
        }
      })
  }

  reload () {
    this.server().getMeta(this.docMeta.identifier)
      .then(r => {
        if (!('error' in r)) {
          this.$emit('update:meta', { ...r, identifier: this.docMeta.identifier })
        }
      }).then(() => {
        this.reloadTags()
      })
  }

  created () {
    this.reload()
  }
}
</script>
