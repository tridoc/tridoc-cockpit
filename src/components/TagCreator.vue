<template>
  <v-dialog v-model="show" :fullscreen="$vuetify.breakpoint.smAndDown" persistent max-width="600px">
    <template v-slot:activator="{ on }">
      <v-btn
        block noutlined ntext
        color="primary"
        v-on="on"
      >
        <v-icon left>mdi-tag-plus</v-icon>
        Create Tag
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Create Tag</span>
      </v-card-title>
      <v-card-text>
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

@Component({

})
export default class TagCreator extends Vue {
  @Prop() server !: Server;
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
      this.server.createTag(this.label, this.type !== 'simple' ? this.type : undefined)
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
}
</script>
