<template>
  <div
    :class="isGridLayout ? 'custom-grid-cols grid' : 'flex flex-wrap'"
    class="gap-x-7 gap-y-3 text-xs leading-3 text-vanilla-400"
  >
    <template v-for="(dataset, idx) in datasets">
      <div
        v-if="dataset.name !== 'others'"
        :key="dataset.name"
        v-tooltip="datasetNameFormatter(dataset.name)"
        :class="{ 'col-start-2': datasets.length === 3 && idx === 2 && !othersDatasetNames.length }"
        class="flex items-center gap-x-2 truncate"
      >
        <span :class="dataset.bgColor" class="h-2 w-2 flex-shrink-0 rounded-sm"></span>
        {{ datasetNameFormatter(dataset.name) }}
      </div>

      <z-menu
        v-else-if="othersDatasetNames.length"
        :key="dataset.name"
        :direction="menuDirection"
        :placement="menuPlacement"
        width="x-small"
        items-z-class="z-50"
      >
        <template #trigger="{ toggle }">
          <button
            class="flex cursor-pointer items-center gap-x-2 leading-3 hover:text-vanilla-100 focus:text-vanilla-100"
            @click="toggle"
          >
            <span :class="dataset.bgColor" class="h-2 w-2 rounded-sm"></span> Others
          </button>
        </template>
        <template #body>
          <ul class="space-y-3 px-3 py-2.5">
            <p
              v-for="name in othersDatasetNames"
              :key="name"
              :icon="name"
              class="cursor flex items-center gap-x-2.5"
            >
              <z-icon :icon="name" size="x-small" />{{ datasetNameFormatter(name) }}
            </p>
          </ul>
        </template>
      </z-menu>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Dataset } from '~/types/reportTypes'
import { toSentenceCase } from '~/utils/string'
import { issueCategoryMap } from '~/utils/reports'
/**
 * Legends component for reports charts
 */
@Component({
  methods: {
    toSentenceCase
  }
})
export default class ReportChartLegend extends Vue {
  @Prop({ required: true })
  datasets: Array<Dataset>

  @Prop({ default: 'flex' })
  layout: string

  @Prop({ default: 'left' })
  menuDirection: string

  @Prop({ default: 'bottom' })
  menuPlacement: string

  @Prop({ default: () => [] })
  othersDatasetNames: Array<string>

  get isGridLayout(): boolean {
    return this.layout === 'grid'
  }

  /**
   * Method to format dataset name.
   * If name is of a issue category, we map it to its desired label.
   *
   * @param {string} name
   * @returns {string}
   */
  datasetNameFormatter(name: string): string {
    const label = issueCategoryMap[name]?.label ?? name
    return toSentenceCase(label, false)
  }
}
</script>

<style scoped>
.custom-grid-cols {
  grid-template-columns: 1fr min-content;
}
</style>
