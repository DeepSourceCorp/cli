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
          <z-icon :icon="filterIcon" /> <span>Priority</span>
        </span>
        <z-icon icon="x" size="small" /></div
    ></z-button>
  </z-badge>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ModelSync, Prop } from 'vue-property-decorator'

export interface SortChoice {
  name: string
  label: string
  icon: string
}

/**
 * Component to sort issues based on inc & dec priority.
 */
@Component({})
export default class IssuePrioritySort extends Vue {
  @ModelSync('selectedSortFilter', 'updateSortFilter', { type: String })
  readonly modelValue: string

  @Prop({ default: 'secondary' })
  buttonType: string

  private sortFilters: Record<string, SortChoice> = {
    'increasing-priority': {
      label: 'Increasing priority',
      icon: 'chevrons-up',
      name: 'increasing-priority'
    },
    'decreasing-priority': {
      label: 'Decreasing priority',
      icon: 'chevrons-down',
      name: 'decreasing-priority'
    }
  }

  get sortApplied(): boolean {
    return Boolean(this.modelValue)
  }

  get filterIcon(): string {
    return this.sortFilters[this.modelValue]?.icon
  }
}
</script>
