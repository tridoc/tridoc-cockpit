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
      <v-card-title>
        <span class="headline">Add Tag to {{ meta.identifier }}</span>
      </v-card-title>
      <v-card-text>
        Has:
        <v-chip-group column>
          <v-chip
            v-for="tag in meta.tags"
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
          >
            <v-icon small class="mr-3" v-if="tag.parameter">{{ tag.parameter.type === 'http://www.w3.org/2001/XMLSchema#decimal' ? 'mdi-pound' : 'mdi-calendar' }}</v-icon>
            <v-icon v-if="tag.label === '..'">mdi-sync</v-icon>
            <span v-else>{{ tag.label }}</span>
          </v-chip>
        </v-chip-group>
        <v-divider class="my-6" />
        <h2>Create new Tag</h2>
        <v-form
          lazy-validation
          v-model="valid"
          ref="form"
        >
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  outlined
                  v-model="label"
                  :rules="labelRules"
                  label="Label"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-radio-group v-model="type">
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
          <v-btn color="secondary darken-1" text @click="clear">Cancel</v-btn>
          <v-btn color="secondary darken-1" text @click="show = false">Close</v-btn>
          <v-btn color="primary darken-1" text @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script lang="ts">
import Server from '@tridoc/frontend'
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class TagAdder extends Vue {
  @Prop() server !: () => Server
  @Prop() meta !: tdDocMeta
  allTags: tdTag[] = []
  show = false
  valid = false
  label = ''
  type: 'simple' | 'date' | 'decimal' = 'simple'

  labelRules: FormRule[] = [
    v => !!v || 'Label is required',
    v => !(/\s|\/|\\|#|"|'|,|;|:|\?/.test(v)) || 'The label must not contain any of the following: whitespace / \\ # " \' , ; : ?',
    v => !(/^[.]{1,2}$/.test(v)) || 'The label must not equal . (single dot) or .. (double dot)',
  ]

  clear () {
    this.show = false
    this.label = ''
    this.type = 'simple';
    (this.$refs.form as any).resetValidation()
  }

  save () {
    (this.$refs.form as any).validate()
    if (this.valid) {
      this.server().createTag(this.label, this.type !== 'simple' ? this.type : undefined)
        .then((r: {error?: string}) => {
          if (r.error) {
            this.$emit('error', r)
            this.clear()
          } else {
            this.$emit('tagcreated')
            this.clear()
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
    this.server().getTags()
      .then(r => {
        if (!('error' in r)) {
          this.allTags = r.filter(t => {
            return !!t.parameter || (this.meta.tags || []).findIndex(mt => mt.label === t.label) === -1
          })
        }
      })
  }

  created () {
    this.reloadTags()
  }
}
</script>
