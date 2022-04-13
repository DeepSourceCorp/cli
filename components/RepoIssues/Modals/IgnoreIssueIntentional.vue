<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close">
      <template slot="title">
        <span class="text-sm font-medium text-vanilla-400">
          Ignore and mark this occurrence of
          <span class="font-bold text-vanilla-100">{{ issueShortcode }}</span> as intentional
        </span>
      </template>
      <div class="flex p-4 space-x-2 text-vanilla-400">
        <z-icon icon="alert-circle" size="medium" color="vanilla-400"></z-icon>
        <div class="flex flex-col space-y-2 text-sm leading-7 text-vanilla-400">
          <span>This will only remove the current occurrence of this issue.</span>
          <span
            ><span class="font-bold"
              >We recommend adding a <span class="bg-ink-200 px-1.5 pb-0.5">skipcq</span> rule</span
            >
            in your source code so this occurrence does not repeat in the future. For help, please
            read the
            <a
              href="https://deepsource.io/docs/setup-analysis#silencing-a-specific-issue"
              target="_blank"
              rel="noopener noreferrer"
              class="text-juniper hover:underline"
              >documentation</a
            >.
          </span>
        </div>
      </div>
      <template slot="footer">
        <div class="px-3 py-2 space-x-2 text-right border-t text-vanilla-100 border-ink-200">
          <z-button
            class="flex items-center space-x-2 modal-primary-action"
            spacing="px-2"
            buttonType="primary"
            size="small"
            icon="check"
            label="Confirm and ignore"
            :isLoading="isLoading"
            :disabled="isLoading"
            loadingLabel="Updating issue"
            @click="confirm"
          />
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
        this.$emit('ignore', [this.checkIssueId])
      } else {
        throw new Error(`Received a non-ok response for this check`)
      }
    } catch (e) {
      this.$toast.danger('Something went wrong while ignoring this issue')
      this.logErrorForUser(e, 'Ignore Issue', {
        method: 'Ignore issue intentional',
        shortcode: this.shortcode,
        checkIssueId: this.checkIssueId
      })
    } finally {
      this.isLoading = false
    }
  }
}
</script>
