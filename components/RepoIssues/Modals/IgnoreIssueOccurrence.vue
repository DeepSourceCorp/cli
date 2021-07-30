<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close">
      <template slot="title">
        <span class="text-sm font-medium text-vanilla-400">
          Ignore issue
          <span class="text-vanilla-100 font-bold">{{ issueShortcode }}</span> for
          <span class="text-vanilla-100 font-bold">{{ filePath }}</span
          >?
        </span>
      </template>
      <div class="flex space-x-2 p-4 text-vanilla-400">
        <z-icon icon="alert-circle" size="medium" color="vanilla-400"></z-icon>
        <div class="text-vanilla-400 text-sm leading-7 flex flex-col space-y-2">
          Doing this will remove all current occurrences of this issue and silence all the future
          ones in this file.
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
import { ZIcon, ZModal, ZButton, ZCheckbox } from '@deepsourcelabs/zeal'
import IssueDetailMixin from '~/mixins/issueDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

@Component({
  components: {
    ZIcon,
    ZModal,
    ZButton,
    ZCheckbox
  }
})
export default class IgnoreIssueOccurence extends mixins(IssueDetailMixin, ActiveUserMixin) {
  @Prop({ default: false })
  isOpen!: boolean

  @Prop()
  filePath!: string

  @Prop()
  checkId!: string

  @Prop()
  shortcode?: string

  public selectedValue = false

  public close(): void {
    this.$emit('close')
  }

  get issueShortcode(): string {
    return this.shortcode ?? this.issue.shortcode ?? this.singleIssue.shortcode
  }

  public async confirm(): Promise<void> {
    const params = {
      repoIssueId: this.issue.id,
      filePath: this.filePath
    } as {
      repoIssueId?: string
      checkId?: string
      filePath: string
      issueShortcode?: string
    }

    if (this.checkId) {
      delete params.repoIssueId
      params.checkId = this.checkId
      params.issueShortcode = this.issueShortcode
    }
    try {
      const response = await this.ignoreIssueForFile(params)
      this.$emit('ignoreForever', response.checkIssueIds)
    } catch (e) {
      this.$toast.danger('Something went wrong while ignoring this issue, please contact support')
      this.logSentryErrorForUser(e, 'Ignore Issue', {
        method: 'Ignore Issue Occurence for Single File',
        ...params
      })
    }
  }
}
</script>
