<template>
  <base-card :to="getRoute(runId)">
    <template #left-section>
      <div class="flex w-full justify-between">
        <div class="md:w-4/5 2xl:w-5/6 gap-2 p-3" :class="[isSecondary ? 'w-full' : 'w-2/3']">
          <div class="flex flex-col flex-grow">
            <section class="flex items-center gap-x-1 text-xs md:text-base">
              <z-icon
                v-tooltip="tagLabel"
                class="self-center flex-shrink-0 inline mt-0.5"
                :icon="icon"
                :class="{ 'animate-spin': isPending }"
                :color="iconColor"
              />
              <h3 class="inline font-medium cursor-pointer text-vanilla-100 line-clamp-1">
                {{ branchName }}
              </h3>
              <span class="inline font-medium text-vanilla-400">{{
                pullRequestNumberDisplay
              }}</span>
            </section>
            <section
              class="flex flex-wrap items-center flex-grow mt-1 leading-8 gap-x-4 gap-y-2 pl-px"
            >
              <meta-data-item v-if="!isPending" :label="`Analyzed ${createdString}`" icon="clock" />
              <meta-data-item v-else :label="statusText" icon="clock" />
              <meta-data-item
                v-if="isSecondary && issueMetaDataLabel"
                :label="issueMetaDataLabel"
                icon="flag"
                class="md:hidden"
              />
              <section v-if="!isSecondary && $slots.toggleTrigger" class="flex-shrink-0">
                <slot name="toggleTrigger"></slot>
              </section>
            </section>
          </div>
        </div>
        <!-- stats-->
        <div
          v-if="issueStats.length && !isPending"
          class="md:w-1/5 2xl:w-1/6 border-l border-ink-200"
          :class="{ 'hidden md:block': isSecondary }"
        >
          <div
            class="grid items-center justify-around flex-shrink-0 h-full grid-cols-1 md:grid-cols-2 md:gap-x-0 divide-y md:divide-y-0 divide-ink-200"
          >
            <div
              v-for="stat in issueStats"
              :key="stat.label"
              class="grid w-20 md:w-full h-full p-2 text-center place-content-center md:p-3"
            >
              <div
                class="text-sm md:text-1.5xl font-semibold"
                :class="{
                  'text-cherry': !stat.isPositive,
                  'text-juniper': stat.isPositive,
                  'text-vanilla-400': Number(stat.value) === 0
                }"
              >
                {{ stat.value }}
              </div>
              <div class="text-xxs md:text-xs text-vanilla-400">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </base-card>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { BaseCard } from '../'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { fromNow, formatSeconds } from '@/utils/date'
import { shortenLargeNumber } from '@/utils/string'
import { Maybe, RunStatus, Scalars } from '~/types/types'
import { state } from '~/store'

@Component({
  components: {
    BaseCard,
    ZIcon
  }
})
export default class RunCard extends mixins(RepoDetailMixin) {
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

  @Prop({ default: '' })
  vcsPrUrl: string

  @Prop({ default: '' })
  pullRequestNumberDisplay: string

  @Prop({ default: 0 })
  issuesRaisedCount: number

  @Prop({ default: 0 })
  issuesResolvedNum: number

  @Prop({ default: 0 })
  branchRunCount: number

  @Prop({ default: false })
  isSecondary: boolean

  @Prop({ required: true })
  config!: Maybe<Scalars['GenericScalar']>

  @Prop({ default: false })
  isForDefaultBranch: boolean

  get provider() {
    const { provider } = this.$route.params
    return this.$providerMetaMap[provider].text
  }

  get vscLinkTooltip() {
    const { provider } = this.$route.params
    return this.isForDefaultBranch
      ? `Open ${this.branchName} on ${this.provider}`
      : provider === 'gl'
      ? 'Open MR'
      : 'Open PR'
  }

  get icon(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'check',
      [RunStatus.Fail]: 'x',
      [RunStatus.Pend]: 'spin-loader',
      [RunStatus.Timo]: 'timer',
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

  get tagLabel(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'Passed',
      [RunStatus.Fail]: 'Failing',
      [RunStatus.Pend]: 'Running',
      [RunStatus.Timo]: 'Timed out',
      [RunStatus.Cncl]: 'Cancelled',
      [RunStatus.Read]: 'Ready'
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

  get statusIcon(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'run-passed',
      [RunStatus.Fail]: 'run-failed',
      [RunStatus.Pend]: 'clock',
      [RunStatus.Timo]: 'run-timed-out',
      [RunStatus.Cncl]: 'run-failed',
      [RunStatus.Read]: 'run-passed'
    }
    return types[this.status] || 'clock'
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
    return this.$generateRoute(['run', candidate])
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

  get issueMetaDataLabel(): string {
    let label = ''
    if (this.issueStats[0].value !== '0')
      label = label.concat(`${this.issueStats[0].value} issues introduced`)
    if (this.issueStats[1].value !== '0')
      label = label.concat(`${label.length > 0 && ', '}${this.issueStats[1].value} issues resolved`)
    return label
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

  /**
   * Handles the click event on the "Open PR" button
   * This is done programatically instead of via an achor since the element is placed within a parent with a click handler,
   * so the "@click.prevent" event modifier is needed to override the default click action
   */
  handlePrUrlClick() {
    const url = this.isForDefaultBranch ? this.repository.vcsUrl : this.vcsPrUrl

    const anchor = document.createElement('a')
    Object.assign(anchor, {
      target: '_blank',
      href: url,
      rel: 'noopener noreferrer'
    }).click()
    anchor.parentNode?.removeChild(anchor)
  }
}
</script>
