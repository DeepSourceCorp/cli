<template>
  <div class="w-full h-2 mt-1 rounded-full bg-ink-200">
    <div
      class="h-2 transition-all duration-200 ease-in-out transform rounded-full"
      :class="{
        'bg-juniper': 50 >= completion,
        'bg-honey': 80 >= completion && completion > 50,
        'bg-cherry': completion > 80
      }"
      :style="{
        width: `${completion}%`
      }"
    ></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({})
export default class UsageInfo extends Vue {
  @Prop({ required: true })
  completion: number
}
</script>
