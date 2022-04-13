<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close" width="wide">
      <template slot="title">
        <span class="text-sm font-medium text-vanilla-400">
          Ignore and mark this occurrence of
          <span class="font-bold text-vanilla-100">{{ issueShortcode }}</span> as a
          <span class="font-bold text-vanilla-100">false-positive</span>
        </span>
      </template>
      <div class="flex flex-col p-4 space-y-4 text-sm leading-7 text-vanilla-400">
        <span>
          This will <span class="font-bold">remove the current occurrence</span> of this issue and
          notify our team who will be available to respond to your questions.</span
        >
        <div class="flex flex-col space-y-2">
          <span>Tell us why this is a false positive (optional)</span>
          <div class="h-24 bg-ink-400">
            <z-textarea v-model="comment" textSize="sm"></z-textarea>
          </div>
        </div>
      </div>
      <template slot="footer">
        <div class="px-3 py-3 space-x-2 text-right border-t text-vanilla-100 border-ink-200">
          <z-button
            class="flex items-center space-x-2 modal-primary-action"
            spacing="px-2"
            buttonType="primary"
            size="small"
            icon="check"
            label="Confirm and ignore"
            loadingLabel="Updating issue"
            @click="confirm"
            :disabled="isLoading"
            :isLoading="isLoading"
          />
        </div>
      </template>
    </z-modal>
  </portal>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZModal, ZButton, ZCheckbox, ZTextarea } from '@deepsourcelabs/zeal'

import IssueDetailMixin from '~/mixins/issueDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

@Component({
  components: {
    ZIcon,
    ZModal,
    ZButton,
    ZCheckbox,
    ZTextarea
  }
})
export default class IgnoreIssueFalsePositive extends mixins(IssueDetailMixin, ActiveUserMixin) {
  @Prop({ default: '' })
  checkIssueId!: string

  @Prop({ default: false })
  isOpen!: boolean

  @Prop()
  shortcode?: string

  isLoading = false

  get issueShortcode(): string {
    return this.shortcode ?? this.issue.shortcode ?? this.singleIssue.shortcode
  }

  public comment = ' '

  public close(): void {
    this.$emit('close')
  }

  public async confirm(): Promise<void> {
    this.isLoading = true
    try {
      const response = await this.ignoreIssueFalsePositive({
        checkIssueId: this.checkIssueId,
        comment: this.comment
      })
      if (response.ok) {
        this.$emit('ignore', [this.checkIssueId])
      } else {
        throw new Error(`Received a non-ok response for this check`)
      }
    } catch (e) {
      this.$toast.danger('Something went wrong while reporting this false positive')
      this.logErrorForUser(e, 'Ignore Issue', {
        method: 'Report false positive',
        shortcode: this.shortcode,
        checkIssueId: this.checkIssueId,
        comment: this.comment
      })
    } finally {
      this.isLoading = false
    }
  }
}
</script>
