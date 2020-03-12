<template>
<v-list nav dense>
    <v-subheader>TAGS</v-subheader>
    <v-list-item-group v-model="item" color="primary">
        <v-list-item
            v-for="(item, i) in items"
            :key="i"
        >
            <v-list-item-icon>
            <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
            <v-list-item-title v-text="item.text"></v-list-item-title>
            </v-list-item-content>
        </v-list-item>
    </v-list-item-group>
</v-list>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  components: {}
})
export default class TagList extends Vue {
  items = [
    { icon: 'mdi-tag-plus', text: 'Add Tag' }
  ]
}
</script>
