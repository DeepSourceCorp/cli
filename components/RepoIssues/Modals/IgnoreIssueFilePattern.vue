<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close">
      <template slot="title">
        <span class="text-sm font-medium text-vanilla-100">
          Ignore issue <span class="font-bold">{{ issueShortcode }}</span> for file pattern
        </span>
      </template>
      <div class="flex flex-col space-y-2 p-4">
        <div class="text-vanilla-400 text-sm">Add file path pattern to ignore this issue for</div>
        <z-input
          v-model="pattern"
          class="py-3 font-mono"
          backgroundColor="ink-400"
          size="small"
          placeholder="Add a valid glob pattern eg. foundations/core/*.py"
        ></z-input>
      </div>
      <template slot="footer">
        <div class="py-3 px-3 space-x-2 text-right text-vanilla-100 border-t border-ink-200">
          <z-button
            class="modal-primary-action flex space-x-2 items-center"
            spacing="px-2"
            buttonType="primary"
            size="small"
            @click="confirm"
            :disabled="pattern ? false : true"
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
import { ZIcon, ZModal, ZButton, ZCheckbox, ZInput } from '@deepsourcelabs/zeal'
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

    try {
      const response = await this.ignoreIssueFilePattern(params)
      this.$emit('ignore', response.checkIssueIds)
    } catch (e) {
      this.$toast.danger('Something went wrong while ignoring this issue, please contact support')
      this.logSentryErrorForUser(e, 'Ignore Issue', {
        method: 'Ignore Issue File Pattern',
        ...params
      })
    }
  }
}
</script>
