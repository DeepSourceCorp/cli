<template>
  <div class="text-xs">
    <p class="text-vanilla-400 mb-2 font-semibold uppercase tracking-wider">{{ title }}</p>

    <p class="flex items-center gap-x-1.5">
      <slot>
        <p class="text-sm font-semibold tracking-wider">{{ value }}</p>
      </slot>
    </p>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

/**
 * Component to show a stat in ChartContainer
 */
@Component({})
export default class ChartStat extends Vue {
  @Prop({ required: true })
  public title: string

  @Prop()
  public value: number | string
}
</script>
