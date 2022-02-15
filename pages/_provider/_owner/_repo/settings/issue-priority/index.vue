<template>
  <div class="flex flex-col max-w-2xl p-4 pb-24 gap-y-2">
    <!-- title -->
    <page-title
      class="max-w-2xl items-center"
      title="Issue priority"
      description-width-class="max-w-2xl"
    >
      <template v-if="showCtaAndControls" slot="actions">
        <z-button
          v-if="canChangePriority"
          icon="flag"
          label="Assign priority"
          size="small"
          class="hidden md:flex"
          @click="isIssueSelectModalOpen = true"
        />
      </template>
    </page-title>

    <!-- Search & filter tab -->
    <div v-show="showCtaAndControls" class="flex justify-between">
      <div class="flex gap-x-2 mr-2">
        <issue-priority-sort v-model="sortType" />
        <issue-priority-filter v-model="analyzerType" />
      </div>
      <!-- add debounce triggered search when API is done -->
      <z-input
        v-model="query"
        size="small"
        icon="search"
        :showBorder="false"
        background-color="ink-300"
        placeholder="Search issues..."
        @debounceInput="onSearchQueryChange"
      >
        <template slot="left">
          <z-icon icon="search" class="ml-1.5" size="small"></z-icon>
        </template>
        <template slot="right">
          <z-icon
            icon="x"
            size="small"
            class="cursor-pointer"
            v-show="query"
            @click="clearSearch"
          ></z-icon>
        </template>
      </z-input>
    </div>

    <!-- Issues List -->
    <template v-if="$fetchState.pending">
      <div
        v-for="index in 5"
        :key="index"
        class="bg-ink-300 animate-pulse opacity-50 rounded-md p-8"
      ></div>
    </template>
    <section v-else-if="issueList.length > 0" class="flex flex-col">
      <issue-priority-card
        v-for="(issue, position) in issueList"
        :key="issue.shortcode"
        v-bind="issue"
        :priority="issue.issuePriority.repositoryIssuePriority.slug"
        :can-change-priority="canChangePriority"
        :class="{
          'border-b border-ink-200': position < issueList.length - 1
        }"
        @priority-edited="editPriority(issue.shortcode, $event)"
        @priority-unset="unsetPriority(issue.shortcode)"
      />
    </section>

    <lazy-empty-state
      v-else-if="query.length || analyzerType.length || sortType.length"
      :title="emptyStateTitle"
      :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
      :png-image-path="require('~/assets/images/ui-states/directory/empty-search.png')"
    />
    <lazy-empty-state
      v-else-if="!isLoading"
      title="No priority assignments found"
      subtitle="You haven't assigned priorities to any issues yet."
      class="border border-dashed rounded-lg border-2 border-ink-200 py-20"
    >
      <template slot="action">
        <div class="flex justify-around">
          <z-button
            v-if="canChangePriority"
            icon="flag"
            label="Assign priority"
            size="small"
            class="hidden md:flex"
            @click="isIssueSelectModalOpen = true"
          />
        </div>
      </template>
    </lazy-empty-state>

    <div v-if="totalPageCount > 1" class="flex justify-center my-6 text-sm">
      <z-pagination
        :page="currentPage"
        :total-pages="totalPageCount"
        :total-visible="5"
        @selected="updatePageNum"
      />
    </div>

    <portal to="modal">
      <choose-issue-modal
        v-if="isIssueSelectModalOpen"
        :repo-id="repository.id"
        @close="isIssueSelectModalOpen = false"
        @issues-selected="refetchIssues"
      />
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'

import { ZIcon, ZButton, ZInput, ZBadge, ZPagination } from '@deepsourcelabs/zeal'
import {
  IssuePrioritySort,
  ChooseIssueModal,
  IssuePriorityFilter,
  IssuePriorityCard
} from '@/components/IssuePriority'

import RoleAccessMixin from '~/mixins/roleAccessMixin'
import RepoDetailMixin from '@/mixins/repoDetailMixin'
import PaginationMixin from '~/mixins/paginationMixin'
import IssuePriorityListMixin from '~/mixins/issuePriorityListMixin'

import { RepoPerms } from '~/types/permTypes'
import { Issue } from '~/types/types'
import { resolveNodes } from '~/utils/array'

/**
 * Page that shows list of issue with priority set and allows to change priority
 * for a specific repository.
 */
@Component({
  components: {
    ZIcon,
    ZButton,
    ZInput,
    ZBadge,
    ZPagination,
    IssuePrioritySort,
    IssuePriorityFilter,
    ChooseIssueModal,
    IssuePriorityCard
  },
  layout: 'repository',
  middleware: ['perm'],
  meta: {
    auth: {
      strict: true,
      repoPerms: [RepoPerms.CHANGE_ISSUE_PRIORITY]
    }
  }
})
export default class SettingsIssuePriority extends mixins(
  RoleAccessMixin,
  RepoDetailMixin,
  PaginationMixin,
  IssuePriorityListMixin
) {
  public isIssueSelectModalOpen = false
  public query = ''
  public analyzerType = ''
  public sortType = ''
  public perPageCount = 10
  public issueList: Issue[] = []
  public isLoading = false

  /**
   * The fetch hook
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.refetchIssues()
  }

  /**
   * Method to fetch issue that have priority set
   *
   * @param {boolean} refetch
   * @returns {Promise<void>}
   */
  async refetchIssues(refetch = true): Promise<void> {
    this.isLoading = true
    const { repo, provider, owner } = this.$route.params
    if (!this.repository.id) {
      await this.fetchBasicRepoDetails({
        name: repo,
        provider,
        owner
      })
    }

    await this.fetchIssuesWithPriority({
      isRepositoryIssuePrioritySet: true,
      repositoryId: this.repository.id,
      q: this.query,
      first: this.perPageCount,
      offset: this.queryOffset,
      sort: this.sortType,
      analyzerShortcode: this.analyzerType,
      refetch: refetch
    })
    this.totalCount = this.issuesWithPriority.totalCount || 0
    this.issueList = resolveNodes(this.issuesWithPriority) as Issue[]
    this.isLoading = false
  }

  /**
   * Method to edit priority of an issue
   *
   * @param {string} shortcode
   * @param {string} priorityValue
   * @returns {Promise<void>}
   */
  async editPriority(shortcode: string, priorityValue: string): Promise<void> {
    try {
      await this.updateIssuePriority({
        repositoryId: this.repository.id,
        input: {
          issueShortcode: shortcode,
          repositoryId: this.repository.id,
          issuePriorityType: priorityValue
        }
      })
      this.$toast.success(`Priority edited for ${shortcode}.`)
    } catch (error) {
      this.$toast.danger(`Could not edit priority for ${shortcode}.`)
    }

    await this.refetchIssues()
  }

  /**
   * Method to unset priority of an issue
   *
   * @param {string} shortcode
   * @returns {Promise<void>}
   */
  async unsetPriority(shortcode: string): Promise<void> {
    const response = await this.unsetIssuePriority({
      input: {
        issueShortcode: shortcode,
        repositoryId: this.repository.id
      }
    })

    if (response?.ok) {
      this.$toast.success(`Priority removed for ${shortcode}.`)
      if (this.issueList.length <= 1) {
        this.currentPage = this.currentPage - 1
      }
      await this.refetchIssues()
    }
  }

  /**
   * Method to reset search query and refetch issues
   *
   * @returns {Promise<void>}
   */
  async clearSearch(): Promise<void> {
    this.query = ''
    this.currentPage = 1
    await this.refetchIssues()
  }

  /**
   * Method to refetch issues when the search query changes
   *
   * @returns {Promise<void>}
   */
  async onSearchQueryChange(query: string): Promise<void> {
    this.query = query
    this.currentPage = 1
    await this.refetchIssues()
  }

  get canChangePriority(): boolean {
    return this.$gateKeeper.repo(RepoPerms.CHANGE_ISSUE_PRIORITY, this.repoPerms.permission)
  }

  get emptyStateTitle(): string {
    if (this.query.length) {
      return `No results found for '${this.query}'`
    } else if (this.analyzerType.length) {
      return `No issues found for '${this.analyzerType}' analyzer`
    } else {
      return 'No issues found'
    }
  }

  get showCtaAndControls(): boolean {
    return (
      this.issueList.length > 0 ||
      this.query !== '' ||
      this.analyzerType !== '' ||
      this.sortType !== '' ||
      this.isLoading
    )
  }

  /**
   * Watcher to refetch issues when the analyzer type changes
   *
   * @returns {Promise<void>}
   */
  @Watch('analyzerType')
  async onAnalyzerTypeChange(): Promise<void> {
    this.currentPage = 1
    await this.refetchIssues()
  }

  /**
   * Watcher to refetch issues when the sort type changes
   *
   * @returns {Promise<void>}
   */
  @Watch('sortType')
  async onSortTypeChange(): Promise<void> {
    this.currentPage = 1
    await this.refetchIssues()
  }
}
</script>
