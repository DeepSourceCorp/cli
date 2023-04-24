<template>
  <z-badge type="success" :is-dot="sortApplied ? true : false" size="md">
    <z-menu v-if="!sortApplied" direction="right" width="small" class="text-vanilla-100">
      <template #trigger="{ toggle }">
        <z-button
          icon="amount-down"
          icon-color="vanilla-400"
          size="small"
          button-type="secondary"
          @click="toggle"
        >
          <span class="hidden md:inline text-vanilla-100">Sort</span>
        </z-button>
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
      size="small"
      button-type="secondary"
      :icon="filterIcon"
      @click="$emit('reset')"
    >
      <span class="hidden md:inline-block">Sort by {{ filterLabel.toLowerCase() }}</span>
      <z-icon icon="x" size="small" />
    </z-button>
  </z-badge>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ModelSync } from 'vue-property-decorator'
import { ZIcon, ZButton, ZInput, ZMenu, ZMenuItem, ZBadge } from '@deepsource/zeal'

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

  @Prop({ default: true })
  readonly showSeenOptions: string

  get sortFilters(): Record<string, SortChoice> {
    const frequencyOpts = {
      'most-frequent': { label: 'Most frequent', icon: 'most-frequent', name: 'most-frequent' },
      'least-frequent': { label: 'Least frequent', icon: 'least-frequent', name: 'least-frequent' }
    }

    const seenOpts = {
      'first-seen': { label: 'First seen', icon: 'first-seen', name: 'first-seen' },
      'last-seen': { label: 'Last seen', icon: 'last-seen', name: 'last-seen' }
    }

    return this.showSeenOptions ? { ...frequencyOpts, ...seenOpts } : frequencyOpts
  }

  get sortApplied(): boolean {
    return Boolean(this.modelValue)
  }

  get filterLabel(): string {
    const filterItem = this.sortFilters[this.modelValue]
    if (!filterItem) {
      throw new Error(`Filter name not recognized: ${this.modelValue}`)
    }
    return filterItem.label
  }

  get filterIcon(): string {
    const filterItem = this.sortFilters[this.modelValue]
    if (!filterItem) {
      throw new Error(`Filter name not recognized: ${this.modelValue}`)
    }
    return filterItem.icon
  }
}
</script>
