<template>
  <div>
    <div class="fixed z-20 flex justify-center w-screen p-3 pb-8 lg:hidden filter-wrapper">
      <z-button
        button-type="primary"
        @click="isModalOpen = true"
        class="flex items-center min-w-48"
      >
        <div class="inline-flex items-center w-full leading-tight gap-x-2">
          <z-icon :icon="activeIssueCategory.icon" size="small" color="ink-400" />
          <span class="text-sm leading-none">{{ activeIssueCategory.name }}</span>
          <div class="flex-grow"></div>
          <div class="px-2 py-1 text-sm leading-none rounded-full place-self-end bg-juniper-400">
            {{ shortenLargeNumber(activeIssueCategory.count) }}
          </div>
        </div>
      </z-button>
    </div>
    <portal v-if="isModalOpen" to="modal">
      <z-modal v-if="isModalOpen" title="Filter issues" @onClose="closeModal">
        <div class="grid grid-cols-2 gap-3 px-3 py-4">
          <div
            v-for="issueType in issueCategories"
            :key="issueType.shortcode"
            class="rounded-md"
            :class="
              modelValue === issueType.shortcode
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
              <div class="inline-flex leading-tight items-center w-full gap-x-0.5">
                <span class="flex-grow-0 overflow-x-hidden text-xs text-left overflow-ellipsis">{{
                  issueType.name
                }}</span>
                <div class="flex-grow"></div>
                <div
                  class="px-2 py-1 text-xs leading-none rounded-full place-self-end"
                  :class="modelValue === issueType.shortcode ? 'bg-juniper-400' : 'bg-ink-100'"
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
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZModal } from '@deepsourcelabs/zeal'

import { shortenLargeNumber } from '~/utils/string'
import IssueCategoryMixin, { IssueCategoryChoice } from '~/mixins/issueCategoryMixin'

/**
 * Component to add issue filtering based on category on mobiles for a repo
 */
@Component({
  components: { ZButton, ZIcon, ZModal },
  name: 'CategorySelectorMobile'
})
export default class CategorySelectorMobile extends mixins(IssueCategoryMixin) {
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

  get activeIssueCategory(): IssueCategoryChoice {
    return (
      this.issueCategories.find((issueCategory) => issueCategory.shortcode === this.modelValue) ||
      ({} as IssueCategoryChoice)
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
