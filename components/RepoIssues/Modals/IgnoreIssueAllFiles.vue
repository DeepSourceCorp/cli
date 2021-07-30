<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close">
      <template slot="title">
        <span class="text-sm font-medium text-vanilla-400"
          >Ignore issue <span class="text-vanilla-100 font-bold">{{ issueShortcode }}</span> for
          this repository?</span
        >
      </template>
      <div class="flex space-x-2 p-4 text-vanilla-400">
        <z-icon icon="alert-circle" size="medium" color="vanilla-400"></z-icon>
        <div class="text-vanilla-400 text-sm leading-7">
          Doing this will <span class="text-vanilla-100">remove all current occurrences</span> of
          this issue and <span class="text-vanilla-100">silence all the future ones</span> in this
          repository.
        </div>
      </div>
      <template slot="footer">
        <div class="py-2 px-3 space-x-2 text-right text-vanilla-100 border-ink-200 border-t">
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
  name: 'IgnoreIssueAllFiles',
  components: {
    ZIcon,
    ZModal,
    ZButton,
    ZCheckbox
  }
})
export default class IgnoreIssueAllFiles extends mixins(IssueDetailMixin, ActiveUserMixin) {
  @Prop({ default: false })
  isOpen!: boolean

  @Prop()
  checkId!: string

  @Prop()
  shortcode?: string

  get issueShortcode(): string {
    return this.shortcode ?? this.issue.shortcode ?? this.singleIssue.shortcode
  }

  public close(): void {
    this.$emit('close')
  }

  public async confirm(): Promise<void> {
    const params = {
      repoIssueId: this.issue.id
    } as {
      repoIssueId?: string
      checkId?: string
      issueShortcode?: string
    }

    if (this.checkId) {
      delete params.repoIssueId
      params.checkId = this.checkId
      params.issueShortcode = this.issueShortcode
    }

    try {
      const response = await this.ignoreIssueRepository(params)
      this.$emit('ignore', response.checkIssueIds)
    } catch (e) {
      this.$toast.danger('Something went wrong while ignoring this issue, please contact support')
      this.logSentryErrorForUser(e, 'Ignore Issue', {
        method: 'Ignore Issue All Files',
        ...params
      })
    }
  }
}
</script>
