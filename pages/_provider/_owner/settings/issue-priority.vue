<template>
  <div class="flex max-w-3xl flex-col gap-y-2 p-4 pb-24">
    <!-- title -->
    <page-title
      title="Issue priority"
      description-width-class="max-w-3xl"
      class="max-w-3xl items-center"
    >
      <template v-if="showCtaAndControls" #actions>
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
      <div class="mr-2 flex gap-x-2">
        <issue-priority-sort v-model="sortType" />
        <issue-priority-filter v-model="analyzerType" :level="ownerLevel" />
      </div>
      <!-- add debounce triggered search when API is done -->
      <z-input
        v-model="query"
        :show-border="false"
        size="small"
        icon="search"
        background-color="ink-300"
        placeholder="Search issues..."
        @debounceInput="onSearchQueryChange"
      >
        <template #left>
          <z-icon icon="search" size="small" class="ml-1.5" />
        </template>
        <template #right>
          <z-icon
            v-show="query"
            icon="x"
            size="small"
            class="cursor-pointer"
            @click="clearSearch"
          />
        </template>
      </z-input>
    </div>

    <!-- Issues List -->
    <template v-if="$fetchState.pending">
      <div
        v-for="index in 5"
        :key="index"
        class="animate-pulse rounded-md bg-ink-300 p-8 opacity-50"
      ></div>
    </template>
    <section v-else-if="issueList.length > 0" class="mt-1 flex flex-col">
      <issue-priority-card
        v-for="(issue, position) in issueList"
        :key="issue.shortcode"
        v-bind="issue"
        :priority="issue.issuePriority.ownerIssuePriority.slug"
        :can-change-priority="canChangePriority"
        :class="{
          'border-b border-slate-400': position < issueList.length - 1
        }"
        @priority-edited="editPriority(issue.shortcode, $event)"
        @priority-unset="unsetPriority(issue.shortcode)"
      />
    </section>

    <lazy-empty-state
      v-else-if="query.length || analyzerType.length || sortType.length"
      :title="emptyStateTitle"
      :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
      :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
    />
    <lazy-empty-state
      v-else-if="!isLoading"
      :use-v2="true"
      title="No priority assignments found"
      subtitle="You haven't assigned priorities to any issues yet."
      class="rounded-lg border border-2 border-dashed border-slate-400 py-20"
    >
      <template #action>
        <div class="flex">
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

    <div v-if="totalPageCount > 1" class="my-6 flex justify-center text-sm">
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
        :object-id="owner.id"
        :level="ownerLevel"
        @close="isIssueSelectModalOpen = false"
        @issues-selected="refetchIssues"
      />
    </portal>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'

import {
  IssuePrioritySort,
  ChooseIssueModal,
  IssuePriorityFilter,
  IssuePriorityCard
} from '@/components/IssuePriority'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import PaginationMixin from '~/mixins/paginationMixin'
import IssuePriorityListMixin from '~/mixins/issuePriorityListMixin'

import { TeamPerms } from '~/types/permTypes'
import { Issue, IssuePriorityLevel } from '~/types/types'
import { resolveNodes } from '~/utils/array'

/**
 * Page that shows list of issue with priority set and allows to change priority
 * for a specific team.
 */
@Component({
  components: {
    IssuePrioritySort,
    IssuePriorityFilter,
    ChooseIssueModal,
    IssuePriorityCard
  },
  layout: 'dashboard',
  middleware: ['perm', 'teamOnly'],
  meta: {
    auth: {
      strict: true,
      teamPerms: [TeamPerms.MANAGE_OWNER_ISSUE_PRIORITY]
    }
  }
})
export default class SettingsIssuePriority extends mixins(
  ActiveUserMixin,
  OwnerDetailMixin,
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
    const { owner, provider } = this.$route.params
    if (!this.owner.id) {
      await this.fetchOwnerDetails({ login: owner, provider })
    }

    await this.fetchIssuesWithPriority({
      isIssuePrioritySet: true,
      objectId: this.owner.id,
      level: IssuePriorityLevel.Owner,
      q: this.query,
      first: this.perPageCount,
      offset: this.queryOffset,
      sort: this.sortType,
      analyzerShortcode: this.analyzerType,
      refetch: refetch
    })
    this.totalCount = this.issuesWithPriority.totalCount || 0
    this.issueList = resolveNodes(this.issuesWithPriority)
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
        objectId: this.owner.id,
        level: IssuePriorityLevel.Owner,
        input: {
          issueShortcode: shortcode,
          objectId: this.owner.id,
          level: IssuePriorityLevel.Owner,
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
        objectId: this.owner.id,
        level: IssuePriorityLevel.Owner
      }
    })

    if (response?.ok) {
      this.$toast.success(`Priority removed for ${shortcode}.`)
      if (this.issueList.length <= 1 && this.currentPage > 1) {
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

  get ownerLevel(): IssuePriorityLevel {
    return IssuePriorityLevel.Owner
  }

  get canChangePriority(): boolean {
    return this.$gateKeeper.team(TeamPerms.MANAGE_OWNER_ISSUE_PRIORITY, this.teamPerms.permission)
  }

  get emptyStateTitle(): string {
    if (this.query.length) {
      return `No results found for '${this.query}'`
    }
    if (this.analyzerType.length) {
      return `No issues found for '${this.analyzerType}' analyzer`
    }
    return 'No issues found'
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
