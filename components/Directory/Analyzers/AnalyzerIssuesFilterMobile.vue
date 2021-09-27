<template>
  <div>
    <div class="lg:hidden absolute w-screen bottom-0 z-20 flex justify-center p-3 pb-5">
      <z-button
        button-type="primary"
        @click="isModalOpen = true"
        class="flex items-center min-w-48"
      >
        <z-icon :icon="activeFilter || 'list'" size="small" color="ink-400" class="mr-0.5" />
        <span class="leading-none text-sm">{{ activeFilterTitle || 'All issues' }}</span>
        <div class="flex-grow"></div>
        <div class="place-self-end text-sm rounded-full w-9 bg-juniper-400">
          {{ shortenNumber(totalIssueCount) }}
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
              color="currentColor"
              class="w-full"
              @click="updateFilter('')"
            >
              <div class="flex items-center w-full">
                <z-icon icon="list" size="small" color="currentColor" class="mr-2" />
                <span
                  class="text-xs flex-grow-0 overflow-ellipsis w-17 text-left overflow-x-hidden"
                >
                  All issues
                </span>
                <div class="flex-grow"></div>
                <div
                  class="place-self-end text-xs rounded-full w-9"
                  :class="activeFilter === '' ? 'bg-juniper-400' : 'bg-ink-100'"
                >
                  {{ shortenNumber(allFilterCount) }}
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
              color="currentColor"
              class="w-full"
              @click="updateFilter(issueType.shortcode)"
            >
              <div class="flex items-center w-full">
                <z-icon
                  :icon="issueType.shortcode"
                  size="small"
                  color="currentColor"
                  class="mr-2 flex-shrink-0"
                />
                <span
                  class="text-xs flex-grow-0 overflow-ellipsis w-17 text-left overflow-x-hidden"
                  >{{ issueType.title }}</span
                >
                <div class="flex-grow"></div>
                <div
                  class="place-self-end text-xs rounded-full w-9"
                  :class="activeFilter === issueType.shortcode ? 'bg-juniper-400' : 'bg-ink-100'"
                >
                  {{ shortenNumber(issueType.count) }}
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
import { Component, Vue, Prop, Watch } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZModal } from '@deepsourcelabs/zeal'

import { shortenLargeNumber } from '~/utils/string'
import IssueTypeT from '~/types/issueDistribution'

@Component({
  components: { ZButton, ZIcon, ZModal },
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

  updateFilter(val: string) {
    this.$emit('selected', val)
    this.isModalOpen = false
  }

  closeModal() {
    this.isModalOpen = false
  }

  shortenNumber(val: number): string {
    return shortenLargeNumber(val)
  }
}
</script>
