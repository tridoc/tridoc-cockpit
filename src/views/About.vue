<template>
  <div class="about">
    <h1>This is {{ id }}</h1>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({})
export default class ErrorDialog extends Vue {
  @Prop() id!: string
}
</script>
