<template>
  <div class="text-xs sm:h-14 flex flex-col justify-between">
    <p class="text-vanilla-400 mb-2 font-semibold uppercase tracking-wider leading-7">
      <slot name="title">{{ title }}</slot>
    </p>

    <slot>
      <div v-if="loading" class="h-6 mt-px rounded-sm bg-ink-300 animate-pulse"></div>
      <p
        v-else
        v-tooltip="value > 1000 ? `${value}` : ''"
        class="text-base text-vanilla-100 font-semibold leading-8"
      >
        {{ shortenLargeNumber(value) }}
      </p>
    </slot>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

import { shortenLargeNumber } from '~/utils/string'

/**
 * Component to show a stat in ChartContainer
 */
@Component({ methods: { shortenLargeNumber } })
export default class ChartStat extends Vue {
  @Prop({ default: '' })
  title: string

  @Prop()
  value: number | string

  @Prop({ default: false })
  loading: boolean
}
</script>
