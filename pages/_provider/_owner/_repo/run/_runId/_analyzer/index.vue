<template>
  <main class="pb-12 md:pb-60">
    <template v-if="!$fetchState.pending">
      <analyzer-header
        v-if="check.analyzer && check.analyzer.name && check.analyzer.shortcode && check.status"
        :title="check.analyzer.name"
        :icon="check.analyzer.shortcode"
        :alerting-metrics-count="alertingMetrics.length"
        v-bind="check"
        class="px-4"
      />
      <run-autofix-bar
        v-if="
          allowAutofix &&
          check.autofixableIssues.length &&
          !run.isForDefaultBranch &&
          !run.isForCrossRepoPr
        "
        v-bind="check"
        :can-create-autofix="canCreateAutofix"
      />
      <z-tabs>
        <z-tab-list class="px-4 py-0 pt-2 border-b border-ink-200">
          <z-tab-item
            icon="flag"
            class="flex items-center space-x-1"
            border-active-color="vanilla-400"
          >
            <span>Issues</span>
          </z-tab-item>
          <z-tab-item
            icon="bar-chart"
            class="flex items-center space-x-1"
            border-active-color="vanilla-400"
          >
            <span>Metrics</span>
          </z-tab-item>
        </z-tab-list>
        <z-tab-panes class="p-4">
          <z-tab-pane>
            <analyzer-run :canCreateAutofix="canCreateAutofix" v-bind="check">
              <template #controls>
                <div class="flex w-auto space-x-2 md:w-3/5">
                  <issue-sort
                    v-model="queryParams.sort"
                    :show-seen-options="false"
                    @reset="removeFilter('sort')"
                  />
                  <issue-category-filter
                    v-model="queryParams.category"
                    @reset="removeFilter('category')"
                  />
                </div>
                <issue-search
                  v-focus
                  :search-candidate="queryParams.q"
                  placeholder="Search for issue title or shortcode"
                  class="w-full md:w-1/3"
                  @updateSearch="updateSearch"
                />
              </template>
            </analyzer-run>
          </z-tab-pane>
          <z-tab-pane>
            <run-loading v-if="check.status === 'PEND'" />
            <run-cancelled v-else-if="check.status === 'CNCL'" />
            <run-timeout v-else-if="check.status === 'TIMO'" />
            <template v-else>
              <div
                v-if="Array.isArray(check.metricsCaptured) && check.metricsCaptured.length"
                class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              >
                <stat-card
                  v-for="stat in check.metricsCaptured"
                  :key="stat.id"
                  :title="stat.name"
                  :subtitle="stat.namespace.key"
                  :value="stat.valueDisplay"
                  :icon="check.analyzer.shortcode"
                  :color="stat.isPassing === false ? 'cherry' : 'juniper'"
                  :with-transition="stat.isPassing === false"
                />
              </div>
              <empty-state
                v-else
                :show-border="true"
                title="No metrics captured for this run"
                class="text-vanilla-200"
              />
            </template>
          </z-tab-pane>
        </z-tab-panes>
      </z-tabs>
    </template>
    <template v-else>
      <!-- Header -->
      <div class="flex flex-1 w-full p-4 space-x-2 rounded-sm">
        <!-- Left Section -->
        <div class="flex flex-col w-3/5 space-y-2 md:w-4/5 justify-evenly">
          <div class="h-10 rounded-md bg-ink-300 animate-pulse"></div>
          <div class="h-6 rounded-md bg-ink-300 animate-pulse"></div>
        </div>
        <!-- Right Section -->
        <div class="relative w-2/5 md:w-1/5">
          <div class="h-full rounded-md bg-ink-300 animate-pulse"></div>
        </div>
      </div>
      <div class="flex p-4 space-x-2">
        <div class="w-24 h-8 rounded-md bg-ink-300 animate-pulse"></div>
        <div class="h-8 rounded-md w-28 bg-ink-300 animate-pulse"></div>
      </div>

      <div class="p-4 space-y-2">
        <div class="w-full rounded-md h-28 bg-ink-300 animate-pulse"></div>
        <div class="w-full rounded-md h-28 bg-ink-300 animate-pulse"></div>
      </div>
    </template>
  </main>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

// Import State & Types
import { Check, RepositoryMetricValue } from '~/types/types'
import { AppFeatures, RepoPerms } from '~/types/permTypes'
import { RunHeader, AnalyzerRun } from '@/components/Run'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import RunDetailMixin from '~/mixins/runDetailMixin'
import { ZIcon, ZTabs, ZTabList, ZTabPane, ZTabPanes, ZTabItem } from '@deepsourcelabs/zeal'
import RouteQueryMixin from '~/mixins/routeQueryMixin'

/**
 * Page that provides detailed information about generated issues for a specific analyzer run.
 */
@Component({
  components: {
    AnalyzerRun,
    RunHeader,
    ZIcon,
    ZTabs,
    ZTabList,
    ZTabPane,
    ZTabPanes,
    ZTabItem
  },
  layout: 'repository'
})
export default class AnalyzerDetails extends mixins(
  RepoDetailMixin,
  RoleAccessMixin,
  RunDetailMixin,
  RouteQueryMixin
) {
  /**
   * Created hook to update query params from route query mixin
   *
   * @return {any}
   */
  created() {
    this.queryParams = Object.assign(this.queryParams, this.$route.query)
  }

  /**
   * Fetch hook for the page.
   *
   * @returns {Promise<void>} A promise that resolves with no return on completion of fetch.
   */
  async fetch(): Promise<void> {
    await this.fetchRepoPerms(this.baseRouteParams)
    await this.fetchCurrentRun()
    await this.fetchCheck({ checkId: this.currentCheck.id })
    await this.fetchIssues()
  }

  /**
   * Network only refetch of details of a check and its issues.
   *
   * @param {string} checkId `id` of the check whose details are to be refetched.
   * @returns {Promise<void>} A promise that resolves with no return on completion of fetch.
   */
  async refetchCheck(checkId: string): Promise<void> {
    if (this.currentCheck?.id === checkId) {
      await this.fetchCheck({ checkId: this.currentCheck.id, refetch: true })
      await this.fetchIssues(true)
    }
  }

  /**
   * Network only refetch of details of a run, specifed check and its issues.
   *
   * @param {{run_id: string, check_id?: string}} websocketData Object containing `run_id` and `check_id` of the checks that are completed.
   * @returns {Promise<void>} A promise that resolves with no return on completion of fetch.
   */
  async refetchRunAndCheck({
    run_id,
    check_id
  }: {
    run_id: string
    check_id?: string
  }): Promise<void> {
    if (this.$route.params.runId === run_id) {
      Promise.all([
        this.fetchCurrentRun(true),
        this.refetchCheck(check_id || this.currentCheck?.id)
      ])
    }
  }

  get currentCheck(): Check {
    const filteredCheck = this.checks.filter((edge) => {
      return edge.analyzer?.shortcode == this.$route.params.analyzer
    })

    return filteredCheck[0]
  }

  get alertingMetrics(): Array<RepositoryMetricValue> {
    const metrics = (this.check?.metricsCaptured || []) as RepositoryMetricValue[]
    return metrics.filter((metric) => metric.isPassing === false)
  }

  /**
   * Mounted lifecycle hook for the page. Binds event bus and socket event listeners.
   *
   * @returns {void}
   */
  mounted(): void {
    this.$root.$on('refetchCheck', this.refetchCheck)
    this.$socket.$on('repo-analysis-updated', this.refetchRunAndCheck)
    this.$socket.$on('autofixrun-fixes-ready', this.refetchRunAndCheck)
  }

  /**
   * BeforeDestroy lifecycle hook for the page. Unbinds event bus and socket event listeners.
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$root.$off('refetchCheck', this.refetchCheck)
    this.$socket.$off('repo-analysis-updated', this.refetchRunAndCheck)
    this.$socket.$off('autofixrun-fixes-ready', this.refetchRunAndCheck)
  }

  /**
   * Route query callback
   *
   * @return {Promise<void>}
   */
  async refetchAfterRouteChange(): Promise<void> {
    await this.fetchIssues()
  }

  /**
   * Fetch of details of the current page's run.
   *
   * @param {boolean} refetch Whether to refetch data from server or use cache. Has a default value of **false**.
   * @returns {Promise<void>} A promise that resolves with no return on completion of fetch.
   */
  async fetchCurrentRun(refetch = false): Promise<void> {
    const { runId, repo, owner, provider } = this.$route.params
    return this.fetchRun({
      provider,
      owner,
      name: repo,
      runId,
      refetch
    })
  }

  /**
   * Fetch a list of maximum 30 concrete issues for a given check.
   *
   * @param {boolean} refetch Whether to refetch data from server or use cache. Has a default value of **false**.
   * @returns {Promise<void>} A promise that resolves with no return on completion of fetch.
   */
  async fetchIssues(refetch = false): Promise<void> {
    await this.fetchConcreteIssueList({
      checkId: this.check.id,
      currentPageNumber: 1,
      limit: 50,
      sort: (this.queryParams.sort as string) || '',
      issueType: (this.queryParams.category as string) || '',
      q: (this.queryParams.q as string) || '',
      refetch
    })
  }

  /**
   * Update search in queryParams, but remove filter for empty string
   *
   * @param {string} val
   *
   * @return {void}
   */
  updateSearch(val: string): void {
    val ? this.addFilter('q', val) : this.removeFilter('q')
  }

  get allowAutofix(): boolean {
    const { provider } = this.$route.params
    return this.$gateKeeper.provider(AppFeatures.AUTOFIX, provider)
  }

  get canCreateAutofix(): boolean {
    return this.$gateKeeper.repo(RepoPerms.CREATE_AUTOFIXES, this.repoPerms.permission)
  }
}
</script>
