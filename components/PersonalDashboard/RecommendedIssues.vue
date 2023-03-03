<template>
  <stat-section
    title="Recommended issues"
    :show-border="false"
    :body-spacing="0"
    :body-is-grid="false"
  >
    <div class="space-y-3">
      <issue-list-item
        v-for="issue in issueList"
        :key="issue.id"
        v-bind="issue"
        :issue-link="buildRoute(issue)"
        :show-autofix-button="allowAutofix"
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
        @run-quota-exhausted="openUpgradeAccountModal"
      />
      <upgrade-account-modal
        v-if="isUpgradeAccountModalOpen"
        :login="repoParams.login"
        :provider="repoParams.provider"
        @close="isUpgradeAccountModalOpen = false"
      />
    </div>
  </stat-section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { StatSection } from '@/components/Metrics'
import IssueListItem from '@/components/IssueListItem.vue'
import ActiveUserMixin from '@/mixins/activeUserMixin'

import { RepositoryIssue } from '~/types/types'
import { resolveNodes } from '~/utils/array'
import { AppFeatures } from '~/types/permTypes'

@Component({
  components: {
    StatSection,
    IssueListItem
  }
})
export default class RecommendedIssues extends mixins(ActiveUserMixin) {
  public autofixIssue: Record<string, string | Array<string>> = {}
  public repoParams: Record<string, string | Array<string>> = {}
  public isAutofixOpen = false
  public isUpgradeAccountModalOpen = false

  async fetch(): Promise<void> {
    await this.fetchRecommendedIssues()
  }

  get issueList(): Array<RepositoryIssue | null> {
    if (this.viewer?.recommendedIssues) {
      return resolveNodes(this.viewer.recommendedIssues) as RepositoryIssue[]
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

  /**
   * Function to open Upgrade account modal on the `run-quota-exhausted` event
   *
   * @returns {void}
   */
  public openUpgradeAccountModal(): void {
    this.isAutofixOpen = false
    this.isUpgradeAccountModalOpen = true
  }

  get allowAutofix(): boolean {
    return this.$gateKeeper.provider(AppFeatures.AUTOFIX, this.activeProvider)
  }
}
</script>
