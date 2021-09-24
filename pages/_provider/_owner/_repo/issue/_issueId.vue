<template>
  <div>
    <!-- Back to Issue list Page -->
    <div class="px-4 py-2 min-h-13 border-b border-ink-200 flex flex-row items-center">
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
        :canCreateAutofix="canCreateAutofix"
        @ignoreIssues="ignoreIssues"
      ></issue-actions>
    </div>
    <div class="flex flex-col space-y-1 px-4 py-3">
      <div class="space-y-2" v-if="$fetchState.pending">
        <!-- Left Section -->
        <div class="w-3/5 md:w-4/5 h-10 bg-ink-300 rounded-md animate-pulse"></div>
        <div class="w-1/3 flex space-x-2">
          <div class="h-6 w-1/4 bg-ink-300 rounded-md animate-pulse"></div>
          <div class="h-6 w-1/4 bg-ink-300 rounded-md animate-pulse"></div>
          <div class="h-6 w-1/2 bg-ink-300 rounded-md animate-pulse"></div>
        </div>
      </div>
      <issue-details-header v-else :showMeta="true" v-bind="issue"> </issue-details-header>
    </div>
    <div id="tabs" class="flex xl:col-span-2 border-b border-ink-300 mt-3">
      <div class="flex self-end px-4 space-x-4 overflow-auto flex-nowrap">
        <nuxt-link :to="getRoute('occurrences')">
          <z-tab
            :isActive="$route.path === getRoute('occurrences')"
            border-active-color="vanilla-400"
          >
            <span>Occurences</span>
            <z-tag
              v-if="issue.occurrenceCount"
              text-size="xxs"
              :spacing="String(issue.occurrenceCount).length === 1 ? 'px-0 py-0' : 'px-0.5'"
              bgColor="ink-100"
              class="leading-none h-4 items-center justify-center"
              :class="{
                'w-4': String(issue.occurrenceCount).length === 1,
                'w-6': String(issue.occurrenceCount).length === 2,
                'w-8': String(issue.occurrenceCount).length >= 3
              }"
              >{{ issue.occurrenceCount }}</z-tag
            >
          </z-tab>
        </nuxt-link>
        <nuxt-link :to="getRoute('ignore-rules')">
          <z-tab
            :isActive="$route.path === getRoute('ignore-rules')"
            border-active-color="vanilla-400"
            >Ignore Rules</z-tab
          >
        </nuxt-link>
      </div>
    </div>
    <nuxt-child></nuxt-child>
  </div>
</template>
<script lang="ts">
import { Component, Provide, mixins } from 'nuxt-property-decorator'
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
import { RepoPerms } from '~/types/permTypes'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

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

  @Provide()
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
}
</script>
