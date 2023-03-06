<template>
  <div class="flex flex-row-reverse w-full gap-2 xl:w-4/6 xl:flex-row">
    <!-- Sort menu mobile -->
    <z-menu direction="left" width="x-small" class="xl:hidden text-vanilla-100">
      <template #trigger="{ toggle }">
        <z-button
          v-if="!sortApplied"
          icon="amount-down"
          type="button"
          size="small"
          class="text-sm"
          button-type="secondary"
          @click="toggle"
        >
          Sort
        </z-button>
        <z-button
          v-else
          type="button"
          size="small"
          class="text-sm"
          button-type="secondary"
          @click="clearSort"
        >
          <div class="flex items-center gap-x-2">
            <span class="hidden xl:inline-block">Sorted by - {{ selectedFilter }}</span>
            <z-icon icon="x" />
          </div>
        </z-button>
      </template>
      <template #body class="text-vanilla-200">
        <z-menu-item
          v-for="filter in sortFilters"
          :key="filter.name"
          :icon="filter.icon"
          @click="sortIssues(filter.name)"
        >
          {{ filter.label }}
        </z-menu-item>
      </template>
    </z-menu>
    <!-- Sort menu desktop -->
    <z-menu direction="right" width="x-small" class="hidden xl:inline-block text-vanilla-100">
      <template #trigger="{ toggle }">
        <z-button
          v-if="!sortApplied"
          icon="amount-down"
          type="button"
          size="small"
          class="text-sm"
          button-type="secondary"
          @click="toggle"
        >
          Sort
        </z-button>
        <z-button
          v-else
          type="button"
          size="small"
          class="text-sm"
          button-type="secondary"
          @click="clearSort"
        >
          <div class="flex items-center gap-x-2">
            <span class="inline-block">Sorted by - {{ selectedFilter }}</span>
            <z-icon icon="x" />
          </div>
        </z-button>
      </template>
      <template #body class="text-vanilla-200">
        <z-menu-item
          v-for="filter in sortFilters"
          :key="filter.name"
          :icon="filter.icon"
          @click="sortIssues(filter.name)"
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
        background-color="ink-300"
        placeholder="Search occurrences in a file path"
        :show-border="false"
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
import { ZIcon, ZInput, ZButton, ZMenu, ZMenuItem } from '@deepsource/zeal'
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
