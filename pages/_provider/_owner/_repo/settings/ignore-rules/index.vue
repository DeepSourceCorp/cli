<template>
  <div class="flex flex-col max-w-2xl p-4 gap-y-2">
    <!-- title -->
    <h2 class="mb-4 text-lg font-medium">Ignored rules</h2>
    <!-- List of Ignored rules -->
    <div v-if="loadingRules" class="space-y-2">
      <div v-for="idx in 3" :key="idx" class="h-20 rounded-md bg-ink-300 animate-pulse"></div>
    </div>
    <div
      v-else-if="repository.silenceRules && repository.silenceRules.totalCount > 0"
      class="flex flex-col divide-y divide-ink-300"
    >
      <ignored-rule
        v-for="(rule, idx) in repository.silenceRules.edges"
        :key="rule.node.id"
        :rule="rule.node"
        :vertical-padding="idx === 0 ? 'pb-4' : 'py-4'"
        @delete-rule-triggered="openDeleteRuleModal"
      />
    </div>
    <empty-state
      v-else
      title="No ignored rules"
      class="py-20 border-2 border-dashed rounded-lg border-ink-200"
    />
    <ignored-rule-delete-modal
      :isOpen="isDeleteModalOpen"
      :silenceRuleId="deleteRuleId"
      @close="closeDeleteModal"
      @delete="deleteRule"
    ></ignored-rule-delete-modal>
  </div>
</template>

<script lang="ts">
import { Component, namespace, mixins } from 'nuxt-property-decorator'
import { IgnoredRule } from '@/components/Repository/index'
import { IgnoredRuleDeleteModal } from '@/components/Settings/index'
import { ZDivider, ZInput, ZMenu, ZMenuItem, ZIcon } from '@deepsourcelabs/zeal'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

const repoStore = namespace('repository/detail')

/**
 * Page that shows list of rules that are ignored
 * for a specific repository.
 */
@Component({
  components: {
    IgnoredRule,
    IgnoredRuleDeleteModal,
    ZDivider,
    ZInput,
    ZMenu,
    ZMenuItem,
    ZIcon
  },
  layout: 'repository'
})
export default class IgnoreRules extends mixins(RepoDetailMixin) {
  public loadingRules = false
  public searchRule = ''
  filters: Array<Record<string, string | boolean>> = [
    { label: 'Most Frequent', icon: 'most-frequent', name: 'most-frequent' },
    { label: 'Least Frequent', icon: 'least-frequent', name: 'least-frequent' },
    { label: 'First Seen', icon: 'first-seen', name: 'first-seen' },
    { label: 'Last Seen', icon: 'last-seen', name: 'last-seen' }
  ]
  public deleteRuleId: string = ''
  public isDeleteModalOpen = false

  /**
   * Method to fetch ignored rules
   *
   * @returns {Promise<void>}
   * @param {boolean} refetch
   */
  async refetchIgnoreRules(refetch = false): Promise<void> {
    this.loadingRules = true
    await this.fetchRepositorySettingsIgnoreRules({
      ...this.baseRouteParams,
      limit: 30,
      currentPageNumber: 1,
      refetch
    })
    this.loadingRules = false
  }

  /**
   * fetch hook for vue component
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    this.refetchIgnoreRules()
  }

  /**
   * Method to open the delete modal
   * and set the deleteRuleId
   *
   * @returns {void}
   * @param {string} ruleId
   */
  openDeleteRuleModal(ruleId: string): void {
    this.deleteRuleId = ruleId
    this.isDeleteModalOpen = true
  }

  /**
   * Method to close the delete modal
   * and reset the deleteRuleId
   *
   * @returns {void}
   */
  closeDeleteModal(): void {
    this.isDeleteModalOpen = false
    this.deleteRuleId = ''
  }

  /**
   * Method to delete a rule
   *
   * @returns {Promise<void>}
   */
  async deleteRule(): Promise<void> {
    await this.deleteIgnoredRule({
      silenceRuleId: this.deleteRuleId
    })
    await this.refetchIgnoreRules(true)
  }
}
</script>
