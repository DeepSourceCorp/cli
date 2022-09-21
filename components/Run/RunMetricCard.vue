<template>
  <z-accordion-item :is-open="true" :span-custom-height="true">
    <template #title="{ open, toggleAccordion }">
      <div
        v-if="$slots.header"
        class="flex w-full item-center justify-between px-4 p-3 border-b border-ink-100 cursor-pointer transition-all duration-300"
        :class="{ 'border-opacity-0': !open }"
        @click="isInModal ? () => undefined : toggleAccordion()"
      >
        <slot name="header"></slot>
        <div
          class="bg-ink-100 text-vanilla-100 text-xs rounded-full px-2 items-center gap-x-0.5"
          :class="[isInModal ? 'hidden' : 'flex']"
        >
          {{ metricsCaptured.length }}
          <z-icon
            icon="chevron-down"
            size="x-small"
            class="transform transition-transform ease-in-out duration-300"
            :class="{ 'rotate-180': open }"
          />
        </div>
      </div>
    </template>
    <div class="grid divide-y divide-ink-200">
      <run-metric-stat
        v-for="metric in metricsCaptured"
        :key="metric.namespace.key"
        :metric="metric"
        :show-suppress-button="showSuppressButton"
        :tooltip-text="tooltipText"
        :can-suppress-metric="canSuppressMetric"
        @confirmMetricSuppression="$emit('confirmMetricSuppression', metric)"
      />
    </div>
  </z-accordion-item>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import RunMetricStat from './RunMetricStat.vue'
import { ZIcon, ZTag, ZButton, ZAccordionItem } from '@deepsourcelabs/zeal'
import { Repository, RepositoryMetricValue } from '~/types/types'

const repoStore = namespace('repository/detail')

@Component({
  components: {
    ZIcon,
    ZTag,
    ZButton,
    ZAccordionItem,
    RunMetricStat
  }
})
export default class RunMetricCard extends Vue {
  @repoStore.State
  repository: Repository

  @Prop({ required: true })
  metricsCaptured: RepositoryMetricValue[]

  @Prop({ default: false })
  isInModal: boolean

  get canSuppressMetric(): boolean {
    return Boolean(this.repository?.userPermissionMeta?.can_ignore_failing_metrics)
  }

  get tooltipText(): string {
    return `Compared to ${this.repository.defaultBranchName}`
  }
}
</script>
