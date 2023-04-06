<template>
  <div>
    <div class="filter-wrapper fixed z-20 flex w-screen justify-center p-3 pb-8 lg:hidden">
      <z-button
        button-type="primary"
        class="flex items-center min-w-48"
        @click="isModalOpen = true"
      >
        <div class="inline-flex w-full items-center gap-x-2 leading-tight">
          <z-icon :icon="activeIssueCategory.icon" size="small" color="ink-400" />
          <span class="text-sm leading-none">{{ activeIssueCategory.name }}</span>
          <div class="flex-grow"></div>
          <div class="place-self-end rounded-full bg-juniper-400 px-2 py-1 text-sm leading-none">
            {{ shortenLargeNumber(occurrenceCounts[activeIssueCategory.shortcode]) }}
          </div>
        </div>
      </z-button>
    </div>
    <portal to="modal">
      <z-modal v-if="isModalOpen" title="Filter issues" @onClose="closeModal">
        <div class="grid grid-cols-2 gap-3 px-3 py-4">
          <div
            v-for="issueType in issueCategories"
            :key="issueType.shortcode"
            class="rounded-md"
            :class="
              issueType.shortcode === activeSidebarItem
                ? 'bg-juniper text-ink-400'
                : 'bg-ink-200 text-vanilla-100'
            "
          >
            <z-button
              button-type="ghost"
              color="current"
              class="w-full hover:bg-opacity-0"
              @click="updateCategory(issueType.shortcode)"
            >
              <div class="inline-flex w-full items-center gap-x-0.5 leading-tight">
                <span class="flex-grow-0 overflow-x-hidden overflow-ellipsis text-left text-xs">{{
                  issueType.name
                }}</span>
                <div class="flex-grow"></div>
                <div
                  class="place-self-end rounded-full px-2 py-1 text-xs leading-none"
                  :class="
                    issueType.shortcode === activeSidebarItem ? 'bg-juniper-400' : 'bg-ink-100'
                  "
                >
                  {{ shortenLargeNumber(occurrenceCounts[issueType.shortcode]) }}
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
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZModal } from '@deepsource/zeal'

import { shortenLargeNumber } from '~/utils/string'
import { IssueFilterChoice } from '~/types/issues'

/**
 * Component to add issue filtering based on category on mobiles for a repo
 */
@Component({
  components: { ZButton, ZIcon, ZModal },
  name: 'CategorySelectorMobile',
  methods: { shortenLargeNumber }
})
export default class CategorySelectorMobile extends Vue {
  @Prop({ default: 'recommended' })
  activeSidebarItem: string

  @Prop({ default: () => [] })
  issueCategories: IssueFilterChoice[]

  @Prop({ default: () => ({}) })
  occurrenceCounts: Record<string, number>

  private isModalOpen = false

  /**
   * Mounted hook for Vue component
   *
   * @returns void
   */
  mounted(): void {
    let vh = window.innerHeight
    document.documentElement.style.setProperty('--window-inner-height', `${vh}px`)
  }

  get activeIssueCategory(): IssueFilterChoice {
    return (
      this.issueCategories.find(
        (issueCategory) => issueCategory.shortcode === this.activeSidebarItem
      ) || ({} as IssueFilterChoice)
    )
  }

  /**
   * Function to close the modal
   *
   * @returns void
   */
  closeModal(): void {
    this.isModalOpen = false
  }

  /**
   * Function to update category and close modal
   *
   * @param {string} shortcode - Shortcode of the new category
   * @returns void
   */
  updateCategory(shortcode: string): void {
    this.$emit('updateCategory', shortcode)
    this.closeModal()
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
