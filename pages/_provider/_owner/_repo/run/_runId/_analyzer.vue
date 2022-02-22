<template>
  <div>
    <div
      v-if="$fetchState.pending && !run"
      class="h-24 m-4 rounded-md bg-ink-300 animate-pulse"
    ></div>
    <run-header
      v-else
      v-bind="run"
      :route-to-previous="$generateRoute(['history', 'runs'])"
      :checks="checks"
      :current-analyzer="$route.params.analyzer"
    />
    <nuxt-child />
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

// Import State & Types
import { RunHeader, AnalyzerRun } from '@/components/Run'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import RunDetailMixin from '~/mixins/runDetailMixin'

/**
 * Page that provides detailed information about generated issues for a specific analyzer run.
 */
@Component({
  components: {
    AnalyzerRun,
    RunHeader
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
