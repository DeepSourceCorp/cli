<template>
  <div class="flex flex-col space-y-4">
    <div class="flex gap-2 w-full xl:w-4/6 flex-row-reverse xl:flex-row">
      <!-- Sort menu -->
      <z-menu direction="right" width="x-small" class="text-vanilla-100">
        <z-button slot="trigger" buttonType="secondary" icon="amount-down" size="small">
          Sort
        </z-button>
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
      <div class="flex-grow xl:min-w-80 h-full">
        <z-input
          icon="search"
          backgroundColor="ink-300"
          size="small"
          placeholder="Search for issue title, file or issue code"
          v-model="searchValue"
          :showBorder="false"
          @debounceInput="debounceSearch"
        ></z-input>
      </div>
    </div>
    <div class="flex w-full">
      <!-- Issue list -->
      <div class="flex flex-col w-full xl:w-4/6 space-y-4">
        <issue-editor
          v-for="edge in edges"
          v-bind="edge.node"
          :key="edge.node.id"
          :checkId="checkId"
          :checkIssueIds="issuesIgnored"
          :shortcode="$route.params.issueId"
          :canIgnoreIssues="canIgnoreIssues"
          :blobUrlRoot="blobUrlRoot"
          @ignoreIssues="ignoreIssues"
        ></issue-editor>
        <z-pagination
          class="flex justify-center"
          v-if="pageCount > 1"
          :totalPages="pageCount"
          :totalVisible="totalVisible"
          :page="startPage"
          @selected="updatePage"
        ></z-pagination>
      </div>
      <!-- Description -->
      <issue-description :description="description"></issue-description>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZInput, ZButton, ZMenu, ZMenuItem, ZPagination } from '@deepsourcelabs/zeal'
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

  @Prop()
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

  private sortFilters: Array<Record<string, string | boolean>> = [
    { label: 'First Seen', icon: 'first-seen', name: 'first-seen' },
    { label: 'Last Seen', icon: 'last-seen', name: 'last-seen' }
  ]
}
</script>
