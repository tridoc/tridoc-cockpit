<template>
  <v-dialog v-model="show" :fullscreen="$vuetify.breakpoint.smAndDown" persistent max-width="600px">
    <template v-slot:activator="{ on }">
      <v-list-item v-on="on">
        <v-list-item-icon>
          <v-icon >mdi-cog</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <v-card>
      <v-card-title>
        <span class="headline">Settings</span>
      </v-card-title>
      <v-card-text>
        <v-form
          lazy-validation
          v-model="valid"
          ref="form"
        >
          <v-container>
            <v-row>
              <v-col cols="12" md="auto">
                <v-text-field
                  outlined
                  v-model="url"
                  :rules="urlRules"
                  label="Server URL"
                  required
                />
              </v-col>
              <v-col cols="12" md="auto">
                <v-text-field
                  outlined
                  v-model="password"
                  :rules="passwordRules"
                  label="Password"
                  required
                />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary darken-1" text @click="show = false">Close</v-btn>
          <v-btn color="primary darken-1" text @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script lang="ts">
import Server from '@tridoc/frontend'
import { Component, Prop, Vue } from 'vue-property-decorator'

const isValidUrl = (string: string) => {
  if (!string.startsWith('http://') || !string.startsWith('https://')) {
    string = 'https://' + string
  }
  try {
    const url = new URL(string);
    return url.href;
  } catch (_) {
    return false;
  }
}

@Component({

})
export default class TagCreator extends Vue {
  @Prop() servers !: {[key: string]: Server};
  @Prop() current !: string;

  show = false
  valid = false
  url = this.current || ''
  password = ''

  urlRules: FormRule[] = [
    v => !!v || 'URL is required',
    v => {
      const temp = isValidUrl(v)
      if (temp) {
        this.url = temp
        return true
      }
      return 'URL has to be valid'
    },
  ]

  passwordRules: FormRule[] = [
    v => !!v || 'Password is required',
  ]

  save () {
    this.$refs.form.validate()
    if (this.valid) {
      this.servers[this.url] = new Server(this.url)
      this.$emit('change', this.url)
      this.show = false
    }
  }
}
</script>
