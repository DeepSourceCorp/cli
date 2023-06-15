<template>
  <main class="analyzer-page">
    <!-- UI state corresponding to archived runs -->
    <lazy-empty-state-card
      v-if="showArchivedRunEmptyState"
      :webp-image-path="require('~/assets/images/ui-states/runs/no-recent-autofixes.webp')"
      subtitle="We archive all older runs periodically to keep your dashboard lean, clean, and fast."
      title="This Analysis run has been archived"
      class="mt-52 max-w-sm md:max-w-xl"
    />

    <template v-else>
      <div
        class="offset-for-breadcrumbs z-40 flex w-full flex-row items-center justify-between space-x-4 border-b border-slate-400 bg-ink-400 p-2 px-4 md:sticky"
      >
        <div class="my-px flex items-center gap-x-2 py-4 md:py-1.5">
          <nuxt-link
            v-if="previousPageLink"
            :to="previousPageLink"
            class="flex h-7 w-7 cursor-pointer items-center justify-center gap-x-2 rounded-3px border border-slate-400 bg-ink-200 text-sm text-vanilla-400 hover:bg-ink-100 md:hidden"
            ><z-icon icon="arrow-left"
          /></nuxt-link>
          <z-breadcrumb :key="$route.path" separator="/" class="text-sm text-vanilla-100">
            <span class="text-vanilla-400 md:hidden">..</span>
            <z-breadcrumb-item
              v-for="(link, index) in breadCrumbLinks"
              :key="link.label"
              :class="{
                'cursor-pointer text-vanilla-400': link.route,
                'hidden md:block': index !== breadCrumbLinks.length - 1
              }"
            >
              <span v-if="link.route && link.route === '/'" @click="triggerActiveAnalyzerFlash">{{
                link.label
              }}</span>
              <nuxt-link v-else-if="link.route" :to="link.route">{{ link.label }}</nuxt-link>
              <template v-else>{{ link.label }}</template>
            </z-breadcrumb-item>
          </z-breadcrumb>
        </div>
        <div class="flex h-full items-center gap-2">
          <z-split-dropdown-button-v2
            v-if="canRetryAnalysis && !isFreshLoad && retryableChecks.length"
            divider-height="h-7"
            divider-color="slate-400"
          >
            <template #primary-button>
              <button
                :disabled="areAllChecksRetrying"
                class="outline-none flex h-7 cursor-pointer items-center gap-x-2 rounded-l-3px border border-r-0 border-slate-400 bg-ink-200 px-2 text-xs text-vanilla-400 hover:bg-ink-100 focus:bg-ink-100 disabled:cursor-not-allowed disabled:border-opacity-40 disabled:bg-opacity-40"
                @click="retryChecks(retryableAnalyzers)"
              >
                <z-icon
                  :icon="areAllChecksRetrying ? 'spin-loader' : 'fast-forward'"
                  size="x-small"
                  :class="{ 'animate-spin': areAllChecksRetrying }"
                />
                <span class="hidden md:inline"> Retry all unsuccessful checks </span>
              </button>
            </template>
            <template #menu>
              <z-menu direction="left" width="small">
                <template #trigger="{ toggle }">
                  <button
                    :disabled="areAllChecksRetrying"
                    class="outline-none flex h-7 cursor-pointer items-center gap-x-2 rounded-r-3px border border-l-0 border-slate-400 bg-ink-200 px-2 text-vanilla-400 hover:bg-ink-100 focus:bg-ink-100 disabled:cursor-not-allowed disabled:border-opacity-40 disabled:bg-opacity-40"
                    @click="toggle"
                  >
                    <z-icon icon="chevron-down" size="x-small" />
                  </button>
                </template>
                <template #body>
                  <z-menu-item
                    v-for="retryableCheck in retryableChecks"
                    :key="retryableCheck.id"
                    :disabled="
                      analyzersInRetry.has(
                        (retryableCheck.analyzer && retryableCheck.analyzer.shortcode) || ''
                      )
                    "
                    as="button"
                    spacing="px-3 py-2"
                    class="flex w-full items-center gap-x-2 truncate text-xs leading-4 text-vanilla-400 disabled:cursor-not-allowed disabled:border-opacity-40 disabled:bg-opacity-40"
                    @click="retryChecks([retryableCheck.analyzer.shortcode])"
                  >
                    <z-icon
                      v-if="
                        analyzersInRetry.has(
                          (retryableCheck.analyzer && retryableCheck.analyzer.shortcode) || ''
                        )
                      "
                      icon="spin-loader"
                      size="x-small"
                      class="animate-spin"
                    />
                    <analyzer-logo v-else v-bind="retryableCheck.analyzer" size="x-small" />
                    <span>{{ retryableCheck.analyzer.name }}</span>
                  </z-menu-item>
                </template>
              </z-menu>
            </template>
          </z-split-dropdown-button-v2>
          <z-menu class="xl:hidden" direction="left">
            <template #trigger="{ toggle }">
              <button
                class="outline-none flex h-7 cursor-pointer items-center gap-x-2 rounded-3px border border-slate-400 bg-ink-200 px-2 text-xs text-vanilla-400 hover:bg-ink-100 focus:bg-ink-100"
                @click="toggle"
              >
                All checks
              </button>
            </template>
            <template #body>
              <z-menu-section :divider="false" class="hide-scroll max-h-56 overflow-y-auto">
                <analyzer-selector
                  v-bind="run"
                  :checks="checks"
                  :flash-active-analyzer="flashActiveAnalyzer"
                />
              </z-menu-section>
            </template>
          </z-menu>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-y-0 xl:grid-cols-14-fr">
        <div
          class="top-bar-offset run-body-height sticky hidden h-full flex-col justify-between border-r border-slate-400 xl:flex"
        >
          <analyzer-selector
            v-bind="run"
            :checks="checks"
            :flash-active-analyzer="flashActiveAnalyzer"
          />
          <run-summary v-if="!isCurrentCheckSkipped" v-bind="run" />
        </div>
        <div v-if="isCurrentCheckSkipped" class="pt-40 pb-56">
          <lazy-empty-state-card
            :webp-image-path="require('~/assets/images/ui-states/runs/no-recent-autofixes.webp')"
            title="This check was manually skipped"
            class="max-w-sm md:max-w-xl"
          >
            <template #subtitle
              >Analysis was manually skipped for commit
              <code class="rounded-sm bg-ink-200 px-0.5 text-vanilla-100">{{
                currectCheckCommitOid
              }}</code
              >. Check results of subsequent commits or run analysis for this commit.</template
            >
            <template #action>
              <div class="flex items-center gap-x-6">
                <run-selector v-if="branchRuns.length" :branch-runs="branchRuns">
                  <template #trigger="{ isOpen, toggle, countText }">
                    <button
                      class="auxillary-button py-2"
                      :class="isOpen ? 'bg-ink-100' : 'bg-ink-200 hover:bg-ink-100'"
                      @click="toggle"
                    >
                      <div class="flex items-center gap-x-2 text-sm text-vanilla-400">
                        <z-icon icon="refresh-cw" size="x-small" />
                        <span> {{ countText }} </span>
                        <z-icon
                          icon="chevron-down"
                          size="x-small"
                          class="transform transition-all duration-300"
                          :class="isOpen ? 'rotate-180' : 'rotate-0'"
                        />
                      </div>
                    </button>
                  </template>
                </run-selector>
              </div>
            </template>
          </lazy-empty-state-card>
        </div>
        <div v-else>
          <div class="top-bar-offset z-30 md:sticky">
            <run-header
              v-if="showRunHeader"
              v-bind="run"
              :checks="checks"
              :current-analyzer="$route.params.analyzer"
              :check="check"
              :is-retrying="isCurrentCheckRetrying"
              :hide-retry="isLoading || !canRetryAnalysis"
              class="border-b border-ink-200 bg-ink-400"
              @retry-current-check="retryChecks([check.analyzer.shortcode])"
            />
            <inferred-artifact
              v-if="checkHasInferredArtifacts && checkInferredArtifactsPr"
              v-bind="checkInferredArtifactsPr"
            />
          </div>
          <nuxt-child @is-fetching="handleLoading" />
        </div>
      </div>
    </template>
  </main>
</template>
<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { RunHeader, AnalyzerRun, AnalyzerSelector, RunSummary } from '@/components/Run'
import {
  ZMenu,
  ZMenuSection,
  ZMenuItem,
  ZIcon,
  ZButton,
  ZBreadcrumb,
  ZBreadcrumbItem
} from '@deepsource/zeal'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import RunDetailMixin from '~/mixins/runDetailMixin'
import { ILinks } from '~/components/Common/BreadcrumbContainer.vue'
import { toTitleCase } from '~/utils/string'
import { PageRefetchStatusT, RunDetailActions } from '~/store/run/detail'
import { Check, CheckStatus, Pr, Run, RunConnection } from '~/types/types'
import { RunTypes } from '~/types/run'

import RetryChecksMutation from '@/apollo/mutations/repository/runs/retryChecks.gql'
import { GraphqlMutationResponse } from '~/types/apollo-graphql-types'
import { RepoPerms } from '~/types/permTypes'
import { resolveNodes } from '~/utils/array'
import { RunListActions } from '~/store/run/list'

const runListStore = namespace('run/list')

/**
 * Page that provides detailed information about generated issues for a specific analyzer run.
 */
@Component({
  components: {
    AnalyzerRun,
    RunHeader,
    AnalyzerSelector,
    RunSummary,
    ZMenu,
    ZMenuSection,
    ZMenuItem,
    ZIcon,
    ZButton,
    ZBreadcrumb,
    ZBreadcrumbItem
  },
  layout: 'repository',
  middleware: [
    async function ({ store, route, error }) {
      const refetch = (store.state.run.detail.pageRefetchStatus as PageRefetchStatusT).runDetail

      const { provider, owner, repo, runId } = route.params
      const runResponse = (await store.dispatch(`run/detail/${RunDetailActions.FETCH_RUN}`, {
        provider,
        owner,
        name: repo,
        runId,
        isRunner: false, // This is the top-level page. We don't require code snippets here, hence supplying `isRunner` as `false`. The fetch is done in the child view.
        refetch
      })) as Run | undefined

      // Show the UI state corresponding to archived runs after checking against the error message
      if (
        store.state.run.detail.error.message?.replace('GraphQL error: ', '') ===
        RunTypes.ARCHIVED_RUN
      ) {
        return
      }

      if (!runResponse) {
        // Show `404` page if the run doesn't exist
        error({ statusCode: 404, message: 'This page is not real' })
      }
    }
  ]
})
export default class AnalyzerDetails extends mixins(
  RepoDetailMixin,
  RoleAccessMixin,
  RunDetailMixin
) {
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

  public flashActiveAnalyzer = false
  analyzersInRetryList: string[] = []
  isLoading = false

  /**
   * Fetch all runs on this branch
   *
   * @param {boolean} [refetch=true] refetch the query
   * @returns {Promise<void>}
   */
  async fetchRuns(refetch = true): Promise<void> {
    if (this.run.branchName) {
      await this.fetchBranchRuns({
        ...this.baseRouteParams,
        branchName: this.run.branchName,
        limit: 30,
        refetch
      })
    }
  }

  async fetch() {
    if (this.currentCheck?.status === CheckStatus.Skip) {
      await this.fetchRuns()
    }
  }

  /**
   * Sets `flashActiveAnalyzer` to true for 1 second, and then resets it back to false
   */
  triggerActiveAnalyzerFlash() {
    this.flashActiveAnalyzer = true
    setTimeout(() => {
      this.flashActiveAnalyzer = false
    }, 1000)
  }

  /**
   * Returns a link to the analyzer page for this issue, or undefined if not on a issue page
   */
  get previousPageLink(): string | undefined {
    const { runId, analyzer, issueId } = this.$route.params
    if (issueId) return this.$generateRoute(['run', runId, analyzer])
  }

  get currentCheck(): Check | undefined {
    return this.getCurrentCheck(this.$route.params.analyzer)
  }

  get checkHasInferredArtifacts(): boolean {
    if (this.currentCheck?.analyzer?.shortcode !== 'test-coverage') {
      return false
    }
    return this.currentCheck?.hasInferredArtifacts ?? false
  }

  get checkInferredArtifactsPr(): Pr | null {
    if (this.currentCheck?.analyzer?.shortcode !== 'test-coverage') {
      return null
    }

    return this.currentCheck?.inferredArtifactsPr ?? null
  }

  get breadCrumbLinks(): ILinks[] {
    const { runId, analyzer, issueId } = this.$route.params

    const links: ILinks[] = [
      {
        label: 'All runs',
        route: this.$generateRoute(['history', 'runs'])
      },
      {
        label: (this.run.isForDefaultBranch
          ? this.run.branchName
          : this.run.pullRequestNumberDisplay) as string,
        route:
          this.checks?.length > 0 && analyzer === this.checks[0].analyzer?.shortcode && !issueId
            ? '/'
            : this.$generateRoute(['run', runId])
      }
    ]

    if (analyzer) {
      // Do not follow title case for `cxx` Analyzer
      const analyzerLabelsMap: Record<string, string> = {
        cxx: 'cxx'
      }

      const breadcrumbLabel =
        analyzerLabelsMap[this.currentAnalyzer] ?? toTitleCase(this.currentAnalyzer)

      const link = {
        label: breadcrumbLabel,
        route: issueId ? this.$generateRoute(['run', runId, analyzer]) : undefined
      }

      if (issueId && this.$route.query) {
        const { listsort, listcategory, listq } = this.$route.query
        let filters = []
        if (listsort) filters.push(`sort=${listsort}`)
        if (listcategory) filters.push(`category=${listcategory}`)
        if (listq) filters.push(`q=${listq}`)
        if (filters.length > 0) {
          link.route = `${link.route}?${filters.join('&')}`
        }
      }

      links.push(link)
    }

    if (issueId) {
      links.push({
        label: issueId
      })
    }

    return links
  }

  get canRetryAnalysis() {
    return this.$gateKeeper.repo(RepoPerms.RETRY_ANALYSIS, this.repoPerms.permission)
  }

  get currentAnalyzer(): string {
    return this.$route.params.analyzer
  }

  get showArchivedRunEmptyState(): boolean {
    return this.runDetailError.message?.replace('GraphQL error: ', '') === RunTypes.ARCHIVED_RUN
  }

  get showRunHeader() {
    return !this.$route.params.issueId
  }

  get retryableChecks(): Check[] {
    return this.checks.filter((check) => check.isRetryable)
  }

  get retryableAnalyzers() {
    return this.retryableChecks
      .map((check) => check.analyzer?.shortcode)
      .filter(Boolean) as string[]
  }

  get analyzersInRetry() {
    return new Set(this.analyzersInRetryList)
  }

  set analyzersInRetry(value) {
    this.analyzersInRetryList = Array.from(value)
  }

  get isCurrentCheckRetrying(): boolean {
    return this.analyzersInRetry.has(this.check.analyzer?.shortcode || '')
  }

  get areAllChecksRetrying(): boolean {
    return this.retryableChecks.every((check) =>
      this.analyzersInRetry.has(check.analyzer?.shortcode || '')
    )
  }

  get isCurrentCheckSkipped(): boolean {
    return this.currentCheck?.status === CheckStatus.Skip
  }

  get currectCheckCommitOid() {
    return this.run.commitOid?.substring(0, 7)
  }

  /**
   * Get the run nodes for all other runs on this branch
   *
   * @returns {Array<Run>}
   */
  get branchRuns() {
    if (this.run.branchName) {
      const resolvedRuns = resolveNodes(this.branchRunList[this.run.branchName]) as Run[]

      return resolvedRuns.filter((run) => run.runId !== this.run.runId)
    }
    return []
  }

  get isFreshLoad() {
    return this.$route.params.runId !== this.run.runId
  }

  /**
   * Update value of @see{@link isLoading}
   *
   * @param {boolean} newLoading - Value to update to
   * @returns {void}
   */
  handleLoading(newLoading: boolean) {
    this.isLoading = newLoading
  }

  /**
   * Retry given checks
   *
   * @param {string[]} analyzerShortcodes - shortcodes of analyzer to retry
   * @returns {Promise<boolean>}
   */
  async retryChecks(analyzerShortcodes: string[]): Promise<boolean> {
    const analyzersToRetry = analyzerShortcodes.filter(
      (shortcode) => !this.analyzersInRetry.has(shortcode)
    )
    this.analyzersInRetry = new Set([...Array.from(this.analyzersInRetry), ...analyzerShortcodes])
    try {
      if (analyzersToRetry.length) {
        const response: GraphqlMutationResponse = await this.$applyGraphqlMutation(
          RetryChecksMutation,
          {
            input: { runId: this.$route.params.runId, analyzers: analyzersToRetry }
          }
        )
        if (response.data.retryChecksInRun?.ok) {
          if (analyzerShortcodes.includes(this.$route.params.analyzer)) {
            this.$root.$emit('refetchRunAndCheck', { run_id: this.$route.params.runId })
          }
          return true
        }
      }
    } catch (e) {
      const err = e as Error
      this.$logErrorAndToast(err, err.message.replace('GraphQL error: ', '') as `${string}.`)
      this.analyzersInRetry = new Set(
        this.analyzersInRetryList.filter((analyzer) => !analyzerShortcodes.includes(analyzer))
      )
    }
    return false
  }

  /**
   * Function that returns `head` property to configure page metadata.
   *
   * @returns {Record<string, string>} A record containing meta properties against their values.
   */
  head(): Record<string, string> {
    const { owner, repo } = this.$route.params
    let title = ''
    if (this.run.branchName) {
      title = `${this.run.branchName} ${title}`
    }
    if (this.run.commitOid) {
      title = `${title} @ ${this.run.commitOid?.slice(0, 7)} `
    }
    return {
      title: `${title || 'Run'} • ${owner}/${repo}`,
      description:
        'DeepSource is an automated code review tool that helps developers automatically find and fix issues in their code.'
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

/* height of RepoHeader + Breadcrumbs */
.top-bar-offset {
  top: var(--top-bar-offset);
}

/* height for the run page, used to set the correct height for the run sidebar */
.run-body-height {
  height: calc(100vh - var(--top-bar-offset));
}

/* offset for the breadcrumb container when sticky */
.offset-for-breadcrumbs {
  top: var(--repo-header-height);
}

/* offset for the check page parent element when sticky, accomodates the top bar and run header */
.check-body-offset {
  top: calc(var(--top-bar-offset) + var(--run-check-title-height));
}

/* offset for the check page parent element with retry option when sticky, accomodates the top bar and run header */
.check-body-offset.has-retry {
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
</style>
