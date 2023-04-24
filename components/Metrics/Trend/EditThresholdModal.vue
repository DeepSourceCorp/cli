<template>
  <z-modal :title="`Update ${thresholdName}`" width="narrow" @onClose="$emit('close')">
    <template #default="{ close }">
      <div class="space-y-4 p-4">
        <p v-if="isAggregate" class="text-sm text-vanilla-400">
          Update <span class="lowercase"> {{ thresholdName }} </span> for
          <span class="bold text-vanilla-200">Aggregate</span>
        </p>
        <p v-else class="text-sm text-vanilla-400">
          Update <span class="bold lowercase text-vanilla-200">{{ metricName }}</span> ⎯
          <span class="bold lowercase text-vanilla-200">{{ thresholdName }}</span> for
          <span class="bold text-vanilla-200">{{ analyzerKey }}</span>
        </p>
        <div class="space-y-2">
          <z-input
            :value="thresholdValue"
            type="number"
            size="small"
            placeholder="New threshold value"
            min="0"
            @input="setThresholdValue"
            @blur="(e) => validateThreshold(e.target.value)"
          />
          <p v-if="thresholdInputError || thresholdValue < 0" class="text-xs text-cherry">
            Please enter a valid threshold value
          </p>
        </div>
        <div class="text-right">
          <z-button
            icon="check-circle"
            :disabled="thresholdInputError"
            button-type="primary"
            label="Update threshold"
            loading-label="Updating threshold"
            size="small"
            class="modal-primary-action"
            @click="updateThreshold(close)"
          />
        </div>
      </div>
    </template>
  </z-modal>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator'

import { ZModal, ZInput, ZButton } from '@deepsource/zeal'
import { Maybe, Metric, MetricNamespace, MetricNamespaceTrend, Repository } from '~/types/types'
import { MetricType } from '~/types/metric'

/**
 * Modal component that is used to edit the threshold of a Metric namespace.
 */
@Component({
  name: 'EditThresholdModal',
  components: { ZModal, ZInput, ZButton }
})
export default class EditThresholdModal extends Vue {
  @Prop()
  thresholdValue:
    | MetricNamespace['threshold']
    | MetricNamespaceTrend['newCodeThreshold']
    | MetricNamespaceTrend['threshold']
    | undefined

  @Prop({ required: true })
  metricName: Metric['name']

  @Prop({ required: true })
  analyzerKey: MetricNamespace['key'] | MetricNamespaceTrend['key']

  @Prop({ required: true })
  metricShortcode: Metric['shortcode']

  @Prop({ required: true })
  repositoryId: Repository['id']

  @Prop({ required: true })
  unit: Metric['unit'] | Maybe<string> | undefined

  @Prop({ required: true })
  thresholdName: string

  newThresholdValue: number | undefined = undefined
  thresholdInputError = false

  /**
   * ? Assumes anything that can't be converted to a valid `Number` is a %
   */
  get isValueAPercentage() {
    return Boolean(this.unit)
  }

  get isAggregate() {
    return this.analyzerKey === MetricType.aggregate
  }

  /**
   * Validation function that validates if the given value is a valid threshold value or not
   * and sets the result to `thresholdInputError`.
   *
   * @param {string} value - Value to test.
   *
   * @returns {void}
   */
  validateThreshold(value?: string): void {
    this.thresholdInputError = value
      ? Number(value) < 0 || (this.isValueAPercentage ? Number(value) > 100 : false)
      : true
  }

  /**
   * Sets the new threshold value.
   *
   * @param {string} input - Value to set.
   *
   * @returns {void}
   */
  setThresholdValue(input: string): void {
    this.thresholdInputError = false
    this.newThresholdValue = Number(input)
  }

  /**
   * Emits the `editThreshold` event with the new threshold value to update to and its namespace details.
   *
   * @param {Function} close - Function that closes the modal when called.
   * @returns {void}
   */
  updateThreshold(close?: () => void): void {
    if (!this.thresholdInputError) {
      if (close && this.newThresholdValue === undefined) {
        return close()
      }

      this.$emit(
        'editThreshold',
        Number(this.newThresholdValue),
        this.analyzerKey,
        this.metricShortcode,
        close
      )
    } else {
      this.$toast.danger('Please enter a valid threshold value.')
    }
  }

  /**
   * Resets the error state of the modal.
   *
   * @returns {void}
   */
  @Watch('metricName')
  @Watch('key')
  resetErrorState(): void {
    this.thresholdInputError = false
  }

  /**
   * Resets the threshold value holder and error state of the modal.
   *
   * @returns {void}
   */
  @Watch('$route.params.metric')
  fullReset(): void {
    this.newThresholdValue = undefined
    this.thresholdInputError = false
  }
}
</script>
