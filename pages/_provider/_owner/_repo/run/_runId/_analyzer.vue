<template>
  <main>
    <div
      class="bg-ink-400 w-full flex flex-row justify-between space-x-4 p-2 border-b border-ink-200 z-20 md:sticky repo-header-offset"
    >
      <div class="p-0.5 px-2 mt-px">
        <z-breadcrumb separator="/" class="text-sm text-vanilla-100" :key="$route.name">
          <z-breadcrumb-item class="text-vanilla-400"
            ><nuxt-link :to="linkToAllRuns">All runs</nuxt-link></z-breadcrumb-item
          >
          <z-breadcrumb-item
            :isCurrent="!$route.params.issueId"
            :class="{ 'text-vanilla-400': $route.params.issueId }"
            ><nuxt-link :to="$route.params.issueId ? linkToAnalyzerPage : '#'">{{
              parentBreadCrumb
            }}</nuxt-link></z-breadcrumb-item
          >
          <z-breadcrumb-item v-if="$route.params.issueId" isCurrent>{{
            $route.params.issueId
          }}</z-breadcrumb-item>
        </z-breadcrumb>
      </div>
      <z-menu class="md:hidden">
        <template #trigger="{ toggle }">
          <z-button button-type="secondary" size="x-small" @click="toggle">
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
    <div class="grid grid-cols-1 md:grid-cols-14-fr gap-y-0">
      <div
        class="h-full border-r border-ink-200 hidden md:flex flex-col justify-between sticky run-sidebar top-bar-offset"
      >
        <analyzer-selector v-bind="run" :checks="checks" />
        <run-summary v-bind="run" />
      </div>
      <div class="">
        <div v-if="$fetchState.pending || !run">
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
            <div class="w-full rounded-md h-14 bg-ink-300 animate-pulse"></div>
            <div class="w-full rounded-md h-14 bg-ink-300 animate-pulse"></div>
          </div>
        </div>
        <run-header
          v-else-if="showRunHeader"
          v-bind="run"
          :route-to-previous="linkToAllRuns"
          :checks="checks"
          :current-analyzer="$route.params.analyzer"
          class="bg-ink-400 border-b border-ink-200 md:sticky top-bar-offset z-30"
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
import { toTitleCase } from '@/utils/string'

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
  /**
   * Fetch hook for the page.
   *
   * @returns {Promise<void>} A promise that resolves with no return on completion of fetch.
   */
  async fetch(): Promise<void> {
    await this.fetchRepoPerms(this.baseRouteParams)
    await this.fetchCurrentRun()
  }

  get currentAnalyzer(): string {
    return this.$route.params.analyzer
  }

  get showRunHeader() {
    return !Boolean(this.$route.params.issueId)
  }

  /**
   * Returns the breadcrumb label for the previous page
   *
   * @returns {string}
   */
  get parentBreadCrumb(): string {
    return (
      `${
        this.run.isForDefaultBranch ? this.run.branchName : this.run.pullRequestNumberDisplay
      } - ${toTitleCase(this.$route.params.analyzer)}` || ''
    )
  }

  /**
   * Returns a route to all runs for this branch
   *
   * @returns {string} A promise that resolves with no return on completion of fetch.
   */
  get linkToAllRuns(): string {
    return this.$generateRoute(['history', 'runs'])
  }

  /**
   * Returns a route back to the current active analyzer page
   *
   * @returns {string}
   */
  get linkToAnalyzerPage(): string {
    const { runId, analyzer } = this.$route.params
    return this.$generateRoute(['run', runId, analyzer])
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
/* height of RepoHeader + Breadcrumbs */
.top-bar-offset {
  top: 238px;
}

.run-sidebar {
  height: calc(100vh - 238px);
}

.repo-header-offset {
  top: 195px;
}

@media (min-width: 1024px) {
  .run-sidebar {
    height: calc(100vh - 182px);
  }

  .top-bar-offset {
    top: 182px;
  }

  .repo-header-offset {
    top: 139px;
  }
}

@media (min-width: 1280px) {
  .run-sidebar {
    height: calc(100vh - 139px);
  }

  .top-bar-offset {
    top: 139px;
  }

  .repo-header-offset {
    top: 96px;
  }
}
</style>
