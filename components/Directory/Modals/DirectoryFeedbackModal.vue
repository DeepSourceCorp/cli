<template>
  <z-modal
    class="shadow-double-dark"
    title="Send feedback"
    :close-after-primary-action="false"
    @onClose="$emit('close')"
  >
    <div class="min-h-20 p-4 text-sm text-vanilla-400">
      <div>
        <label>
          <span class="text-sm text-vanilla-400">
            We'd love to know how we can improve DeepSource for you.
            <span class="text-cherry">*</span>
          </span>
          <textarea
            id="directory-feedback"
            v-model="feedback"
            name="directory-feedback"
            :readonly="isLoading"
            required
            class="mt-2 h-full max-h-44 min-h-28 w-full border bg-ink-400 p-2 text-sm text-vanilla-100 outline-none focus:border-vanilla-100 lg:max-h-60"
          >
          </textarea>
        </label>
      </div>
      <div class="mt-4">
        <z-checkbox
          v-model="isAlreadyUsing"
          :label="`I have used this ${isAnalyzer ? 'Analyzer' : 'Transformer'} before.`"
          size="small"
          :read-only="isLoading"
          class="cursor-pointer"
        />
      </div>
      <div class="mt-5 flex">
        <z-checkbox
          v-model="okToContact"
          label="It is okay for DeepSource to contact me about this feedback."
          size="small"
          :read-only="isLoading"
          class="cursor-pointer"
        />
      </div>
    </div>
    <template #footer="{ close }">
      <div class="space-x-3 border-slate-400 p-4 text-right text-vanilla-100">
        <z-button
          icon="check-circle"
          :is-loading="isLoading"
          :disabled="isLoading || !feedback.length"
          class="modal-primary-action"
          button-type="primary"
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
import { Vue, Component, namespace, Prop } from 'nuxt-property-decorator'
import { AddAnalyzerFeedbackInput, AddTransformerFeedbackInput } from '~/types/types'
import { DirectoryActions } from '~/store/directory/directory'

const directoryStore = namespace('directory/directory')

@Component({
  name: 'DirectoryFeedbackModal'
})
export default class DirectoryFeedbackModal extends Vue {
  @directoryStore.Action(DirectoryActions.ADD_ANALYZER_FEEDBACK)
  addAnalyzerFeedback: (args: { input: AddAnalyzerFeedbackInput }) => Promise<boolean>

  @directoryStore.Action(DirectoryActions.ADD_TRANSFORMER_FEEDBACK)
  addTransformerFeedback: (args: { input: AddTransformerFeedbackInput }) => Promise<boolean>

  @Prop()
  shortcode!: string

  @Prop({ default: true })
  isAnalyzer: boolean

  private feedback = ''
  private isAlreadyUsing = false
  private okToContact = false
  private isLoading = false

  async submitFeedback(close: () => void) {
    this.isLoading = true
    const feedbackDidSubmit = this.isAnalyzer
      ? await this.addAnalyzerFeedback({
          input: {
            feedback: this.feedback,
            isAlreadyUsing: this.isAlreadyUsing,
            okToContact: this.okToContact,
            analyzerShortcode: this.shortcode
          }
        })
      : await this.addTransformerFeedback({
          input: {
            feedback: this.feedback,
            isAlreadyUsing: this.isAlreadyUsing,
            okToContact: this.okToContact,
            shortcode: this.shortcode
          }
        })
    if (feedbackDidSubmit) {
      close()
    }
    this.isLoading = false
  }
}
</script>
