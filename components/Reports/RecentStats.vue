<template>
  <div
    class="grid grid-cols-2 gap-y-6 rounded-lg border border-slate-400 py-4 md:grid-cols-3 md:pr-5 xl:grid-cols-5"
  >
    <div class="flex flex-col items-center gap-y-2">
      <template v-if="loading">
        <div class="h-3.5 w-24 animate-pulse rounded-sm bg-ink-300"></div>
        <div class="mb-px h-6 w-8 animate-pulse rounded-sm bg-ink-300"></div>
      </template>
      <template v-else>
        <h3 class="text-xs font-semibold uppercase tracking-wider text-vanilla-400">Current</h3>
        <p class="text-base font-semibold text-vanilla-100">
          {{ shortenLargeNumber(currentVal) }}
        </p>
      </template>
    </div>
    <template v-if="loading">
      <div v-for="index in 4" :key="index" class="flex flex-col items-center gap-y-2">
        <div class="h-3.5 w-24 animate-pulse rounded-sm bg-ink-300"></div>
        <div class="flex flex-col items-center gap-y-1">
          <div class="h-6 w-8 animate-pulse rounded-sm bg-ink-300"></div>
          <div class="h-5 w-12 animate-pulse rounded-sm bg-ink-300"></div>
        </div>
      </div>
    </template>
    <template v-else>
      <div v-for="stat in stats" :key="stat.statLabel" class="flex flex-col items-center gap-y-2">
        <h3 class="text-xs font-semibold uppercase tracking-wider text-vanilla-400">
          {{ stat.statLabel }}
        </h3>
        <div
          class="flex h-full flex-col items-center gap-y-0.5"
          :class="{ 'justify-center': stat.statValue && stat.trendValue }"
        >
          <p v-if="stat.statValue === null" class="text-base font-medium tracking-wider text-slate">
            N/A
          </p>
          <p v-else class="text-base font-semibold text-vanilla-100">
            {{ shortenLargeNumber(stat.statValue) }}
          </p>
          <ticker
            v-if="stat.trendValue && stat.statValue"
            :trend-direction="direction(stat.trendDirection)"
            :trend-positive="stat.trendPositive"
            :trend-value="smartTrendValue(stat.trendValue, stat.statValue)"
            class="font-medium"
          />
        </div>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { RecentStat, TrendDirection } from '~/types/types'
import { shortenLargeNumber } from '~/utils/string'

/**
 * Component to show recent and current values of a report.
 */
@Component({ methods: { shortenLargeNumber } })
export default class RecentStats extends Vue {
  @Prop({ required: true })
  public stats: Array<RecentStat>

  @Prop({ required: true })
  public currentVal: number

  @Prop({ default: false })
  public loading: boolean

  /**
   * Parse trend direction enum values to ticker component compatible values.
   *
   * @param trendDirection TrendDirection
   * @returns string
   */
  direction(trendDirection: TrendDirection): string {
    return trendDirection === TrendDirection.Up ? 'up' : 'down'
  }

  /**
   * Returns string to render inside ticker
   *
   * @param trendValue number
   * @param statValue number
   *
   * @returns string
   */
  smartTrendValue(trendValue: number, statValue: number): string {
    // statValue = 0 means that the change is infinity, this case is handled here
    // The ticker does not render for statValue is zero, this change is just for extra defense
    if (statValue === 0) return ''

    if (trendValue < 120) return `${trendValue}%`

    const smartValue = (trendValue / 100).toFixed(1)

    return `${smartValue}x`
  }
}
</script>
