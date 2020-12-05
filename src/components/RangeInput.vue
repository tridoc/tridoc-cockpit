<template>
<div>
  <v-divider/>
  <div class="rangerow mx-2 mt-2" v-if="type === 'number'">
    <v-text-field
      v-model="min"
      label="From"
      outlined dense
      hide-details="auto"
      type="number"
    />
    <v-text-field
      v-model="max"
      label="To"
      outlined dense
      hide-details="auto"
      type="number"
    />
  </div>
  <div class="rangerow mx-2 mt-2" v-else>
    <v-menu
      ref="minMenu"
      v-model="minMenu"
      :close-on-content-click="false"
      :return-value.sync="min"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
          v-model="min"
          @change="minDate = min || ''"
          label="From"
          outlined dense
          hide-details="auto"
          :rules="dateRules"
          v-bind="attrs"
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker
        v-model="minDate"
        no-title
        scrollable
      >
        <v-spacer></v-spacer>
        <v-btn
          text
          color="primary"
          @click="minMenu = false"
        >
          Cancel
        </v-btn>
        <v-btn
          text
          color="primary"
          @click="$refs.minMenu.save(minDate)"
        >
          OK
        </v-btn>
      </v-date-picker>
    </v-menu>
    <v-menu
      ref="maxMenu"
      v-model="maxMenu"
      :close-on-content-click="false"
      :return-value.sync="max"
      transition="scale-transition"
      offset-y
      min-width="290px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
          v-model="max"
          @change="maxDate = max || ''"
          label="To"
          outlined dense
          hide-details="auto"
          :rules="dateRules"
          v-bind="attrs"
          v-on="on"
        ></v-text-field>
      </template>
      <v-date-picker
        v-model="maxDate"
        no-title
        scrollable
      >
        <v-spacer></v-spacer>
        <v-btn
          text
          color="primary"
          @click="maxMenu = false"
        >
          Cancel
        </v-btn>
        <v-btn
          text
          color="primary"
          @click="$refs.maxMenu.save(maxDate)"
        >
          OK
        </v-btn>
      </v-date-picker>
    </v-menu>
  </div>
  <div class="bottom">
    <v-btn
      text small
      class="ma-1"
       @click="() => remove(min, max, inc)"
    >Remove</v-btn>
    <v-btn
      icon
      color="primary"
    >
      <v-icon>{{ inc ? 'mdi-check-box-outline' : 'mdi-close-box-outline' }}</v-icon>
    </v-btn>
  </div>
</div>
</template>

<script lang="ts">
import { Component, Prop, PropSync, Vue, Watch } from 'vue-property-decorator'

@Component({})
export default class TagRangeInput extends Vue {
  @PropSync('minimum') min!: number|string|null
  @PropSync('maximum') max!: number|string|null
  @PropSync('include') inc!: boolean
  @Prop() type!: 'number'|'date'

  @Prop() remove!: (min: (string|number|undefined), max: (string|number|undefined), include: boolean) => void

  minMenu = false
  maxMenu = false

  minDate = ''
  maxDate = ''

  dateRules: FormRule[] = [
    v => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v).getTime())) || 'Must be a date of format YYYY-MM-DD',
  ]
}
</script>

<style lang="scss" scoped>
.rangerow {
  display: flex;
  justify-content: space-between;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  max-width: 100%;
}

.bottom {
  display: flex;
  justify-content: space-between;
}
</style>
