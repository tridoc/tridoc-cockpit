<template>
  <v-card outlined>
    <v-expansion-panels v-model="show" flat>
      <v-expansion-panel>
        <v-expansion-panel-header>
          <template v-slot:default>
            <div v-if="!docMeta.tags.length">
              <v-chip label>
                <v-icon small class="mr-3">mdi-tag-off-outline</v-icon>
                Document has no tags
              </v-chip>
            </div>
            <div class="ma-n1 overflow" v-else-if="docMeta.tags[0].label !== '..'">
              <v-chip
                class="ma-1"
                v-for="tag in docMeta.tags"
                :key="tag.label + (tag.parameter ? tag.parameter.value : '')"
                label close
                @click:close="removeTag(tag.label)"
              >
                {{ tag.label }}
                <v-divider class="mx-3" vertical v-if="tag.parameter"></v-divider>
                <strong v-if="tag.parameter">
                  <span v-if="tag.parameter.type === 'http://www.w3.org/2001/XMLSchema#decimal'">{{ tag.parameter.value }}</span>
                  <local-time v-else :datetime="tag.parameter.value">{{ tag.parameter.value }}</local-time>
                </strong>
              </v-chip>
            </div>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-divider/>
          <h2 class="my-3 text-overline">
            Available Tags:
          </h2>
          <div class="ma-n1 overflow">
            <v-chip
              class="ma-1"
              v-for="tag in allTags"
              :key="tag.label"
              label
              @click="label = tag.label"
            >
              <v-icon small class="mr-3" v-if="tag.parameter">{{ tag.parameter.type === 'http://www.w3.org/2001/XMLSchema#decimal' ? 'mdi-pound' : 'mdi-calendar' }}</v-icon>
              <span>{{ tag.label }}</span>
            </v-chip>
          </div>
          <h2 class="my-3 text-overline">
            Add Tag:
          </h2>
          <v-form
            lazy-validation
            v-model="valid"
            ref="form"
          >
            <v-container class="pa-0">
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
                    id="dateField"
                    outlined
                    v-model="value"
                    :rules="valRules"
                    label="Value"
                    @input="valDate = (valRules[1](value) === true) ? value : ''"
                    required
                    autocomplete="off"
                    :disabled="this.type === 'simple'"
                    :messages="this.type === 'simple' ? 'Value will be ignored for simple tags' : ''"
                  />
                  <v-menu
                    v-if="this.type === 'date'"
                    ref="dateMenu"
                    open-on-focus
                    v-model="dateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y bottom
                    min-width="290px"
                    activator="#dateField"
                  >
                    <v-date-picker
                      v-model="valDate"
                      @input="value = valDate"
                      :show-current="false"
                      scrollable
                    >
                    </v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" class="pt-0">
                  <v-radio-group v-model="type" :disabled="fixed" class="mt-0" hide-details>
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
              <v-row>
                <v-col cols="auto" class="ml-auto">
                  <v-btn color="secondary" class="mr-2" text @click="clear">Cancel</v-btn>
                  <v-btn color="primary" dark @click="save">Add</v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script lang="ts">
import type Server from '@tridoc/frontend'
import { Component, Prop, PropSync, Vue, Watch } from 'vue-property-decorator'

@Component({})
export default class TagAdder extends Vue {
  @Prop() id!: string;
  @PropSync('meta') docMeta !: tdDocMeta
  allTags: tdTag[] = []
  show = -1
  valid = true
  label = ''
  type: 'simple' | 'date' | 'decimal' = 'simple'
  value = ''
  valDate = ''
  fixed = false
  dateMenu = false

  @Watch('label')
  change (l: string) {
    const exists = this.allTags.find(t => t.label === l)
    if (exists) {
      this.fixed = true
      this.type = exists.parameter
        ? (exists.parameter.type === 'http://www.w3.org/2001/XMLSchema#decimal'
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
    v => (this.getType() === 'decimal' && !isNaN(+v) && !!v) || this.getType() !== 'decimal' || 'Must be a number',
    v => (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v).getTime())) || this.getType() !== 'date' || 'Must be a date of format YYYY-MM-DD',
  ]

  @Watch('type')
  typeChanged () {
    this.value = '';
    (this.$refs.form as any).resetValidation()
  }

  clear () {
    this.label = ''
    this.type = 'simple';
    (this.$refs.form as any).resetValidation()
  }

  async save () {
    this.valid = (this.$refs.form as any).validate()
    const cs = this.$store.getters.server.server as Server
    if (cs && this.valid) {
      await this.reloadTags()
      if ((this.docMeta.tags || []).findIndex(t => t.label === this.label) !== -1) {
        alert('Tag has already been added to the document')
        return // see also comment further below
      } else if (this.allTags.findIndex(t => t.label === this.label) === -1) {
        if (confirm('This tag doesn’t exist yet. Do you want to create it?')) {
          await cs.createTag(this.label, this.type !== 'simple' ? this.type : undefined)
            .then(r => {
              if ('error' in r) {
                console.error(r) // eslint-disable-line no-console
              }
            })
        } else {
          this.reload();
          return;
        }
      }
      cs.addTag(this.id, this.label, this.type !== 'simple' ? this.type : undefined, this.type !== 'simple' ? this.value : undefined)
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

  removeTag (label: string) {
    const cs = this.$store.getters.server.server as Server
    if (cs && confirm(`Do you want to remove tag "${label}" from the Document?
This Action cannot be undone`)) {
      cs.removeTag(this.id, label).then(this.reload)
    }
  }

  reloadTags () {
    const cs = this.$store.getters.server.server as Server
    if (cs) {
      return cs.getTags()
        .then(r => {
          if (!('error' in r)) {
            this.allTags = r.filter(t => {
              return /* !!t.parameter || */ (this.docMeta.tags || []).findIndex(mt => mt.label === t.label) === -1 // while it is possible to add a paramterisable tag multiple times to a document, it's not possible to remove only selct ones of them, thus tridoc-cockpit discourages this.
            })
          }
        })
    }
  }

  reload () {
    const cs = this.$store.getters.server.server as Server
    if (cs) {
      cs.getMeta(this.id)
        .then(r => {
          if (!('error' in r)) {
            this.$emit('update:meta', { ...r, identifier: this.id })
          }
        }).then(() => {
          this.reloadTags()
        })
    }
  }

  created () {
    this.reload()
  }
}
</script>

<style scoped>
.overflow {
  overflow: auto;
}
.v-chip .v-chip__content {
  max-width: unset;
}
.v-chip {
  max-width: unset;
}
</style>
