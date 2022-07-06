<template>
  <div class="grid grid-cols-3">
    <div class="col-span-3 sm:col-span-2 flex flex-col gap-y-1.5 p-3">
      <div class="flex items-start gap-x-3">
        <z-icon :icon="currentCheck.analyzer.shortcode" size="large" />
        <div class="text-vanilla-100 text-lg font-bold">
          {{ currentCheck.analyzer.name }}
          <span class="text-vanilla-400 font-medium"
            ><a v-if="vcsCommitUrl" :href="vcsCommitUrl" target="_blank" rel="noopener noreferrer"
              >@{{ commitOid.slice(0, 7) }}</a
            >
          </span>
        </div>
        <z-tag class="border border-ink-200 py-0.5 px-2 hidden md:inline-flex" spacing="">
          <z-icon
            :icon="getStatusIcon(currentCheck.status)"
            :color="getStatusIconColor(currentCheck.status)"
            class="flex-shrink-0"
            :class="{ 'motion-safe:animate-spin': isPending }"
          />
          <span
            class="text-vanilla-200 text-xxs font-semibold leading-7 uppercase tracking-wider"
            >{{ tagLabel }}</span
          >
        </z-tag>
      </div>
      <div class="flex space-x-3">
        <div class="flex space-x-1.5 items-center">
          <z-icon
            :icon="isForDefaultBranch ? 'git-branch' : 'git-pull-request'"
            size="x-small"
            class="flex-shrink-0"
          />
          <div class="text-vanilla-400 font-medium line-clamp-1 text-sm">
            <a v-tooltip="vscLinkTooltip" :href="vcsPrUrl" target="_blank" rel="noopener noreferrer"
              >{{ branchName }}
            </a>
          </div>
        </div>
        <z-menu v-if="runCount" width="2x-large">
          <template #trigger="{ toggle, isOpen }">
            <button
              @click="toggle"
              class="flex items-center gap-x-2 px-2 h-7 border border-ink-200 hover:bg-ink-200 rounded-full cursor-pointer"
            >
              <div class="flex items-center gap-x-1 text-vanilla-400 text-xs">
                <z-icon
                  icon="chevron-down"
                  size="small"
                  class="transform duration-300 transition-all"
                  :class="(isOpen && 'rotate-180') || 'rotate-0'"
                />
                <span> {{ countText }} </span>
              </div>
            </button>
          </template>
          <template #body>
            <z-menu-section
              :divider="false"
              class="border border-ink-200 rounded-md divide-y divide-ink-200 max-h-96 overflow-y-auto hide-scroll"
            >
              <z-menu-item
                v-for="run in branchRuns"
                :to="getRoute(run.node.runId)"
                as="nuxt-link"
                class="bg-ink-300"
                :key="run.node.runId"
              >
                <div class="py-1 flex flex-col gap-y-3">
                  <div class="flex gap-x-1.5 items-center">
                    <z-icon
                      :icon="getStatusIcon(run.node.status)"
                      :color="getStatusIconColor(run.node.status)"
                      size="x-small"
                      class="mt-px"
                    />
                    <div class="text-vanilla-100 text-sm font-medium">
                      {{ run.node.branchName }}
                      <span class="text-vanilla-400">@{{ run.node.commitOid.slice(0, 7) }}</span>
                    </div>
                  </div>
                  <div class="flex gap-x-3">
                    <div v-if="!isPending" class="flex items-center gap-x-1.5">
                      <z-icon icon="clock" size="x-small" color="vanilla-400" />
                      <span class="text-sm text-vanilla-400">{{
                        getCreatedString(run.node.createdAt)
                      }}</span>
                    </div>
                    <div class="flex gap-x-1.5 items-center">
                      <z-icon icon="git-commit" size="x-small" color="vanilla-400" />
                      <span class="text-sm text-vanilla-400">{{ run.node.gitCompareDisplay }}</span>
                    </div>
                  </div>
                </div>
              </z-menu-item>
            </z-menu-section>
          </template>
        </z-menu>
      </div>
      <div class="flex sm:hidden items-center">
        <meta-data-item
          v-if="issueMetaDataLabel"
          :label="issueMetaDataLabel"
          icon="flag"
          text-size="text-sm"
          class="md:hidden"
        />
      </div>
    </div>
    <div v-if="currentCheck.status !== 'PEND'" class="p-3 col-span-3 sm:col-span-1 hidden sm:flex">
      <div class="w-full flex items-center sm:justify-end gap-x-6">
        <!-- introduced issues -->
        <div class="flex flex-col items-center">
          <div
            v-tooltip="
              `${
                currentCheck.issuesRaisedCount > 1000
                  ? formatIntl(currentCheck.issuesRaisedCount)
                  : ''
              } issues introduced`
            "
            class="text-2xl font-semibold"
            :class="currentCheck.issuesRaisedCount > 0 ? 'text-cherry' : 'text-vanilla-400'"
          >
            {{ shortenLargeNumber(currentCheck.issuesRaisedCount) }}
          </div>
          <div class="text-xs text-vanilla-400">introduced</div>
        </div>
        <!-- resolved issues -->
        <div class="flex flex-col items-center">
          <div
            v-tooltip="
              `${
                currentCheck.issuesResolvedCount > 1000
                  ? formatIntl(currentCheck.issuesResolvedCount)
                  : ''
              } issues resolved`
            "
            class="text-2xl font-semibold"
            :class="currentCheck.issuesResolvedCount > 0 ? 'text-juniper' : 'text-vanilla-400'"
          >
            {{ shortenLargeNumber(currentCheck.issuesResolvedCount) }}
          </div>
          <div class="text-xs text-vanilla-400">resolved</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { ZIcon, ZTag, ZMenu, ZMenuItem, ZMenuSection } from '@deepsourcelabs/zeal'
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'

import LinkToPrev from '@/components/LinkToPrev.vue'
import { Check, Run, RunConnection, RunStatus, Scalars } from '~/types/types'
import { formatIntl, shortenLargeNumber } from '~/utils/string'
import { RunListActions } from '~/store/run/list'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { fromNow } from '~/utils/date'

const runListStore = namespace('run/list')

/**
 * Nav header component for run details page. Lists:
 *
 * - Information about run like branch name, PR, commits, time taken, time created and other runs on the branch.
 */
@Component({
  components: {
    ZIcon,
    ZTag,
    ZMenu,
    ZMenuItem,
    ZMenuSection,
    LinkToPrev
  },
  methods: {
    formatIntl,
    shortenLargeNumber
  },
  layout: 'repository'
})
export default class RunHeader extends RepoDetailMixin {
  @runListStore.State
  branchRunList: Record<string, RunConnection>

  @runListStore.Action(RunListActions.FETCH_BRANCH_RUNS_LIST)
  fetchBranchRuns: (args: {
    provider: string
    owner: string
    name: string
    branchName: string
    limit?: number
    refetch?: boolean
  }) => Promise<void>

  @Prop({ default: '' })
  runId: Scalars['ID']

  @Prop({ default: '' })
  branchName: string

  @Prop({ default: false })
  isForDefaultBranch: boolean

  @Prop({ default: '' })
  commitOid: string

  @Prop({ default: '' })
  createdAt: string

  @Prop({ default: 0 })
  finishedIn: number

  @Prop({ default: 'PASS' })
  status: RunStatus

  @Prop({ default: '' })
  gitCompareDisplay: string

  @Prop({ default: () => [] })
  checks: Array<Check>

  @Prop({ default: '' })
  routeToPrevious: string

  @Prop({ default: '' })
  vcsCommitUrl: string

  @Prop({ default: '' })
  vcsPrUrl: string

  @Prop({ default: '' })
  pullRequestNumberDisplay: string

  @Prop({ default: '' })
  currentAnalyzer: string

  /**
   * Fetch hook for this component.
   *
   * @returns {Promise<void>} A promise that resolves with no return on completion of fetch.
   */
  async fetch(): Promise<void> {
    this.fetchRuns()
  }

  /**
   * Get an icon to represent a given run status.
   *
   * @param {string} status The run's status
   * @returns {string} The icon name to be used to represent the given status
   */
  getStatusIcon(status: RunStatus): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'check',
      [RunStatus.Fail]: 'x',
      [RunStatus.Pend]: 'spin-loader',
      [RunStatus.Timo]: 'clock',
      [RunStatus.Cncl]: 'alert-circle',
      [RunStatus.Read]: 'check-circle'
    }
    return types[status || 'PASS']
  }

  /**
   * Get a color to represent a given run status.
   *
   * @param {string} status The run's status
   * @returns {string} The icon color to be used to represent the given status
   */
  getStatusIconColor(status: RunStatus): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'juniper',
      [RunStatus.Fail]: 'cherry',
      [RunStatus.Pend]: 'vanilla-100',
      [RunStatus.Timo]: 'honey',
      [RunStatus.Cncl]: 'honey',
      [RunStatus.Read]: 'vanilla-400'
    }
    return types[status || 'PASS']
  }

  /**
   * Get a status string to describe a given run's status.
   *
   * @param {string} status The run's status
   * @returns {string} A string that can be used to display the given run status
   */
  getStatusText(status: RunStatus): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: this.finishedIn ? 'Passed in' : 'Passed',
      [RunStatus.Fail]: this.finishedIn ? 'Failed after' : 'Failed',
      [RunStatus.Pend]: 'Analysis in progress',
      [RunStatus.Timo]: this.finishedIn ? 'Timed out after' : 'Timed out',
      [RunStatus.Cncl]: this.finishedIn ? 'Cancelled after' : 'Cancelled',
      [RunStatus.Read]: this.finishedIn ? 'Completed in' : 'Completed'
    }
    return types[status || 'PASS']
  }

  /**
   * Get a formatted string to represent when a run was created.
   *
   * @param {string} createdAt The run's status
   * @returns {string} The formatted string with the time since the run was created
   */
  getCreatedString(createdAt: string): string {
    return fromNow(createdAt)
  }

  get isPending(): boolean {
    return this.status === RunStatus.Pend
  }

  get transformersAllowed(): boolean {
    return this.$route.params.provider !== 'gsr'
  }
  /**
   * Get the current active check
   * * @returns {Check}
   */
  get currentCheck(): Check | undefined {
    return this.checks.find((check) => check.analyzer?.shortcode === this.currentAnalyzer)
  }

  /**
   * Get an text label to be used for the current run status
   *
   * @returns {string} The text label to be used to represent the current run's status
   */
  get tagLabel(): string {
    const types: Record<string, string> = {
      [RunStatus.Pass]: 'Passed',
      [RunStatus.Fail]: 'Failing',
      [RunStatus.Pend]: 'Running',
      [RunStatus.Timo]: 'Timed out',
      [RunStatus.Cncl]: 'Cancelled',
      [RunStatus.Read]: 'Ready'
    }
    return types[this.currentCheck?.status || 'PASS']
  }

  /**
   * Get route for a given analyzer shortcode.
   *
   * @param {string} shortcode Shortcode of an analyzer
   * @returns {string} Route to given analyzer's check
   */
  getRoute(candidate: string): string {
    return this.$generateRoute(['run', candidate])
  }

  /**
   * Fetch all runs on this branch
   *
   * @param {boolean} refetch refetch the query
   * @returns {Promise<void>}
   */
  async fetchRuns(refetch = false): Promise<void> {
    await this.fetchBranchRuns({
      ...this.baseRouteParams,
      branchName: this.branchName,
      limit: 30,
      refetch: refetch
    })
  }

  /**
   * Get the count of additional runs on this branch
   *
   * @returns {int}
   */
  get runCount() {
    if (!this.branchRunList) return 0
    const totalCount = this.branchRunList[this.branchName]?.totalCount
    return totalCount ? totalCount - 1 : 0
  }

  /**
   * Get the text label to be used for additional runs
   *
   * @returns {string}
   */
  get countText(): string {
    if (this.runCount === 1) {
      // singular
      return `${this.runCount} more run`
    } else if (this.runCount > 1 && this.runCount <= 30) {
      // plural
      return `${this.runCount} more runs`
    } else if (this.runCount > 30) {
      return `30 more runs`
    } else {
      return ''
    }
  }

  /**
   * Get the run nodes for all other runs on this branch
   *
   * @returns {Array<RunEdge>}
   */
  get branchRuns() {
    return this.branchRunList[this.branchName].edges.filter((runEdge) => {
      return runEdge?.node?.runId !== this.runId
    })
  }

  get issueMetaDataLabel(): string {
    let label = ''
    if (!this.currentCheck) return label
    if (this.currentCheck.issuesRaisedCount && this.currentCheck.issuesRaisedCount > 0)
      label = label.concat(`${this.currentCheck.issuesRaisedCount} issues introduced`)
    if (this.currentCheck.issuesResolvedCount && this.currentCheck.issuesResolvedCount > 0)
      label = label.concat(
        `${label.length > 0 && ', '}${this.currentCheck.issuesResolvedCount} issues resolved`
      )
    return label
  }

  get vscLinkTooltip() {
    const { provider } = this.$route.params
    return this.isForDefaultBranch
      ? `Open ${this.branchName} on ${this.$providerMetaMap[provider].text}`
      : provider === 'gl'
      ? 'Open MR'
      : 'Open PR'
  }
}
</script>
