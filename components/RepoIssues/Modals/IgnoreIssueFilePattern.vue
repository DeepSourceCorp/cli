<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close">
      <template slot="title">
        <span class="text-sm font-medium text-vanilla-100">
          Ignore issue <span class="font-bold">{{ issueShortcode }}</span> for file pattern
        </span>
      </template>
      <div class="flex flex-col p-4 space-y-2">
        <div class="text-sm text-vanilla-400">Add file path pattern to ignore this issue for</div>
        <z-input
          v-model="pattern"
          class="py-3 font-mono"
          background-color="ink-400"
          size="small"
          placeholder="Add a valid glob pattern eg. foundations/core/*.py"
        />
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
            :disabled="!pattern || isLoading"
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
import { ZIcon, ZModal, ZButton, ZCheckbox, ZInput } from '@deepsource/zeal'
import IssueDetailMixin from '~/mixins/issueDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

@Component({
  name: 'IgnoreIssueFilePattern',
  components: {
    ZIcon,
    ZModal,
    ZButton,
    ZCheckbox,
    ZInput
  }
})
export default class IgnoreIssueFilePattern extends mixins(IssueDetailMixin, ActiveUserMixin) {
  @Prop({ default: false })
  isOpen!: boolean

  @Prop()
  checkId!: string

  @Prop()
  shortcode?: string

  public pattern = ''
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
      pattern: this.pattern
    } as {
      repoIssueId?: string
      checkId?: string
      pattern: string
      issueShortcode?: string
    }

    if (this.checkId) {
      delete params.repoIssueId
      params.checkId = this.checkId
      params.issueShortcode = this.issueShortcode
    }

    this.isLoading = true

    try {
      const response = await this.ignoreIssueFilePattern(params)
      this.$emit('ignore', response.checkIssueIds)
    } catch (e) {
      this.$toast.danger('Something went wrong while ignoring this issue, please contact support')
      this.logErrorForUser(e, 'Ignore Issue', {
        method: 'Ignore Issue File Pattern',
        ...params
      })
    } finally {
      this.isLoading = false
    }
  }
}
</script>
