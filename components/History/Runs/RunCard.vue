<template>
  <base-card :to="getRoute(runId)">
    <template slot="title">
      <z-icon
        v-tooltip="tooltipText"
        :icon="icon"
        size="small"
        :color="iconColor"
        class="flex-shrink-0"
        :class="{ 'motion-safe:animate-spin': isPending }"
      />
      <h3
        class="overflow-hidden cursor-pointer text-vanilla-100 whitespace-nowrap overflow-ellipsis"
      >
        {{ branchName }}
      </h3>
      <span class="inline text-sm font-normal text-vanilla-400 md:flex md:flex-shrink-0"
        >@{{ commitOid.slice(0, 7) }}</span
      >
    </template>
    <template slot="description">
      <div class="mt-2 ml-6 space-y-1 md:space-y-0 md:flex md:flex-wrap md:items-center md:gap-x-4">
        <div v-if="!isPending" class="flex items-center gap-x-1.5">
          <z-icon icon="clock" size="x-small" color="vanilla-400" />
          <span class="text-sm text-vanilla-400">Analyzed {{ createdString }}</span>
        </div>
        <div v-else class="flex items-center gap-x-1.5">
          <z-icon icon="clock" size="x-small" color="vanilla-400" />
          <span class="text-sm text-vanilla-400">{{ statusText }}</span>
        </div>
        <!-- Issue type -->
        <div class="hidden gap-x-1.5 md:flex md:items-center">
          <z-icon icon="git-commit" size="x-small" color="vanilla-400" />
          <span class="text-sm text-vanilla-400">{{ gitCompareDisplay }}</span>
        </div>
        <!-- Created -->
        <div v-if="!isPending" class="hidden gap-x-1.5 md:flex md:items-center">
          <z-icon icon="clock" size="x-small" color="vanilla-400" />
          <span v-if="statusText && finishedIn" class="text-sm text-vanilla-400">
            {{ statusText }} {{ finishedString }}
          </span>
          <span v-else class="text-sm text-vanilla-400">{{ absentTimeStatusText }}</span>
        </div>
        <!-- introduced resolved -->
        <div
          v-if="!isPending && (issuesRaisedCount || issuesResolvedNum)"
          class="flex items-center gap-x-1.5 md:hidden"
        >
          <z-icon icon="zap" size="x-small" color="vanilla-400" />
          <span class="text-sm text-vanilla-400">
            <!-- ! Prevents a space before `,`, the following 2 templates should be continuous -->
            <template v-if="issuesRaisedCount">{{ issuesRaisedCount }} introduced</template
            ><template v-if="issuesRaisedCount && issuesResolvedNum">,</template>
            <template v-if="issuesResolvedNum">{{ issuesResolvedNum }} resolved</template>
          </span>
        </div>
      </div>
    </template>
    <template slot="info">
      <div
        v-if="issueStats.length && !isPending"
        class="flex items-center justify-around h-full gap-x-2"
      >
        <div v-for="stat in issueStats" :key="stat.label" class="flex flex-col items-center">
          <div
            class="text-2xl font-medium"
            :class="{
              'text-cherry': !stat.isPositive,
              'text-juniper': stat.isPositive,
              'text-vanilla-400': Number(stat.value) === 0
            }"
          >
            {{ stat.value }}
          </div>
          <div class="text-xs text-vanilla-400">{{ stat.label }}</div>
        </div>
      </div>
    </template>
  </base-card>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { BaseCard } from '../'

import { fromNow, formatSeconds } from '@/utils/date'
import { shortenLargeNumber } from '@/utils/string'
import { Maybe, RunStatus, Scalars } from '~/types/types'

@Component({
  components: {
    BaseCard,
    ZIcon
  }
})
export default class RunCard extends Vue {
  @Prop({ default: 'PASS' })
  status: string

  @Prop({ default: '' })
  branchName: string

  @Prop({ default: '' })
  runId: string

  @Prop({ default: '' })
  createdAt: string

  @Prop({ default: '' })
  finishedIn: number

  @Prop({ default: '' })
  gitCompareDisplay: string

  @Prop({ default: '' })
  commitOid: string

  @Prop({ default: 0 })
  issuesRaisedCount: number

  @Prop({ default: 0 })
  issuesResolvedNum: number

  @Prop({ required: true })
  config!: Maybe<Scalars['GenericScalar']>

  get icon(): string {
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

  get iconColor(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'juniper',
      [RunStatus.Fail]: 'cherry',
      [RunStatus.Pend]: 'vanilla-100',
      [RunStatus.Timo]: 'honey',
      [RunStatus.Cncl]: 'honey',
      [RunStatus.Read]: 'vanilla-400'
    }
    return types[this.status || 'PASS']
  }

  get tooltipText(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'Run has passed',
      [RunStatus.Fail]: 'Run failed',
      [RunStatus.Pend]: 'Analysis in progress',
      [RunStatus.Timo]: 'Analysis timed out',
      [RunStatus.Cncl]: 'Analysis cancelled',
      [RunStatus.Read]: 'Analysis ready'
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

  get absentTimeStatusText(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'Passed',
      [RunStatus.Fail]: 'Failed',
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

  getRoute(candidate: string): string {
    const analyzer = this.config?.analyzers[0] && this.config.analyzers[0]['name']
    const route = analyzer ? ['run', candidate, analyzer] : ['run', candidate]
    return this.$generateRoute(route)
  }

  get issueStats(): { label: string; value: string; isPositive: boolean | null }[] {
    const stats = []
    if (this.issuesRaisedCount !== null) {
      stats.push({
        label: 'introduced',
        value: shortenLargeNumber(this.issuesRaisedCount),
        isPositive: this.issuesRaisedCount === 0 ? null : false
      })
    }
    if (this.issuesResolvedNum !== null) {
      stats.push({
        label: 'resolved',
        value: shortenLargeNumber(this.issuesResolvedNum),
        isPositive: this.issuesResolvedNum === 0 ? null : true
      })
    }

    return stats
  }

  get commitHash(): string {
    return this.commitOid.slice(0, 7)
  }

  get createdString(): string {
    // return '2mins'
    return fromNow(this.createdAt)
  }

  get finishedString(): string {
    return formatSeconds(this.finishedIn)
  }
}
</script>
