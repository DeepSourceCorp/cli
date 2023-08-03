<template>
  <div class="flex flex-col justify-between text-xs sm:h-14">
    <p class="mb-2 font-semibold uppercase leading-7 tracking-wider text-vanilla-400">
      <slot name="title">{{ title }}</slot>
    </p>

    <slot>
      <div v-if="loading" class="mt-px h-6 animate-pulse rounded-sm bg-ink-300"></div>
      <p
        v-else
        v-tooltip="value > 1000 ? `${value}` : ''"
        class="text-base font-semibold leading-8 text-vanilla-100"
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
