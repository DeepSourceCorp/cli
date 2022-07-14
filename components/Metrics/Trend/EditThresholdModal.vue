<template>
  <z-modal title="Update threshold" width="narrow" @onClose="$emit('close')">
    <template v-slot:default="{ close }">
      <div class="p-4 space-y-4">
        <p class="text-sm text-vanilla-400">
          Update <b class="text-vanilla-200">{{ metricName }}</b> threshold for
          <b class="text-vanilla-200">{{ analyzerKey }}</b>
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

import { ZModal, ZInput, ZButton } from '@deepsourcelabs/zeal'
import { Maybe, Metric, MetricNamespace, MetricNamespaceTrend, Repository } from '~/types/types'

/**
 * Modal component that is used to edit the threshold of a Metric namespace.
 */
@Component({
  name: 'EditThresholdModal',
  components: { ZModal, ZInput, ZButton }
})
export default class EditThresholdModal extends Vue {
  @Prop()
  thresholdValue: MetricNamespace['threshold'] | MetricNamespaceTrend['threshold'] | undefined

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

  newThresholdValue: number | undefined = undefined
  thresholdInputError = false

  /**
   * ? Assumes anything that can't be converted to a valid `Number` is a %
   */
  get isValueAPercentage() {
    return Boolean(this.unit)
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
      this.$emit('editThreshold', Number(this.newThresholdValue), this.analyzerKey, close)
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
