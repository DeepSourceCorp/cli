<template>
  <div class="flex flex-col gap-y-2.5">
    <div class="flex flex-grow items-end">
      <p class="uppercase text-xs text-vanilla-400 tracking-wider font-semibold leading-7">
        {{ isThreshold ? 'Threshold' : metric.name }}
      </p>
    </div>
    <div
      v-if="metric.value || metric.value === 0"
      class="flex items-center gap-x-2 h-6 flex-shrink-0"
    >
      <span class="text-base font-semibold leading-8">
        {{ thresholdDisplay }}
      </span>
      <z-menu v-if="isThreshold && canModifyThreshold">
        <template v-slot:trigger="{ toggle }">
          <z-button
            button-type="ghost"
            icon="more-vertical"
            icon-color="vanilla-400"
            size="x-small"
            @click="toggle"
          />
        </template>
        <template slot="body">
          <z-menu-section :divider="false" class="text-left">
            <z-menu-item class="text-sm" icon="edit-2" @click="$emit('openUpdateThresholdModal')">
              Update Threshold
            </z-menu-item>
            <z-menu-item
              class="text-sm text-cherry"
              icon="trash-2"
              @click="$emit('deleteThreshold')"
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
        class="border border-ink-100 border-dashed"
        @click="$emit('addThreshold')"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { ZButton, ZMenu, ZMenuItem, ZMenuSection, ZIcon } from '@deepsourcelabs/zeal'
import { StatType } from '~/types/metric'
import { Metric, MetricNamespaceTrend } from '~/types/types'

/**
 * Displays the trend metric of a page and adds components for updating threshold if required.
 */
@Component({
  name: 'TrendStat',
  components: { ZButton, ZMenu, ZMenuItem, ZMenuSection, ZIcon }
})
export default class TrendStat extends Vue {
  @Prop()
  metric: {
    name?: Metric['name'] | MetricNamespaceTrend['key']
    value: MetricNamespaceTrend['valueDisplay'] | MetricNamespaceTrend['threshold']
    unit?: Metric['unit']
  }

  @Prop({ required: true })
  type: StatType

  @Prop({ default: false })
  canModifyThreshold: boolean

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
