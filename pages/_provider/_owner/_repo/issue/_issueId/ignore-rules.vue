<template>
  <div class="relative top-0 p-4 w-4/6 flex flex-col space-y-0 xl:space-y-4">
    <div v-if="isListLoading" class="space-y-2">
      <div v-for="idx in 3" :key="idx" class="h-20 rounded-md bg-ink-300 animate-pulse"></div>
    </div>

    <div v-else-if="ignoreRules && ignoreRules.length" class="flex flex-col space-y-2">
      <ignored-rule
        v-for="rule in ignoreRules"
        :key="rule.id"
        :rule="rule"
        @delete-rule-triggered="openModal"
      />
    </div>

    <div v-else class="w-full h-72 flex items-center justify-center text-vanilla-400">
      <empty-state title="No ignore rules found" />
    </div>

    <ignored-rule-delete-modal
      :is-open="isModalOpen"
      @close="closeModal"
      @delete="deleteRuleHandler"
    />
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import IssueDetailMixin from '~/mixins/issueDetailMixin'
import RepoDetailMixin from '@/mixins/repoDetailMixin'
import { SilenceRule } from '~/types/types'

@Component({
  layout: 'repository'
})
export default class IssuesDetails extends mixins(IssueDetailMixin, RepoDetailMixin) {
  checkIssueId = ''
  isModalOpen = false
  isListLoading = false

  ignoreRules = [] as Array<SilenceRule>

  /**
   * The fetch hook
   * Fetch silence rules from the network
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    try {
      await this.fetchIgnoreRules()
    } catch (err) {
      this.$logErrorAndToast(err as Error, 'Something went wrong while fetching the ignore rules')
    }
  }

  /**
   * Method to close the delete ignored rule modal
   *
   * @returns {void}
   */
  closeModal(): void {
    this.checkIssueId = ''
    this.isModalOpen = false
  }

  /**
   * Handler for the delete ignored rule modal primary action
   * Trigger the `deleteSilenceRule` GQL mutation
   *
   * @returns {Promise<void>}
   */
  async deleteRuleHandler(): Promise<void> {
    try {
      await this.deleteIgnoredRule({
        silenceRuleId: this.checkIssueId
      })

      // Re-fetch ignore rules
      await this.fetchIgnoreRules()
    } catch (err) {
      this.$logErrorAndToast(err as Error, 'Something went wrong while ignoring the rule')
    } finally {
      this.isModalOpen = false
    }
  }

  /**
   * Method to open the delete ignored rule modal
   *
   * @param {string} checkIssueId
   * @returns {void}
   */
  openModal(checkIssueId: string): void {
    this.checkIssueId = checkIssueId
    this.isModalOpen = true
  }

  /**
   * Method to fetch silence rules from the network by default
   *
   * @returns {Promise<void>}
   */
  async fetchIgnoreRules(refetch = true): Promise<void> {
    this.isListLoading = true

    // Fetch ignore rules and populate `ignoreRules` data property with the response
    this.ignoreRules = await this.fetchSilenceRules({
      ...this.baseRouteParams,
      limit: 30,
      issueCode: this.$route.params.issueId,
      refetch
    })

    this.isListLoading = false
  }
}
</script>
