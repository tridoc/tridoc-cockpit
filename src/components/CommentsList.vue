<template>
  <div class="mt-3">
    <v-card outlined :loading="loading">
      <v-card-text v-if="loading">
        Loading Comments
      </v-card-text>
      <v-card-text v-else-if="!meta.comments || meta.comments.length === 0">
        No Comments found
      </v-card-text>
      <div
        v-for="(comment, i) in meta.comments"
        :key="comment.created"
      >
        <v-divider v-if="i !== 0" />
        <v-card-text>
          <span style="white-space: pre-line;">{{ comment.text }}</span>
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
import { Component, Prop, PropSync, Vue, Watch } from 'vue-property-decorator'
import type Server from '@tridoc/frontend'

@Component({})
export default class CommentsList extends Vue {
  @Prop() id!: string;
  @PropSync('meta') docMeta !: tdDocMeta
  allTags: tdTag[] = []

  loading = true

  comment = ''
  valid = false
  commentRules: FormRule[] = [
    v => !!v || 'Can’t make empty comments',
  ]

  async add () {
    this.valid = (this.$refs.form as any).validate()
    if (this.valid) {
      this.$store.getters.server.server.addComment(this.id, this.comment)
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
    (this.$store.getters.server.server as Server).getMeta(this.id)
      .then(r => {
        this.loading = false
        if (!('error' in r)) {
          this.$emit('update:meta', { ...r, identifier: this.id })
        }
      })
  }

  created () {
    this.reload()
  }
}
</script>
