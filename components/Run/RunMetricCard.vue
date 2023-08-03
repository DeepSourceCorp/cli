<template>
  <z-accordion-item :is-open="true" :span-custom-height="true">
    <template #title="{ open, toggleAccordion }">
      <div
        v-if="$slots.header"
        class="item-center flex w-full cursor-pointer justify-between border-b border-slate-400 p-3 px-4 transition-all duration-300"
        :class="{ 'border-opacity-0': !open }"
        @click="isInModal ? () => undefined : toggleAccordion()"
      >
        <slot name="header"></slot>
        <div
          class="items-center gap-x-0.5 rounded-full bg-ink-100 px-2 text-xs text-vanilla-100"
          :class="[isInModal ? 'hidden' : 'flex']"
        >
          {{ metricsCaptured.length }}
          <z-icon
            icon="chevron-down"
            size="x-small"
            class="transform transition-transform duration-300 ease-in-out"
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
        :is-in-modal="isInModal"
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
import { Repository, RepositoryMetricValue } from '~/types/types'

const repoStore = namespace('repository/detail')

@Component({
  components: {
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
