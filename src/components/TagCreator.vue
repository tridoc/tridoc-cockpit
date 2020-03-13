<template>
  <v-dialog v-model="show" :fullscreen="$vuetify.breakpoint.smAndDown" persistent max-width="600px">
    <template v-slot:activator="{ on }">
      <v-list-item v-on="on">
        <v-list-item-icon>
          <v-icon>mdi-tag-plus</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Create Tag</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Create Tag</span>
      </v-card-title>
      <v-card-text>
        <v-form
          v-model="valid"
          ref="form"
        >
          <v-container>
            <v-row>
              <v-text-field
                v-model="label"
                :rules="labelRules"
                label="Label"
                required
              />
            </v-row>
          </v-container>
        </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="clear">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="show = false">Close</v-btn>
          <v-btn color="blue darken-1" text @click="save">Save</v-btn>
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
  show = true
  valid = false
  label = ''
  type = null

  labelRules: FormRule[] = [
    v => !!v || 'Label is required',
    v => !(/\s|\/|\\|#|"|'|,|;|:|\?/.test(v)) || 'The label must not contain any of the following: whitespace / \\ # " \' , ; : ?',
    v => !(/^[.]{1,2}$/.test(v)) || 'The label must not equal . (single dot) or .. (double dot)',
  ]

  clear () {
    this.show = false
    this.label = ''
    this.$refs.form.resetValidation()
  }

  save () {
    if (this.valid) {
      this.server.createTag(this.label, this.type)
        .then((r: {error?: 'string'}) => {
          if (!r.error) {
            this.$emit('tagcreated')
            this.clear()
          }
        })
    }
  }
}
</script>
