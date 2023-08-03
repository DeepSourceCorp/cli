<template>
  <filter-generic v-model="coverageSortFilter" :filters="coverageFilters" badge-size="sm">
    <template #default="{ filterApplied, filterLabel, filterIcon }">
      <z-button
        button-type="ghost"
        size="x-small"
        :color="filterApplied ? 'vanilla-100' : 'vanilla-400'"
        :class="{ 'bg-ink-200 hover:bg-ink-100': filterApplied }"
        @click="coverageSortFilter = nextSort"
      >
        <div class="flex items-center gap-x-2 font-semibold">
          <span class="uppercase">{{ filterApplied ? filterLabel : defaultLabel }}</span>
          <z-icon :icon="filterApplied ? filterIcon : 'arrow-up-down'" />
        </div>
      </z-button>
    </template>
  </filter-generic>
</template>

<script lang="ts">
import { Vue, Component, ModelSync, Prop } from 'nuxt-property-decorator'

import FilterGeneric from '~/components/Common/FilterGeneric.vue'

import { FilterChoice } from '~/components/Common/FilterGeneric.vue'
import { CodeCoverageT, CoverageSortT } from '~/types/reportTypes'

/**
 * Sort component for code coverage report
 */
@Component({
  components: {
    FilterGeneric
  }
})
export default class CodeCoverageSort extends Vue {
  @ModelSync('selectedCoverageSortFilter', 'updateCoverageSortFilter', { type: String })
  readonly coverageSortFilter: CoverageSortT

  @Prop({ required: true })
  coverageFilters: { [key in CoverageSortT]?: FilterChoice }

  @Prop({ required: true })
  coverageType: CodeCoverageT

  @Prop({ required: true })
  defaultLabel: string

  get nextSort(): string {
    return this.newSortValue(this.coverageType, this.coverageSortFilter)
  }

  /**
   * Returns the next sort value in a cyclic way
   *
   * @param {CodeCoverageT} coverageType
   * @param {string} coverageSortFilter
   *
   * @returns string
   */
  newSortValue(coverageType: CodeCoverageT, coverageSortFilter: string): string {
    /**
     * If sort is ascending -> apply descending
     * If sort is descending -> remove sort
     * If sort is not applied -> apply ascending
     */
    if (coverageType === CodeCoverageT.BCV) {
      if (coverageSortFilter === CoverageSortT.BCV_ASCENDING) {
        return CoverageSortT.BCV_DESCENDING
      } else if (coverageSortFilter === CoverageSortT.BCV_DESCENDING) {
        return ''
      } else {
        return CoverageSortT.BCV_ASCENDING
      }
    }

    if (coverageType === CodeCoverageT.LCV) {
      if (coverageSortFilter === CoverageSortT.LCV_ASCENDING) {
        return CoverageSortT.LCV_DESCENDING
      } else if (coverageSortFilter === CoverageSortT.LCV_DESCENDING) {
        return ''
      } else {
        return CoverageSortT.LCV_ASCENDING
      }
    }

    return ''
  }
}
</script>
