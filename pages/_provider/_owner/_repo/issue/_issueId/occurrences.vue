<template>
  <div class="relative top-0 p-4 flex flex-col space-y-0 xl:space-y-4">
    <div class="flex flex-col space-y-4">
      <issue-occurence-section @filtersUpdated="updateFilters"></issue-occurence-section>
      <div class="flex w-full">
        <!-- Issue list -->
        <div class="flex flex-col w-full xl:w-4/6 space-y-4">
          <div
            v-if="checkIssues.totalCount === 0"
            class="h-full w-full flex items-center justify-center"
          >
            No results
          </div>
          <div v-for="(child, index) in this.checkIssues.edges" :key="index">
            <issue-editor
              v-bind="child.node"
              :blobUrlRoot="repository.blobUrlRoot"
              :checkIssueIds="issuesIgnored"
              :canIgnoreIssues="canIgnoreIssues"
              @ignoreIssues="ignoreIssues"
            ></issue-editor>
          </div>
        </div>
        <!-- Description -->
        <issue-description :description="issue.descriptionRendered"></issue-description>
      </div>
    </div>
    <z-pagination
      class="flex justify-center w-full xl:w-4/6"
      v-if="pageCount > 1"
      :totalPages="pageCount"
      :totalVisible="totalVisible"
      :page="currentPage"
      @selected="updatePage"
    ></z-pagination>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Watch, Inject, mixins, namespace } from 'nuxt-property-decorator'
import { ZPagination } from '@deepsourcelabs/zeal'
import { IssueDescription, IssueOccurenceSection } from '@/components/RepoIssues/index'

import IssueDetailMixin from '@/mixins/issueDetailMixin'
import RepoDetailMixin from '@/mixins/repoDetailMixin'

import { Maybe, Repository } from '@/types/types'
import RoleAccessMixin from '~/mixins/roleAccessMixin'

const PAGE_SIZE = 5
const VISIBLE_PAGES = 3

const repoStore = namespace('repository/detail')

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
  @repoStore.State
  repository!: Repository

  @Prop({ default: '' })
  link!: string

  private urlFilters: Record<string, string | (string | null)[]> = {}

  public loadingIssue = false

  public pageSize = PAGE_SIZE

  public currentPage: Maybe<number> = null

  public issuesIgnored: Array<string> = []

  @Inject('fetchIssueData')
  readonly fetchIssueData: () => Promise<void>

  mounted() {
    this.loadIgnoredIssues()
    this.$root.$on('update-ignored-issues-occurences', this.loadIgnoredIssues)
  }

  beforeDestroy() {
    this.$root.$off('update-ignored-issues-occurences', this.loadIgnoredIssues)
  }

  loadIgnoredIssues(): void {
    this.issuesIgnored =
      (this.$localStore.get('repo-issue-occurences', this.localKey) as string[]) ?? []
  }

  get canIgnoreIssues() {
    return this.repoPerms.canIgnoreIssues
  }

  get localKey(): string {
    const { owner, repo, issueId } = this.$route.params
    return `${owner}-${repo}-${issueId}-ignored-issues`
  }

  ignoreIssues(issueIds: string[]): void {
    this.issuesIgnored = [...new Set(this.issuesIgnored.concat(issueIds))]
    this.$localStore.set('repo-issue-occurences', this.localKey, this.issuesIgnored)
  }

  async fetch(): Promise<void> {
    this.loadingIssue = true

    await this.fetchIssueData()
    await this.fetchRepoPerms(this.baseRouteParams)

    this.updateFilters({
      sort: this.$route.query['sort-by'],
      q: this.$route.query.q
    })
    this.currentPage = this.$route.query.page ? Number(this.$route.query.page) : 1
    this.loadingIssue = false
  }

  get pageCount(): number {
    if (this.checkIssues && this.checkIssues.totalCount) {
      return Math.ceil(this.checkIssues.totalCount / this.pageSize)
    }
    return 0
  }

  get totalVisible(): number {
    return this.pageCount >= VISIBLE_PAGES ? VISIBLE_PAGES : this.pageCount
  }

  @Watch('urlFilters', { deep: true })
  @Watch('currentPage')
  async filtersUpdated(): Promise<void> {
    const { sort, q } = this.urlFilters
    const query: Record<string, any> = {}

    if (this.currentPage) query.page = String(this.currentPage)
    if (sort) query['sort-by'] = sort
    if (q) query.q = q

    this.$router.push({
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

  public async fetchChildren(): Promise<void> {
    await this.fetchIssueChildren({
      nodeId: this.issue.id,
      sort: this.urlFilters.sort,
      q: this.urlFilters.q,
      currentPageNumber: this.currentPage ? this.currentPage : 1,
      limit: this.pageSize
    })
  }

  public updateFilters(payload: Record<string, string | (string | null)[]>): void {
    this.urlFilters = {
      ...this.urlFilters,
      ...payload
    }
  }
}
</script>
