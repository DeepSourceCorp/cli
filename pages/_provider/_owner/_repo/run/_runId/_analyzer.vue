<template>
  <main class="analyzer-page">
    <div
      class="z-40 flex flex-row items-center justify-between w-full p-2 px-4 space-x-4 border-b bg-ink-400 border-slate-400 md:sticky offset-for-breadcrumbs"
    >
      <div class="flex items-center py-4 md:py-1.5 my-px gap-x-2">
        <nuxt-link
          v-if="previousPageLink"
          :to="previousPageLink"
          class="flex md:hidden items-center justify-center gap-x-2 w-7 h-7 rounded-md cursor-pointer border border-slate-400 bg-ink-200 hover:bg-ink-100 text-sm text-vanilla-400"
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
      <div class="flex items-center h-full">
        <z-menu class="xl:hidden" direction="left">
          <template #trigger="{ toggle }">
            <button
              class="flex items-center gap-x-2 px-2 h-7 rounded-md cursor-pointer border border-slate-400 bg-ink-200 hover:bg-ink-100 text-sm text-vanilla-400"
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
    <div class="grid grid-cols-1 xl:grid-cols-14-fr gap-y-0">
      <div
        class="sticky flex-col justify-between hidden h-full border-r border-slate-400 xl:flex top-bar-offset run-body-height"
      >
        <analyzer-selector
          v-bind="run"
          :checks="checks"
          :flash-active-analyzer="flashActiveAnalyzer"
        />
        <run-summary v-bind="run" />
      </div>
      <div>
        <run-header
          v-if="showRunHeader"
          v-bind="run"
          :checks="checks"
          :current-analyzer="$route.params.analyzer"
          class="z-30 border-b bg-ink-400 border-slate-400 md:sticky top-bar-offset"
        />
        <nuxt-child />
      </div>
    </div>
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
import { RunDetailActions } from '~/store/run/detail'
import { Run } from '~/types/types'

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
      const { provider, owner, repo, runId } = route.params
      const runResponse = (await store.dispatch(`run/detail/${RunDetailActions.FETCH_RUN}`, {
        provider,
        owner,
        name: repo,
        runId
      })) as Run | undefined

      if (!runResponse) {
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
      let link = {
        label: toTitleCase(this.$route.params.analyzer),
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

  get showRunHeader() {
    return !this.$route.params.issueId
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
