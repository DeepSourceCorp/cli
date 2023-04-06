<template>
  <z-badge :is-dot="filterApplied" type="success" size="md">
    <z-menu v-if="!filterApplied" direction="right" width="small" class="text-vanilla-100">
      <template #trigger="{ toggle }">
        <z-button
          icon="filter"
          icon-color="vanilla-400"
          size="small"
          button-type="secondary"
          @click="toggle"
        >
          <span class="hidden text-vanilla-100 md:inline">Filter</span>
        </z-button>
      </template>
      <template #body>
        <z-menu-item
          v-for="filter in issueCategoryOptions"
          :key="filter.shortcode"
          :icon="filter.icon"
          @click="modelValue = filter.shortcode"
        >
          {{ filter.name }}
        </z-menu-item>
      </template>
    </z-menu>

    <z-button
      v-else
      :icon="modelValue"
      size="small"
      button-type="secondary"
      @click="$emit('reset')"
    >
      <span class="hidden md:inline-block">{{ selectedFilterLabel }}</span>
      <z-icon icon="x" size="small" />
    </z-button>
  </z-badge>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ModelSync } from 'vue-property-decorator'
import { ZIcon, ZButton, ZInput, ZMenu, ZMenuItem, ZBadge } from '@deepsource/zeal'
import { IssueTypeOptions, IssueFilterChoice } from '~/types/issues'

/**
 * Issue category filter
 */
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
export default class IssueCategoryFilter extends Vue {
  @ModelSync('selectedCategory', 'updateCategory', { type: String })
  readonly modelValue: string

  readonly categoryLabelMap: Record<string, string> = {
    [IssueTypeOptions.ANTI_PATTERN]: 'Anti-pattern',
    [IssueTypeOptions.BUG_RISK]: 'Bug risk',
    [IssueTypeOptions.PERFORMANCE]: 'Performance',
    [IssueTypeOptions.SECURITY]: 'Security',
    [IssueTypeOptions.COVERAGE]: 'Coverage',
    [IssueTypeOptions.TYPECHECK]: 'Type check',
    [IssueTypeOptions.STYLE]: 'Style',
    [IssueTypeOptions.DOCUMENTATION]: 'Documentation'
  }

  get issueCategoryOptions(): IssueFilterChoice[] {
    return Object.keys(this.categoryLabelMap).map((categoryKey) => {
      return {
        name: this.categoryLabelMap[categoryKey],
        shortcode: categoryKey,
        icon: categoryKey
      }
    })
  }

  get selectedFilterLabel(): string {
    const filterLabel = this.categoryLabelMap[this.modelValue]
    if (!filterLabel) {
      throw new Error(`Filter name not recognized: ${this.modelValue}`)
    }
    return filterLabel
  }

  get filterApplied(): boolean {
    return Boolean(this.modelValue)
  }
}
</script>
