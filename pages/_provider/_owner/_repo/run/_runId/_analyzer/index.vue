<template>
  <div>
    <run-header
      v-if="run"
      v-bind="run"
      :routeToPrevious="$generateRoute(['history', 'runs'])"
      :checks="checks"
      :currentAnalyzer="$route.params.analyzer"
    ></run-header>
    <div v-else class="h-24 w-full bg-ink-200 animate-pulse"></div>
    <div v-if="runDetailLoading">
      <!-- Header -->
      <div class="flex w-full rounded-sm flex-1 p-4 space-x-2">
        <!-- Left Section -->
        <div class="w-3/5 md:w-4/5 flex flex-col space-y-2 justify-evenly">
          <div class="h-10 bg-ink-300 rounded-md animate-pulse"></div>
          <div class="h-6 bg-ink-300 rounded-md animate-pulse"></div>
        </div>
        <!-- Right Section -->
        <div class="relative w-2/5 md:w-1/5">
          <div class="h-full bg-ink-300 rounded-md animate-pulse"></div>
        </div>
      </div>
      <div class="flex p-4 space-x-2">
        <div class="h-8 w-24 bg-ink-300 rounded-md animate-pulse"></div>
        <div class="h-8 w-28 bg-ink-300 rounded-md animate-pulse"></div>
      </div>

      <div class="p-4 space-y-2">
        <div class="h-28 w-full bg-ink-300 rounded-md animate-pulse"></div>
        <div class="h-28 w-full bg-ink-300 rounded-md animate-pulse"></div>
      </div>
    </div>
    <analyzer-run
      v-else
      :key="$route.params.analyzer"
      :canCreateAutofix="canCreateAutofix"
      v-bind="check"
    ></analyzer-run>
  </div>
</template>

<script lang="ts">
import { Component, namespace, mixins } from 'nuxt-property-decorator'

// Import State & Types
import { Maybe, Check, CheckEdge } from '~/types/types'
import { RepoPerms } from '~/types/permTypes'
import { RunHeader, AnalyzerRun } from '@/components/Run'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import RunDetailMixin from '~/mixins/runDetailMixin'

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
  async fetch(): Promise<void> {
    await this.fetchRepoPerms(this.baseRouteParams)
    await this.fetchCurrentRun()
    await this.fetchCheck({ checkId: this.currentCheck.id })
    await this.fetchIssues()
  }

  async refetchCheck(checkId: string): Promise<void> {
    if (this.currentCheck.id === checkId) {
      await this.fetchCheck({ checkId: this.currentCheck.id, refetch: true })
      await this.fetchIssues(true)
    }
  }

  created(): void {
    this.setAnalysisUpdateEvent()
  }

  mounted(): void {
    this.$root.$on('refetchCheck', this.refetchCheck)
  }

  async fetchCurrentRun(): Promise<void> {
    const { runId, repo, owner, provider } = this.$route.params
    return this.fetchRun({
      provider,
      owner,
      name: repo,
      runId
    })
  }

  async fetchIssues(refetch = false): Promise<void> {
    await this.fetchConcreteIssueList({
      checkId: this.check.id,
      currentPageNumber: 1,
      limit: 30,
      sort: '',
      issueType: '',
      refetch
    })
  }

  get currentCheck(): Check {
    const filteredCheck = this.checks.filter((edge) => {
      return edge.analyzer?.shortcode == this.currentAnalyzer
    })

    return filteredCheck[0]
  }

  get currentAnalyzer(): string {
    return this.$route.params.analyzer
  }

  get checks(): Array<Check> {
    if (this.run?.checks?.edges) {
      return this.run.checks.edges.map((edge: Maybe<CheckEdge>) => {
        return edge?.node as Check
      })
    }
    return []
  }

  get canCreateAutofix(): boolean {
    return this.$gateKeeper.repo(RepoPerms.CREATE_AUTOFIXES, this.repoPerms.permission)
  }

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
