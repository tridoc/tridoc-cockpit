<template>
  <v-dialog v-model="show" :fullscreen="$vuetify.breakpoint.smAndDown" persistent max-width="600px">
    <template v-slot:activator="{ on }">
      <v-chip
        color="primary"
        label
        v-on="on">
          <v-icon left>mdi-pencil</v-icon>
          <strong>EDIT TAGS</strong>
      </v-chip>
    </template>
    <v-card>
      <v-card-title class="headline">Manage Tags</v-card-title>
      <v-card-subtitle>
        {{ docMeta.title }}
        <kbd class="mx-2">{{ id }}</kbd>
      </v-card-subtitle>
      <v-card-text>
        Has:
        <v-chip-group column>
          <v-chip
            v-for="tag in docMeta.tags"
            :key="tag.label + (tag.parameter ? tag.parameter.value : '')"
            label
            close
            @click:close="removeTag(tag.label)"
          >
            <v-icon v-if="tag.label === '..'">mdi-sync</v-icon>
            <span v-else>{{ tag.label }}</span>
            <v-divider class="mx-3" vertical v-if="tag.parameter" />
            <strong v-if="tag.parameter">
              <span v-if="tag.parameter.type === 'http://www.w3.org/2001/XMLSchema#decimal'">{{ tag.parameter.value }}</span>
              <local-time v-else :datetime="tag.parameter.value">{{ tag.parameter.value }}</local-time>
            </strong>
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
          lazy-validation
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
                  autocomplete="off"
                  v-if="this.type !== 'date'"
                  :disabled="this.type !== 'decimal'"
                  :messages="this.type === 'simple' ? 'Value will be ignored for simple tags' : ''"
                />
                <v-menu
                  v-else
                  ref="dateMenu"
                  v-model="dateMenu"
                  :close-on-content-click="false"
                  :return-value.sync="value"
                  transition="scale-transition"
                  offset-y bottom
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="value"
                      @change="valDate = value || ''"
                      label="Value"
                      outlined
                      :rules="dateRules"
                      v-bind="attrs"
                      v-on="on"
                      required
                      autocomplete="off"
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="valDate"
                    no-title
                    scrollable
                  >
                    <v-spacer></v-spacer>
                    <v-btn
                      text
                      color="primary"
                      @click="dateMenu = false"
                    >
                      Cancel
                    </v-btn>
                    <v-btn
                      text
                      color="primary"
                      @click="$refs.dateMenu.save(valDate)"
                    >
                      OK
                    </v-btn>
                  </v-date-picker>
                </v-menu>
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
import type Server from '@tridoc/frontend'
import { Component, Prop, PropSync, Vue, Watch } from 'vue-property-decorator'

@Component({})
export default class TagAdder extends Vue {
  @Prop() id!: string;
  @PropSync('meta') docMeta !: tdDocMeta
  allTags: tdTag[] = []
  show = false
  valid = false
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
    // v => (this.getType() === 'simple' && !v) || this.getType() !== 'simple' || 'Value will be ignored',
    v => (this.getType() === 'decimal' && !isNaN(+v)) || this.getType() !== 'decimal' || 'Must be a number'
  ]

  dateRules: FormRule[] = [
    v => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v).getTime())) || 'Must be a date of format YYYY-MM-DD',
  ]

  clear () {
    this.show = false
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
