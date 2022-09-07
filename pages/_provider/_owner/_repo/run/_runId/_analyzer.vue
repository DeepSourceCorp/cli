<template>
  <main class="analyzer-page">
    <div
      class="z-20 flex flex-row justify-between w-full p-2 px-4 space-x-4 border-b bg-ink-400 border-ink-200 md:sticky offset-for-breadcrumbs"
    >
      <div class="py-1.5 my-px">
        <z-breadcrumb :key="$route.name" separator="/" class="text-sm text-vanilla-100">
          <z-breadcrumb-item
            v-for="link in breadCrumbLinks"
            :key="link.label"
            :class="{ 'cursor-pointer text-vanilla-400': link.route }"
          >
            <nuxt-link v-if="link.route" :to="link.route">{{ link.label }}</nuxt-link>
            <template v-else>{{ link.label }}</template>
          </z-breadcrumb-item>
        </z-breadcrumb>
      </div>
      <div class="flex items-center h-full">
        <z-menu class="md:hidden">
          <template #trigger="{ toggle }">
            <z-button button-type="secondary" size="small" @click="toggle">
              <z-icon icon="analyzers" />
            </z-button>
          </template>
          <template #body>
            <z-menu-section :divider="false">
              <analyzer-selector v-bind="run" :checks="checks" />
            </z-menu-section>
          </template>
        </z-menu>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-14-fr gap-y-0">
      <div
        class="sticky flex-col justify-between hidden h-full border-r border-ink-200 md:flex top-bar-offset run-body-height"
      >
        <analyzer-selector v-bind="run" :checks="checks" />
        <run-summary v-bind="run" />
      </div>
      <div>
        <!-- Header Loading state -->
        <div
          v-if="isLoading"
          class="flex flex-1 w-full p-4 space-x-2 rounded-sm h-23 border-b border-ink-200"
        >
          <!-- Left Section -->
          <div class="flex flex-col w-3/5 space-y-2 md:w-4/5 justify-evenly">
            <div class="h-10 rounded-md bg-ink-300 animate-pulse"></div>
            <div class="h-6 w-40 rounded-md bg-ink-300 animate-pulse"></div>
          </div>
          <!-- Right Section -->
          <div class="relative w-2/5 md:w-1/5">
            <div class="h-full rounded-md bg-ink-300 animate-pulse"></div>
          </div>
        </div>

        <run-header
          v-else-if="showRunHeader"
          v-bind="run"
          :checks="checks"
          :current-analyzer="$route.params.analyzer"
          class="z-30 border-b bg-ink-400 border-ink-200 md:sticky top-bar-offset"
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
} from '@deepsourcelabs/zeal'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import RunDetailMixin from '~/mixins/runDetailMixin'
import { ILinks } from '~/components/Common/BreadcrumbContainer.vue'
import { toTitleCase } from '~/utils/string'

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
  layout: 'repository'
})
export default class AnalyzerDetails extends mixins(
  RepoDetailMixin,
  RoleAccessMixin,
  RunDetailMixin
) {
  public isLoading = false
  /**
    Created hook to verify whether a loader skeleton needs to be shown or not.
  */
  created() {
    setTimeout(() => {
      if (this.$fetchState.pending) this.isLoading = true
    }, 300)
  }

  /**
   * Fetch hook for the page.
   *
   * @returns {Promise<void>} A promise that resolves with no return on completion of fetch.
   */
  async fetch(): Promise<void> {
    await this.fetchRepoPerms(this.baseRouteParams)
    await this.fetchCurrentRun()
    this.isLoading = false
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
        route: this.$generateRoute(['run', runId])
      }
    ]

    if (analyzer) {
      links.push({
        label: toTitleCase(this.$route.params.analyzer),
        route: issueId ? this.$generateRoute(['run', runId, analyzer]) : undefined
      })
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
  --breadcrumb-height: 52px;

  --top-bar-offset: calc(
    var(--repo-header-height) + var(--breadcrumb-height) + var(--mobile-navbar-height)
  );

  --run-check-title-height: 92px;
}

/* height of RepoHeader + Breadcrumbs */
.top-bar-offset {
  top: var(--top-bar-offset);
}

.run-body-height {
  height: calc(100vh - var(--top-bar-offset));
}

.offset-for-breadcrumbs {
  top: calc(var(--repo-header-height) + var(--mobile-navbar-height));
}

.check-body-offset {
  top: calc(var(--top-bar-offset) + var(--run-check-title-height));
}

.check-body-height {
  min-height: calc(100vh - var(--top-bar-offset) - var(--run-check-title-height));
}

/* all for tablets */
@media (min-width: 1023px) {
  .analyzer-page {
    --mobile-navbar-height: 0px;
    --repo-header-height: 167.5px;
    /* Same as mobile */
    /* --breadcrumb-height: 52px; */
  }
}

@media (min-width: 1280px) {
  .analyzer-page {
    --mobile-navbar-height: 0px;
    --repo-header-height: 96px;
    /* Same as mobile and tablet */
    /* --breadcrumb-height: 52px; */
  }
}
</style>
