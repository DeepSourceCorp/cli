<template>
  <stat-section title="Recommended Issues" :showBorder="false" :bodySpacing="0" :bodyIsGrid="false">
    <div class="space-y-3">
      <issue-list-item
        v-for="issue in issueList"
        :key="issue.id"
        :showComparisonStat="false"
        v-bind="issue"
        :issueLink="buildRoute(issue)"
        @autofix="(iss) => openAutofixModal(iss, issue)"
      >
        <template v-if="issue.repositoryInstance" slot="header">
          {{ issue.repositoryInstance.owner.login }}/{{ issue.repositoryInstance.name }}
        </template>
      </issue-list-item>
      <!-- Autofix Modal -->
      <autofix-file-chooser
        v-bind="autofixIssue"
        :isOpen="isAutofixOpen"
        :repoParams="repoParams"
        @close="closeAutofixModal"
      ></autofix-file-chooser>
    </div>
  </stat-section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { StatSection } from '@/components/Metrics'
import IssueListItem from '@/components/IssueListItem.vue'
import ActiveUserMixin from '@/mixins/activeUserMixin'

import { RepositoryIssue } from '~/types/types'

@Component({
  components: {
    StatSection,
    IssueListItem
  }
})
export default class RecommendedIssues extends mixins(ActiveUserMixin) {
  public autofixIssue: Record<string, string | Array<string>>
  public repoParams: Record<string, string | Array<string>> = {}
  public isAutofixOpen = false

  async fetch(): Promise<void> {
    await this.fetchRecommendedIssues()
  }

  get issueList(): Array<RepositoryIssue | null> {
    if (this.viewer?.recommendedIssues) {
      const { edges } = this.viewer.recommendedIssues
      return edges
        .map((edge) => {
          return edge?.node ? edge.node : null
        })
        .filter((node) => node?.id)
    }
    return []
  }

  buildRoute(issue: RepositoryIssue): string {
    const { repositoryInstance } = issue
    const { owner } = repositoryInstance
    return [
      '',
      this.$providerMetaMap[repositoryInstance.vcsProvider].shortcode,
      owner.login,
      repositoryInstance.name,
      'issue',
      issue.shortcode
    ].join('/')
  }

  public closeAutofixModal(): void {
    this.isAutofixOpen = false
  }

  public openAutofixModal(iss: Record<string, string>, issue: RepositoryIssue): void {
    const { repositoryInstance } = issue
    const { owner } = repositoryInstance
    this.repoParams = {
      provider: this.$providerMetaMap[repositoryInstance.vcsProvider].shortcode,
      login: owner.login,
      name: repositoryInstance.name
    }
    this.autofixIssue = { ...iss }
    this.isAutofixOpen = true
  }
}
</script>
