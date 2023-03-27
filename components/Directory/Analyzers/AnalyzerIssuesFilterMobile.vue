<template>
  <div>
    <div class="fixed z-20 flex justify-center w-screen p-3 pb-8 lg:hidden filter-wrapper">
      <z-button
        button-type="primary"
        class="flex items-center min-w-48"
        @click="isModalOpen = true"
      >
        <div class="inline-flex items-center w-full leading-tight gap-x-2">
          <z-icon :icon="activeFilter || 'list'" size="small" color="ink-400" class="mr-0.5" />
          <span class="text-sm leading-none">{{ activeFilterTitle || 'All issues' }}</span>
          <div class="flex-grow"></div>
          <div class="px-2 py-1 text-sm leading-none rounded-full place-self-end bg-juniper-400">
            {{ shortenLargeNumber(totalIssueCount) }}
          </div>
        </div>
      </z-button>
    </div>
    <portal v-if="isModalOpen" to="modal">
      <z-modal v-if="isModalOpen" title="Filter issues" @onClose="closeModal">
        <div class="grid grid-cols-2 gap-3 px-3 py-4">
          <div
            class="rounded-md"
            :class="activeFilter === '' ? 'bg-juniper text-ink-400' : 'bg-ink-200 text-vanilla-100'"
          >
            <z-button
              button-type="ghost"
              color="current"
              class="w-full hover:bg-opacity-0"
              @click="updateFilter('')"
            >
              <div class="inline-flex leading-tight items-center w-full gap-x-0.5">
                <z-icon icon="list" size="small" color="current" class="mr-2" />
                <span class="flex-grow-0 overflow-x-hidden text-xs text-left overflow-ellipsis">
                  All issues
                </span>
                <div class="flex-grow"></div>
                <div
                  class="px-2 py-1 text-xs leading-none rounded-full place-self-end"
                  :class="activeFilter === '' ? 'bg-juniper-400' : 'bg-ink-100'"
                >
                  {{ shortenLargeNumber(allFilterCount) }}
                </div>
              </div>
            </z-button>
          </div>
          <div
            v-for="issueType in filteredIssueDistribution"
            :key="issueType.shortcode"
            class="rounded-md"
            :class="
              activeFilter === issueType.shortcode
                ? 'bg-juniper text-ink-400'
                : 'bg-ink-200 text-vanilla-100'
            "
          >
            <z-button
              button-type="ghost"
              color="current"
              class="w-full hover:bg-opacity-0"
              @click="updateFilter(issueType.shortcode)"
            >
              <div class="inline-flex leading-tight items-center w-full gap-x-0.5">
                <z-icon
                  :icon="issueType.shortcode"
                  size="small"
                  color="current"
                  class="flex-shrink-0 mr-2"
                />
                <span class="flex-grow-0 overflow-x-hidden text-xs text-left overflow-ellipsis">{{
                  issueType.title
                }}</span>
                <div class="flex-grow"></div>
                <div
                  class="px-2 py-1 text-xs leading-none rounded-full place-self-end"
                  :class="activeFilter === issueType.shortcode ? 'bg-juniper-400' : 'bg-ink-100'"
                >
                  {{ shortenLargeNumber(issueType.count) }}
                </div>
              </div>
            </z-button>
          </div>
        </div>
      </z-modal>
    </portal>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZModal } from '@deepsource/zeal'

import { shortenLargeNumber } from '~/utils/string'
import IssueTypeT from '~/types/issueDistribution'

/**
 * Component for filtering issues by category in analyzer directory
 */
@Component({
  components: { ZButton, ZIcon, ZModal },
  methods: { shortenLargeNumber },
  name: 'AnalyzerIssuesFilterMobile'
})
export default class AnalyzerIssuesFilterMobile extends Vue {
  @Prop()
  issueDistribution: IssueTypeT[]

  @Prop()
  totalIssueCount: number

  @Prop()
  activeFilter: string

  private isModalOpen = false
  shortenLargeNumber = shortenLargeNumber

  /**
   * Mounted hook for Vue component
   *
   * @returns void
   */
  mounted(): void {
    let vh = window.innerHeight
    document.documentElement.style.setProperty('--window-inner-height', `${vh}px`)
  }

  get filteredIssueDistribution(): IssueTypeT[] {
    return this.issueDistribution.slice(1)
  }

  get activeFilterTitle(): string | undefined {
    return this.issueDistribution.find((issueType) => issueType.shortcode === this.activeFilter)
      ?.title
  }

  get allFilterCount(): number | undefined {
    return this.issueDistribution.find((issueType) => issueType.shortcode === 'all')?.count
  }

  /**
   * Update the set category filter for issues
   *
   * @param {string} val - shortcode of the new category
   * @returns void
   */
  updateFilter(val: string): void {
    this.$emit('selected', val)
    this.isModalOpen = false
  }

  /**
   * Function to close the modal
   *
   * @returns void
   */
  closeModal(): void {
    this.isModalOpen = false
  }
}
</script>
<style scoped>
.filter-wrapper {
  bottom: 0px;
}

@-moz-document url-prefix() {
  .filter-wrapper {
    bottom: calc(100vh - var(--window-inner-height, 1vh));
  }
}
</style>
