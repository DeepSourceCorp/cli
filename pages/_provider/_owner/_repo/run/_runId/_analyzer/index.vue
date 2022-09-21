<template>
  <main class="check-body-offset md:sticky pt-3 md:pt-0">
    <div v-if="!isLoading">
      <z-tabs>
        <z-tab-list class="flex-row w-full ml-2 -space-x-2 text-center md:hidden">
          <z-tab
            :is-active="activeTabIndex === 0"
            :action="() => updateActiveTabIndex(0)"
            :remove-indicator-styles="true"
            class="w-1/2 -mb-3"
          >
            <div
              class="w-full p-3 border rounded-l-md border-ink-200"
              :class="{ 'bg-ink-50 border-r-0': activeTabIndex === 0 }"
            >
              Issues
            </div>
          </z-tab>
          <z-tab
            :is-active="activeTabIndex === 1"
            :action="() => updateActiveTabIndex(1)"
            :remove-indicator-styles="true"
            class="w-1/2 -mb-3"
          >
            <div
              class="w-full p-3 border rounded-r-md border-ink-200"
              :class="{ 'bg-ink-50 border-l-0': activeTabIndex === 1 }"
            >
              Metrics
            </div>
          </z-tab>
        </z-tab-list>
        <!-- issues -->
        <div
          v-if="activeTabIndex === 0"
          class="grid grid-cols-1 run-body-height"
          :class="{
            'md:grid-cols-fr-22 divide-x divide-ink-200': ['FAIL', 'PASS'].includes(check.status)
          }"
        >
          <analyzer-run
            v-bind="check"
            :filters="queryParams"
            :can-create-autofix="canCreateAutofix"
            :currentPage="currentPage"
          >
            <template #controls>
              <div class="flex flex-col pt-3 gap-y-4 md:relative">
                <!-- shadow effect -->
                <div
                  v-if="isScrolled"
                  class="absolute hidden w-full pointer-events-none md:block bg-gradient-to-b from-ink-400 via-ink-400 to-transparent"
                  :class="[showAutofixBar ? 'h-48' : 'h-20']"
                ></div>
                <run-autofix-bar
                  v-if="showAutofixBar"
                  @autofixIssues="autofixSelectedIssues"
                  v-bind="check"
                  :autofixLoading="autofixLoading"
                  :can-create-autofix="canCreateAutofix"
                  class="md:z-10"
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
                class="flex justify-center my-6 text-sm"
              >
                <z-pagination
                  :page="currentPage"
                  :key="currentPage"
                  :total-pages="totalPageCount"
                  :total-visible="5"
                  @selected="updatePageNum"
                />
              </div>
            </template>
          </analyzer-run>
          <section v-if="['FAIL', 'PASS'].includes(check.status)">
            <div class="sticky flex-col hidden p-3 space-y-2 md:flex metrics-header-offset">
              <div
                v-if="Array.isArray(check.metricsCaptured) && check.metricsCaptured.length"
                class="grid grid-cols-1 gap-3 overflow-y-auto hide-scroll"
              >
                <div class="flex items-center gap-x-1">
                  <z-icon v-tooltip="metricIconTooltip" :color="metricIconColor" icon="bar-chart" />
                  <p class="text-xs font-semibold tracking-wide uppercase text-slate">Metrics</p>
                </div>

                <run-metric-card
                  v-for="metricGroup in metricsGroupedByName"
                  :key="metricGroup.name"
                  :metrics-captured="metricGroup.metrics"
                  class="border rounded-md border-ink-200 bg-ink-300"
                  @confirmMetricSuppression="confirmMetricSuppression"
                >
                  <template #header>
                    <div
                      class="w-full flex items-center gap-x-2 justify-between text-sm font-semibold text-vanilla-400"
                    >
                      {{ metricGroup.name }}
                    </div>
                  </template>
                </run-metric-card>
              </div>
              <base-state
                v-else
                :show-border="true"
                class="text-vanilla-400"
                height-class="h-auto"
                spacing-class="p-6"
              >
                <template #title>
                  <h1 class="mt-1 text-sm text-center text-vanilla-400">
                    No metrics captured for this check
                  </h1>
                </template>
              </base-state>
            </div>
          </section>
        </div>
        <!-- metrics -->
        <div v-else class="flex flex-col p-3 space-y-2 xl:hidden">
          <lazy-run-loading v-if="check.status === CheckStatus.Pend" />
          <lazy-run-cancelled v-else-if="check.status === CheckStatus.Cncl" />
          <lazy-run-timeout v-else-if="check.status === CheckStatus.Timo" />
          <lazy-run-waiting v-else-if="check.status === CheckStatus.Wait" />
          <lazy-run-nuked v-else-if="check.status === CheckStatus.Atmo" />
          <template v-else>
            <div
              v-if="Array.isArray(check.metricsCaptured) && check.metricsCaptured.length"
              class="grid grid-cols-1 gap-4 overflow-y-auto hide-scroll"
            >
              <run-metric-card
                v-for="metricGroup in metricsGroupedByName"
                :key="metricGroup.name"
                :metrics-captured="metricGroup.metrics"
                class="border rounded-md border-ink-200 bg-ink-300"
                @confirmMetricSuppression="confirmMetricSuppression"
              >
                <template #header>
                  <div
                    class="w-full flex items-center gap-x-2 justify-between text-sm font-semibold text-vanilla-400"
                  >
                    {{ metricGroup.name }}
                  </div>
                </template>
              </run-metric-card>
            </div>
            <empty-state
              v-else
              :show-border="true"
              title="No metrics captured for this check"
              class="text-vanilla-200"
            />
          </template>
        </div>
      </z-tabs>
    </div>
    <div v-else>
      <!-- Loading state -->

      <div class="grid w-full grid-cols-1 lg:grid-cols-fr-20">
        <!-- Issues -->

        <div class="flex flex-col p-2 gap-y-3">
          <!-- Controls -->
          <div class="flex items-center w-full space-x-4 h-11">
            <div class="h-8 rounded-md w-22 bg-ink-300 animate-pulse"></div>
            <div class="h-8 rounded-md w-22 bg-ink-300 animate-pulse"></div>
            <div class="flex-grow h-8 rounded-md bg-ink-300 animate-pulse"></div>
          </div>
          <div v-for="index in 10" :key="index" class="w-full h-24 bg-ink-300 animate-pulse"></div>
        </div>
        <!-- Metrics -->
        <div class="flex flex-col p-2 gap-y-3">
          <div
            v-for="index in 5"
            :key="index"
            class="w-full h-32 rounded-md bg-ink-300 animate-pulse"
          ></div>
        </div>
      </div>

      <div class="flex p-4 space-x-2">
        <div class="w-24 h-8 rounded-md bg-ink-300 animate-pulse"></div>
        <div class="h-8 rounded-md w-28 bg-ink-300 animate-pulse"></div>
      </div>

      <div class="p-4 space-y-2">
        <div class="w-full rounded-md h-14 bg-ink-300 animate-pulse"></div>
        <div class="w-full rounded-md h-14 bg-ink-300 animate-pulse"></div>
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
            class="border rounded-md border-ink-100 bg-ink-300 md:hidden shadow-xl mb-6"
            @confirmMetricSuppression="confirmMetricSuppression"
          >
            <template #header>
              <div
                class="w-full flex items-center gap-x-2 justify-between text-sm font-semibold text-vanilla-400"
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
        <template v-slot:footer="{ close }">
          <div class="flex items-center justify-end mt-6 space-x-4 text-right text-vanilla-100">
            <z-button buttonType="ghost" class="text-vanilla-100" size="small" @click="close">
              Cancel
            </z-button>
            <z-button
              v-if="suppressingMetric"
              button-type="warning"
              size="small"
              :disabled="true"
              class="flex items-center w-44"
            >
              <z-icon icon="spin-loader" color="ink" class="mr-2 animate-spin"></z-icon>
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
  </main>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'

// Import State & Types
import { Check, CheckStatus, RepositoryMetricValue } from '~/types/types'
import { AppFeatures, RepoPerms } from '~/types/permTypes'
import { RunHeader, AnalyzerRun } from '@/components/Run'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import RunDetailMixin from '~/mixins/runDetailMixin'
import {
  ZIcon,
  ZTabs,
  ZTabList,
  ZTabPane,
  ZTabPanes,
  ZTab,
  ZPagination,
  ZButton,
  ZTag,
  ZConfirm
} from '@deepsourcelabs/zeal'
import RouteQueryMixin from '~/mixins/routeQueryMixin'
import PaginationMixin from '~/mixins/paginationMixin'

import { RunDetailActions } from '~/store/run/detail'
import { resolveNodes } from '~/utils/array'
import { MetricType, GroupedMetrics } from '~/types/metric'

const runStore = namespace('run/detail')

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
    ZTab,
    ZPagination,
    ZButton,
    ZTag,
    ZConfirm
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
      const checks = resolveNodes(store.state.run.detail.run.checks) as Check[]
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
    this.queryParams = Object.assign(this.queryParams, this.$route.query)
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
    await this.fetchRepoPerms(this.baseRouteParams)
    await this.fetchCurrentRun()
    await this.fetchCheck({ checkId: this.currentCheck.id })
    await this.fetchIssues()
    this.isLoading = false
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
      this.autofixLoading = false
      if (response.autofixRunId) {
        this.$router.push(`/${provider}/${owner}/${repo}/autofix/${response.autofixRunId}`)
      } else {
        this.$toast.danger(
          'An error occured while redirecting you to autofixes for selected issues.'
        )
      }
    } catch (e) {
      this.$toast.danger('An error occured while creating autofixes for selected issues.')
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
  --mobile-navbar-height: 40px;
  --repo-header-height: 184px;
  --breadcrumb-height: 72px;

  --top-bar-offset: calc(
    var(--repo-header-height) + var(--breadcrumb-height) + var(--mobile-navbar-height)
  );

  --run-check-title-height: 104px;
}

.metrics-header-offset {
  top: calc(var(--top-bar-offset) + var(--run-check-title-height));
}

.run-body-height {
  height: calc(100vh - (var(--top-bar-offset) + var(--run-check-title-height)));
}

@media (min-width: 640px) {
  .analyzer-page {
    --run-check-title-height: 104px;
  }
}

@media (min-width: 768px) {
  .analyzer-page {
    --breadcrumb-height: 52px;
  }
}

/* all for tablets */
@media (min-width: 1023px) {
  .analyzer-page {
    --mobile-navbar-height: 0px;
    --repo-header-height: 167.5px;
  }
}

@media (min-width: 1280px) {
  .analyzer-page {
    --mobile-navbar-height: 0px;
    --repo-header-height: 96px;
  }
}
</style>
