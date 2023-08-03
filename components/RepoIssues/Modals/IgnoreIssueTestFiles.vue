<template>
  <portal to="modal">
    <z-modal v-if="isOpen" @onClose="close">
      <template #title>
        <span class="text-sm font-medium text-vanilla-100">
          Ignore issue <span class="font-bold">{{ issueShortcode }}</span> for all test files
        </span>
      </template>
      <div class="flex flex-col space-y-2 p-4">
        <template v-if="repository.config && repository.config.test_patterns">
          <div class="text-sm leading-7 text-vanilla-400">
            On confirming, this issue will be ignored for all files that match the following test
            file patterns, as defined in your
            <span class="inline rounded-sm bg-ink-200 px-1.5 pb-0.5 font-mono">deepsource.toml</span
            >.
          </div>
          <div class="flex flex-col space-y-2 bg-ink-400 px-2 py-3 text-xs text-vanilla-100">
            <div v-for="pattern in repository.config.test_patterns" :key="pattern">
              {{ pattern }}
            </div>
          </div>
        </template>
        <div v-else class="text-sm leading-7 text-vanilla-400">
          No test patterns are defined in this repository's
          <span class="inline rounded-sm bg-ink-200 px-1.5 pb-0.5 font-mono">deepsource.toml</span
          ><br />
          You can look at the
          <a
            href="https://docs.deepsource.com/docs/configuration#test_patterns"
            target="_blank"
            rel="noopener noreferrer"
            class="text-juniper hover:underline"
            >docs</a
          >
          for help.
        </div>
      </div>
      <template #footer>
        <div class="space-x-2 px-3 py-3 text-right text-vanilla-100">
          <z-button
            class="modal-primary-action flex items-center space-x-2"
            spacing="px-2"
            button-type="primary"
            size="small"
            icon="check"
            label="Confirm and ignore"
            loading-label="Updating issue"
            :disabled="!hasPatterns || isLoading"
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
import RepoDetailMixin from '~/mixins/repoDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

@Component({
  name: 'IgnoreIssueTestFiles'
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

  isLoading = false

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

    this.isLoading = true

    try {
      const response = await this.ignoreIssueTestPattern(params)
      this.$toast.success(`${this.issueShortcode} ignored for all test files.`)

      this.$emit('ignore', response.checkIssueIds)
    } catch (e) {
      this.logErrorForUser(
        e as Error,
        'Ignore Issue',
        {
          method: 'Ignore Issue Test Files',
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
