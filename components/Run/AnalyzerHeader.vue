<template>
  <!-- Header -->
  <div class="flex flex-1 w-full rounded-sm min-h-24">
    <!-- Left Section -->
    <div class="flex flex-col w-3/5 py-2 space-y-1 md:w-4/5 justify-evenly">
      <!-- heading -->
      <div
        class="
          flex
          items-center
          space-x-2
          text-xs
          font-normal
          lg:text-lg lg:leading-9
          text-vanilla-400
        "
      >
        <!-- Issue title -->
        <z-icon :icon="icon" size="small" color="transparent" />
        <!-- Issue ID -->
        <span class="text-base font-bold text-vanilla-100">{{ title }}</span>
      </div>
      <!-- Description -->
      <div class="space-x-6 sm:flex">
        <!-- Found -->
        <div class="flex items-center space-x-2">
          <z-icon
            :icon="statusIcon"
            size="small"
            :color="statusIconColor"
            :class="{ 'motion-safe:animate-spin': isPending }"
          />
          <div v-if="statusText && finishedInDisplay" class="text-sm text-vanilla-400">
            <span v-if="isPending"> {{ statusText }} (Time elapsed: {{ finishedInDisplay }}) </span>
            <span v-else> {{ statusText }} {{ finishedInDisplay }} </span>
          </div>
          <span v-else class="text-sm text-vanilla-400">{{ statusDescription }} </span>
        </div>
        <!-- Issue type -->
        <div v-if="alertingMetricsCount" class="items-center hidden space-x-2 md:flex">
          <z-icon icon="bar-chart" size="small" color="honey" />
          <span class="text-xs sm:text-sm text-vanilla-400">{{ alertingMetricsMessage }}</span>
        </div>
      </div>
    </div>
    <!-- Right Section -->
    <div v-if="status !== 'PEND'" class="relative w-2/5 p-4 md:w-1/5">
      <div class="flex items-center justify-around">
        <!-- introduced issues -->
        <div class="flex flex-col items-center space-y-1">
          <div
            v-tooltip="
              `${issuesRaisedCount > 1000 ? formatIntl(issuesRaisedCount) : ''} issues introduced`
            "
            class="text-2xl font-medium"
            :class="issuesRaisedCount > 0 ? 'text-cherry' : 'text-vanilla-400'"
          >
            {{ shortenNumber(issuesRaisedCount) }}
          </div>
          <div class="text-xs text-vanilla-400">introduced</div>
        </div>
        <!-- resolved issues -->
        <div class="flex flex-col items-center space-y-1">
          <div
            v-tooltip="
              `${issuesResolvedCount > 1000 ? formatIntl(issuesResolvedCount) : ''} issues resolved`
            "
            class="text-2xl font-medium"
            :class="issuesResolvedCount > 0 ? 'text-juniper' : 'text-vanilla-400'"
          >
            {{ shortenNumber(issuesResolvedCount) }}
          </div>
          <div class="text-xs text-vanilla-400">resolved</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ZIcon } from '@deepsourcelabs/zeal'
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { RunStatus } from '~/types/types'
import { formatIntl, shortenLargeNumber } from '~/utils/string'

@Component({
  components: {
    ZIcon
  }
})
export default class AnalyzerHeader extends Vue {
  @Prop({ required: true })
  title!: string

  @Prop({ required: true })
  icon!: string

  @Prop({ required: true })
  status!: string

  @Prop()
  finishedInDisplay: string

  @Prop({ default: 0 })
  issuesRaisedCount: number

  @Prop({ default: 0 })
  issuesResolvedCount: number

  @Prop({ default: 0 })
  alertingMetricsCount: number

  public formatIntl = formatIntl
  public shortenNumber = shortenLargeNumber

  get alertingMetricsMessage(): string {
    if (this.alertingMetricsCount === 1) {
      return `1 metric is critically alerting`
    } else if (this.alertingMetricsCount > 1) {
      return `${this.alertingMetricsCount} metrics are critically alerting`
    }

    return ''
  }

  get statusIcon(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'check',
      [RunStatus.Fail]: 'x',
      [RunStatus.Pend]: 'spin-loader',
      [RunStatus.Timo]: 'clock',
      [RunStatus.Cncl]: 'alert-circle',
      [RunStatus.Read]: 'check-circle'
    }
    return types[this.status || 'PASS']
  }

  get statusIconColor(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'juniper',
      [RunStatus.Fail]: 'cherry',
      [RunStatus.Pend]: 'vanilla-100',
      [RunStatus.Timo]: 'honey',
      [RunStatus.Cncl]: 'honey',
      [RunStatus.Read]: 'juniper-100'
    }
    return types[this.status || 'PASS']
  }

  get statusText(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'Passed in',
      [RunStatus.Fail]: 'Failed after',
      [RunStatus.Pend]: 'Analysis in progress',
      [RunStatus.Timo]: 'Timed out after',
      [RunStatus.Cncl]: 'Cancelled after',
      [RunStatus.Read]: 'Completed in'
    }
    return types[this.status || 'PASS']
  }

  get statusDescription(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'Finished',
      [RunStatus.Fail]: 'Finished',
      [RunStatus.Pend]: 'Analysis in progress',
      [RunStatus.Timo]: 'Timed out',
      [RunStatus.Cncl]: 'Cancelled',
      [RunStatus.Read]: 'Ready'
    }
    return types[this.status || 'PASS']
  }

  get isPending(): boolean {
    return this.status === RunStatus.Pend
  }
}
</script>
