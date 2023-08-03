<template>
  <div class="flex flex-col gap-y-4 p-4">
    <issue-occurrence-section
      @filters-updated="triggerFilterUpdate"
      @filter-removed="removeFilter"
    />
    <div class="grid grid-cols-12">
      <!-- Issue list -->
      <div class="col-span-full flex flex-col gap-y-4 lg:col-span-8">
        <div
          v-if="checkIssues.totalCount === 0"
          class="flex h-full w-full items-center justify-center"
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
            class="h-36 w-full animate-pulse rounded-md bg-ink-300"
          ></div>
        </template>
        <template v-else>
          <div v-for="(child, index) in issuesInCheck" :key="index">
            <issue-editor
              v-bind="child"
              :blob-url-root="repository.blobUrlRoot"
              :check-issue-ids="issuesIgnored"
              :can-ignore-issues="canIgnoreIssues"
              :snippets-fetch-errored="snippetsFetchErrored"
              :snippets-loading="snippetsLoading"
              :is-subrepo="isSubrepo"
              :repo-path="repoPath"
              @ignoreIssues="ignoreIssues"
            />
          </div>
        </template>
        <z-pagination
          v-if="pageCount > 1"
          class="flex w-full justify-center"
          :total-pages="pageCount"
          :total-visible="5"
          :page="currentPage"
          @selected="updatePage"
        />
      </div>
      <!-- Description -->
      <div v-if="$fetchState.pending" class="col-span-4 hidden px-4 lg:block">
        <div class="h-44 animate-pulse rounded-md bg-ink-300"></div>
      </div>
      <issue-description v-else :description="issue.descriptionRendered" class="col-span-4" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import ContextMixin from '~/mixins/contextMixin'
import IssueDetailMixin from '~/mixins/issueDetailMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import RoleAccessMixin from '~/mixins/roleAccessMixin'
import RouteQueryMixin from '~/mixins/routeQueryMixin'

import { CheckIssue, RepositoryKindChoices } from '~/types/types'
import { resolveNodes } from '~/utils/array'
import { AnalysisRequestBodyT, fetchSnippets } from '~/utils/runner'
import { makeSafeNumber } from '~/utils/string'

const PAGE_SIZE = 5
const VISIBLE_PAGES = 3

@Component({
  layout: 'repository',
  scrollToTop: true
})
export default class IssuesDetails extends mixins(
  ContextMixin,
  IssueDetailMixin,
  RepoDetailMixin,
  RoleAccessMixin,
  RouteQueryMixin
) {
  issuesIgnored: string[] = []

  codeSnippets = {} as Record<string, string>

  snippetsLoading = false
  snippetsFetchErrored = false

  get currentPage(): number {
    return makeSafeNumber(this.queryParams.page as string, 1)
  }

  async fetch(): Promise<void> {
    if (!Object.keys(this.context).length) {
      await this.fetchContext()
    }

    await this.fetchIssueData()

    try {
      await this.fetchChildren()
    } catch (err) {
      const typedError = err as Error
      const errMsg = `${typedError.message.replace('GraphQL error: ', '')}.` as `${string}.`

      this.$logErrorAndToast(typedError, errMsg)
    }

    // Fetch issue occurrence code snippets if in Runner context
    // The use case here is that we need not wait till the source code snippets fetch to be resolved
    // The issue titles and other information is fetched; hence it can be displayed in the UI
    // Skeleton loaders show up just in place of the code snippets until the fetch is done
    this.fetchRunnerCodeSnippets()

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
      limit: PAGE_SIZE,
      isRunner: this.context.isRunner as boolean
    })
  }

  public async updatePage(pageNumber: number): Promise<void> {
    this.addFilters({ page: pageNumber })
    await this.fetchChildren()
  }

  async fetchIssueData(): Promise<void> {
    const { repo, provider, owner, issueId } = this.$route.params

    if (!issueId) this.$nuxt.error({ statusCode: 404 })

    if (!this.repository.id) {
      await this.fetchBasicRepoDetails({
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
    const resolvedCheckIssues = resolveNodes(this.checkIssues)

    if (this.context.isRunner) {
      resolvedCheckIssues.forEach((checkIssue) => {
        checkIssue.sourceCodeMarkup = this.codeSnippets[checkIssue.sourceCodeIdentifier as string]
      })
    }

    return resolvedCheckIssues
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

  get isSubrepo(): boolean {
    return this.repository.kind === RepositoryKindChoices.Subrepo
  }

  get repoPath(): string {
    return this.repository.path ?? ''
  }

  // Fetch issue occurrence code snippets if in Runner context
  async fetchRunnerCodeSnippets() {
    if (this.context.isRunner) {
      this.snippetsLoading = true

      const sourceCodeIdentifierEntries = this.issuesInCheck.map(
        ({ sourceCodeIdentifier }) => sourceCodeIdentifier
      ) as string[]

      const endpointUrl = this.runnerInfo.codeSnippetUrl

      const requestBody: AnalysisRequestBodyT = {
        snippet_ids: sourceCodeIdentifierEntries
      }

      try {
        const parsedResponse: Record<string, string> = await fetchSnippets(endpointUrl, requestBody)
        this.codeSnippets = parsedResponse
      } catch (_) {
        this.snippetsFetchErrored = true
      } finally {
        this.snippetsLoading = false
      }
    }
  }
}
</script>
