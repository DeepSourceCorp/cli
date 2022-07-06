<template>
  <div class="p-4 space-y-4 grid content-between">
    <div
      class="grid"
      :class="
        metricsCaptured.isPassing === false && !metricsCaptured.isSuppressed
          ? 'grid-cols-2'
          : 'grid-cols-1'
      "
    >
      <p class="font-medium leading-normal text-base text-vanilla-100">
        {{ metricsCaptured.name }}
      </p>
      <div>
        <button
          v-if="metricsCaptured.isPassing === false && !metricsCaptured.isSuppressed"
          class="pl-2 pr-3 py-1 float-right inline-flex items-center gap-x-2 text-vanilla-400 bg-ink-200 text-xxs rounded-sm"
          @click="$emit('confirmMetricSuppression', metricsCaptured)"
        >
          <z-icon icon="minus-circle" size="x-small" class="flex-shrink-0" />
          <span class="whitespace-nowrap flex-shrink-0 leading-none">Suppress</span>
        </button>
      </div>
    </div>
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-x-2">
        <span class="text-2xl leading-snug text-vanilla-100">
          {{ metricsCaptured.valueDisplay }}</span
        >
        <ticker
          v-if="metricsCaptured.valueTrendDisplay"
          :trend-value="trendDisplay"
          :trend-positive="trendPositive"
          :is-percent="trendIsPercent"
          :trend-direction="trendDirection"
          custom-bg-class="bg-ink-100"
          :class="[trendPositive ? 'text-juniper' : 'text-cherry']"
        />
      </div>
      <z-tag
        v-if="metricsCaptured.threshold && !metricsCaptured.isSuppressed"
        :icon-left="metricsCaptured.isPassing ? 'metric-high' : 'metric-low'"
        :icon-color="metricsCaptured.isPassing ? 'juniper' : 'cherry'"
        size="x-small"
        spacing="px-2 py-0"
        class="border border-ink-200"
      >
        <span
          class="font-semibold text-xxs uppercase tracking-wider leading-none py-1.5"
          :class="metricsCaptured.isPassing ? 'text-juniper' : 'text-cherry'"
          >{{ metricsCaptured.isPassing ? 'Above threshold' : 'Below threshold' }}</span
        >
      </z-tag>
      <z-tag
        v-else-if="metricsCaptured.isSuppressed"
        icon-left="minus-circle"
        icon-color="vanilla-400"
        size="x-small"
        spacing="px-2 py-0"
        class="border border-ink-200"
      >
        <span
          class="font-semibold text-xxs uppercase tracking-wider leading-none py-1.5 text-vanilla-400"
          >{{ metricsCaptured.isPassing ? 'Above threshold' : 'Below threshold' }}</span
        >
      </z-tag>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { ZIcon, ZTag } from '@deepsourcelabs/zeal'
import { RepositoryMetricValue } from '~/types/types'

@Component({
  components: {
    ZIcon,
    ZTag
  }
})
export default class RunMetricCard extends Vue {
  @Prop({ required: true })
  metricsCaptured: RepositoryMetricValue

  get trendDisplay(): string {
    return this.metricsCaptured.valueTrendDisplay?.split(' ').at(-1) ?? ''
  }

  get trendDirection(): string {
    return this.metricsCaptured.valueTrendDisplay?.split(' ').at(0)?.toLowerCase() || ''
  }

  get trendPositive(): boolean {
    return this.trendDirection === 'up'
  }

  get trendIsPercent(): boolean {
    return this.metricsCaptured.valueTrendDisplay?.includes('%') || false
  }
}
</script>
