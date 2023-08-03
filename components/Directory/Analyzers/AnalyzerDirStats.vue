<template>
  <div class="flex flex-wrap lg:flex-nowrap">
    <div v-if="isLoading" class="-m-5 mb-0 flex h-80 w-80 items-center justify-center">
      <div class="h-56 w-56 animate-pulse rounded-full bg-ink-300"></div>
    </div>
    <div v-show="!isLoading" class="-ml-3 w-full lg:-ml-10 lg:w-80">
      <z-chart
        v-if="chartLabels.length && chartData.length"
        type="donut"
        :data-sets="[{ values: chartData }]"
        :labels="chartLabels"
        :colors="chartColors"
      />
    </div>
    <div
      v-if="isLoading"
      class="grid flex-grow auto-rows-min grid-cols-3 items-center py-2 lg:ml-4"
    >
      <div v-for="id in 7" :key="id" class="my-4 max-h-14 pl-2">
        <div class="m-2 h-10 w-20 animate-pulse bg-ink-300"></div>
      </div>
    </div>
    <div v-else class="grid flex-grow auto-rows-min grid-cols-3 items-center py-2 lg:ml-4">
      <div
        v-for="(issueType, id) in availableIssueDistribution"
        :key="issueType.shortcode"
        class="my-4 max-h-14 pl-2"
      >
        <p class="mb-1.5">{{ issueType.title }}</p>
        <div
          class="my-1 h-1 w-12 rounded-sm"
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

import IssueTypeT from 'types/issueDistribution'

@Component({
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
