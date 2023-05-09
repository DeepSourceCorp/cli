<template>
  <main class="analyzer-page">
    <!-- UI state corresponding to archived runs -->
    <lazy-empty-state-card
      v-if="showArchivedRunEmptyState"
      :show-border="true"
      :use-v2="true"
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
            class="flex h-7 w-7 cursor-pointer items-center justify-center gap-x-2 rounded-md border border-slate-400 bg-ink-200 text-sm text-vanilla-400 hover:bg-ink-100 md:hidden"
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
        <div class="flex h-full items-center">
          <z-menu class="xl:hidden" direction="left">
            <template #trigger="{ toggle }">
              <button
                class="flex h-7 cursor-pointer items-center gap-x-2 rounded-md border border-slate-400 bg-ink-200 px-2 text-sm text-vanilla-400 hover:bg-ink-100"
                @click="toggle"
              >
                All checks
              </button>
            </template>
            <template #body>
              <z-menu-section :divider="false">
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
          <run-summary v-bind="run" />
        </div>
        <div>
          <div class="top-bar-offset z-30 md:sticky">
            <run-header
              v-if="showRunHeader"
              v-bind="run"
              :checks="checks"
              :current-analyzer="$route.params.analyzer"
              class="border-b border-ink-200 bg-ink-400"
            />
            <inferred-artifact
              v-if="checkHasInferredArtifacts && checkInferredArtifactsPr"
              v-bind="checkInferredArtifactsPr"
            />
          </div>
          <nuxt-child />
        </div>
      </div>
    </template>
  </main>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
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
import { Check, Pr, Run } from '~/types/types'
import { RunTypes } from '~/types/run'

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
  public flashActiveAnalyzer = false

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

  get currentAnalyzer(): string {
    return this.$route.params.analyzer
  }

  get showArchivedRunEmptyState(): boolean {
    return this.runDetailError.message?.replace('GraphQL error: ', '') === RunTypes.ARCHIVED_RUN
  }

  get showRunHeader() {
    return !this.$route.params.issueId
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
  --mobile-navbar-height: 40px;
  --repo-header-height: 184px;
  --breadcrumb-height: 72px;

  --top-bar-offset: calc(
    var(--repo-header-height) + var(--breadcrumb-height) + var(--mobile-navbar-height)
  );

  --run-check-title-height: 140px;
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
  top: calc(var(--repo-header-height) + var(--mobile-navbar-height));
}

/* offset for the check page parent element when sticky, accomodates the top bar and run header */
.check-body-offset {
  top: calc(var(--top-bar-offset) + var(--run-check-title-height));
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
