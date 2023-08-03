<template>
  <div>
    <!-- Back to Issue list Page -->
    <div class="flex min-h-13 flex-row items-center border-b border-slate-400 px-4 py-2">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item class="text-vanilla-400">
          <nuxt-link :to="routeToPrevious">All issues</nuxt-link>
        </z-breadcrumb-item>
        <z-breadcrumb-item>{{ issue.shortcode }}</z-breadcrumb-item>
      </z-breadcrumb>
      <issue-actions
        :issue="issue"
        :shortcode="$route.params.issueId"
        :is-autofix-enabled="isAutofixEnabled"
        :issue-create-integrations="issueCreateIntegrations"
        :can-create-autofix="canCreateAutofix"
        @ignoreIssues="ignoreIssues"
      />
    </div>
    <div class="flex flex-col space-y-1 px-4 py-3">
      <div v-if="$fetchState.pending" class="space-y-2">
        <!-- Left Section -->
        <div class="h-10 w-3/5 animate-pulse rounded-md bg-ink-300 md:w-4/5"></div>
        <div class="flex w-1/3 space-x-2">
          <div class="h-6 w-1/4 animate-pulse rounded-md bg-ink-300"></div>
          <div class="h-6 w-1/4 animate-pulse rounded-md bg-ink-300"></div>
          <div class="h-6 w-1/2 animate-pulse rounded-md bg-ink-300"></div>
        </div>
      </div>
      <issue-details-header
        v-else
        v-bind="issue"
        :show-meta="true"
        :issue-priority="issuePriority"
        :can-edit-priority="canEditPriority"
        @priority-edited="editPriority"
      />
    </div>
    <div id="tabs" class="mt-3 flex border-b border-slate-400 xl:col-span-2">
      <div class="flex flex-nowrap space-x-4 self-end overflow-auto px-4">
        <nuxt-link :to="getRoute('occurrences')">
          <z-tab
            :is-active="$route.path === getRoute('occurrences')"
            border-active-color="vanilla-400"
            class="flex items-center"
          >
            <span>Occurrences</span>
            <z-tag
              v-if="issue.occurrenceCount"
              text-size="xs"
              spacing="px-2 py-1"
              class="leading-none"
              bg-color="ink-100"
              >{{ issue.occurrenceCount }}</z-tag
            >
          </z-tab>
        </nuxt-link>
        <nuxt-link :to="getRoute('ignore-rules')">
          <z-tab
            :is-active="$route.path === getRoute('ignore-rules')"
            border-active-color="vanilla-400"
            >Ignore rules</z-tab
          >
        </nuxt-link>
      </div>
    </div>
    <nuxt-child />
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { IssueDetailsHeader, IssueActions } from '@/components/RepoIssues/index'

import IssueDetailMixin from '@/mixins/issueDetailMixin'
import RepoDetailMixin from '@/mixins/repoDetailMixin'

import { Context } from '@nuxt/types'
import { AppFeatures, RepoPerms, TeamPerms } from '~/types/permTypes'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { IntegrationFeature, IssuePriority, IssuePriorityLevel } from '~/types/types'
import { IssuePriorityLevelVerbose } from '~/types/issuePriorityTypes'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

@Component({
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
export default class IssuePage extends mixins(
  OwnerDetailMixin,
  IssueDetailMixin,
  RepoDetailMixin,
  RoleAccessMixin
) {
  public issuePriority: IssuePriority | null = null
  public isJiraEnabled = false

  async fetch(): Promise<void> {
    await this.fetchIssueData()

    const { owner: login, provider } = this.$route.params
    if (this.$gateKeeper.repo(RepoPerms.CREATE_ISSUE_ON_INTEGRATION, this.repoPerms.permission)) {
      await this.fetchIntegrationForFeature({
        login,
        provider,
        feature: IntegrationFeature.FeatureIssue
      })
    }
  }

  get issueCreateIntegrations(): string[] {
    if (this.owner.installedIntegrations) {
      return this.owner.installedIntegrations
        .map((integration) => integration?.shortcode ?? '')
        .filter(Boolean)
    }

    return []
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
    this.$root.$emit('update-ignored-issues-occurrences')
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
        this.$toast.success(`Priority updated successfully in ${IssuePriorityLevelVerbose[level]}.`)
      } catch (error) {
        this.$toast.danger(
          `An error occurred while updating priority for the issue '${this.$route.params.issueId}'. Please try again.`
        )
      }
    }
  }

  async fetchIssueData(): Promise<void> {
    const { repo, provider, owner, issueId } = this.$route.params

    if (!issueId) this.$nuxt.error({ statusCode: 404 })

    if (!this.repository.id) {
      await this.fetchRepoDetails({
        name: repo,
        provider,
        owner
      })
    }

    const issue = await this.fetchIssueDetails({
      repositoryId: this.repository.id,
      shortcode: issueId
    })

    if (!issue || !Object.keys(issue).length) {
      this.$nuxt.error({
        statusCode: 404,
        message: `Issue "${issueId}" does not exist!`
      })
    }

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
