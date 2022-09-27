<template>
  <div class="text-xs">
    <p class="text-vanilla-400 mb-2 font-semibold uppercase tracking-wider leading-7">
      {{ title }}
    </p>

    <slot>
      <p class="text-base text-vanilla-100 font-semibold leading-8">{{ value }}</p>
    </slot>
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
