<template>
  <div class="flex flex-wrap lg:flex-nowrap">
    <div v-if="isLoading" class="w-80 h-80 -m-5 mb-0 flex justify-center items-center">
      <div class="w-56 h-56 bg-ink-300 animate-pulse rounded-full"></div>
    </div>
    <div v-show="!isLoading" class="w-full lg:w-80 -ml-3 lg:-ml-10">
      <z-chart
        v-if="chartLabels.length && chartData.length"
        type="donut"
        :dataSets="[{ values: chartData }]"
        :labels="chartLabels"
        :colors="chartColors"
      />
    </div>
    <div
      v-if="isLoading"
      class="flex-grow grid grid-cols-3 auto-rows-min items-center py-2 lg:ml-4"
    >
      <div v-for="id in 7" :key="id" class="max-h-14 my-4 pl-2">
        <div class="h-10 w-20 bg-ink-300 animate-pulse m-2"></div>
      </div>
    </div>
    <div v-else class="flex-grow grid grid-cols-3 auto-rows-min items-center py-2 lg:ml-4">
      <div
        v-for="(issueType, id) in availableIssueDistribution"
        :key="issueType.shortcode"
        class="max-h-14 my-4 pl-2"
      >
        <p class="mb-1.5">{{ issueType.title }}</p>
        <div
          class="w-12 h-1 rounded-sm my-1"
          :style="{ 'background-color': chartColors[id] }"
        ></div>
        <p>
          {{ issueType.count }}
        </p>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZChart } from '@deepsourcelabs/zeal'

import IssueTypeT from 'types/issueDistribution'

@Component({
  components: {
    ZChart
  },
  name: 'AnalyzerDirStats'
})
export default class AnalyzerDirStats extends Vue {
  @Prop()
  issueDistribution!: IssueTypeT[]

  @Prop({ default: false })
  isLoading: boolean

  private chartColors = [
    '#5FA992',
    '#83DFC1',
    '#D6F5EB',
    '#114837',
    '#13986D',
    '#13684C',
    '#1F8E6B',
    '#53FFC8'
  ]

  get availableIssueDistribution(): IssueTypeT[] {
    if (this.issueDistribution)
      return this.issueDistribution.filter(
        (issueType) => issueType.count > 0 && issueType.shortcode !== 'all'
      )
    return []
  }

  get chartLabels(): string[] {
    if (this.availableIssueDistribution)
      return this.availableIssueDistribution.map((issueType) => issueType.title)
    return []
  }

  get chartData() {
    if (this.availableIssueDistribution)
      return this.availableIssueDistribution.map((issueType) => issueType.count)
    return []
  }
}
</script>
