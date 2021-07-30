<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close">
      <template slot="title">
        <span class="text-sm font-medium text-vanilla-100">
          Ignore issue <span class="font-bold">{{ issueShortcode }}</span> for all test files
        </span>
      </template>
      <div class="flex flex-col space-y-2 p-4">
        <template v-if="repository.config && repository.config.test_patterns">
          <div class="text-vanilla-400 text-sm leading-7">
            On confirming, this issue will be ignored for all files that match the following test
            file patterns, as defined in your
            <span class="inline bg-ink-200 px-1.5 pb-0.5 rounded-sm font-mono">deepsource.toml</span
            >.
          </div>
          <div class="flex flex-col space-y-2 text-vanilla-100 py-3 px-2 bg-ink-400 text-xs">
            <div v-for="pattern in repository.config.test_patterns" :key="pattern">
              {{ pattern }}
            </div>
          </div>
        </template>
        <div v-else class="text-vanilla-400 text-sm leading-7">
          No test patterns are defined in this repository's
          <span class="inline bg-ink-200 px-1.5 pb-0.5 rounded-sm font-mono">deepsource.toml</span
          ><br />
          You can look at the
          <a
            href="https://deepsource.io/docs/config/deepsource-toml.html#test-patterns"
            target="_blank"
            rel="noopener noreferrer"
            class="text-juniper hover:underline"
            >docs</a
          >
          for help.
        </div>
      </div>
      <template slot="footer">
        <div class="py-3 px-3 space-x-2 text-right text-vanilla-100">
          <z-button
            :disabled="!hasPatterns"
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
import { ZIcon, ZModal, ZButton, ZCheckbox, ZInput } from '@deepsourcelabs/zeal'

import IssueDetailMixin from '~/mixins/issueDetailMixin'
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

@Component({
  name: 'IgnoreIssueTestFiles',
  components: {
    ZIcon,
    ZModal,
    ZButton,
    ZCheckbox,
    ZInput
  }
})
export default class IgnoreIssueTestFiles extends mixins(
  IssueDetailMixin,
  RepoDetailMixin,
  ActiveUserMixin
) {
  @Prop({ default: false })
  isOpen!: boolean

  @Prop()
  checkId!: string

  @Prop()
  shortcode?: string

  get hasPatterns(): boolean {
    const testPatterns = this.repository.config?.test_patterns ?? []
    return testPatterns.length > 0
  }

  async fetch(): Promise<void> {
    await this.fetchRepoDetails(this.baseRouteParams)
  }

  public close(): void {
    this.$emit('close')
  }

  get issueShortcode(): string {
    return this.shortcode ?? this.issue.shortcode ?? this.singleIssue.shortcode
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
      const response = await this.ignoreIssueTestPattern(params)
      this.$emit('ignore', response.checkIssueIds)
    } catch (e) {
      this.$toast.danger('Something went wrong while ignoring this issue, please contact support')
      this.logSentryErrorForUser(e, 'Ignore Issue', {
        method: 'Ignore Issue Test Files',
        ...params
      })
    }
  }
}
</script>
