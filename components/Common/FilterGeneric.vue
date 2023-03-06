<template>
  <z-badge type="success" :is-dot="filterApplied" :size="badgeSize">
    <slot :filter-applied="filterApplied" :filter-label="filterLabel" :filter-icon="filterIcon">
    </slot>
  </z-badge>
</template>

<script lang="ts">
import { Vue, Component, ModelSync, Prop } from 'nuxt-property-decorator'
import { ZBadge } from '@deepsource/zeal'

export interface FilterChoice {
  name: string
  label: string
  icon: string
}

/**
 * Common filter component to filter items.
 */
@Component({
  components: {
    ZBadge
  }
})
export default class FilterGeneric extends Vue {
  @ModelSync('selectedFilter', 'updateFilter', { type: String })
  readonly modelValue: string

  @Prop({ default: 'md' })
  badgeSize: string

  @Prop({ required: true })
  filters: Record<string, FilterChoice>

  get filterApplied(): boolean {
    return Boolean(this.filters[this.modelValue])
  }

  get filterLabel(): string {
    const filterItem = this.filters[this.modelValue]
    return filterItem?.label ?? ''
  }

  get filterIcon(): string {
    return this.filters[this.modelValue]?.icon ?? ''
  }
}
</script>
