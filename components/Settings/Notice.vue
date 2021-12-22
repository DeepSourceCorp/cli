<template>
  <div class="bg-ink-300 px-4 py-3 text-vanilla-400 text-sm flex gap-x-2 items-center rounded-sm">
    <slot name="indicator">
      <span
        class="w-2 h-2 rounded-full flex-shrink-0"
        :class="[enabled ? 'bg-juniper' : 'bg-slate']"
      ></span>
    </slot>
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
