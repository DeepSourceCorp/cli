<template>
  <div>
    <div class="grid grid-cols-2 p-4 pb-0">
      <div class="flex flex-col space-y-2">
        <div class="flex items-center space-x-2">
          <z-icon v-if="namespace.key" :icon="namespace.key.toLowerCase()" color="transparent" />
          <span class="font-semibold text-vanilla-100"
            >{{ namespace.key }}
            <span v-if="currentMetric.name" class="font-normal text-vanilla-400"
              >/ {{ currentMetric.name }}</span
            ></span
          >
        </div>
        <span v-if="namespace.trend" class="font-normal text-2.5xl tracking-snug">
          {{ trendValueForLegend }}
        </span>
      </div>
      <div v-if="currentThreshold" class="text-sm text-right text-vanilla-200">
        <span class="text-xs text-vanilla-400">Threshold</span>
        <span
          class="inline px-1.5 py-1 text-sm font-medium leading-5 rounded-md font-base bg-ink-300"
        >
          {{ isNumberType ? currentThreshold : `${currentThreshold}%` }}
        </span>
        <z-menu direction="left" width="small" size="small" class="inline-block">
          <template #trigger="{ toggle }">
            <button type="button" class="outline-none focus:outline-none" @click="toggle">
              <z-icon class="inline" icon="more-vertical" />
            </button>
          </template>
          <template #body>
            <z-menu-item class="text-sm" icon="edit-2" @click="showThresholdUpdate = true">
              Update Threshold
            </z-menu-item>
            <z-menu-item class="text-sm text-cherry" icon="trash-2" @click="deleteThreshold">
              Delete Threshold
            </z-menu-item>
          </template>
        </z-menu>
      </div>
      <div v-else class="flex justify-end text-sm text-right text-vanilla-200">
        <button
          class="flex items-center h-8 px-2 py-1 space-x-2 text-sm border border-dashed rounded-md border-slate-400 hover:border-slate-400 text-vanilla-400 hover:text-vanilla-200"
          @click="showThresholdUpdate = true"
        >
          <z-icon size="small" icon="plus" />
          <span class="leading-none">Add threshold</span>
        </button>
      </div>
    </div>
    <div class="min-h-40">
      <z-chart
        v-if="chartData.labels.length"
        v-bind="chartData"
        ref="wrapper"
        :key="namespace.is_passing"
        class="flex-grow md:mx-auto"
        :colors="namespace.is_passing === false ? ['cherry-500'] : ['robin-500']"
        :height="chartHeight"
        :type="chartType"
        :tooltip-options="{
          formatTooltipY: formatIntl
        }"
        :show-legend="false"
        :axis-options="axisOptions"
        :y-axis-max="clip ? 100 : null"
        :y-axis-min="clip ? 0 : null"
      />
      <div v-else class="flex items-center justify-center py-12 text-vanilla-400">
        No Data to Display
      </div>
    </div>
    <portal to="modal">
      <z-modal
        v-if="showThresholdUpdate"
        width="narrow"
        title="Update threshold"
        @onClose="showThresholdUpdate = false"
      >
        <template #default="{ close }">
          <div class="p-4">
            <p class="text-sm text-vanilla-400">
              Update <b class="text-vanilla-200">{{ name }}</b> threshold for
              <b class="text-vanilla-200">{{ namespace.key }}</b>
            </p>
            <z-input
              v-model="newThresholdValue"
              size="small"
              class="mt-2"
              min="0"
              placeholder="New threshold value"
              type="number"
              :max="isNumberType ? null : 100"
              @blur="validateThreshold"
              @debounceInput="validateThreshold"
            />
            <p v-if="thresholdInputError" class="text-xs text-cherry">
              {{ thresholdInputErrorMessage }}
            </p>
            <div class="mt-4 space-x-4 text-right text-vanilla-100">
              <z-button
                icon="check-circle"
                class="modal-primary-action"
                button-type="primary"
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
import { ZChart, ZIcon, ZMenu, ZMenuItem, ZInput, ZModal, ZButton } from '@deepsource/zeal'
import { Metrics, MetricsNamespace } from '~/store/repository/detail'
import { formatIntl } from '@/utils/string'

import { RepositoryDetailActions } from '~/store/repository/detail'

const NUMBER_TYPES = ['IDP', 'DDP']

/**
 * Chart component for the metrics page
 */
@Component({
  components: {
    ZChart,
    ZIcon,
    ZMenu,
    ZMenuItem,
    ZInput,
    ZModal,
    ZButton
  },
  methods: {
    formatIntl
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

  /**
   * Mounted hook to set the threshold values
   * @return {any}
   */
  mounted() {
    if (this.namespace?.threshold) {
      this.newThresholdValue = this.namespace.threshold
      this.currentThreshold = this.namespace.threshold
    }
  }

  /**
   * Update the threshold values when current namespace is changed
   * @return {void}
   */
  @Watch('namespace')
  updateNS(): void {
    if (this.namespace?.threshold) {
      this.newThresholdValue = this.namespace.threshold
      this.currentThreshold = this.namespace.threshold
    }
  }

  /**
   * If the new threshold is not a correct value, set it to 100
   * @return {void}
   */
  validateThreshold(): void {
    if (!this.isNumberType && this.newThresholdValue && this.newThresholdValue > 100) {
      this.newThresholdValue = 100
    }
  }

  get isNumberType(): boolean {
    return NUMBER_TYPES.includes(this.shortcode)
  }

  get axisOptions(): Record<string, string | boolean> {
    return {
      xIsSeries: true
    }
  }

  get trendValueForLegend(): string | number {
    const val = this.namespace.trend.values[this.namespace.trend.values.length - 1]
    return this.namespace.display.endsWith('%') && !this.isNumberType ? `${val}%` : val
  }

  /**
   * Trigger GQL mutation to set the threshold value for the metric
   * @param {number} value
   * @return {Promise<void>}
   */
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

  /**
   * Wrapper function for `setThreshold` that clears the modal
   * @param {(} close
   * @return {=> void): Promise<void>}
   */
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

  /**
   * Trigger GQL mutation to set the threshold to zero
   * @return {void}
   */
  deleteThreshold(): void {
    this.setThreshold(0)
  }
}
</script>
