<template>
  <section class="overflow-x-auto rounded-md border border-ink-200 leading-normal">
    <table class="table-fixed cursor w-full">
      <thead class="border-b border-ink-200">
        <tr class="uppercase text-vanilla-400 text-xs font-semibold">
          <th class="pl-4 py-2.5 text-left w-48 sm:w-auto">Repository</th>
          <th class="pr-2 w-40 text-right">
            <code-coverage-sort
              v-model="activeSortFilter"
              default-label="Line Coverage"
              :coverage-filters="lcvSortFilters"
              :coverage-type="CodeCoverageT.LCV"
            />
          </th>
          <th class="pr-2 w-48 text-right">
            <code-coverage-sort
              v-model="activeSortFilter"
              default-label="Branch Coverage"
              :coverage-filters="bcvSortFilters"
              :coverage-type="CodeCoverageT.BCV"
            />
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-ink-200">
        <template v-if="repoCoverageList">
          <tr
            v-for="repoCoverage in repoCoverageList"
            :key="repoCoverage.id"
            :class="{ 'hover:bg-ink-300': linkedRows }"
          >
            <td class="text-left truncate text-sm">
              <component
                :is="linkedRows ? 'nuxt-link' : 'div'"
                :to="$generateRoute([repoCoverage.name, 'metrics', 'LCV'])"
                class="block py-2.5 pl-4"
              >
                <span v-tooltip="{ content: repoCoverage.name, delay: { show: 200, hide: 100 } }">
                  {{ repoCoverage.name }}
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
import CodeCoverageSort from './CodeCoverageSort.vue'
import CodeCoverageTableCell from './CodeCoverageTableCell.vue'

import { CodeCoverageT, CoverageSortT } from '~/types/reportTypes'
import { RepositoryCoverageReportItem } from '~/types/types'
import { FilterChoice } from '../Common/FilterGeneric.vue'

/**
 * Table component for code coverage report
 */
@Component({
  components: { CodeCoverageSort, CodeCoverageTableCell }
})
export default class CodeCoverageTable extends Vue {
  @ModelSync('selectedSortFilter', 'sort-filter-updated', { type: String })
  readonly activeSortFilter: CodeCoverageT | ''

  @Prop({ required: true })
  repoCoverageList: Array<RepositoryCoverageReportItem>

  @Prop({ default: false })
  linkedRows: boolean

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
}
</script>
