<template>
  <div>
    <!-- Back to Issue list Page -->
    <div class="flex flex-row items-center px-4 py-2 border-b min-h-13 border-ink-200">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item class="text-vanilla-400">
          <nuxt-link :to="routeToPrevious">All issues</nuxt-link>
        </z-breadcrumb-item>
        <z-breadcrumb-item>{{ issue.shortcode }}</z-breadcrumb-item>
      </z-breadcrumb>
      <issue-actions
        :issue="issue"
        :repository="repository"
        :shortcode="$route.params.issueId"
        :isAutofixEnabled="isAutofixEnabled"
        :canCreateAutofix="canCreateAutofix"
        @ignoreIssues="ignoreIssues"
      ></issue-actions>
    </div>
    <div class="flex flex-col px-4 py-3 space-y-1">
      <div class="space-y-2" v-if="$fetchState.pending">
        <!-- Left Section -->
        <div class="w-3/5 h-10 rounded-md md:w-4/5 bg-ink-300 animate-pulse"></div>
        <div class="flex w-1/3 space-x-2">
          <div class="w-1/4 h-6 rounded-md bg-ink-300 animate-pulse"></div>
          <div class="w-1/4 h-6 rounded-md bg-ink-300 animate-pulse"></div>
          <div class="w-1/2 h-6 rounded-md bg-ink-300 animate-pulse"></div>
        </div>
      </div>
      <issue-details-header
        v-else
        v-bind="issue"
        :show-meta="true"
        :issue-priority="issuePriority"
        :can-edit-priority="canEditPriority"
        @priority-edited="editPriority"
      >
      </issue-details-header>
    </div>
    <div id="tabs" class="flex mt-3 border-b xl:col-span-2 border-ink-300">
      <div class="flex self-end px-4 space-x-4 overflow-auto flex-nowrap">
        <nuxt-link :to="getRoute('occurrences')">
          <z-tab
            :isActive="$route.path === getRoute('occurrences')"
            border-active-color="vanilla-400"
            class="flex items-center"
          >
            <span>Occurences</span>
            <z-tag
              v-if="issue.occurrenceCount"
              text-size="xs"
              spacing="px-2 py-1"
              class="leading-none"
              bgColor="ink-100"
              >{{ issue.occurrenceCount }}</z-tag
            >
          </z-tab>
        </nuxt-link>
        <nuxt-link :to="getRoute('ignore-rules')">
          <z-tab
            :isActive="$route.path === getRoute('ignore-rules')"
            border-active-color="vanilla-400"
            >Ignore rules</z-tab
          >
        </nuxt-link>
      </div>
    </div>
    <nuxt-child></nuxt-child>
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import {
  ZIcon,
  ZTag,
  ZBreadcrumb,
  ZBreadcrumbItem,
  ZTab,
  ZButton,
  ZMenu,
  ZMenuItem
} from '@deepsourcelabs/zeal'
import { IssueDetailsHeader, IssueActions } from '@/components/RepoIssues/index'

import IssueDetailMixin from '@/mixins/issueDetailMixin'
import RepoDetailMixin from '@/mixins/repoDetailMixin'

import { Context } from '@nuxt/types'
import { AppFeatures, RepoPerms, TeamPerms } from '~/types/permTypes'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { IssuePriority, IssuePriorityLevel } from '~/types/types'

@Component({
  components: {
    ZButton,
    ZIcon,
    ZTag,
    ZTab,
    ZBreadcrumb,
    ZBreadcrumbItem,
    ZMenu,
    ZMenuItem,
    IssueDetailsHeader,
    IssueActions
  },
  layout: 'repository',
  middleware: [
    function ({ redirect, route }: Context): void {
      if (route.name === 'provider-owner-repo-issue-issueId') {
        const { provider, owner, repo, issueId } = route.params
        if (!issueId) {
          return redirect(`/${provider}/${owner}/${repo}/issues`)
        }
        redirect(`/${provider}/${owner}/${repo}/issue/${issueId}/occurrences`)
      }
    }
  ]
})
export default class IssuePage extends mixins(IssueDetailMixin, RepoDetailMixin, RoleAccessMixin) {
  public issuePriority: IssuePriority | null = null

  async fetch(): Promise<void> {
    await this.fetchIssueData()
  }

  refetchIssueData(): void {
    const { issueId } = this.$route.params
    this.fetchIssueDetails({
      repositoryId: this.repository.id,
      shortcode: issueId,
      refetch: true
    })
  }

  mounted(): void {
    this.$socket.$on('repo-analysis-updated', this.refetchIssueData)
    this.$socket.$on('autofixrun-fixes-ready', this.refetchIssueData)
  }

  beforeDestroy(): void {
    this.$socket.$off('repo-analysis-updated', this.refetchIssueData)
    this.$socket.$off('autofixrun-fixes-ready', this.refetchIssueData)
  }

  get localKey(): string {
    const { owner, repo, issueId } = this.$route.params
    return `${owner}-${repo}-${issueId}-ignored-issues`
  }

  ignoreIssues(issueIds: string[]): void {
    let issuesIgnored =
      (this.$localStore.get('repo-issue-occurences', this.localKey) as string[]) ?? []
    issuesIgnored = issuesIgnored.concat(issueIds)

    this.$localStore.set('repo-issue-occurences', this.localKey, [...new Set(issuesIgnored)])
    this.$root.$emit('update-ignored-issues-occurences')
  }

  /**
   * Method to edit priority of the issue
   *
   * @param {string} priorityValue
   * @returns {Promise<void>}
   */
  async editPriority(priorityValue: string): Promise<void> {
    if (this.issuePriority && this.canEditPriority) {
      try {
        const { source } = this.issuePriority
        const objectId =
          source === IssuePriorityLevel.Owner ? this.repository.owner.id : this.repository.id
        const level = source || IssuePriorityLevel.Repository
        this.issuePriority = await this.updateIssuePriority({
          objectId,
          level,
          input: {
            issueShortcode: this.$route.params.issueId,
            objectId,
            level,
            issuePriorityType: priorityValue
          }
        })
        this.$toast.success('Priority updated successfully.')
      } catch (error) {
        this.$toast.danger(
          `An error occurred while updating priority for the issue '${this.$route.params.issueId}'. Please try again.`
        )
      }
    }
  }

  async fetchIssueData(): Promise<void> {
    const { repo, provider, owner, issueId } = this.$route.params
    if (!this.repository.id) {
      await this.fetchRepoDetails({
        name: repo,
        provider,
        owner
      })
    }

    await this.fetchIssueDetails({
      repositoryId: this.repository.id,
      shortcode: issueId
    })

    this.issuePriority = await this.fetchIssuePriority({
      objectId: this.repository.id,
      level: IssuePriorityLevel.Repository,
      shortcode: issueId
    })
  }

  getRoute(candidate: string): string {
    const { issueId } = this.$route.params
    return this.$generateRoute(['issue', issueId, candidate])
  }

  head(): Record<string, string> {
    return {
      title: this.issue.title
        ? `${this.$route.params.issueId} · ${this.issue.title}`
        : this.$route.params.issueId
    }
  }

  get routeToPrevious(): string {
    return this.$generateRoute(['issues'])
  }

  get canCreateAutofix(): boolean {
    return this.$gateKeeper.repo(RepoPerms.CREATE_AUTOFIXES, this.repoPerms.permission)
  }

  get canEditPriority(): boolean {
    if (this.issuePriority) {
      const { source } = this.issuePriority
      return source === IssuePriorityLevel.Owner
        ? this.$gateKeeper.team(TeamPerms.MANAGE_OWNER_ISSUE_PRIORITY, this.teamPerms.permission)
        : this.$gateKeeper.repo(RepoPerms.CHANGE_ISSUE_PRIORITY, this.repoPerms.permission)
    }
    return false
  }

  get isAutofixEnabled(): boolean {
    return this.$gateKeeper.provider(AppFeatures.AUTOFIX, this.$route.params.provider)
  }
}
</script>
