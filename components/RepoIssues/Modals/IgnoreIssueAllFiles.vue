<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close">
      <template slot="title">
        <span class="text-sm font-medium text-vanilla-400"
          >Ignore issue <span class="font-bold text-vanilla-100">{{ issueShortcode }}</span> for
          this repository?</span
        >
      </template>
      <div class="flex p-4 space-x-2 text-vanilla-400">
        <z-icon icon="alert-circle" size="medium" color="vanilla-400" />
        <div class="text-sm leading-7 text-vanilla-400">
          Doing this will <span class="text-vanilla-100">remove all current occurrences</span> of
          this issue and <span class="text-vanilla-100">silence all the future ones</span> in this
          repository.
        </div>
      </div>
      <template slot="footer">
        <div class="px-3 py-2 space-x-2 text-right border-t text-vanilla-100 border-slate-400">
          <z-button
            class="flex items-center space-x-2 modal-primary-action"
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
import { ZIcon, ZModal, ZButton, ZCheckbox } from '@deepsource/zeal'

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

  isLoading = false

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

    this.isLoading = true

    try {
      const response = await this.ignoreIssueRepository(params)
      this.$emit('ignore', response.checkIssueIds)
    } catch (e) {
      this.$toast.danger('Something went wrong while ignoring this issue, please contact support')
      this.logErrorForUser(e, 'Ignore Issue', {
        method: 'Ignore Issue All Files',
        ...params
      })
    } finally {
      this.isLoading = false
    }
  }
}
</script>
