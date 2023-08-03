import '../../assets/css/tailwind.css'
import '../../assets/css/typography.css'
import '../../assets/css/layout.css'
import '../../assets/css/chart.css'
import ZChart from './ZChart.vue'

function getRandomDatasets() {
  return [
    {
      name: 'Active Issues',
      values: Array.from({ length: 12 }, () => Math.floor(10 + Math.random() * 8000))
    },
    {
      name: 'Resolved Issues',
      values: Array.from({ length: 12 }, () => Math.floor(10 + Math.random() * 7500))
    }
  ]
}

function getRandomMarkers() {
  return [
    {
      label: 'Another Threshold',
      value: Math.floor(10 + Math.random() * 80),
      options: { stroke: 'vanilla-400', lineType: 'dashed' }
    }
  ]
}

const issueData = {
  labels: [
    'Jan',
    'Feb',
    'March',
    'April',
    'May',
    'June',
    'July',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec'
  ],
  datasets: getRandomDatasets(),
  yRegions: [{ label: 'Threshold', start: 0, end: 35, options: { fill: 'ink-300' } }],
  yMarkers: getRandomMarkers()
}

export default {
  title: 'Charts',
  component: ZChart,
  excludeStories: /.*Data$/
}

export const LineChart = () => ({
  components: { ZChart },
  data() {
    return {
      dataSets: issueData.datasets,
      labels: issueData.labels,
      yRegions: issueData.yRegions,
      yMarkers: issueData.yMarkers
    }
  },
  methods: {
    changeData() {
      // skipcq JS-0295
      // @ts-ignore ref https://github.com/vuejs/vetur/issues/1707#issuecomment-686851677
      this.dataSets = getRandomDatasets()
      // skipcq JS-0295
      // @ts-ignore ref https://github.com/vuejs/vetur/issues/1707#issuecomment-686851677
      this.yMarkers = getRandomMarkers()
    }
  },
  template: `
    <div class="padding-container">
      <z-chart :dataSets="dataSets" :labels="labels" :yRegions=yRegions :yMarkers=yMarkers type="line" :yAxisMax="100" :yAxisMin="0" />
      <button class="text-vanilla-100 bg-ink-200 rounded-md px-2 py-1" @click="changeData">Change data</button>
    </div>
  `
})

export const CustomColors = () => ({
  components: { ZChart },
  data() {
    return {
      dataSets: issueData.datasets,
      labels: issueData.labels,
      yRegions: issueData.yRegions,
      yMarkers: issueData.yMarkers
    }
  },
  template: `<div class="padding-container">
    <z-chart :dataSets="dataSets" :labels="labels" :yRegions=yRegions :yMarkers=yMarkers type="line" :colors="['ink-200', '#1F7A5D']"></z-chart>
  </div>`
})

export const BarChart = () => ({
  components: { ZChart },
  data() {
    return {
      dataSets: issueData.datasets,
      labels: issueData.labels,
      yRegions: issueData.yRegions,
      yMarkers: issueData.yMarkers
    }
  },
  template: `<div class="padding-container">
    <z-chart :dataSets="dataSets" :labels="labels" :yRegions=yRegions :yMarkers=yMarkers type="bar"></z-chart>
  </div>`
})

export const DonutChart = () => ({
  components: { ZChart },
  data() {
    return {
      dataSets: issueData.datasets,
      labels: issueData.labels,
      yRegions: issueData.yRegions
    }
  },
  template: `<div class="padding-container">
    <z-chart :dataSets="dataSets" :labels="labels" :yRegions=yRegions type="donut"></z-chart>
  </div>`
})

export const PieChart = () => ({
  components: { ZChart },
  data() {
    return {
      dataSets: issueData.datasets,
      labels: issueData.labels,
      yRegions: issueData.yRegions
    }
  },
  template: `<div class="padding-container">
    <z-chart :dataSets="dataSets" :labels="labels" :yRegions=yRegions type="pie"></z-chart>
  </div>`
})

export const PercentageChart = () => ({
  components: { ZChart },
  data() {
    return {
      dataSets: issueData.datasets,
      labels: issueData.labels,
      yRegions: issueData.yRegions
    }
  },
  template: `<div class="padding-container">
    <z-chart :dataSets="dataSets" :labels="labels" :yRegions=yRegions type="percentage"></z-chart>
  </div>`
})

interface ChartDatasetSet {
  name: string
  index: number
  values: Array<number>
}

export const AxisMixedChart = () => ({
  components: { ZChart },
  data() {
    return {
      dataSets: [
        { name: 'ACTIVE ISSUES', chartType: 'bar', values: [17, 19, 12, 9, 14, 5, 5, 4] },
        { name: 'RESOLVED ISSUES', chartType: 'bar', values: [-17, -15, -19, -11, -12, 0, -4, -2] },
        { name: 'NET NEW ISSUES', chartType: 'line', values: [0, 4, -7, -2, 2, 5, 1, 2] }
      ],
      labels: issueData.labels,
      barOptions: {
        stacked: true
      },
      tooltipOptions: {
        formatTooltipY: (d: number, set: ChartDatasetSet) => {
          const formattedValue = set.index === 1 ? Math.abs(d) : d

          if (set.index === 2) {
            return `<span style="color: ${
              formattedValue > 0 ? '#33CB9A' : '#E17783'
            }">${formattedValue}</span>`
          }
          return formattedValue
        },
        formatTooltipX: (label: string) => {
          return `Issues stats for ${label}`
        }
      }
    }
  },
  template: `<div class="padding-container py-20">
    <z-chart :dataSets="dataSets" :labels="labels" :tooltipOptions="tooltipOptions" :barOptions="barOptions" type="axis-mixed"></z-chart>
  </div>`
})
