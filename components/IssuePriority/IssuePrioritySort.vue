<template>
  <z-badge type="success" :is-dot="sortApplied" size="md">
    <z-menu v-if="!sortApplied" direction="right" width="small" class="text-vanilla-100">
      <template #trigger="{ toggle }">
        <z-button
          size="small"
          label="Sort"
          icon="amount-down"
          class="outline-none text-vanilla-100 focus:outline-none"
          :class="buttonBackground"
          @click="toggle"
        />
      </template>
      <template slot="body" class="text-vanilla-200">
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
      size="small"
      class="outline-none text-vanilla-100 focus:outline-none"
      :class="buttonBackground"
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
import { ZIcon, ZButton, ZMenu, ZMenuItem, ZBadge } from '@deepsource/zeal'

export interface SortChoice {
  name: string
  label: string
  icon: string
}

/**
 * Component to sort issues based on inc & dec priority.
 */
@Component({
  components: {
    ZIcon,
    ZButton,
    ZMenu,
    ZMenuItem,
    ZBadge
  }
})
export default class IssuePrioritySort extends Vue {
  @ModelSync('selectedSortFilter', 'updateSortFilter', { type: String })
  readonly modelValue: string

  @Prop({ default: 'bg-ink-300 hover:bg-ink-200' })
  buttonBackground: string

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
