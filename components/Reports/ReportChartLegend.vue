<template>
  <div
    :class="isGridLayout ? 'grid custom-grid-cols' : 'flex flex-wrap'"
    class="gap-x-7 gap-y-3 leading-3 text-vanilla-400 text-xs"
  >
    <template v-for="dataset in datasets">
      <div
        v-if="dataset.name !== 'others'"
        v-tooltip="dataset.name"
        :key="dataset.name"
        class="flex items-center gap-x-2 truncate"
      >
        <span :class="dataset.bgColor" class="w-2 h-2 rounded-sm flex-shrink-0" />
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
            class="flex items-center gap-x-2 leading-3 cursor-pointer hover:text-vanilla-100 focus:text-vanilla-100"
            @click="toggle"
          >
            <span :class="dataset.bgColor" class="w-2 h-2 rounded-sm" /> Others
          </button>
        </template>
        <template #body>
          <ul class="py-2.5 px-3 space-y-3">
            <p
              v-for="name in othersDatasetNames"
              :key="name"
              :icon="name"
              class="flex items-center gap-x-2.5 cursor"
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
import { ZMenu, ZIcon } from '@deepsource/zeal'
import { Dataset } from '~/types/reportTypes'
import { toSentenceCase } from '~/utils/string'
import { issueCategoryMap } from '~/utils/reports'
/**
 * Legends component for reports charts
 */
@Component({
  components: {
    ZMenu,
    ZIcon
  },
  methods: {
    toSentenceCase
  }
})
export default class ReportChartLegend extends Vue {
  @Prop({ required: true })
  datasets: Array<Dataset>

  @Prop({ default: 'flex' })
  layout: string

  @Prop({ default: 'right' })
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
