<template>
  <z-badge type="success" :is-dot="sortApplied ? true : false" size="md">
    <z-menu v-if="!sortApplied" direction="left" width="small" class="text-vanilla-100">
      <template v-slot:trigger="{ toggle }">
        <button
          type="button"
          class="inline-flex items-center px-4 py-2 space-x-2 text-sm leading-none rounded-sm shadow-sm outline-none bg-ink-300 hover:bg-ink-200 text-vanilla-100 focus:outline-none"
          @click="toggle"
        >
          <div class="flex items-center space-x-2">
            <z-icon icon="amount-down" size="small"></z-icon>
            <span class="hidden xl:inline-block">Sort</span>
          </div>
        </button>
      </template>
      <template slot="body" class="text-vanilla-200">
        <z-menu-item
          v-for="filter in sortFilters"
          v-bind:key="filter.name"
          :icon="filter.icon"
          @click="modelValue = filter.name"
        >
          {{ filter.label }}
        </z-menu-item>
      </template>
    </z-menu>

    <button
      v-else
      @click="modelValue = null"
      class="inline-flex items-center px-4 py-2 space-x-2 text-sm leading-none rounded-sm shadow-sm outline-none bg-ink-300 hover:bg-ink-200 text-vanilla-100 focus:outline-none"
    >
      <div class="flex items-center space-x-2">
        <span class="hidden xl:inline-block">Sort by {{ filterLabel.toLowerCase() }}</span>
        <z-icon icon="x" size="small"></z-icon>
      </div>
    </button>
  </z-badge>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ModelSync } from 'vue-property-decorator'
import { ZIcon, ZButton, ZInput, ZMenu, ZMenuItem, ZBadge } from '@deepsourcelabs/zeal'

export interface SortChoice {
  name: string
  label: string
  icon: string
}

@Component({
  components: {
    ZIcon,
    ZButton,
    ZInput,
    ZMenu,
    ZMenuItem,
    ZBadge
  }
})
export default class IssueSort extends Vue {
  @ModelSync('selectedSortFilter', 'updateSortFilter', { type: String })
  readonly modelValue: string

  private sortFilters: Record<string, SortChoice> = {
    'most-frequent': { label: 'Most frequent', icon: 'most-frequent', name: 'most-frequent' },
    'least-frequent': { label: 'Least frequent', icon: 'least-frequent', name: 'least-frequent' },
    'first-seen': { label: 'First seen', icon: 'first-seen', name: 'first-seen' },
    'last-seen': { label: 'Last seen', icon: 'last-seen', name: 'last-seen' }
  }

  get sortApplied(): boolean {
    return this.modelValue ? true : false
  }

  get filterLabel(): string {
    const filterItem = this.sortFilters[this.modelValue]
    if (!filterItem) {
      throw new Error(`Filter name not recognized: ${this.modelValue}`)
    }
    return filterItem.label
  }
}
</script>
