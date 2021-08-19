<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close">
      <template slot="title">
        <span class="text-sm font-medium text-vanilla-400">
          Ignore and mark this occurrence of
          <span class="text-vanilla-100 font-bold">{{ issueShortcode }}</span> as intentional
        </span>
      </template>
      <div class="flex space-x-2 p-4 text-vanilla-400">
        <z-icon icon="alert-circle" size="medium" color="vanilla-400"></z-icon>
        <div class="text-vanilla-400 text-sm leading-7 flex flex-col space-y-2">
          <span>This will only remove the current occurrence of this issue.</span>
          <span
            ><span class="font-bold"
              >We recommend adding a <span class="bg-ink-200 px-1.5 pb-0.5">skipcq</span> rule</span
            >
            in your source code so this occurrence does not repeat in the future. For help, please
            read the documentation.</span
          >
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
  components: {
    ZIcon,
    ZModal,
    ZButton,
    ZCheckbox
  }
})
export default class IgnoreIssueIntentional extends mixins(IssueDetailMixin, ActiveUserMixin) {
  @Prop({ default: '' })
  checkIssueId!: string

  @Prop({ default: false })
  isOpen!: boolean

  @Prop()
  shortcode?: string

  get issueShortcode(): string {
    return this.shortcode ?? this.issue.shortcode ?? this.singleIssue.shortcode
  }

  public selectedValue = false

  public close(): void {
    this.$emit('close')
  }

  public async confirm(): Promise<void> {
    try {
      const response = await this.updateIgnoreCheckIssue({
        checkIssueId: this.checkIssueId
      })
      if (response.ok) {
        this.$emit('ignore', [this.checkIssueId])
      } else {
        throw new Error(`Received a non-ok response for this check`)
      }
    } catch (e) {
      this.$toast.danger('Something went wrong while ignoring this issue')
      this.logSentryErrorForUser(e, 'Ignore Issue', {
        method: 'Ignore issue intentional',
        shortcode: this.shortcode,
        checkIssueId: this.checkIssueId
      })
    }
  }
}
</script>
