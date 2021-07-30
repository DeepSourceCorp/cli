<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close" width="wide">
      <template slot="title">
        <span class="text-sm font-medium text-vanilla-400">
          Ignore and mark this occurrence of
          <span class="text-vanilla-100 font-bold">{{ issueShortcode }}</span> as a
          <span class="text-vanilla-100 font-bold">false-positive</span>
        </span>
      </template>
      <div class="text-vanilla-400 text-sm leading-7 flex flex-col space-y-4 p-4">
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
        <div class="py-3 px-3 space-x-2 text-right text-vanilla-100 border-ink-200 border-t">
          <z-button
            class="modal-primary-action flex space-x-2 items-center"
            spacing="px-2"
            buttonType="primary"
            size="small"
            @click="confirm"
          >
            <z-icon icon="check" size="small" color="ink-300"></z-icon>
            <span class="text-xs text-ink-300">Confirm and ignore</span>
          </z-button>
        </div>
      </template>
    </z-modal>
  </portal>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZModal, ZButton, ZCheckbox, ZTextarea } from '@deepsourcelabs/zeal'

import IssueDetailMixin from '~/mixins/issueDetailMixin'

@Component({
  components: {
    ZIcon,
    ZModal,
    ZButton,
    ZCheckbox,
    ZTextarea
  }
})
export default class IgnoreIssueFalsePositive extends mixins(IssueDetailMixin) {
  @Prop({ default: '' })
  checkIssueId!: string

  @Prop({ default: false })
  isOpen!: boolean

  @Prop()
  shortcode?: string

  get issueShortcode(): string {
    return this.shortcode ?? this.issue.shortcode ?? this.singleIssue.shortcode
  }

  public comment = ' '

  public close(): void {
    this.$emit('close')
  }

  public async confirm(): Promise<void> {
    await this.ignoreIssueFalsePositive({
      checkIssueId: this.checkIssueId,
      comment: this.comment
    })
    this.$emit('ignore')
  }
}
</script>
