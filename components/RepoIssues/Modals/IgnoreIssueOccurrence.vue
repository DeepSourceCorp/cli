<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close">
      <template #title>
        <span class="text-sm font-medium text-vanilla-400">
          Ignore issue
          <span class="font-bold text-vanilla-100">{{ issueShortcode }}</span> for
          <span class="font-bold text-vanilla-100">{{ filePath }}</span
          >?
        </span>
      </template>
      <div class="flex space-x-2 p-4 text-vanilla-400">
        <z-icon icon="alert-circle" size="medium" color="vanilla-400" />
        <div class="flex flex-col space-y-2 text-sm leading-7 text-vanilla-400">
          Doing this will remove all current occurrences of this issue and silence all the future
          ones in this file.
        </div>
      </div>
      <template #footer>
        <div class="space-x-2 border-t border-slate-400 px-3 py-3 text-right text-vanilla-100">
          <z-button
            class="modal-primary-action flex items-center space-x-2"
            spacing="px-2"
            button-type="primary"
            size="small"
            icon="check"
            label="Confirm and ignore"
            loading-label="Updating issue"
            :disabled="isLoading"
            :is-loading="isLoading"
            @click="confirm"
          />
        </div>
      </template>
    </z-modal>
  </portal>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'
import IssueDetailMixin from '~/mixins/issueDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

@Component({})
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

      this.$toast.success(
        `Ignored all occurrences of ${this.issueShortcode} for ${params.filePath}.`
      )
      this.$emit('ignoreForever', response.checkIssueIds)
    } catch (e) {
      this.logErrorForUser(
        e as Error,
        'Ignore Issue',
        {
          method: 'Ignore Issue Occurence for Single File',
          ...params
        },
        'Something went wrong while ignoring this issue, please contact support.'
      )
    } finally {
      this.isLoading = false
    }
  }
}
</script>
