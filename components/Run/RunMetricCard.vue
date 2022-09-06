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
            v-tooltip="tooltipText"
            :trend-value="trendDisplay"
            :trend-positive="trendPositive"
            :is-percent="trendIsPercent"
            :trend-direction="trendDirection"
            custom-bg-class="bg-ink-100"
            :class="[trendPositive ? 'text-juniper' : 'text-cherry']"
          />
        </div>
        <template v-if="metricThresholdRelation">
          <z-tag
            v-if="metricsCaptured.isSuppressed"
            icon-left="minus-circle"
            icon-color="vanilla-400"
            size="x-small"
            spacing="px-2 py-0"
            class="border border-ink-200"
          >
            <span
              class="font-semibold text-xxs uppercase tracking-wider leading-none py-1.5 text-vanilla-400"
              >{{ metricThresholdRelation }}</span
            >
          </z-tag>
          <z-tag
            v-else
            :icon-left="metricThresholdRelationIcon"
            :icon-color="metricsCaptured.isPassing ? 'juniper' : 'cherry'"
            size="x-small"
            spacing="px-2 py-0"
            class="border border-ink-200"
          >
            <span
              class="font-semibold text-xxs uppercase tracking-wider leading-none py-1.5"
              :class="metricsCaptured.isPassing ? 'text-juniper' : 'text-cherry'"
              >{{ metricThresholdRelation }}</span
            >
          </z-tag>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'

import { ZIcon, ZTag, ZButton } from '@deepsourcelabs/zeal'
import { Repository, RepositoryMetricValue } from '~/types/types'

const repoStore = namespace('repository/detail')

enum VALUE_STATE {
  ABOVE = 'Above threshold',
  BELOW = 'Below threshold',
  MEETS = 'Meets threshold'
}

const ICON_VALUE_STATE = {
  [VALUE_STATE.ABOVE]: 'metric-high',
  [VALUE_STATE.BELOW]: 'metric-low',
  [VALUE_STATE.MEETS]: 'metric-medium'
}

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

  get metricThresholdRelation(): VALUE_STATE | '' {
    if (
      this.metricsCaptured.value !== null &&
      this.metricsCaptured.value !== undefined &&
      this.metricsCaptured.threshold !== null &&
      this.metricsCaptured.threshold !== undefined
    ) {
      return this.metricsCaptured.value === this.metricsCaptured.threshold
        ? VALUE_STATE.MEETS
        : this.metricsCaptured.value > this.metricsCaptured.threshold
        ? VALUE_STATE.ABOVE
        : VALUE_STATE.BELOW
    }
    return ''
  }

  get metricThresholdRelationIcon(): string {
    return this.metricThresholdRelation ? ICON_VALUE_STATE[this.metricThresholdRelation] : ''
  }

  get canSuppressMetric(): boolean {
    return Boolean(this.repository?.userPermissionMeta?.can_ignore_failing_metrics)
  }

  get tooltipText(): string {
    return `Compared to ${this.repository.defaultBranchName}`
  }
}
</script>
