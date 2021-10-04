<template>
  <div class="relative top-0 flex flex-col p-4 space-y-0 xl:space-y-4">
    <div class="flex flex-col space-y-4">
      <issue-occurence-section @filtersUpdated="updateFilters"></issue-occurence-section>
      <div class="flex w-full">
        <!-- Issue list -->
        <div class="flex flex-col w-full space-y-4 xl:w-4/6">
          <div
            v-if="checkIssues.totalCount === 0"
            class="flex items-center justify-center w-full h-full"
          >
            No results
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
                :blobUrlRoot="repository.blobUrlRoot"
                :checkIssueIds="issuesIgnored"
                :canIgnoreIssues="canIgnoreIssues"
                @ignoreIssues="ignoreIssues"
              ></issue-editor>
            </div>
          </template>
        </div>
        <!-- Description -->
        <div v-if="$fetchState.pending" class="hidden w-2/6 px-4 xl:block">
          <div class="rounded-md h-44 bg-ink-300 animate-pulse"></div>
        </div>
        <issue-description v-else :description="issue.descriptionRendered"></issue-description>
      </div>
    </div>
    <z-pagination
      class="flex justify-center w-full xl:w-4/6"
      v-if="pageCount > 1"
      :totalPages="pageCount"
      :totalVisible="5"
      :page="currentPage"
      @selected="updatePage"
    ></z-pagination>
  </div>
</template>
<script lang="ts">
import { Component, Watch, Inject, mixins } from 'nuxt-property-decorator'
import { ZPagination } from '@deepsourcelabs/zeal'
import { IssueDescription, IssueOccurenceSection } from '@/components/RepoIssues/index'

import IssueDetailMixin from '@/mixins/issueDetailMixin'
import RepoDetailMixin from '@/mixins/repoDetailMixin'

import { CheckIssue, Maybe } from '@/types/types'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import { resolveNodes } from '~/utils/array'

const PAGE_SIZE = 5
const VISIBLE_PAGES = 3

@Component({
  components: {
    IssueOccurenceSection,
    IssueDescription,
    ZPagination
  },
  layout: 'repository'
})
export default class IssuesDetails extends mixins(
  IssueDetailMixin,
  RepoDetailMixin,
  RoleAccessMixin
) {
  private urlFilters: Record<string, string | (string | null)[]> = {}
  pageSize = PAGE_SIZE
  currentPage: Maybe<number> = 1
  issuesIgnored: Array<string> = []

  async fetch(): Promise<void> {
    await this.fetchIssueData()
    await this.fetchRepoPerms(this.baseRouteParams)

    this.updateFilters({
      sort: this.$route.query['sort-by'],
      q: this.$route.query.q
    })
    this.currentPage = this.$route.query.page ? Number(this.$route.query.page) : 1
  }

  mounted() {
    this.loadIgnoredIssues()
    this.$root.$on('update-ignored-issues-occurences', this.loadIgnoredIssues)
  }

  beforeDestroy() {
    this.$root.$off('update-ignored-issues-occurences', this.loadIgnoredIssues)
  }

  public async fetchChildren(): Promise<void> {
    await this.fetchIssueChildren({
      nodeId: this.issue.id,
      sort: this.urlFilters.sort,
      q: this.urlFilters.q,
      currentPageNumber: this.currentPage ? this.currentPage : 1,
      limit: this.pageSize
    })
  }

  @Watch('urlFilters', { deep: true })
  @Watch('currentPage')
  async filtersUpdated(): Promise<void> {
    const { sort, q } = this.urlFilters
    const query: Record<string, any> = {}

    if (this.currentPage) query.page = String(this.currentPage)
    if (sort) query['sort-by'] = sort
    if (q) query.q = q

    this.$router.replace({
      path: this.$route.path,
      query
    })
    if (this.issue.id) {
      await this.fetchChildren()
    }
  }

  public async updatePage(pageNumber: number): Promise<void> {
    this.currentPage = pageNumber
    await this.fetchChildren()
  }

  public updateFilters(payload: Record<string, string | (string | null)[]>): void {
    this.urlFilters = {
      ...this.urlFilters,
      ...payload
    }
  }

  @Inject('fetchIssueData')
  readonly fetchIssueData: () => Promise<void>

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
      return Math.ceil(this.checkIssues.totalCount / this.pageSize)
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
