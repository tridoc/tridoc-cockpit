<template>
  <div class="mt-3">
    <v-card outlined v-if="meta.comments && meta.comments.length > 0">
      <div
        v-for="(comment, i) in meta.comments"
        :key="comment.created"
      >
        <v-divider v-if="i !== 0" />
        <v-card-text style>
          <span style="white-space: pre;">{{ comment.text }}</span>
          <code class="ml-2">{{ comment.created.replace('T', ' ').replace(/:\d{2}\.\d{1,3}/, ' ').replace('Z', 'UTC') }}</code>
        </v-card-text>
      </div>
    </v-card>
    <v-form
      lazy-validation
      v-model="valid"
      ref="form"
      class="d-flex pt-3 align-stretch"
    >
          <v-textarea
            outlined
            v-model="comment"
            :rules="commentRules"
            label="New Comment"
            required
            rows="1"
            auto-grow
          />
          <v-btn
            class="ml-1"
            style="height: unset; margin-bottom: 30px"
            outlined
            @click="add"
          >
            Add
          </v-btn>
    </v-form>
  </div>
</template>

<script lang="ts">
import Server from '@tridoc/frontend'
import { Component, Prop, PropSync, Vue, Watch } from 'vue-property-decorator'

@Component({})
export default class CommentsList extends Vue {
  @Prop() server !: () => Server
  @PropSync('meta') docMeta !: tdDocMeta
  allTags: tdTag[] = []

  comment = ''
  valid = false
  commentRules: FormRule[] = [
    v => !!v || 'Can’t make empty comments',
  ]

  async add () {
    this.valid = (this.$refs.form as any).validate()
    if (this.valid) {
      this.server().addComment(this.docMeta.identifier, this.comment)
        .then(() => {
          (this.$refs.form as any).reset()
          this.reload()
        })
    } else {
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

  reload () {
    this.server().getMeta(this.docMeta.identifier)
      .then(r => {
        if (!('error' in r)) {
          this.$emit('update:meta', { ...r, identifier: this.docMeta.identifier })
        }
      })
  }

  created () {
    this.reload()
  }
}
</script>
