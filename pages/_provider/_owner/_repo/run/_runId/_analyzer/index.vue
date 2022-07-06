<template>
  <main>
    <template v-if="!$fetchState.pending">
      <div>
        <z-tabs>
          <z-tab-list class="w-full lg:hidden flex-row p-3 -space-x-2 text-center">
            <z-tab
              :is-active="activeTabIndex === 0"
              :action="() => updateActiveTabIndex(0)"
              :remove-indicator-styles="true"
              class="w-1/2 -mb-3"
            >
              <div
                class="w-full p-3 rounded-l-md border border-ink-200"
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
                class="w-full p-3 rounded-r-md border border-ink-200"
                :class="{ 'bg-ink-50 border-l-0': activeTabIndex === 1 }"
              >
                Metrics
              </div>
            </z-tab>
          </z-tab-list>
          <!-- issues -->
          <div v-if="activeTabIndex === 0" class="grid grid-cols-1 lg:grid-cols-fr-22">
            <div class="border-r border-ink-200 p-3">
              <analyzer-run v-bind="check" :can-create-autofix="canCreateAutofix">
                <template #controls>
                  <div class="flex flex-col">
                    <run-autofix-bar
                      v-if="
                        allowAutofix &&
                        Array.isArray(check.autofixableIssues) &&
                        check.autofixableIssues.length &&
                        !check.run.isForDefaultBranch &&
                        !check.run.isForCrossRepoPr
                      "
                      @autofixIssues="autofixSelectedIssues"
                      v-bind="check"
                      :autofixLoading="autofixLoading"
                      :can-create-autofix="canCreateAutofix"
                    />
                    <div class="flex space-x-2 w-full">
                      <div class="flex w-auto space-x-2">
                        <issue-category-filter
                          v-model="queryParams.category"
                          @reset="removeFilter('category')"
                        />
                        <issue-sort
                          v-model="queryParams.sort"
                          :show-seen-options="false"
                          @reset="removeFilter('sort')"
                        />
                      </div>
                      <issue-search
                        v-focus
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
            </div>
            <div
              class="hidden lg:flex flex-col space-y-2 p-3 lg:sticky header-offset metrics-sidebar"
            >
              <run-loading v-if="check.status === 'PEND'" />
              <run-cancelled v-else-if="check.status === 'CNCL'" />
              <run-timeout v-else-if="check.status === 'TIMO'" />
              <template v-else>
                <div
                  v-if="Array.isArray(check.metricsCaptured) && check.metricsCaptured.length"
                  class="grid grid-cols-1 gap-4 overflow-y-auto hide-scroll"
                >
                  <div class="flex items-center gap-x-2">
                    <p
                      class="text-sm font-semibold tracking-wide uppercase text-vanilla-400 leading-none"
                    >
                      Metrics
                    </p>
                    <z-tag
                      v-if="areMetricsAlerting"
                      icon-left="alert-circle"
                      icon-color="cherry"
                      size="x-small"
                      spacing="px-2 py-0"
                      class="border border-ink-200"
                    >
                      <span
                        class="font-semibold text-xxs uppercase tracking-wider leading-none py-1.5 text-cherry"
                        >Alerting</span
                      >
                    </z-tag>
                  </div>
                  <run-metric-card
                    v-for="stat in sortedMetricsCaptured"
                    :key="stat.id"
                    :metrics-captured="stat"
                    class="border border-ink-200 bg-ink-300 rounded-md"
                    @confirmMetricSuppression="confirmMetricSuppression"
                  />
                </div>
                <base-state
                  v-else
                  :show-border="true"
                  class="text-vanilla-400"
                  height-class="h-auto"
                  spacing-class="p-6"
                >
                  <template #title>
                    <h1 class="text-sm text-center text-vanilla-400">
                      No metrics captured for this check
                    </h1>
                  </template>
                </base-state>
              </template>
            </div>
          </div>
          <!-- metrics -->
          <div v-else class="flex lg:hidden flex-col space-y-2 p-3 lg:sticky header-offset">
            <lazy-run-loading v-if="check.status === CheckStatus.Pend" />
            <lazy-run-cancelled v-else-if="check.status === CheckStatus.Cncl" />
            <lazy-run-timeout v-else-if="check.status === CheckStatus.Timo" />
            <lazy-run-waiting v-else-if="check.status === CheckStatus.Wait" />
            <lazy-run-nuked v-else-if="check.status === CheckStatus.Atmo" />
            <template v-else>
              <div
                v-if="Array.isArray(check.metricsCaptured) && check.metricsCaptured.length"
                class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 overflow-y-auto hide-scroll"
              >
                <run-metric-card
                  v-for="stat in sortedMetricsCaptured"
                  :key="stat.id"
                  :metrics-captured="stat"
                  class="border border-ink-200 bg-ink-300 rounded-md"
                  @confirmMetricSuppression="confirmMetricSuppression"
                />
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
    </template>
    <div v-else>
      <!-- Loading state -->
      <div class="flex flex-col gap-y-3 w-full space-x-2 rounded-sm">
        <!-- Controls -->
        <div class="w-full flex space-x-4 p-4">
          <div class="h-8 w-22 rounded-md bg-ink-300 animate-pulse"></div>
          <div class="h-8 w-22 rounded-md bg-ink-300 animate-pulse"></div>
          <div class="h-8 flex-grow rounded-md bg-ink-300 animate-pulse"></div>
        </div>

        <div class="w-full grid grid-cols-1 lg:grid-cols-fr-20">
          <!-- Issues -->
          <div class="flex flex-col gap-y-3 p-2">
            <div
              v-for="index in 10"
              :key="index"
              class="h-22 w-full bg-ink-300 animate-pulse"
            ></div>
          </div>
          <!-- Metrics -->
          <div class="flex flex-col gap-y-3 p-2">
            <div
              v-for="index in 5"
              :key="index"
              class="h-32 w-full rounded-md bg-ink-300 animate-pulse"
            ></div>
          </div>
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

      <portal to="modal">
        <z-confirm
          v-if="showConfirmDialog"
          primaryActionType="danger"
          title="Are you sure you want to suppress the metric?"
          @onClose="showConfirmDialog = false"
        >
          <template v-slot:footer="{ close }">
            <div class="mt-6 space-x-4 text-right text-vanilla-100 flex items-center justify-end">
              <z-button buttonType="ghost" class="text-vanilla-100" size="small" @click="close">
                Cancel
              </z-button>
              <z-button
                v-if="suppressingMetric"
                button-type="warning"
                size="small"
                :disabled="true"
                class="w-44 flex items-center"
              >
                <z-icon icon="spin-loader" color="ink" class="animate-spin mr-2"></z-icon>
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
    </div>
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
  ZConfirm,
  ZButton,
  ZTag
} from '@deepsourcelabs/zeal'
import RouteQueryMixin from '~/mixins/routeQueryMixin'
import PaginationMixin from '~/mixins/paginationMixin'

import { RunDetailActions } from '~/store/run/detail'
import { resolveNodes } from '~/utils/array'

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
    ZConfirm,
    ZButton,
    ZTag
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
  readonly CheckStatus = CheckStatus
  showConfirmDialog = false
  suppressingMetric = false
  metricToSuppress: RepositoryMetricValue = {} as RepositoryMetricValue

  @runStore.Action(RunDetailActions.IGNORE_CHECK_METRIC)
  ignoreMetric: (args: {
    checkId: string
    metricShortcode: string
    key: string
  }) => Promise<boolean>

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
    if (process.client && window.innerWidth > 1024) this.updateActiveTabIndex(0)
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
    window.addEventListener('resize', this.handleResize)
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
    val ? this.addFilter('q', val) : this.removeFilter('q')
  }

  get allowAutofix(): boolean {
    const { provider } = this.$route.params
    return this.$gateKeeper.provider(AppFeatures.AUTOFIX, provider)
  }

  get canCreateAutofix(): boolean {
    return this.$gateKeeper.repo(RepoPerms.CREATE_AUTOFIXES, this.repoPerms.permission)
  }

  /**
   * Priority:
   * 1. Metrics with `isPassing` false
   * 2. Metrics with `isPassing` true
   * 3. Metrics without threshold
   *
   * For a sort function `(a,b) => Number`:
   *
   * The sort relies on relation between two metrics:
   * - If a negative value is returned, item `a` is sorted before item `b`.
   * - If a positive value is returned, item `a` is sorted after item `b`.
   * - If a `0` is returned, the items stay as is.
   *
   * We want all the metrics without threshold to be last, so we always exit early
   * if `threshold` is falsey by returning a value as per above logic.
   *
   * Otherwise, we compare the two values. Since, `Number(boolean)` is 0 for false and 1 for true.
   *
   * @see [MDN - Array.prototype.sort()#Description]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description}
   */
  get sortedMetricsCaptured() {
    return this.check.metricsCaptured
      ? [...this.check.metricsCaptured].sort((a, b) => {
          if (!a?.threshold) {
            return 1
          }
          if (!b?.threshold) {
            return -1
          }

          return Number(a.isPassing) - Number(b.isPassing)
        })
      : []
  }

  get areMetricsAlerting(): boolean {
    return (
      this.check.metricsCaptured?.some((metricValue) => metricValue?.isPassing === false) || false
    )
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
/* height of RepoHeader + Breadcrumbs + RunHeader */
.header-offset {
  top: 323px;
}

.metrics-sidebar {
  height: calc(100vh - 339px);
}

@media (min-width: 1024px) {
  .header-offset {
    top: 269px;
  }

  .metrics-sidebar {
    height: calc(100vh - 269px);
  }
}

@media (min-width: 1280px) {
  .header-offset {
    top: 228px;
  }

  .metrics-sidebar {
    height: calc(100vh - 228px);
  }
}
</style>
