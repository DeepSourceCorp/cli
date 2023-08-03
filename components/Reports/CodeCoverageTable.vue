<template>
  <section
    :class="isWidget ? 'max-h-92 overflow-y-scroll' : 'rounded-md border border-slate-400'"
    class="hide-scroll overflow-x-auto leading-normal"
  >
    <table class="cursor w-full table-fixed">
      <thead class="border-b border-slate-400">
        <tr class="text-xs font-semibold uppercase text-vanilla-400">
          <th
            :class="isWidget ? 'pl-5' : 'pl-4 sm:w-auto'"
            class="w-48 py-2.5 text-left font-semibold"
          >
            Repository
          </th>
          <th :class="[isWidget ? 'w-28' : 'w-40 pr-2']" class="text-right">
            <code-coverage-sort
              v-model="activeSortFilter"
              :coverage-filters="lcvSortFilters"
              :coverage-type="CodeCoverageT.LCV"
              :default-label="isWidget ? 'Line' : 'Line Coverage'"
              :is-widget="isWidget"
            />
          </th>
          <th :class="[isWidget ? 'w-28 pr-5' : 'w-48 pr-2']" class="text-right">
            <code-coverage-sort
              v-model="activeSortFilter"
              :coverage-filters="bcvSortFilters"
              :coverage-type="CodeCoverageT.BCV"
              :default-label="isWidget ? 'Branch' : 'Branch Coverage'"
              :is-widget="isWidget"
            />
          </th>
        </tr>
      </thead>
      <tbody :class="isWidget ? 'divide-ink-300' : 'divide-ink-200'" class="divide-y">
        <template v-if="repoCoverageList">
          <tr
            v-for="repoCoverage in repoCoverageList"
            :key="repoCoverage.id"
            :class="{ 'hover:bg-ink-300': linkedRows }"
          >
            <td class="truncate text-left text-sm">
              <component
                :is="linkedRows ? 'nuxt-link' : 'div'"
                :to="$generateRoute([repoCoverage.name, 'metrics', 'LCV'])"
                :class="isWidget ? 'pl-5' : 'pl-4'"
                class="block py-2.5"
              >
                <span
                  v-tooltip="{
                    content: getFormattedRepoName(repoCoverage.name),
                    delay: { show: 200, hide: 100 }
                  }"
                >
                  {{ getFormattedRepoName(repoCoverage.name) }}
                </span>
              </component>
            </td>
            <code-coverage-table-cell
              :linked-cell="linkedRows"
              :is-passing="repoCoverage.lcvIsPassing"
              :value="repoCoverage.lcvValue"
              :repo-name="repoCoverage.name"
            />
            <code-coverage-table-cell
              :linked-cell="linkedRows"
              :is-passing="repoCoverage.bcvIsPassing"
              :is-widget="isWidget"
              :value="repoCoverage.bcvValue"
              :repo-name="repoCoverage.name"
            />
          </tr>
        </template>
      </tbody>
    </table>
  </section>
</template>

<script lang="ts">
import { Vue, Component, Prop, ModelSync } from 'nuxt-property-decorator'

import { CodeCoverageT, CoverageSortT } from '~/types/reportTypes'
import { RepositoryCoverageReportItem } from '~/types/types'
import { FilterChoice } from '../Common/FilterGeneric.vue'

/**
 * Table component for code coverage report
 */
@Component({})
export default class CodeCoverageTable extends Vue {
  @ModelSync('selectedSortFilter', 'sort-filter-updated', { type: String })
  readonly activeSortFilter: CodeCoverageT | ''

  @Prop({ default: false })
  isWidget: boolean

  @Prop({ default: false })
  linkedRows: boolean

  @Prop({ required: true })
  repoCoverageList: Array<RepositoryCoverageReportItem>

  CodeCoverageT = CodeCoverageT

  bcvSortFilters: { [key in CoverageSortT]?: FilterChoice } = {
    [CoverageSortT.BCV_ASCENDING]: {
      label: 'BRANCH COVERAGE',
      icon: 'arrow-up',
      name: CoverageSortT.BCV_ASCENDING
    },
    [CoverageSortT.BCV_DESCENDING]: {
      label: 'BRANCH COVERAGE',
      icon: 'arrow-down',
      name: CoverageSortT.BCV_DESCENDING
    }
  }

  lcvSortFilters: { [key in CoverageSortT]?: FilterChoice } = {
    [CoverageSortT.LCV_ASCENDING]: {
      label: 'LINE COVERAGE',
      icon: 'arrow-up',
      name: CoverageSortT.LCV_ASCENDING
    },
    [CoverageSortT.LCV_DESCENDING]: {
      label: 'LINE COVERAGE',
      icon: 'arrow-down',
      name: CoverageSortT.LCV_DESCENDING
    }
  }

  /**
   * The `mounted` hook
   * Update sort filter labels for report widgets
   *
   * @returns {void}
   */
  mounted(): void {
    if (!this.isWidget) {
      return
    }

    Object.keys(this.bcvSortFilters).forEach(
      (key) => ((this.bcvSortFilters[key as CoverageSortT] as FilterChoice).label = 'BRANCH')
    )

    Object.keys(this.lcvSortFilters).forEach(
      (key) => ((this.lcvSortFilters[key as CoverageSortT] as FilterChoice).label = 'LINE')
    )
  }

  getFormattedRepoName(repoName: string) {
    return repoName.replace(/:/g, ' / ')
  }
}
</script>
