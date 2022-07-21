<template>
  <div class="flex flex-row-reverse w-full gap-2 xl:w-4/6 xl:flex-row">
    <!-- Sort menu -->
    <z-menu direction="right" width="x-small" class="text-vanilla-100">
      <template v-slot:trigger="{ toggle }">
        <z-button type="button" size="small" class="text-sm" buttonType="secondary" @click="toggle">
          <div v-if="!sortApplied" class="flex items-center space-x-2">
            <z-icon icon="amount-down" size="small"></z-icon>
            <span class="hidden xl:inline-block">Sort</span>
          </div>
          <div v-else class="flex items-center space-x-2">
            <span class="hidden xl:inline-block">Sorted by - {{ selectedFilter }}</span>
            <z-icon icon="x" size="small" @click="clearSort()"></z-icon>
          </div>
        </z-button>
      </template>
      <template slot="body" class="text-vanilla-200">
        <z-menu-item
          v-for="filter in sortFilters"
          v-bind:key="filter.name"
          :icon="filter.icon"
          @click="() => sortIssues(filter.name)"
        >
          {{ filter.label }}
        </z-menu-item>
      </template>
    </z-menu>
    <!-- Search -->
    <div class="flex-grow xl:min-w-80">
      <z-input
        v-model="searchIssue"
        size="small"
        class="text-sm"
        backgroundColor="ink-300"
        placeholder="Search occurrences in a file path"
        :showBorder="false"
        @debounceInput="searchIssueChildren"
      >
        <template slot="left">
          <div class="pl-1">
            <z-icon icon="search" size="small"></z-icon>
          </div>
        </template>
        <template slot="right">
          <z-icon
            v-show="searchIssue"
            icon="x"
            size="small"
            class="cursor-pointer"
            @click="clearSearch"
          />
        </template>
      </z-input>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, namespace } from 'nuxt-property-decorator'
import { ZIcon, ZInput, ZButton, ZMenu, ZMenuItem } from '@deepsourcelabs/zeal'
import IssueEditor from './IssueEditor.vue'

// types
import { RepositoryIssue } from '~/types/types'

// store
const issueStore = namespace('issue/detail')

@Component({
  components: {
    ZIcon,
    ZInput,
    ZButton,
    ZMenu,
    ZMenuItem,
    IssueEditor
  }
})
export default class IssueOccurrenceSection extends Vue {
  @issueStore.State
  issue!: RepositoryIssue

  public searchIssue: string | (string | null)[] = ''

  public selectedFilter = this.$route.query['sort']

  public sortFilters: Array<Record<string, string | boolean>> = [
    { label: 'First Seen', icon: 'first-seen', name: 'first-seen', isActive: false },
    { label: 'Last Seen', icon: 'last-seen', name: 'last-seen', isActive: true }
  ]

  mounted(): void {
    this.selectedFilter = this.$route.query['sort']
    this.searchIssue = this.$route.query['q']
  }

  get sortApplied(): boolean {
    return this.$route.query['sort'] ? true : false
  }

  public clearSearch() {
    this.searchIssue = ''
    this.$emit('filter-removed', 'q')
  }

  public clearSort(): void {
    this.$emit('filter-removed', 'sort')
  }

  public sortIssues(name: string): void {
    this.selectedFilter = name
    this.$emit('filters-updated', {
      sort: name
    })
  }

  public searchIssueChildren(): void {
    this.$emit('filters-updated', {
      q: this.searchIssue ? this.searchIssue : null
    })
  }
}
</script>
