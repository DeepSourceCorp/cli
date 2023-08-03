<template>
  <div class="w-full space-y-6 p-4">
    <!-- Available Autofixes -->
    <install-autofix-notice v-if="!repository.isAutofixEnabled && canEnableAutofix" />
    <stat-section
      v-if="
        (repository.autofixableIssuesPerAnalyzer &&
          repository.autofixableIssuesPerAnalyzer.length) ||
        ($fetchState.pending && loaderCount > 0)
      "
      title="Available Autofixes"
      help-text="Summary of issues that can be Autofixed"
      :show-border="false"
      spacing-class="gap-3"
      custom-grid-class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
      :body-is-grid="$fetchState.pending || showAvailableAutofixes"
    >
      <template v-if="$fetchState.pending">
        <div
          v-for="idx in loaderCount"
          :key="idx"
          class="flex h-28 flex-col justify-between space-y-2 rounded-md bg-ink-300 p-2"
        >
          <div class="flex justify-between space-x-2">
            <div class="h-5 w-48 animate-pulse rounded-md bg-ink-200"></div>
            <div class="h-5 w-5 animate-pulse rounded-md bg-ink-200"></div>
          </div>
          <div class="h-8 w-40 animate-pulse rounded-md bg-ink-200"></div>
          <div class="h-4 w-16 animate-pulse rounded-md bg-ink-200"></div>
        </div>
      </template>
      <template v-else-if="showAvailableAutofixes">
        <autofix-card
          v-for="autofix in repository.autofixableIssuesPerAnalyzer"
          :key="autofix.analyzer.shortcode"
          v-bind="autofix"
        />
      </template>
      <!-- TODO: Empty state -->
      <div v-else class="flex h-full w-full items-center justify-center p-2">
        No Autofixes available
      </div>
    </stat-section>
    <!-- Autofix Stats -->
    <autofix-issues-graph />
    <!-- Recent Autofixes -->
    <div v-if="$fetchState.pending">
      <div class="grid grid-cols-12-fr gap-2">
        <div class="col-span-full h-12 animate-pulse rounded-md bg-ink-300"></div>
        <div class="animate-pulse rounded-md bg-ink-300"></div>
        <div class="flex h-full w-full flex-col space-y-2">
          <div class="h-20 animate-pulse rounded-md bg-ink-300"></div>
          <div class="h-20 animate-pulse rounded-md bg-ink-300"></div>
          <div class="h-20 animate-pulse rounded-md bg-ink-300"></div>
          <div class="h-20 animate-pulse rounded-md bg-ink-300"></div>
        </div>
      </div>
    </div>
    <stat-section
      title="Recent Autofixes"
      custom-grid-class="grid grid-cols-12-fr"
      :grid-spacing="2"
    >
      <div class="col-span-2 grid grid-cols-3 gap-1 md:col-span-1 md:block md:space-y-2">
        <div
          v-for="opt in options"
          :key="opt.name"
          class="cursor-pointer space-y-2 rounded-md p-2 text-center hover:bg-ink-300 md:text-left"
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
            class="flex w-full flex-col space-y-3"
          >
            <autofix-list-item
              v-for="run in pendingAutofixList"
              v-bind="getAutofixListItem(run)"
              :key="run.runId"
              :show-info="false"
            />
          </div>
          <empty-state v-else title="No pending commits" />
        </template>
        <template v-else-if="selectedRun.name == 'History'">
          <div
            v-if="autofixListItems && autofixListItems.length > 0"
            class="flex w-full flex-col space-y-3"
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
    return resolveNodes(this.autofixRunList)
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
