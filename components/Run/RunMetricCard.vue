<template>
  <div>
    <div v-if="$slots.header" class="bg-ink-200 px-4 py-2">
      <slot name="header"></slot>
    </div>
    <div class="p-4 space-y-2.5 grid content-between">
      <div>
        <div class="float-right">
          <z-button
            v-if="
              canSuppressMetric &&
              metricsCaptured.isPassing === false &&
              !metricsCaptured.isSuppressed
            "
            button-type="ghost"
            icon="minus-circle"
            icon-color="vanilla-400"
            size="x-small"
            @click="$emit('confirmMetricSuppression', metricsCaptured)"
          />
        </div>
        <p class="font-medium leading-normal text-base text-vanilla-100">
          {{ metricsCaptured.name }}
        </p>
      </div>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-x-2">
          <span class="text-lg font-bold leading-snug text-vanilla-100">
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
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'

import { ZIcon, ZTag, ZButton } from '@deepsourcelabs/zeal'
import { Repository, RepositoryMetricValue } from '~/types/types'

const repoStore = namespace('repository/detail')

@Component({
  components: {
    ZIcon,
    ZTag,
    ZButton
  }
})
export default class RunMetricCard extends Vue {
  @repoStore.State
  repository: Repository

  @Prop({ required: true })
  metricsCaptured: RepositoryMetricValue

  get trendDisplay(): string {
    return this.metricsCaptured.valueTrendDisplay?.split(' ')?.[1] ?? ''
  }

  get trendDirection(): string {
    return this.metricsCaptured.valueTrendDisplay?.split(' ')?.[0]?.toLowerCase() || ''
  }

  get trendPositive(): boolean {
    return this.trendDirection === 'up'
  }

  get trendIsPercent(): boolean {
    return this.metricsCaptured.valueTrendDisplay?.includes('%') || false
  }

  get canSuppressMetric(): boolean {
    return Boolean(this.repository?.userPermissionMeta?.can_ignore_failing_metrics)
  }
}
</script>
