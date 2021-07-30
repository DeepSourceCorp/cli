<template>
  <div class="bg-ink-300 px-4 py-3 text-vanilla-400 text-sm flex space-x-2 items-center rounded-sm">
    <span
      class="w-2 h-2 rounded-full"
      :class="{
        'bg-juniper': enabled,
        'bg-slate': !enabled
      }"
    ></span>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({})
export default class Notice extends Vue {
  @Prop({ default: true })
  enabled!: boolean
}
</script>
