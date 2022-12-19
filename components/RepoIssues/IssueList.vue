<template>
  <div class="flex flex-col space-y-4">
    <div class="flex flex-row-reverse w-full gap-2 xl:flex-row">
      <!-- Sort menu -->
      <z-menu direction="right" width="x-small" class="text-vanilla-100">
        <template v-slot:trigger="{ toggle }">
          <z-button
            type="button"
            buttonType="secondary"
            icon="amount-down"
            size="small"
            @click="toggle"
          >
            Sort
          </z-button>
        </template>
        <template slot="body" class="text-vanilla-200">
          <z-menu-item
            v-for="filter in sortFilters"
            @click="() => updateSort(filter.name)"
            :key="filter.name"
            :icon="filter.icon"
            direction="left"
          >
            {{ filter.label }}
          </z-menu-item>
        </template>
      </z-menu>
      <!-- Search -->
      <div class="flex-grow h-full xl:min-w-80">
        <z-input
          background-color="ink-300"
          size="small"
          placeholder="Search for issue title, file or issue code"
          v-model="searchValue"
          :show-border="false"
          @debounceInput="debounceSearch"
        >
          <template slot="left">
            <z-icon class="flex-shrink-0 p-px" icon="search" size="small"></z-icon>
          </template>
        </z-input>
      </div>
    </div>

    <!-- Issue list -->
    <div v-if="edges.length" class="flex flex-col gap-y-3.5">
      <issue-editor
        v-for="edge in edges"
        v-bind="edge.node"
        :key="edge.node.id"
        :check-id="checkId"
        :check-issue-ids="issuesIgnored"
        :shortcode="$route.params.issueId"
        :can-ignore-issues="canIgnoreIssues"
        :blob-url-root="blobUrlRoot"
        @ignoreIssues="ignoreIssues"
      />
      <z-pagination
        class="flex justify-center"
        v-if="pageCount > 1"
        :totalPages="pageCount"
        :totalVisible="5"
        :page="startPage"
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
import { ZIcon, ZInput, ZButton, ZMenu, ZMenuItem, ZPagination, ZAccordion } from '@deepsource/zeal'
import IssueDescription from './IssueDescription.vue'
import IssueEditor from './IssueEditor.vue'
import { CheckIssueEdge } from '~/types/types'

const VISIBLE_PAGES = 5

@Component({
  components: {
    ZIcon,
    ZInput,
    ZButton,
    ZMenu,
    ZMenuItem,
    IssueDescription,
    IssueEditor,
    ZPagination,
    ZAccordion
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
  edges: Array<CheckIssueEdge>

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

  private sortFilters: Array<Record<string, string | boolean>> = [
    { label: 'First Seen', icon: 'first-seen', name: 'first-seen' },
    { label: 'Last Seen', icon: 'last-seen', name: 'last-seen' }
  ]
}
</script>
