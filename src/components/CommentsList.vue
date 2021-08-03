<template>
  <div class="mt-3">
    <v-card outlined :loading="loading" class="list">
      <v-progress-linear
        indeterminate
        :active="loading"
      />
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
          <span class="timestamp"><time-ago :datetime="comment.created">{{ comment.created }}</time-ago></span>
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

<style lang="scss" scoped>
.timestamp {
  float: right;
  font-size: small;
  margin: 4px -4px -4px 4px;
  opacity: 0.8;
}
</style>

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
