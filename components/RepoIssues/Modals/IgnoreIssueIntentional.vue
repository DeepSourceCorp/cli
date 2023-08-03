<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close">
      <template #title>
        <span class="text-sm font-medium text-vanilla-400">
          Ignore and mark this occurrence of
          <span class="font-bold text-vanilla-100">{{ issueShortcode }}</span> as intentional
        </span>
      </template>
      <div class="flex space-x-2 p-4 text-vanilla-400">
        <z-icon icon="alert-circle" size="medium" color="vanilla-400" />
        <div class="flex flex-col space-y-2 text-sm leading-7 text-vanilla-400">
          <span>This will only remove the current occurrence of this issue.</span>
          <span
            ><span class="font-bold"
              >We recommend adding a <span class="bg-ink-200 px-1.5 pb-0.5">skipcq</span> rule</span
            >
            in your source code so this occurrence does not repeat in the future. For help, please
            read the
            <a
              href="https://docs.deepsource.com/docs/issues-ignore-rules#silencing-a-specific-issue"
              target="_blank"
              rel="noopener noreferrer"
              class="text-juniper hover:underline"
              >documentation</a
            >.
          </span>
        </div>
      </div>
      <template #footer>
        <div class="space-x-2 border-t border-slate-400 px-3 py-2 text-right text-vanilla-100">
          <z-button
            class="modal-primary-action flex items-center space-x-2"
            spacing="px-2"
            button-type="primary"
            size="small"
            icon="check"
            label="Confirm and ignore"
            :is-loading="isLoading"
            :disabled="isLoading"
            loading-label="Updating issue"
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
export default class IgnoreIssueIntentional extends mixins(IssueDetailMixin, ActiveUserMixin) {
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

  public selectedValue = false

  public close(): void {
    this.$emit('close')
  }

  public async confirm(): Promise<void> {
    this.isLoading = true
    try {
      const response = await this.updateIgnoreCheckIssue({
        checkIssueId: this.checkIssueId
      })
      if (response.ok) {
        this.$toast.success(`Ignored the current occurrence of ${this.issueShortcode}.`)

        this.$emit('ignore', [this.checkIssueId])
      } else {
        throw new Error('Received a non-ok response for this check')
      }
    } catch (e) {
      this.logErrorForUser(
        e as Error,
        'Ignore Issue',
        {
          method: 'Ignore issue intentional',
          shortcode: this.shortcode,
          checkIssueId: this.checkIssueId
        },
        'Something went wrong while ignoring this issue, please contact support.'
      )
    } finally {
      this.isLoading = false
    }
  }
}
</script>
