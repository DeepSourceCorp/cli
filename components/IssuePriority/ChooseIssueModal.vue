<template>
  <z-modal
    title="Select issues and assign priorities"
    width="wide"
    primary-action-label="Done"
    primary-action-icon="check"
    @onClose="onModalClose"
    @primaryAction="$emit('issues-selected')"
  >
    <section class="flex flex-col gap-y-3 p-4 pb-0">
      <!-- Search & filter tab -->
      <div class="flex justify-between">
        <div class="flex gap-x-2 mr-2">
          <issue-priority-filter
            v-model="analyzerType"
            :level="level"
            button-background="bg-ink-200 hover:bg-ink-100"
          />
        </div>
        <!-- add debounce triggered search when API is done -->
        <z-input
          v-model="query"
          :show-border="false"
          size="small"
          background-color="ink-200"
          placeholder="Search for an issue..."
          class="text-sm"
          @debounceInput="onSearchQueryChange"
        >
          <template slot="left">
            <z-icon icon="search" size="small" class="flex-shrink-0 p-px" />
          </template>
          <template slot="right">
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

      <div class="flex flex-col border border-ink-200 rounded-md h-96 2xl:h-102 overflow-y-auto">
        <template v-if="$fetchState.pending">
          <div
            v-for="index in 10"
            :key="index"
            class="bg-ink-200 animate-pulse opacity-50 p-8 border-b border-ink-100"
          ></div>
        </template>

        <template v-else-if="issueList.length > 0">
          <base-card
            v-for="issue in issueList"
            :key="issue.shortcode"
            :remove-default-style="true"
            :class="{
              'border-b border-ink-200': issueList.length > 0
            }"
          >
            <template slot="title">
              <p class="text-sm font-semibold text-vanilla-300">
                <span v-html="escapeHtml(issue.title)" />
                <span class="ml-1 text-xs font-normal text-vanilla-400 whitespace-nowrap"
                  >{{ issue.shortcode }}
                </span>
              </p>
            </template>
            <template slot="description">
              <div class="flex flex-wrap gap-x-4 text-xs">
                <!-- Analyzer type -->
                <div class="flex items-center gap-x-1.5">
                  <analyzer-logo v-bind="issue.analyzer" :hide-tooltip="true" size="small" />
                  <span class="text-sm text-vanilla-400 tracking-wide capitalize">
                    {{ issue.analyzer.name }}
                  </span>
                </div>
                <!-- Issue type -->
                <div class="flex items-center gap-x-1.5">
                  <z-icon :icon="issue.issueType" size="x-small" color="vanilla-400" />
                  <span class="text-vanilla-400 tracking-wide capitalize">
                    {{ issue.issueType }}
                  </span>
                </div>
              </div>
            </template>
            <template slot="info">
              <div class="flex justify-end pt-3 pr-3">
                <priority-type-select
                  :priority="issue.priority"
                  direction="left"
                  @priority-changed="setPriority(issue.shortcode, $event)"
                />
              </div>
            </template>
          </base-card>
        </template>

        <lazy-empty-state
          v-else-if="query.length"
          :title="`No results found for '${query}'`"
          :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
          :png-image-path="require('~/assets/images/ui-states/directory/empty-search.png')"
          class="my-auto"
        />
        <lazy-empty-state v-else title="No issues found" />

        <div v-if="totalPageCount > 1" class="flex justify-center my-6 text-sm">
          <z-pagination
            :page="currentPage"
            :total-pages="totalPageCount"
            :total-visible="5"
            @selected="updatePageNum"
          />
        </div>
      </div>
    </section>
  </z-modal>
</template>
<script lang="ts">
import { Component, Watch, mixins, Prop } from 'nuxt-property-decorator'
import { ZModal, ZInput, ZButton, ZIcon, ZPagination } from '@deepsourcelabs/zeal'
import PriorityTypeSelect from './PriorityTypeSelect.vue'
import IssuePrioritySort from './IssuePrioritySort.vue'
import IssuePriorityFilter from './IssuePriorityFilter.vue'
import AnalyzerLogo from '~/components/AnalyzerLogo.vue'
import { escapeHtml } from '~/utils/string'

import PaginationMixin from '~/mixins/paginationMixin'
import IssuePriorityListMixin from '~/mixins/issuePriorityListMixin'
import { resolveNodes } from '~/utils/array'
import { Issue, IssuePriorityLevel } from '~/types/types'

/**
 * Modal component to set priorities for issues
 */
@Component({
  components: {
    ZModal,
    ZInput,
    ZButton,
    ZIcon,
    ZPagination,
    AnalyzerLogo,
    PriorityTypeSelect,
    IssuePrioritySort,
    IssuePriorityFilter
  },
  methods: {
    escapeHtml
  }
})
export default class ChooseIssueModal extends mixins(IssuePriorityListMixin, PaginationMixin) {
  @Prop({ required: true })
  objectId: string

  @Prop({ required: true, default: IssuePriorityLevel.Repository })
  level: IssuePriorityLevel

  public query = ''
  public analyzerType = ''
  public perPageCount = 10
  public issueList: Issue[] = []

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
   * @returns {Promise<void>}
   */
  async refetchIssues(): Promise<void> {
    await this.fetchIssuesWithPriority({
      isIssuePrioritySet: false,
      objectId: this.objectId,
      level: this.level,
      q: this.query,
      first: this.perPageCount,
      offset: this.queryOffset,
      analyzerShortcode: this.analyzerType,
      refetch: true
    })
    this.totalCount = this.issuesWithPriority.totalCount || 0
    this.issueList = resolveNodes(this.issuesWithPriority) as Issue[]
  }

  /**
   * Method to set priority of an issue
   *
   * @param {string} shortcode
   * @param {string} priorityValue
   * @returns {Promise<void>}
   */
  async setPriority(shortcode: string, priorityValue: string): Promise<void> {
    try {
      await this.updateIssuePriority({
        objectId: this.objectId,
        level: this.level,
        input: {
          issueShortcode: shortcode,
          objectId: this.objectId,
          level: this.level,
          issuePriorityType: priorityValue
        }
      })
    } catch (error) {
      this.$toast.danger(
        `An error occurred while setting priority for the issue '${shortcode}'. Please try again.`
      )
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

  /**
   * Method to emit close event
   *
   * @returns {void}
   */
  onModalClose(): void {
    this.$emit('close')
  }

  /**
   * Watcher to emit close event based on
   * the current route path as it's updated
   *
   * @return {void}
   */
  @Watch('$route.path')
  closeModal(): void {
    this.$emit('close')
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
