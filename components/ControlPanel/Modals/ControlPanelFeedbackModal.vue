<template>
  <z-modal
    class="shadow-double-dark z-1000"
    title="Send feedback"
    :close-after-primary-action="false"
    @onClose="$emit('close')"
  >
    <div class="p-4 text-sm text-vanilla-400 min-h-20">
      <div>
        <label>
          <span class="text-sm text-vanilla-400">
            We'd love to know how we can improve DeepSource for you.
            <span class="text-cherry">*</span>
          </span>
          <textarea
            v-model="feedback"
            name="directory-feedback"
            id="directory-feedback"
            :readonly="isLoading"
            required
            class="w-full h-full p-2 mt-2 text-sm border outline-none bg-ink-400 min-h-28 max-h-44 lg:max-h-60 text-vanilla-100 focus:border-vanilla-100"
          >
          </textarea>
        </label>
      </div>
      <div class="flex mt-5">
        <z-checkbox
          v-model="okToContact"
          label="It is okay for DeepSource to contact me about this feedback."
          size="small"
          :read-only="isLoading"
          class="cursor-pointer"
        />
      </div>
    </div>
    <template v-slot:footer="{ close }">
      <div class="p-4 space-x-3 text-right text-vanilla-100 border-ink-200">
        <z-button
          icon="check-circle"
          :is-loading="isLoading"
          :disabled="isLoading || !feedback.length"
          class="modal-primary-action"
          buttonType="primary"
          size="small"
          label="Submit feedback"
          loading-label="Submitting feedback"
          @click="submitFeedback(close)"
        />
      </div>
    </template>
  </z-modal>
</template>
<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { ZModal, ZButton, ZCheckbox } from '@deepsource/zeal'

@Component({
  components: {
    ZModal,
    ZButton,
    ZCheckbox
  },
  name: 'DirectoryFeedbackModal'
})
export default class DirectoryFeedbackModal extends Vue {
  private feedback = ''
  private okToContact = false
  private isLoading = false

  submitFeedback(close: () => void) {
    this.isLoading = true
    //! Add logic
    const feedbackDidSubmit = true
    if (feedbackDidSubmit) {
      close()
    }
    this.isLoading = false
  }
}
</script>
