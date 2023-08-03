<template>
  <!-- Header -->
  <div class="flex min-h-24 w-full flex-1 rounded-sm">
    <!-- Left Section -->
    <div class="flex w-3/5 flex-col gap-y-3 py-4 md:w-4/5 md:gap-y-2">
      <!-- heading -->
      <div
        class="flex items-center space-x-2 text-xs font-normal text-vanilla-400 lg:text-lg lg:leading-9"
      >
        <!-- Issue title -->
        <z-icon :icon="icon" size="small" color="transparent" />
        <!-- Issue ID -->
        <span class="text-base font-bold text-vanilla-100">{{ title }}</span>
      </div>
      <!-- Description -->
      <div class="space-x-6 sm:flex">
        <!-- Found -->
        <div class="flex items-start space-x-2">
          <z-icon :icon="statusIcon" size="small" :color="statusIconColor" class="mt-0.5" />
          <div v-if="showStatusText" class="text-sm text-vanilla-400">
            <span v-if="isPending"> {{ statusText }} (Time elapsed: {{ finishedInDisplay }}) </span>
            <span v-else> {{ statusText }} {{ finishedInDisplay }} </span>
          </div>
          <span v-else class="text-sm text-vanilla-400">{{ statusDescription }} </span>
        </div>
        <!-- Issue type -->
        <div v-if="alertingMetricsCount" class="hidden items-center space-x-2 md:flex">
          <z-icon icon="bar-chart" size="small" color="honey" />
          <span class="text-xs text-vanilla-400 sm:text-sm">{{ alertingMetricsMessage }}</span>
        </div>
      </div>
    </div>
    <!-- Right Section -->
    <div v-if="status !== 'PEND'" class="relative w-2/5 p-3 md:w-1/5">
      <div class="flex items-center justify-around gap-x-4">
        <!-- introduced issues -->
        <div class="flex flex-col items-center">
          <div
            v-tooltip="
              `${issuesRaisedCount > 1000 ? formatIntl(issuesRaisedCount) : ''} issues introduced`
            "
            class="text-2xl font-medium"
            :class="issuesRaisedCount > 0 ? 'text-cherry' : 'text-vanilla-400'"
          >
            {{ shortenLargeNumber(issuesRaisedCount) }}
          </div>
          <div class="text-xs text-vanilla-400">introduced</div>
        </div>
        <!-- resolved issues -->
        <div class="flex flex-col items-center">
          <div
            v-tooltip="
              `${issuesResolvedCount > 1000 ? formatIntl(issuesResolvedCount) : ''} issues resolved`
            "
            class="text-2xl font-medium"
            :class="issuesResolvedCount > 0 ? 'text-juniper' : 'text-vanilla-400'"
          >
            {{ shortenLargeNumber(issuesResolvedCount) }}
          </div>
          <div class="text-xs text-vanilla-400">resolved</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { RunStatus } from '~/types/types'
import { formatIntl, shortenLargeNumber } from '~/utils/string'
import { runStatusIcon, runStatusIconColor, runStatusTagLabel } from '~/utils/ui'

@Component({
  methods: {
    formatIntl,
    shortenLargeNumber
  }
})
export default class AnalyzerHeader extends Vue {
  @Prop({ required: true })
  title!: string

  @Prop({ required: true })
  icon!: string

  @Prop({ required: true })
  status!: RunStatus

  @Prop()
  finishedInDisplay: string

  @Prop({ default: 0 })
  issuesRaisedCount: number

  @Prop({ default: 0 })
  issuesResolvedCount: number

  @Prop({ default: 0 })
  alertingMetricsCount: number

  get alertingMetricsMessage(): string {
    if (this.alertingMetricsCount === 1) {
      return '1 metric is critically alerting'
    } else if (this.alertingMetricsCount > 1) {
      return `${this.alertingMetricsCount} metrics are critically alerting`
    }

    return ''
  }

  get statusIcon(): string {
    return runStatusIcon(this.status)
  }

  get statusIconColor(): string {
    return runStatusIconColor(this.status)
  }

  get statusText(): string {
    return runStatusTagLabel(this.status, true)
  }

  get statusDescription(): string {
    return runStatusTagLabel(this.status)
  }

  get isPending(): boolean {
    return this.status === RunStatus.Pend
  }

  get showStatusText(): boolean {
    return Boolean(this.statusText && this.finishedInDisplay)
  }
}
</script>
