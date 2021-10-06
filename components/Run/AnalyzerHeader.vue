<template>
  <!-- Header -->
  <div class="flex w-full rounded-sm flex-1 min-h-24">
    <!-- Left Section -->
    <div class="w-3/5 md:w-4/5 py-2 flex flex-col space-y-1 justify-evenly">
      <!-- heading -->
      <div
        class="flex text-xs lg:text-lg lg:leading-9 text-vanilla-400 font-normal items-center space-x-2"
      >
        <!-- Issue title -->
        <z-icon :icon="icon" size="small" color="transparent"></z-icon>
        <!-- Issue ID -->
        <span class="text-base font-bold text-vanilla-100">{{ title }}</span>
      </div>
      <!-- Description -->
      <div class="sm:flex space-x-6">
        <!-- Found -->
        <div class="flex items-center space-x-2">
          <z-icon :icon="statusIcon" size="small" :color="statusIconColor"></z-icon>
          <div v-if="statusText && finishedInDisplay" class="text-sm text-vanilla-400">
            <span v-if="isPending"> {{ statusText }} (Time elapsed: {{ finishedInDisplay }}) </span>
            <span v-else> {{ statusText }} {{ finishedInDisplay }} </span>
          </div>
          <span v-else class="text-sm text-vanilla-400">{{ statusDescription }} </span>
        </div>
        <!-- Issue type -->
        <div v-if="alertingMetricsCount" class="hidden md:flex items-center space-x-2">
          <z-icon icon="bar-chart" size="small" color="honey"></z-icon>
          <span class="text-xs sm:text-sm text-vanilla-400">{{ alertingMetricsMessage }}</span>
        </div>
      </div>
    </div>
    <!-- Right Section -->
    <div v-if="status !== 'PEND'" class="relative w-2/5 md:w-1/5 p-4">
      <div class="flex justify-around items-center">
        <!-- introduced issues -->
        <div class="flex flex-col space-y-1 items-center">
          <div
            class="text-2xl font-medium text-cherry"
            v-tooltip="
              `${issuesRaisedCount > 1000 ? formatIntl(issuesRaisedCount) : ''} issues introduced`
            "
          >
            {{ shortenNumber(issuesRaisedCount) }}
          </div>
          <div class="text-xs text-vanilla-400">introduced</div>
        </div>
        <!-- resolved issues -->
        <div class="flex flex-col space-y-1 items-center">
          <div
            class="text-2xl font-medium text-vanilla-400"
            v-tooltip="
              `${issuesResolvedCount > 1000 ? formatIntl(issuesResolvedCount) : ''} issues resolved`
            "
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
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { RunStatus } from '~/types/types'
import { shortenLargeNumber, formatIntl } from '~/utils/string'

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

  public shortenNumber = shortenLargeNumber
  public formatIntl = formatIntl

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
      [RunStatus.Pend]: 'refresh-cw',
      [RunStatus.Timo]: 'clock',
      [RunStatus.Cncl]: 'alert-circle'
    }
    return types[this.status || 'PASS']
  }

  get statusIconColor(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'juniper',
      [RunStatus.Fail]: 'cherry',
      [RunStatus.Pend]: 'vanilla-100',
      [RunStatus.Timo]: 'honey',
      [RunStatus.Cncl]: 'honey'
    }
    return types[this.status || 'PASS']
  }

  get statusText(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'Passed in',
      [RunStatus.Fail]: 'Failed after',
      [RunStatus.Pend]: 'Analysis in progress',
      [RunStatus.Timo]: 'Timed out after',
      [RunStatus.Cncl]: 'Cancelled after'
    }
    return types[this.status || 'PASS']
  }

  get statusDescription(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'Finished',
      [RunStatus.Fail]: 'Finished',
      [RunStatus.Pend]: 'Analysis in progress',
      [RunStatus.Timo]: 'Timed out',
      [RunStatus.Cncl]: 'Cancelled'
    }
    return types[this.status || 'PASS']
  }

  get isPending(): boolean {
    return this.status === RunStatus.Pend
  }
}
</script>
