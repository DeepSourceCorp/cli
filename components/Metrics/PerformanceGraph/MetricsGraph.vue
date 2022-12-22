<template>
  <stat-section
    :title="title"
    helpText="Overview of key quality metrics over time"
    :bodySpacing="0"
    :gridSpacing="0"
  >
    <template v-slot:controls>
      <div class="flex justify-end h-full">
        <graph-control
          class="flex space-x-2 w-full sm:w-auto"
          :dayOptions="pageLengthOptions"
          :filterValue="pageLength"
          @updateFilter="updatePageLength"
        ></graph-control>
      </div>
    </template>
    <graph-data-selector
      :dataPoints="sortedData"
      v-if="sortedData.length"
      v-model="selectedIndex"
    ></graph-data-selector>
    <div
      class="col-span-1 border-l lg:col-span-2 xl:col-span-3 2xl:col-span-4 border-slate-400 divide-y divide-ink-300"
    >
      <div v-for="ns in namespaces" :key="ns">
        <graph-chart
          v-if="chartData[ns]"
          :chartData="build(chartData[ns])"
          :namespace="chartData[ns]"
          :currentMetric="currentMetric"
          :shortcode="currentMetric.shortcode"
          :chartHeight="chartHeight"
          :clip="true"
        ></graph-chart>
      </div>
    </div>
  </stat-section>
</template>
<script lang="ts">
import { Vue, Component, Prop, Inject } from 'nuxt-property-decorator'

import { ZChart, ZIcon } from '@deepsource/zeal'

import { StatSection } from '@/components/Metrics'
import { GraphDataSelector, GraphChart } from '.'
import { GraphControl } from '@/components/Graphs'

import { Metrics, MetricsNamespace } from '~/store/repository/detail'

import { countDaysBackwards, formatDate, parseISODate } from '@/utils/date'

const coverageStats = [
  'branch coverage',
  'test coverage',
  'test documentation coverage',
  'application documenatation coverage',
  'api documenatation coverage',
  'direct external dependencies',
  'indirect dependencies'
]

@Component({
  components: {
    StatSection,
    GraphControl,
    GraphDataSelector,
    GraphChart,
    ZChart,
    ZIcon
  }
})
export default class MetricsGraph extends Vue {
  @Prop({ default: 'Key metrics' })
  title: string

  @Prop({ default: () => [] })
  data: Array<Metrics>

  @Prop()
  namespaces: Array<string>

  @Inject()
  pageLengthOptions: number[]

  @Inject()
  pageLength: number

  @Inject()
  updatePageLength: (pageLength: number) => void

  public filterValue = 'Last 7 Days'
  public chartHeight = 220
  public selectedIndex = 0

  get chartData(): Record<string, MetricsNamespace> {
    const chartData = {} as Record<string, MetricsNamespace>
    this.currentMetric.namespaces.forEach((namespace) => {
      chartData[namespace.key] = namespace
    })

    return chartData
  }

  get currentMetric(): Metrics {
    return this.sortedData[this.selectedIndex]
  }

  get labels(): Array<string> {
    return countDaysBackwards(14).map((day) => formatDate(day))
  }

  get sortedData(): Array<Metrics> {
    return [...this.data].sort((a, b) => {
      return (
        coverageStats.indexOf(a.name.toLowerCase()) - coverageStats.indexOf(b.name.toLowerCase())
      )
    })
  }

  build(data: MetricsNamespace): Record<string, Array<string | number | unknown> | undefined> {
    return {
      labels: data.trend.labels.map((label) => formatDate(parseISODate(label))),
      dataSets: [
        {
          name: data.key,
          values: data.trend.values
        }
      ],
      yRegions: data.threshold
        ? [
            {
              label: 'Threshold',
              start: 0,
              end: data.threshold,
              options: { labelPos: 'right' }
            }
          ]
        : undefined
    }
  }
}
</script>
