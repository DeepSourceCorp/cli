<template>
  <z-modal title="Add threshold" width="narrow" @onClose="closeModal">
    <template #default="{ close }">
      <div class="p-4 space-y-6">
        <div class="space-y-3">
          <div class="space-y-1">
            <p class="text-sm text-vanilla-400">Language</p>
            <z-select
              v-if="analyzers.length"
              v-model="analyzerToAdd"
              placeholder="Analyzer"
              :key="Number(computingFlag)"
              spacing="px-2 py-1"
              class="rounded-md bg-ink-400"
            >
              <z-option
                v-for="analyzer in analyzers"
                :key="analyzer.id"
                :label="analyzer.name"
                :value="analyzer.name"
              />
            </z-select>
            <div v-else class="h-8 w-full bg-ink-300 animate-pulse"></div>
            <p v-if="thresholdLangMissing" class="text-xs text-cherry">
              Please select a valid language.
            </p>
          </div>
          <div class="space-y-1">
            <p class="text-sm text-vanilla-400">Threshold</p>
            <z-input
              type="number"
              size="small"
              placeholder="New threshold value"
              min="0"
              @input="setThresholdValue"
              @blur="(e) => validateThreshold(e.target.value)"
            />
            <p v-if="thresholdInputError" class="text-xs text-cherry">
              Please enter a valid threshold value.
            </p>
          </div>
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
            @click="createThreshold(close)"
          />
        </div>
      </div>
    </template>
  </z-modal>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'nuxt-property-decorator'

import { ZModal, ZInput, ZButton, ZSelect, ZOption } from '@deepsource/zeal'
import { Analyzer } from '~/types/types'

/**
 * Modal component that is used to add the threshold of a Metric namespace.
 */
@Component({
  name: 'AddNlcvThresholdModal',
  components: { ZModal, ZInput, ZButton, ZSelect, ZOption }
})
export default class AddNlcvThresholdModal extends Vue {
  @Prop({ required: true })
  analyzers: Analyzer[]

  computingFlag = false
  analyzerToAdd = ''
  newThresholdValue: number | null = null
  thresholdLangMissing = false
  thresholdInputError = false

  /**
   * Validation function that validates if the given value is a valid threshold value or not
   * and sets the result to `thresholdInputError`.
   *
   * @param {string} value - Value to test.
   *
   * @returns {void}
   */
  validateThreshold(value?: string): void {
    this.thresholdInputError = Number(value) < 0 || Number(value) > 100
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
  createThreshold(close?: () => void): void {
    if (!this.thresholdInputError && this.analyzerToAdd && this.newThresholdValue) {
      this.$emit('addThreshold', this.analyzerToAdd, Number(this.newThresholdValue), close)
    } else {
      this.$toast.danger('Please select a valid analyzer and threshold value.')
    }
  }

  /**
   * Close the modal.
   */
  closeModal() {
    this.newThresholdValue = null
    this.analyzerToAdd = ''
    //skipcq JS-0093
    this.computingFlag != this.computingFlag
    this.$emit('close')
  }

  /**
   * Hacks Vue reactivity as it says
   */
  @Watch('analyzers.length', { immediate: true })
  hackReactivity(newValue: number) {
    this.computingFlag = !this.computingFlag
    if (newValue) this.analyzerToAdd = this.analyzers[0].name
  }
}
</script>
