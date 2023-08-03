<template>
  <main
    class="check-body-offset pt-3 md:sticky md:pt-0"
    :class="{ 'has-retry': check.isRetryable }"
  >
    <div v-if="!isLoading">
      <z-tabs>
        <z-tab-list
          class="custom-tab-selector-width ml-2 flex-row -space-x-2 overflow-hidden text-center md:hidden"
        >
          <z-tab
            :is-active="activeTabIndex === 0"
            :action="() => updateActiveTabIndex(0)"
            :remove-indicator-styles="true"
            class="-mb-3 w-1/2"
          >
            <div
              class="w-full rounded-l-md border border-slate-400 p-3"
              :class="{ 'border-r-0 bg-ink-50': activeTabIndex === 0 }"
            >
              Issues
            </div>
          </z-tab>
          <z-tab
            :is-active="activeTabIndex === 1"
            :action="() => updateActiveTabIndex(1)"
            :remove-indicator-styles="true"
            class="-mb-3 w-1/2"
          >
            <div
              class="w-full rounded-r-md border border-slate-400 p-3"
              :class="{ 'border-l-0 bg-ink-50': activeTabIndex === 1 }"
            >
              Metrics
            </div>
          </z-tab>
        </z-tab-list>
        <!-- issues -->
        <div
          v-if="activeTabIndex === 0"
          class="grid grid-cols-1"
          :class="{
            'divide-x divide-ink-200 md:grid-cols-fr-22': ['FAIL', 'PASS'].includes(check.status)
          }"
        >
          <analyzer-run
            v-bind="check"
            :filters="queryParams"
            :can-create-autofix="canCreateAutofix"
            :current-page="currentPage"
          >
            <template #controls>
              <div class="flex flex-col gap-y-4 pt-3 md:relative">
                <!-- shadow effect -->
                <div
                  v-if="isScrolled"
                  class="pointer-events-none absolute hidden w-full bg-gradient-to-b from-ink-400 via-ink-400 to-transparent md:block"
                  :class="[showAutofixBar ? 'h-48' : 'h-20']"
                ></div>
                <run-autofix-bar
                  v-if="showAutofixBar"
                  v-bind="check"
                  :autofix-loading="autofixLoading"
                  :can-create-autofix="canCreateAutofix"
                  class="md:z-10"
                  @autofixIssues="autofixSelectedIssues"
                />
                <div class="flex w-full space-x-2 md:z-10">
                  <div class="flex w-auto space-x-2">
                    <issue-category-filter
                      :selected-category="queryParams.category"
                      @updateCategory="(value) => addFilters({ category: value })"
                      @reset="removeFilter('category')"
                    />
                    <issue-sort
                      :selected-sort-filter="queryParams.sort"
                      :show-seen-options="false"
                      @updateSortFilter="(value) => addFilters({ sort: value })"
                      @reset="removeFilter('sort')"
                    />
                  </div>
                  <issue-search
                    :expand-on-focus="false"
                    :search-candidate="queryParams.q"
                    placeholder="Search for issue title or shortcode"
                    class="w-full md:flex-grow"
                    @updateSearch="updateSearch"
                  />
                </div>
              </div>
            </template>

            <template #footer>
              <div
                v-if="concreteIssueList.totalCount > perPageCount"
                class="my-6 flex justify-center text-sm"
              >
                <z-pagination
                  :key="currentPage"
                  :page="currentPage"
                  :total-pages="totalPageCount"
                  :total-visible="5"
                  @selected="updatePageNum"
                />
              </div>
            </template>
          </analyzer-run>
          <section v-if="['FAIL', 'PASS'].includes(check.status)">
            <div
              class="metrics-header-offset sticky hidden flex-col space-y-2 p-3 md:flex"
              :class="{ 'has-retry': check.isRetryable }"
            >
              <div
                v-if="Array.isArray(check.metricsCaptured) && check.metricsCaptured.length"
                class="hide-scroll grid grid-cols-1 gap-3 overflow-y-auto"
              >
                <div class="flex items-center gap-x-1">
                  <z-icon v-tooltip="metricIconTooltip" :color="metricIconColor" icon="bar-chart" />
                  <p class="text-xs font-semibold uppercase tracking-wide text-vanilla-400">
                    Metrics
                  </p>
                </div>

                <run-metric-card
                  v-for="metricGroup in metricsGroupedByName"
                  :key="metricGroup.name"
                  :metrics-captured="metricGroup.metrics"
                  class="rounded-md border border-slate-400 bg-ink-300"
                  @confirmMetricSuppression="confirmMetricSuppression"
                >
                  <template #header>
                    <div
                      class="flex w-full items-center justify-between gap-x-2 text-sm font-semibold text-vanilla-400"
                    >
                      {{ metricGroup.name }}
                    </div>
                  </template>
                </run-metric-card>
              </div>
              <empty-state v-else image-width="w-22">
                <template #title>
                  <p class="text-base text-vanilla-200">No metrics recorded</p>
                </template>
                <template #subtitle>
                  The Analyzer did not report any metrics for this analysis run.
                </template>
              </empty-state>
            </div>
          </section>
        </div>
        <!-- metrics -->
        <div v-else class="flex flex-col space-y-2 p-3 xl:hidden">
          <lazy-run-loading v-if="check.status === CheckStatus.Pend" />
          <lazy-run-cancelled v-else-if="check.status === CheckStatus.Cncl" />
          <lazy-run-timeout v-else-if="check.status === CheckStatus.Timo" />
          <lazy-run-waiting v-else-if="check.status === CheckStatus.Wait" />
          <lazy-run-nuked v-else-if="check.status === CheckStatus.Atmo" />
          <template v-else>
            <div
              v-if="Array.isArray(check.metricsCaptured) && check.metricsCaptured.length"
              class="hide-scroll grid grid-cols-1 gap-4 overflow-y-auto"
            >
              <run-metric-card
                v-for="metricGroup in metricsGroupedByName"
                :key="metricGroup.name"
                :metrics-captured="metricGroup.metrics"
                class="rounded-md border border-slate-400 bg-ink-300"
                @confirmMetricSuppression="confirmMetricSuppression"
              >
                <template #header>
                  <div
                    class="flex w-full items-center justify-between gap-x-2 text-sm font-semibold text-vanilla-400"
                  >
                    {{ metricGroup.name }}
                  </div>
                </template>
              </run-metric-card>
            </div>
            <empty-state v-else>
              <template #title>
                <p class="text-base text-vanilla-200">No metrics recorded</p>
              </template>
              <template #subtitle>
                The Analyzer did not report any metrics for this analysis run.
              </template>
            </empty-state>
          </template>
        </div>
      </z-tabs>
    </div>
    <div v-else>
      <!-- Loading state -->

      <div class="grid w-full grid-cols-1 divide-x divide-ink-200 md:grid-cols-fr-22">
        <!-- Issues -->

        <div class="flex flex-col gap-y-3 p-3">
          <!-- Controls -->
          <div class="flex h-11 w-full items-center space-x-4">
            <div class="h-8 w-22 animate-pulse rounded-md bg-ink-300"></div>
            <div class="h-8 w-22 animate-pulse rounded-md bg-ink-300"></div>
            <div class="h-8 flex-grow animate-pulse rounded-md bg-ink-300"></div>
          </div>
          <div v-for="index in 10" :key="index" class="h-24 w-full animate-pulse bg-ink-300"></div>
        </div>
        <!-- Metrics -->
        <div class="flex flex-col gap-y-3 p-3">
          <div class="flex h-5 w-15 animate-pulse items-center bg-ink-300"></div>
          <div
            v-for="index in 5"
            :key="index"
            class="h-36 w-full animate-pulse rounded-md bg-ink-300"
          ></div>
        </div>
      </div>

      <div class="flex space-x-2 p-4">
        <div class="h-8 w-24 animate-pulse rounded-md bg-ink-300"></div>
        <div class="h-8 w-28 animate-pulse rounded-md bg-ink-300"></div>
      </div>

      <div class="space-y-2 p-4">
        <div class="h-14 w-full animate-pulse rounded-md bg-ink-300"></div>
        <div class="h-14 w-full animate-pulse rounded-md bg-ink-300"></div>
      </div>
    </div>
    <portal to="modal">
      <z-confirm
        v-if="showConfirmDialog"
        primary-action-type="danger"
        @onClose="showConfirmDialog = false"
      >
        <template #default>
          <run-metric-card
            v-if="metricToSuppress"
            :metrics-captured="[metricToSuppress]"
            :is-in-modal="true"
            class="mb-6 rounded-md border border-slate-400 bg-ink-300 shadow-xl md:hidden"
            @confirmMetricSuppression="confirmMetricSuppression"
          >
            <template #header>
              <div
                class="flex w-full items-center justify-between gap-x-2 text-sm font-semibold text-vanilla-400"
              >
                {{ metricToSuppress.name }}
              </div>
            </template>
          </run-metric-card>
          <div class="mb-2 text-base font-medium leading-relaxed text-vanilla-100">
            Are you sure you want to suppress the metric?
          </div>
          <div class="text-sm leading-relaxed text-vanilla-400">
            Suppressing the threshold failure may affect the status of the current analysis.
            <span class="font-bold"> This action cannot be reversed. </span>
          </div>
        </template>
        <template #footer="{ close }">
          <div class="mt-6 flex items-center justify-end space-x-4 text-right text-vanilla-100">
            <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
              Cancel
            </z-button>
            <z-button
              v-if="suppressingMetric"
              button-type="warning"
              size="small"
              :disabled="true"
              class="flex w-44 items-center"
            >
              <z-icon icon="spin-loader" color="ink" class="mr-2 animate-spin" />
              Suppressing metric
            </z-button>
            <z-button
              v-else
              icon="minus-circle"
              class="modal-primary-action w-44"
              button-type="warning"
              size="small"
              @click="suppressMetric(close)"
            >
              Suppress metric
            </z-button>
          </div>
        </template>
      </z-confirm>
    </portal>

    <upgrade-account-modal
      v-if="isUpgradeAccountModalOpen"
      :login="$route.params.owner"
      :provider="$route.params.provider"
      @close="isUpgradeAccountModalOpen = false"
    />
  </main>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'

// Import State & Types
import { Check, CheckStatus, RepositoryMetricValue, Run } from '~/types/types'
import { AppFeatures, RepoPerms } from '~/types/permTypes'
import { RunHeader, AnalyzerRun } from '@/components/Run'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import RunDetailMixin from '~/mixins/runDetailMixin'
import RouteQueryMixin from '~/mixins/routeQueryMixin'
import PaginationMixin from '~/mixins/paginationMixin'

import { RunDetailActions, RunDetailMutations } from '~/store/run/detail'
import { resolveNodes } from '~/utils/array'
import { MetricType, GroupedMetrics } from '~/types/metric'

const runStore = namespace('run/detail')

/**
 * Page that provides detailed information about generated issues for a specific analyzer run.
 */
@Component({
  components: {
    AnalyzerRun,
    RunHeader
  },
  middleware: [
    async function ({ store, route, redirect }) {
      const { provider, owner, repo, runId, analyzer } = route.params

      await store.dispatch(`run/detail/${RunDetailActions.FETCH_RUN}`, {
        provider,
        owner,
        name: repo,
        runId
      })
      const checks = resolveNodes<Check>(store.state.run.detail.run.checks)
      const runAnalyzers = checks
        .map((check) => (check.analyzer ? check.analyzer.shortcode : ''))
        .filter(Boolean)

      if (runAnalyzers.length && !runAnalyzers.includes(analyzer)) {
        redirect(302, ['', provider, owner, repo, 'run', runId, runAnalyzers[0]].join('/'))
      }
    }
  ],
  layout: 'repository'
})
export default class AnalyzerDetails extends mixins(
  RepoDetailMixin,
  RoleAccessMixin,
  RunDetailMixin,
  RouteQueryMixin,
  PaginationMixin
) {
  perPageCount = 10
  public activeTabIndex = 0
  public autofixLoading = false
  public isScrolled = false
  readonly CheckStatus = CheckStatus
  readonly METRICS_WITH_SECTIONS = ['test-coverage']
  showConfirmDialog = false
  isUpgradeAccountModalOpen = false
  suppressingMetric = false
  metricToSuppress: RepositoryMetricValue = {} as RepositoryMetricValue

  @runStore.Action(RunDetailActions.IGNORE_CHECK_METRIC)
  ignoreMetric: (args: {
    checkId: string
    metricShortcode: string
    key: string
  }) => Promise<boolean>

  public isLoading = false

  /**
   * Created hook to update query params from route query mixin
   *
   * @return {void}
   */
  created(): void {
    setTimeout(() => {
      if (this.$fetchState.pending) this.isLoading = true
    }, 300)
  }

  /**
   * Scroll handler that sets isScrolled to true if the window's scroll position exceeds a certain threshold
   *
   * * @return {void}
   */
  handleScroll(): void {
    this.isScrolled = process.client && window.scrollY > 20
  }

  get showMetricCardHeader() {
    return this.METRICS_WITH_SECTIONS.includes(this.check.analyzer?.shortcode || '')
  }

  get showAutofixBar() {
    return (
      this.allowAutofix &&
      Array.isArray(this.check.autofixableIssues) &&
      this.check.autofixableIssues.length &&
      !this.check.run.isForDefaultBranch &&
      !this.check.run.isForCrossRepoPr
    )
  }

  isMetricAggregate(metric: RepositoryMetricValue): boolean {
    return metric.namespace.key === MetricType.aggregate
  }

  /**
   * Fetch hook for the page.
   *
   * @returns {Promise<void>} A promise that resolves with no return on completion of fetch.
   */
  async fetch(): Promise<void> {
    this.$emit('is-fetching', true)
    const { status, analyzer, runId, pageOffset } = this.pageRefetchStatus.runDetail
    const { analyzer: analyzerFromRouteParams, runId: runIdFromRouteParams } = this.$route.params

    // Trigger a re-fetch only if the status corresponding to the page is `true` and the route params and page offset matches
    const refetch =
      status &&
      analyzer === analyzerFromRouteParams &&
      runId === runIdFromRouteParams &&
      this.queryOffset === pageOffset

    await this.fetchRepoPerms(this.baseRouteParams)
    await this.fetchCurrentRun()
    await this.fetchCheck({ checkId: this.currentCheck.id })
    await this.fetchIssues(refetch)
    this.isLoading = false

    if (refetch) {
      // Reset the state
      this.$store.commit(`run/detail/${RunDetailMutations.SET_PAGE_REFETCH_STATUS}`, {
        ...this.pageRefetchStatus,
        runDetail: {
          status: false,
          analyzer: '',
          runId: '',
          pageOffset: 0
        }
      })
    }
    this.$emit('is-fetching', false)
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
      if (check_id) {
        await Promise.all([this.fetchCurrentRun(true), this.refetchCheck(check_id)])
      } else {
        await this.fetchCurrentRun(true)
        await this.refetchCheck(this.currentCheck?.id)
      }
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
    // ? isPassing can be null, which indicates that there is no threshold set. Hence, the explicit check!
    return metrics.filter((metric) => metric.isPassing === false)
  }

  /**
   * Sets the index for the currently active tab
   *
   * @param {number} index index of the active tab
   * @returns {void}
   */
  updateActiveTabIndex(index: number): void {
    this.activeTabIndex = index
  }

  /**
   * Ensures that the Issues tab is displayed when resizing from a tablet or smaller viewport back to a larger size
   *
   * @returns {void}
   */
  handleResize(): void {
    if (process.client && window.innerWidth > 768) this.updateActiveTabIndex(0)
  }

  /**
   * Mounted lifecycle hook for the page. Binds event bus and socket event listeners.
   *
   * @returns {void}
   */
  mounted(): void {
    this.$root.$on('refetchCheck', this.refetchCheck)
    this.$root.$on('refetchRunAndCheck', this.refetchRunAndCheck)
    this.$socket.$on('repo-analysis-updated', this.refetchRunAndCheck)
    this.$socket.$on('autofixrun-fixes-ready', this.refetchRunAndCheck)
    this.handleResize()
    this.handleScroll()
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('scroll', this.handleScroll)
  }

  /**
   * BeforeDestroy lifecycle hook for the page. Unbinds event bus and socket event listeners.
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$root.$off('refetchCheck', this.refetchCheck)
    this.$root.$off('refetchRunAndCheck', this.refetchRunAndCheck)
    this.$socket.$off('repo-analysis-updated', this.refetchRunAndCheck)
    this.$socket.$off('autofixrun-fixes-ready', this.refetchRunAndCheck)
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('scroll', this.handleScroll)
  }

  /**
   * Route query callback
   *
   * @return {Promise<void>}
   */
  async refetchAfterRouteChange(): Promise<void> {
    this.currentPage = 1
    await this.fetchIssues()
  }

  /**
   * Fetch of details of the current page's run.
   *
   * @param {boolean} refetch Whether to refetch data from server or use cache. Has a default value of **false**.
   * @returns {Promise<void>} A promise that resolves with no return on completion of fetch.
   */
  async fetchCurrentRun(refetch = false): Promise<Run | undefined> {
    const { runId, repo, owner, provider } = this.$route.params
    return this.fetchRun({
      provider,
      owner,
      name: repo,
      runId,
      isRunner: false, // This is the top-level page. We don't require code snippets here, hence supplying `isRunner` as `false`. The fetch is done in the child view.
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
      first: this.perPageCount,
      offset: this.queryOffset,
      sort: (this.queryParams.sort as string) || '',
      issueType: (this.queryParams.category as string) || '',
      q: (this.queryParams.q as string) || '',
      refetch
    })
    this.totalCount = this.concreteIssueList.totalCount || 0
  }

  /**
   * Update search in queryParams, but remove filter for empty string
   *
   * @param {string} val
   *
   * @return {void}
   */
  updateSearch(val: string): void {
    val ? this.addFilters({ q: val }) : this.removeFilter('q')
  }

  get allowAutofix(): boolean {
    const { provider } = this.$route.params
    return this.$gateKeeper.provider(AppFeatures.AUTOFIX, provider)
  }

  get canCreateAutofix(): boolean {
    return this.$gateKeeper.repo(RepoPerms.CREATE_AUTOFIXES, this.repoPerms.permission)
  }

  get metricsSortedAlpabetically() {
    return this.check.metricsCaptured
      ? [...this.check.metricsCaptured].sort(
          (a, b) => a?.namespace?.key?.localeCompare(b?.namespace?.key || '') || 0
        )
      : []
  }

  /**
   * Returns an array of GroupedMetrics based on each metric's name
   * Each element in the array corresponds to a unique metric name (i.e Line Coverage, Branch Coverage etc), and contains a nested list of `RepositoryMetricValues` corresponding to individual metric stats from specific analyzers or as an aggregate
   *
   * @returns {Array<GroupedMetrics>}
   */
  get metricsGroupedByName() {
    let groupedMetrics: GroupedMetrics[] = []

    this.check.metricsCaptured?.forEach((metric) => {
      const index = groupedMetrics.findIndex((groupedMetric) => groupedMetric.name === metric?.name)
      // if findIndex returned -1 here, we are encountering this metric name for the first time, and so we add it to the list of groupedMetrics along with the individual metric
      if (index === -1 && metric?.name) {
        groupedMetrics.push({
          name: metric.name,
          metrics: [metric]
        })
      }
      // this metric name already exists in groupedMetrics, so we add the metric to the corresponding object's metric list in groupedMetrics
      else {
        metric && groupedMetrics[index].metrics.push(metric)
      }
    })

    return groupedMetrics
  }

  /**
   * Creates a list of analyzers that contributed to the given metric's aggregate calculation, with each analyzer's name, shortcode and logo
   *
   * @param {string} metricShortCode The metric shortcode ('LCV', 'NLCV' or 'BCV')
   * @returns {Record<string, string, string>[]}
   */
  getAggregateContributingChecks(metricShortCode: string) {
    return this.check.metricsCaptured
      ? [...this.check.metricsCaptured]
          .filter(
            (metric) =>
              metric?.namespace.key !== MetricType.aggregate &&
              metric?.shortcode === metricShortCode
          )
          .map((metric) => metric?.namespace)
      : []
  }

  get areMetricsAlerting(): boolean {
    return (
      this.check.metricsCaptured?.some(
        (metricValue) => metricValue?.isPassing === false && metricValue?.isSuppressed !== true
      ) || false
    )
  }

  get areMetricsPassing(): boolean {
    return !this.check.metricsCaptured?.some((metricValue) => metricValue?.isPassing === false)
  }

  get metricIconColor(): string {
    return this.areMetricsAlerting ? 'cherry' : this.areMetricsPassing ? 'juniper' : 'vanilla-400'
  }

  get metricIconTooltip(): string {
    return this.areMetricsAlerting
      ? 'Metrics are alerting'
      : this.areMetricsPassing
      ? 'Metrics are passing'
      : ''
  }

  /**
   * Creates autofixes for selected issues and redirects user to the created autofix run.
   *
   * @param {Array<String>} selectedIssueShortcodeArray - List of issue shortcodes to be Autofixed
   * @returns {Promise<void>}
   */
  public async autofixSelectedIssues(selectedIssueShortcodeArray: Array<string>): Promise<void> {
    const { owner, provider, repo } = this.$route.params
    this.autofixLoading = true
    try {
      const response = await this.createAutofixPullRequest({
        input: {
          issues: selectedIssueShortcodeArray,
          checkId: this.check.id
        }
      })
      if (response?.autofixRunId) {
        this.$router.push(`/${provider}/${owner}/${repo}/autofix/${response.autofixRunId}`)
      }
    } catch (e) {
      const err = e as Error
      if (err.message.includes('Your autofix run quota has been exhausted')) {
        this.isUpgradeAccountModalOpen = true
      } else {
        this.$toast.danger('An error occured while creating autofixes for selected issues.')
      }
    } finally {
      this.autofixLoading = false
    }
  }

  /**
   * Gets the icon data for a given metric namespace.
   *
   * @param {{analyzer_logo: any, analyzer_shortcode:any}} metricNamespace - Metric namspace with logo and shortcode information.
   *
   * @returns {{analyzerLogo: string, shortcode: string, name: string}}
   */
  getIconData(metricNamespace: { analyzer_logo: any; analyzer_shortcode: any }): {
    analyzerLogo: string
    shortcode: string
    name: string
  } {
    return {
      analyzerLogo: metricNamespace.analyzer_logo,
      shortcode: metricNamespace.analyzer_shortcode,
      name: metricNamespace.analyzer_shortcode
    }
  }

  confirmMetricSuppression(metricsCaptured: RepositoryMetricValue) {
    if (metricsCaptured) {
      this.metricToSuppress = metricsCaptured
      this.showConfirmDialog = true
    }
  }

  async suppressMetric(close: () => void) {
    this.suppressingMetric = true
    try {
      if (this.metricToSuppress.shortcode) {
        const response = await this.ignoreMetric({
          checkId: this.check.id,
          metricShortcode: this.metricToSuppress.shortcode as string,
          key: this.metricToSuppress.namespace.key
        })

        if (response) {
          await this.refetchRunAndCheck({ run_id: this.run.runId, check_id: this.check.id })
          close?.()
        }
      } else {
        this.$toast.danger('An error occured while suppressing the metric.')
      }
    } finally {
      this.suppressingMetric = false
    }
  }
}
</script>
<style scoped>
/* all for mobiles */
.analyzer-page {
  --repo-header-height: 97px;
  --breadcrumb-height: 72px;

  --top-bar-offset: calc(var(--repo-header-height) + var(--breadcrumb-height));

  --run-check-title-height: 140px;
  --run-check-title-height-with-retry: 201px;
}

/* offset for the metrics sidebar, to accomodate the top bar and run header */
.metrics-header-offset {
  top: calc(var(--top-bar-offset) + var(--run-check-title-height));
}

/* offset for the metrics sidebar, to accommodate the top bar and run header with retry button */
.metrics-header-offset.has-retry {
  top: calc(var(--top-bar-offset) + var(--run-check-title-height-with-retry));
}

@media (min-width: 640px) {
  .analyzer-page {
    --run-check-title-height: 105px;
    --run-check-title-height-with-retry: 165px;
  }
}

@media (min-width: 768px) {
  .analyzer-page {
    --breadcrumb-height: 52px;
  }
}

.custom-tab-selector-width {
  width: calc(100vw - 8px);
}
</style>
