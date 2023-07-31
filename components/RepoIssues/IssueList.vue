<template>
  <div class="flex flex-col space-y-4">
    <div class="flex w-full flex-row-reverse gap-2 xl:flex-row">
      <!-- Sort menu mobile -->
      <z-menu direction="left" width="x-small" class="text-vanilla-100 xl:hidden">
        <template #trigger="{ toggle }">
          <z-button
            type="button"
            button-type="secondary"
            icon="amount-down"
            size="small"
            @click="toggle"
          >
            Sort
          </z-button>
        </template>
        <template #body>
          <z-menu-item
            v-for="filter in sortFilters"
            :key="filter.name"
            :icon="filter.icon"
            direction="left"
            @click="() => updateSort(filter.name)"
          >
            {{ filter.label }}
          </z-menu-item>
        </template>
      </z-menu>

      <!-- Sort menu desktop -->
      <z-menu width="x-small" class="hidden text-vanilla-100 xl:inline-block">
        <template #trigger="{ toggle }">
          <z-button
            type="button"
            button-type="secondary"
            icon="amount-down"
            size="small"
            @click="toggle"
          >
            Sort
          </z-button>
        </template>
        <template #body>
          <z-menu-item
            v-for="filter in sortFilters"
            :key="filter.name"
            :icon="filter.icon"
            direction="left"
            @click="() => updateSort(filter.name)"
          >
            {{ filter.label }}
          </z-menu-item>
        </template>
      </z-menu>
      <!-- Search -->
      <div class="h-full flex-grow xl:min-w-80">
        <z-input
          v-model="searchValue"
          :show-border="false"
          background-color="ink-300"
          size="small"
          placeholder="Search for issue title, file or issue code"
          @debounceInput="debounceSearch"
        >
          <template #left>
            <z-icon class="flex-shrink-0 p-px" icon="search" size="small" />
          </template>
        </z-input>
      </div>
    </div>

    <!-- Issue list -->
    <div v-if="issueOccurrences && issueOccurrences.length" class="flex flex-col gap-y-3.5">
      <issue-editor
        v-for="issueOccurrence in issueOccurrences"
        v-bind="issueOccurrence"
        :key="issueOccurrence.id"
        :blob-url-root="blobUrlRoot"
        :can-ignore-issues="canIgnoreIssues"
        :check-id="checkId"
        :check-issue-ids="issuesIgnored"
        :shortcode="$route.params.issueId"
        :snippets-fetch-errored="snippetsFetchErrored"
        :snippets-loading="snippetsLoading"
        @ignoreIssues="ignoreIssues"
      />
      <z-pagination
        v-if="pageCount > 1"
        :total-pages="pageCount"
        :total-visible="5"
        :page="startPage"
        class="flex justify-center"
        @selected="updatePage"
      />
    </div>
    <lazy-empty-state
      v-else
      :title="emptyStateTitle"
      :subtitle="emptyStateSubtitle"
      :png-image-path="emptyStateImagePaths.png"
      :webp-image-path="emptyStateImagePaths.webp"
      :show-border="true"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZInput, ZButton, ZMenu, ZMenuItem, ZPagination } from '@deepsource/zeal'

import { CheckIssue } from '~/types/types'
import { RunDetailMutations } from '~/store/run/detail'

const VISIBLE_PAGES = 5

@Component({
  components: {
    ZIcon,
    ZInput,
    ZButton,
    ZMenu,
    ZMenuItem,
    ZPagination
  }
})
export default class IssueList extends Vue {
  @Prop()
  totalCount: number

  @Prop()
  pageSize: number

  @Prop()
  startPage: number

  @Prop()
  description: string

  @Prop()
  searchValue: string

  @Prop()
  blobUrlRoot: string

  @Prop()
  checkId: string

  @Prop()
  canIgnoreIssues: boolean

  @Prop({ required: true })
  issueOccurrences: CheckIssue[]

  @Prop({ required: true })
  issueIndex: number

  @Prop({ default: false })
  snippetsLoading: boolean

  @Prop({ default: false })
  snippetsFetchErrored: boolean

  issuesIgnored: string[] = []

  mounted() {
    this.loadIgnoredIssues()
    this.$root.$on('update-ignored-issues-checks', this.loadIgnoredIssues)
  }

  beforeDestroy() {
    this.$root.$off('update-ignored-issues-checks', this.loadIgnoredIssues)
  }

  loadIgnoredIssues(): void {
    this.issuesIgnored = (this.$localStore.get('check-issues', this.localKey) as string[]) ?? []
  }

  get localKey(): string {
    const { owner, repo, issueId } = this.$route.params
    return `${owner}-${repo}-${this.checkId}-${issueId}-ignored-issues`
  }

  ignoreIssues(issueIds: string[]): void {
    this.issuesIgnored = [...new Set(this.issuesIgnored.concat(issueIds))]
    this.$localStore.set('check-issues', this.localKey, this.issuesIgnored)

    const { analyzer, runId, issueId } = this.$route.params

    const newPageRefetchStatus = {
      issueOccurrences: {
        status: true,
        issueId, // Specify the `issueId` so that the re-fetch happens on visiting the issue occurrences page with a matching `issueId`
        page: this.$route.query.page ? Number(this.$route.query.page) : 1
      },
      runs: { status: true },
      runDetail: {
        status: true,
        analyzer,
        runId,
        pageOffset: Math.floor(this.issueIndex / 10) * 10 // Specify the page offset so that the re-fetch happens on visiting the page the issue resided
      }
    }

    this.$store.commit(
      `run/detail/${RunDetailMutations.SET_PAGE_REFETCH_STATUS}`,
      newPageRefetchStatus
    )
  }

  debounceSearch(value: string): void {
    this.$emit('search', value)
  }

  updateSort(value: string): void {
    this.$emit('sort', value)
  }

  updatePage(page: number): void {
    this.$emit('page', page)
  }

  get pageCount(): number {
    return Math.ceil(this.totalCount / this.pageSize)
  }

  get totalVisible(): number {
    return this.pageCount >= VISIBLE_PAGES ? VISIBLE_PAGES : this.pageCount
  }

  get emptyStateTitle() {
    return this.searchValue
      ? `No results found for '${this.searchValue}'`
      : 'No more occurrences of this issue'
  }

  get emptyStateSubtitle() {
    return this.searchValue ? 'Please try changing your search query' : 'Give yourself a cookie.'
  }

  get emptyStateImagePaths() {
    return {
      png: this.searchValue
        ? require('~/assets/images/ui-states/directory/empty-search.gif')
        : require('~/assets/images/ui-states/issues/no-issues-found-static-140px.png'),
      webp: this.searchValue
        ? require('~/assets/images/ui-states/directory/empty-search.webp')
        : require('~/assets/images/ui-states/issues/no-issues-found-static-140px.webp')
    }
  }

  private sortFilters: Record<string, string | boolean>[] = [
    { label: 'First Seen', icon: 'first-seen', name: 'first-seen' },
    { label: 'Last Seen', icon: 'last-seen', name: 'last-seen' }
  ]
}
</script>
