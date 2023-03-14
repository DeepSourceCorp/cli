<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close">
      <template slot="title">
        <span class="text-sm font-medium text-vanilla-400">
          Ignore issue
          <span class="font-bold text-vanilla-100">{{ issueShortcode }}</span> for
          <span class="font-bold text-vanilla-100">{{ filePath }}</span
          >?
        </span>
      </template>
      <div class="flex p-4 space-x-2 text-vanilla-400">
        <z-icon icon="alert-circle" size="medium" color="vanilla-400" />
        <div class="flex flex-col space-y-2 text-sm leading-7 text-vanilla-400">
          Doing this will remove all current occurrences of this issue and silence all the future
          ones in this file.
        </div>
      </div>
      <template slot="footer">
        <div class="px-3 py-3 space-x-2 text-right border-t text-vanilla-100 border-slate-400">
          <z-button
            class="flex items-center space-x-2 modal-primary-action"
            spacing="px-2"
            button-type="primary"
            size="small"
            icon="check"
            label="Confirm and ignore"
            loading-label="Updating issue"
            @click="confirm"
            :disabled="isLoading"
            :is-loading="isLoading"
          />
        </div>
      </template>
    </z-modal>
  </portal>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZModal, ZButton, ZCheckbox } from '@deepsource/zeal'
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
  public isLoading = false

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

    this.isLoading = true

    try {
      const response = await this.ignoreIssueForFile(params)
      this.$emit('ignoreForever', response.checkIssueIds)
    } catch (e) {
      this.$toast.danger('Something went wrong while ignoring this issue, please contact support')
      this.logErrorForUser(e, 'Ignore Issue', {
        method: 'Ignore Issue Occurence for Single File',
        ...params
      })
    } finally {
      this.isLoading = false
    }
  }
}
</script>
