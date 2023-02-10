<template>
  <div class="w-full p-4 space-y-6">
    <!-- Available Autofixes -->
    <install-autofix-notice v-if="!repository.isAutofixEnabled && canEnableAutofix" />
    <stat-section
      v-if="
        (repository.autofixableIssuesPerAnalyzer &&
          repository.autofixableIssuesPerAnalyzer.length) ||
        ($fetchState.pending && loaderCount > 0)
      "
      title="Available Autofixes"
      helpText="Summary of issues that can be Autofixed"
      :showBorder="false"
      spacingClass="gap-3"
      customGridClass="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      :bodyIsGrid="$fetchState.pending || showAvailableAutofixes"
    >
      <template v-if="$fetchState.pending">
        <div
          v-for="idx in loaderCount"
          :key="idx"
          class="flex flex-col justify-between p-2 space-y-2 rounded-md h-28 bg-ink-300"
        >
          <div class="flex justify-between space-x-2">
            <div class="w-48 h-5 rounded-md bg-ink-200 animate-pulse"></div>
            <div class="w-5 h-5 rounded-md bg-ink-200 animate-pulse"></div>
          </div>
          <div class="w-40 h-8 rounded-md bg-ink-200 animate-pulse"></div>
          <div class="w-16 h-4 rounded-md bg-ink-200 animate-pulse"></div>
        </div>
      </template>
      <template v-else-if="showAvailableAutofixes">
        <autofix-card
          v-for="autofix in repository.autofixableIssuesPerAnalyzer"
          :key="autofix.analyzer.shortcode"
          v-bind="autofix"
        ></autofix-card>
      </template>
      <!-- TODO: Empty state -->
      <div v-else class="flex items-center justify-center w-full h-full p-2">
        No Autofixes available
      </div>
    </stat-section>
    <!-- Autofix Stats -->
    <autofix-issues-graph />
    <!-- Recent Autofixes -->
    <div v-if="$fetchState.pending">
      <div class="grid gap-2 grid-cols-12-fr">
        <div class="h-12 rounded-md bg-ink-300 animate-pulse col-span-full"></div>
        <div class="rounded-md bg-ink-300 animate-pulse"></div>
        <div class="flex flex-col w-full h-full space-y-2">
          <div class="h-20 rounded-md bg-ink-300 animate-pulse"></div>
          <div class="h-20 rounded-md bg-ink-300 animate-pulse"></div>
          <div class="h-20 rounded-md bg-ink-300 animate-pulse"></div>
          <div class="h-20 rounded-md bg-ink-300 animate-pulse"></div>
        </div>
      </div>
    </div>
    <stat-section title="Recent Autofixes" customGridClass="grid grid-cols-12-fr" :gridSpacing="2">
      <div class="grid grid-cols-3 col-span-2 gap-1 md:space-y-2 md:col-span-1 md:block">
        <div
          v-for="opt in options"
          :key="opt.name"
          class="p-2 space-y-2 text-center rounded-md cursor-pointer hover:bg-ink-300 md:text-left"
          :class="{
            'bg-ink-300': selectedRun.name == opt.name
          }"
          @click="selectedRun = opt"
        >
          <h4 class="text-sm">{{ opt.name }}</h4>
        </div>
      </div>
      <div class="col-span-2 space-y-2 lg:col-span-1">
        <template v-if="selectedRun.name == 'Action needed'">
          <div
            v-if="pendingAutofixList && pendingAutofixList.length > 0"
            class="flex flex-col w-full space-y-3"
          >
            <autofix-list-item
              v-for="run in pendingAutofixList"
              v-bind="getAutofixListItem(run)"
              :key="run.runId"
              :showInfo="false"
            />
          </div>
          <empty-state v-else title="No pending commits" />
        </template>
        <template v-else-if="selectedRun.name == 'History'">
          <div
            v-if="autofixListItems && autofixListItems.length > 0"
            class="flex flex-col w-full space-y-3"
          >
            <autofix-list-item
              v-for="run in autofixListItems"
              v-bind="getAutofixListItem(run)"
              :key="run.runId"
            />
          </div>
          <empty-state v-else title="No autofix runs available" />
        </template>
      </div>
    </stat-section>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsource/zeal'
import { AutofixCard, AutofixListItem } from '@/components/Autofix/index'
import { AutofixRun, AutofixRunStatus } from '~/types/types'
import { AutofixIssuesGraph } from '@/components/Graphs'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import { AppFeatures, RepoPerms } from '~/types/permTypes'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import AutofixRunMixin from '~/mixins/autofixRunMixin'
import { resolveNodes } from '~/utils/array'

/**
 * Component for the Autofix page
 */
@Component({
  components: {
    ZIcon,
    AutofixCard,
    AutofixListItem,
    AutofixIssuesGraph
  },
  middleware: ['validateProvider', 'featureGate', 'perm'],
  meta: {
    auth: {
      strict: true,
      RepoPerms: [RepoPerms.READ_REPO]
    },
    gateFeature: AppFeatures.AUTOFIX
  },
  layout: 'repository'
})
export default class Autofix extends mixins(RepoDetailMixin, RoleAccessMixin, AutofixRunMixin) {
  selectedHunkIds: Array<string> = []
  filesAffected: AutofixRun | Array<string> = []
  options = [
    { name: 'Action needed', link: ['history', 'runs'] },
    { name: 'History', link: 'autofix' }
  ]
  selectedRun = this.options[0]

  /**
   * Mounted hook for Vue component
   *
   * @returns {void}
   */
  mounted(): void {
    this.$root.$on('refetch-autofix-run', this.refetchData)
    this.$socket.$on('repo-analysis-updated', this.refetchData)
  }

  /**
   * BeforeDestroy hook for Vue component
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$root.$off('refetch-autofix-run', this.refetchData)
    this.$socket.$off('repo-analysis-updated', this.refetchData)
  }

  /**
   * Refetch run list data
   *
   * @returns {Promise<void>}
   */
  async refetchData(): Promise<void> {
    await this.fetchRunLists(true)
  }

  /**
   * Fetch run list data
   *
   * @returns {Promise<void>}
   */
  async fetchRunLists(refetch = false): Promise<void> {
    this.fetchAutofixRunList({
      ...this.baseRouteParams,
      limit: 10,
      statusIn: [
        AutofixRunStatus.Pass,
        AutofixRunStatus.Timo,
        AutofixRunStatus.Cncl,
        AutofixRunStatus.Fail,
        AutofixRunStatus.Stal
      ],
      refetch
    })

    this.fetchPendingAutofixRuns({
      ...this.baseRouteParams,
      refetch
    })
  }

  /**
   * Fetch hook
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await Promise.all([
      this.fetchBasicRepoDetails(this.baseRouteParams),
      this.fetchRepoAutofixStats(this.baseRouteParams),
      this.fetchRunLists()
    ])

    this.fetchRepoPerms(this.baseRouteParams)
    this.setLoaderCount(this.repository.autofixableIssuesPerAnalyzer?.length ?? 4)
  }

  get showAvailableAutofixes(): boolean {
    const available = this.repository.autofixableIssuesPerAnalyzer
    return Boolean(available && available.length > 0)
  }

  get autofixListItems(): AutofixRun[] {
    return resolveNodes(this.autofixRunList) as AutofixRun[]
  }

  /**
   * Set available Autofix count on local storage
   *
   * @returns {void}
   */
  setLoaderCount(count: number): void {
    const { provider, owner, repo } = this.$route.params
    if (process.client)
      this.$localStore.set(
        `${provider}-${owner}-${repo}`,
        'autofix-available-autofixes-count',
        count
      )
  }

  /**
   * Get required properties for the @see{@link AutofixListItem} component.
   *
   * @param {AutofixRun} autofixRun - @see{@link AutofixRun} object to extract properties from.
   * @returns Object with required properties for @see{@link AutofixListItem}
   */
  getAutofixListItem(autofixRun: AutofixRun) {
    const {
      runId,
      issue,
      analyzer,
      createdBy,
      createdAt,
      resolvedIssuesCount,
      status,
      pullRequestTitle
    } = autofixRun

    return {
      runId,
      issue,
      analyzer,
      createdBy,
      createdAt,
      resolvedIssuesCount,
      status,
      pullRequestTitle
    }
  }

  get loaderCount(): number {
    if (process.client) {
      const { provider, owner, repo } = this.$route.params
      const localCountFromStore = this.$localStore.get(
        `${provider}-${owner}-${repo}`,
        'autofix-available-autofixes-count'
      ) as number
      return localCountFromStore ?? 3
    }

    return 3
  }

  head(): Record<string, string> {
    const { repo, owner } = this.$route.params
    return {
      title: `Autofix • ${owner}/${repo}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
    }
  }
}
</script>
