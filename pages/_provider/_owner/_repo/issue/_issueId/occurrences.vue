<template>
  <div class="flex flex-col p-4 gap-y-4">
    <issue-occurrence-section
      @filters-updated="triggerFilterUpdate"
      @filter-removed="removeFilter"
    ></issue-occurrence-section>
    <div class="grid grid-cols-12">
      <!-- Issue list -->
      <div class="flex flex-col col-span-full lg:col-span-8 gap-y-4">
        <div
          v-if="checkIssues.totalCount === 0"
          class="flex items-center justify-center w-full h-full"
        >
          <lazy-empty-state
            title="No results found"
            :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
            :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
            subtitle="That’s all we can say right now."
          />
        </div>
        <template v-if="$fetchState.pending">
          <div
            v-for="ii in 3"
            :key="ii"
            class="w-full rounded-md h-36 bg-ink-300 animate-pulse"
          ></div>
        </template>
        <template v-else>
          <div v-for="(child, index) in issuesInCheck" :key="index">
            <issue-editor
              v-bind="child"
              :blob-url-root="repository.blobUrlRoot"
              :check-issue-ids="issuesIgnored"
              :can-ignore-issues="canIgnoreIssues"
              @ignoreIssues="ignoreIssues"
            ></issue-editor>
          </div>
        </template>
        <z-pagination
          class="flex justify-center w-full"
          v-if="pageCount > 1"
          :total-pages="pageCount"
          :total-visible="5"
          :page="currentPage"
          @selected="updatePage"
        />
      </div>
      <!-- Description -->
      <div v-if="$fetchState.pending" class="hidden col-span-4 px-4 lg:block">
        <div class="rounded-md h-44 bg-ink-300 animate-pulse"></div>
      </div>
      <issue-description
        v-else
        :description="issue.descriptionRendered"
        class="col-span-4"
      ></issue-description>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZPagination } from '@deepsource/zeal'
import { IssueDescription, IssueOccurrenceSection } from '@/components/RepoIssues/index'

import IssueDetailMixin from '@/mixins/issueDetailMixin'
import RepoDetailMixin from '@/mixins/repoDetailMixin'

import { CheckIssue } from '@/types/types'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { resolveNodes } from '~/utils/array'
import RouteQueryMixin from '~/mixins/routeQueryMixin'
import { makeSafeNumber } from '~/utils/string'

const PAGE_SIZE = 5
const VISIBLE_PAGES = 3

@Component({
  components: {
    IssueOccurrenceSection,
    IssueDescription,
    ZPagination
  },
  layout: 'repository',
  scrollToTop: true
})
export default class IssuesDetails extends mixins(
  IssueDetailMixin,
  RepoDetailMixin,
  RoleAccessMixin,
  RouteQueryMixin
) {
  issuesIgnored: Array<string> = []

  created() {
    this.queryParams = Object.assign(this.queryParams, this.$route.query)
  }

  get currentPage(): number {
    return makeSafeNumber(this.queryParams.page as string, 1)
  }

  async fetch(): Promise<void> {
    await this.fetchIssueData()
    await this.fetchChildren()
    await this.fetchRepoPerms(this.baseRouteParams)
  }

  mounted() {
    this.loadIgnoredIssues()
    this.$root.$on('update-ignored-issues-occurrences', this.loadIgnoredIssues)
  }

  beforeDestroy() {
    this.$root.$off('update-ignored-issues-occurrences', this.loadIgnoredIssues)
  }

  public async fetchChildren(): Promise<void> {
    await this.fetchIssueChildren({
      nodeId: this.issue.id,
      sort: this.queryParams.sort as string,
      q: this.queryParams.q as string,
      currentPageNumber: this.queryParams.page ? Number(this.queryParams.page) : 1,
      limit: PAGE_SIZE
    })
  }

  public async updatePage(pageNumber: number): Promise<void> {
    this.addFilters({ page: pageNumber })
    await this.fetchChildren()
  }

  async fetchIssueData(): Promise<void> {
    const { repo, provider, owner, issueId } = this.$route.params
    if (!this.repository.id) {
      await this.fetchBasicRepoDetails({
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

  triggerFilterUpdate(params: Record<string, string | number | null>) {
    // reset current page to 1 whenever any filter applied
    this.addFilters({
      ...params,
      page: 1
    })
  }

  loadIgnoredIssues(): void {
    this.issuesIgnored =
      (this.$localStore.get('repo-issue-occurences', this.localKey) as string[]) ?? []
  }

  ignoreIssues(issueIds: string[]): void {
    this.issuesIgnored = [...new Set(this.issuesIgnored.concat(issueIds))]
    this.$localStore.set('repo-issue-occurences', this.localKey, this.issuesIgnored)
  }

  get pageCount(): number {
    if (this.checkIssues && this.checkIssues.totalCount) {
      return Math.ceil(this.checkIssues.totalCount / PAGE_SIZE)
    }
    return 0
  }

  get issuesInCheck(): CheckIssue[] {
    return resolveNodes(this.checkIssues) as CheckIssue[]
  }

  get canIgnoreIssues(): boolean {
    return this.repoPerms.canIgnoreIssues
  }

  get localKey(): string {
    const { owner, repo, issueId } = this.$route.params
    return `${owner}-${repo}-${issueId}-ignored-issues`
  }

  get totalVisible(): number {
    return this.pageCount >= VISIBLE_PAGES ? VISIBLE_PAGES : this.pageCount
  }
}
</script>
