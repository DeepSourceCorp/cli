<template>
  <div class="flex flex-col gap-y-2.5">
    <div class="flex flex-grow items-end">
      <p class="text-xs font-semibold uppercase leading-7 tracking-wider text-vanilla-400">
        {{ metric.name }}
      </p>
    </div>
    <div
      v-if="metric.value || metric.value === 0"
      class="flex h-6 flex-shrink-0 items-center gap-x-2"
    >
      <span class="text-base font-semibold leading-8">
        {{ thresholdDisplay }}
      </span>
      <z-menu v-if="isThreshold && canModifyThreshold">
        <template #trigger="{ toggle }">
          <z-button
            button-type="ghost"
            icon="more-vertical"
            icon-color="vanilla-400"
            size="x-small"
            @click="toggle"
          />
        </template>
        <template #body>
          <z-menu-section :divider="false" class="text-left">
            <z-menu-item
              icon="edit-2"
              class="text-sm"
              @click="$emit('openUpdateThresholdModal', metric.shortcode)"
            >
              Update Threshold
            </z-menu-item>
            <z-menu-item
              icon="trash-2"
              class="text-sm text-cherry"
              @click="$emit('deleteThreshold', metric.shortcode)"
            >
              Delete Threshold
            </z-menu-item>
          </z-menu-section>
        </template>
      </z-menu>
    </div>
    <div v-else-if="isThreshold">
      <z-button
        button-type="ghost"
        icon="plus"
        size="x-small"
        icon-size="x-small"
        color="vanilla-100"
        label="Add threshold"
        class="border border-dashed border-slate-400"
        @click="$emit('addThreshold', metric.shortcode)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { ZButton, ZMenu, ZMenuItem, ZMenuSection, ZIcon } from '@deepsource/zeal'
import { StatType } from '~/types/metric'
import { Metric, MetricNamespaceTrend } from '~/types/types'

export interface TrendStatProps {
  metric: {
    name: Metric['name'] | MetricNamespaceTrend['key']
    shortcode?: Metric['shortcode'] | Metric['newCodeMetricShortcode']
    value: MetricNamespaceTrend['valueDisplay'] | MetricNamespaceTrend['threshold']
    unit?: Metric['unit']
  }
  type: StatType
  canModifyThreshold?: boolean
}

/**
 * Displays the trend metric of a page and adds components for updating threshold if required.
 */
@Component({
  name: 'TrendStat',
  components: { ZButton, ZMenu, ZMenuItem, ZMenuSection, ZIcon }
})
export default class TrendStat extends Vue {
  @Prop()
  metric: TrendStatProps['metric'] | Required<TrendStatProps['metric']>

  @Prop({ required: true })
  type: TrendStatProps['type']

  @Prop({ default: false })
  canModifyThreshold: TrendStatProps['canModifyThreshold']

  get isThreshold(): boolean {
    return this.type === StatType.threshold
  }

  get thresholdDisplay(): string {
    return this.metric.unit
      ? `${this.metric.value}${this.metric.unit}`
      : (this.metric.value as string)
  }
}
</script>
