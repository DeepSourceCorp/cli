<template>
  <div>
    <div class="grid grid-cols-2 p-4 pb-0">
      <div class="flex flex-col space-y-2">
        <div class="flex items-center space-x-2">
          <z-icon
            v-if="namespace.key"
            :icon="namespace.key.toLowerCase()"
            color="transparent"
          ></z-icon>
          <span class="font-semibold text-vanilla-100"
            >{{ namespace.key }}
            <span v-if="currentMetric.name" class="text-vanilla-400 font-normal"
              >/ {{ currentMetric.name }}</span
            ></span
          >
        </div>
        <z-animated-integer
          v-if="namespace.trend"
          class="font-normal text-2.5xl tracking-snug"
          :format="
            namespace.display.endsWith('%') && !isNumberType ? formatPercentage : (val) => val
          "
          :value="namespace.trend.values[namespace.trend.values.length - 1]"
        ></z-animated-integer>
      </div>
      <div v-if="currentThreshold" class="text-sm text-vanilla-200 text-right">
        <span class="text-xs text-vanilla-400">Threshold</span>
        <span
          class="inline px-1.5 py-1 text-sm font-medium leading-5 rounded-md font-base bg-ink-300"
        >
          {{ isNumberType ? currentThreshold : `${currentThreshold}%` }}
        </span>
        <z-menu direction="left" width="small" size="small">
          <template v-slot:trigger="{ toggle }">
            <button type="button" class="outline-none focus:outline-none" @click="toggle">
              <z-icon class="inline" icon="more-vertical"></z-icon>
            </button>
          </template>
          <template slot="body">
            <z-menu-item @click="showThresholdUpdate = true" class="text-sm" icon="edit-2"
              >Update Threshold</z-menu-item
            >
            <z-menu-item @click="deleteThreshold" class="text-cherry text-sm" icon="trash-2"
              >Delete Threshold</z-menu-item
            >
          </template>
        </z-menu>
      </div>
      <div v-else class="text-sm text-vanilla-200 text-right flex justify-end">
        <button
          @click="showThresholdUpdate = true"
          class="flex items-center space-x-2 px-2 py-1 border border-dashed rounded-md border-ink-300 hover:border-ink-200 text-sm h-8 text-vanilla-400 hover:text-vanilla-200"
        >
          <z-icon size="small" icon="plus"></z-icon>
          <span class="leading-none">Add threshold</span>
        </button>
      </div>
    </div>
    <div class="min-h-40">
      <z-chart
        v-if="chartData.labels.length"
        ref="wrapper"
        :key="namespace.is_passing"
        class="flex-grow md:mx-auto"
        v-bind="chartData"
        :colors="namespace.is_passing === false ? ['cherry-500'] : ['robin-500']"
        :height="chartHeight"
        :type="chartType"
        :tooltipOptions="{
          formatTooltipY: formatIntl
        }"
        :showLegend="false"
        :axisOptions="axisOptions"
        :yAxisMax="clip ? 100 : null"
        :yAxisMin="clip ? 0 : null"
      ></z-chart>
      <div v-else class="flex items-center justify-center py-12 text-vanilla-400">
        No Data to Display
      </div>
    </div>
    <portal to="modal">
      <z-modal
        v-if="showThresholdUpdate"
        @onClose="showThresholdUpdate = false"
        width="narrow"
        title="Update threshold"
      >
        <template v-slot:default="{ close }">
          <div class="p-4">
            <p class="text-sm text-vanilla-400">
              Update <b class="text-vanilla-200">{{ name }}</b> threshold for
              <b class="text-vanilla-200">{{ namespace.key }}</b>
            </p>
            <z-input
              size="small"
              class="mt-2"
              min="0"
              :max="isNumberType ? null : 100"
              @blur="validateThreshold"
              placeholder="New threshold value"
              type="number"
              @debounceInput="validateThreshold"
              v-model="newThresholdValue"
            ></z-input>
            <p v-if="thresholdInputError" class="text-xs text-cherry">
              {{ thresholdInputErrorMessage }}
            </p>
            <div class="space-x-4 text-right text-vanilla-100 mt-4">
              <z-button
                icon="check-circle"
                class="modal-primary-action"
                buttonType="primary"
                size="small"
                @click="updateThreshold(close)"
                >Update</z-button
              >
            </div>
          </div>
        </template>
      </z-modal>
    </portal>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Inject, Watch } from 'nuxt-property-decorator'
import {
  ZChart,
  ZIcon,
  ZMenu,
  ZMenuItem,
  ZInput,
  ZModal,
  ZButton,
  ZAnimatedInteger
} from '@deepsourcelabs/zeal'
import { Metrics, MetricsNamespace } from '~/store/repository/detail'
import { formatIntl } from '@/utils/string'

import { RepositoryDetailActions } from '~/store/repository/detail'

const NUMBER_TYPES = ['IDP', 'DDP']

@Component({
  components: {
    ZChart,
    ZIcon,
    ZMenu,
    ZMenuItem,
    ZInput,
    ZModal,
    ZButton,
    ZAnimatedInteger
  }
})
export default class GraphChart extends Vue {
  @Prop()
  namespace: MetricsNamespace

  @Prop()
  chartData: Record<string, Array<string | number | unknown>>

  @Prop({ default: 280 })
  chartHeight: number

  @Prop({ default: 'line' })
  chartType: string

  @Prop({ default: '' })
  name: string

  @Prop({ default: false })
  clip: boolean

  @Prop()
  shortcode: string

  @Prop()
  currentMetric: Metrics

  @Inject('metricRepositoryId')
  metricRepositoryId: string

  @Inject('refetchData')
  refetchData: () => Promise<void>

  public newThresholdValue: number | null = null
  public currentThreshold: number | null = null
  public thresholdInputError: boolean = false
  public thresholdInputErrorMessage: string = ''
  public showThresholdUpdate: boolean = false
  public formatIntl = formatIntl

  @Watch('namespace')
  updateNS(): void {
    if (this.namespace?.threshold) {
      this.newThresholdValue = this.namespace.threshold
      this.currentThreshold = this.namespace.threshold
    }
  }

  get isNumberType(): boolean {
    return NUMBER_TYPES.includes(this.shortcode)
  }

  validateThreshold() {
    if (!this.isNumberType && this.newThresholdValue && this.newThresholdValue > 100) {
      this.newThresholdValue = 100
    }
  }

  mounted() {
    if (this.namespace?.threshold) {
      this.newThresholdValue = this.namespace.threshold
      this.currentThreshold = this.namespace.threshold
    }
  }

  get axisOptions(): Record<string, string | boolean> {
    return {
      xIsSeries: true
    }
  }

  async setThreshold(value: number): Promise<void> {
    await this.$store.dispatch(
      `repository/detail/${RepositoryDetailActions.SET_METRIC_THRESHOLD}`,
      {
        metricShortcode: this.shortcode,
        repositoryId: this.metricRepositoryId,
        thresholdValue: value,
        key: this.namespace.key
      }
    )
    if (value === 0) {
      this.currentThreshold = null
    } else {
      this.currentThreshold = value
    }
    await this.refetchData()
  }

  async updateThreshold(close: () => void): Promise<void> {
    const newVal = Number(this.newThresholdValue)
    if (this.isNumberType || newVal <= 100) {
      this.thresholdInputError = false
      this.thresholdInputErrorMessage = ''
      await this.setThreshold(Number(this.newThresholdValue))
      if (close) {
        close()
        setTimeout(() => {
          this.showThresholdUpdate = false
        }, 500)
      } else {
        this.showThresholdUpdate = false
      }
      this.showThresholdUpdate = false
    } else {
      this.thresholdInputError = true
      this.thresholdInputErrorMessage = 'Please enter a value between 0 and 100'
    }
  }

  deleteThreshold(): void {
    this.setThreshold(0)
  }

  formatPercentage(value: number): string {
    return `${value}%`
  }
}
</script>
