<template>
  <div class="flex items-center gap-x-2 rounded-sm bg-ink-300 px-4 py-3 text-sm text-vanilla-400">
    <slot name="indicator">
      <span
        class="h-2 w-2 flex-shrink-0 rounded-full"
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
