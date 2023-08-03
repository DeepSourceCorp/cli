<template>
  <z-badge type="success" :is-dot="sortApplied" size="md">
    <z-menu v-if="!sortApplied" direction="right" width="small" class="text-vanilla-100">
      <template #trigger="{ toggle }">
        <z-button
          :button-type="buttonType"
          size="small"
          label="Sort"
          icon="amount-down"
          class="text-vanilla-100 outline-none focus:outline-none"
          @click="toggle"
        />
      </template>

      <template #body>
        <z-menu-item
          v-for="filter in sortFilters"
          :key="filter.name"
          :icon="filter.icon"
          as="button"
          class="w-full"
          @click="modelValue = filter.name"
        >
          {{ filter.label }}
        </z-menu-item>
      </template>
    </z-menu>

    <z-button
      v-else
      :button-type="buttonType"
      size="small"
      class="text-vanilla-100 outline-none focus:outline-none"
      @click="modelValue = ''"
    >
      <div class="flex items-center gap-x-2">
        <span class="flex items-center gap-x-1">
          <z-icon :icon="filterIcon" />
          <span>Sort by {{ filterLabel.toLowerCase() }}</span>
        </span>
        <z-icon icon="x" size="small" />
      </div>
    </z-button>
  </z-badge>
</template>

<script lang="ts">
import { Vue, Component, ModelSync, Prop } from 'nuxt-property-decorator'
import { ReportSortT } from '~/types/reportTypes'

export interface SortChoice {
  name: string
  label: string
  icon: string
}

/**
 * Component to sort issues based on inc & dec priority.
 */
@Component({})
export default class PublicReportSort extends Vue {
  @ModelSync('selectedSortFilter', 'updateSortFilter', { type: String })
  readonly modelValue: ReportSortT

  @Prop({ default: 'secondary' })
  buttonType: string

  private sortFilters: Record<ReportSortT, SortChoice> = {
    'first-created': { label: 'First created', icon: 'first-seen', name: 'first-created' },
    'last-created': { label: 'Last created', icon: 'last-seen', name: 'last-created' }
  }

  get sortApplied(): boolean {
    return Boolean(this.modelValue)
  }

  get filterLabel(): string {
    const filterItem = this.sortFilters[this.modelValue]
    return filterItem.label
  }

  get filterIcon(): string {
    return this.sortFilters[this.modelValue]?.icon
  }
}
</script>
