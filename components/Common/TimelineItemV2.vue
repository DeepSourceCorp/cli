<template>
  <li class="flex min-h-32 gap-x-4 text-sm md:min-h-24">
    <div name="list-item-type" class="flex flex-col items-center justify-center">
      <div name="list-item-marker" class="flex items-center justify-center py-1">
        <span class="inline-block h-1.5 w-1.5 rounded-full" :class="listStyleClasses"></span>
      </div>

      <div name="list-item-border" class="h-full border-l border-dashed border-ink-200"></div>
    </div>

    <slot></slot>
  </li>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

type ListStyleTypes = 'circle' | 'disc'

@Component({ name: 'TimelineItemV2' })
export default class TimelineItemV2 extends Vue {
  @Prop({
    default: 'disc',
    type: String,
    validator: (val: string) => ['circle', 'disc'].includes(val)
  })
  listStyleType: ListStyleTypes

  get listStyleClasses() {
    const classMap = {
      circle: 'border border-slate-200 bg-transparent',
      disc: 'bg-slate-200'
    } as Record<ListStyleTypes, string>

    return classMap[this.listStyleType]
  }
}
</script>

<style scoped>
li:last-child > div[name='list-item-type'] > div[name='list-item-border'] {
  @apply border-l-0;
}
</style>
