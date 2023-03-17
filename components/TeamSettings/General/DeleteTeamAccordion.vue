<template>
  <z-accordion>
    <z-accordion-item class="p-4" @isOpen="isOpenHandler">
      <template #title="{ toggleAccordion }">
        <div class="flex items-center cursor-pointer gap-1" @click="toggleAccordion">
          <z-icon icon="chevron-right" :class="chevronIconAnimateClass" class="transform" />
          <span class="font-medium text-xs uppercase text-vanilla-400 tracking-wider">
            Advanced settings
          </span>
        </div>
      </template>

      <div
        class="flex gap-8 flex-col sm:flex-row items-start justify-between bg-cherry bg-opacity-5 rounded-md border border-cherry border-opacity-20 p-4 mt-4"
      >
        <div>
          <p class="text-sm leading-4 text-cherry-500 tracking-wide">Delete team</p>
          <p class="text-xs text-cherry-300 leading-6 mt-1.5">
            Permanently remove your team and all of its contents from the DeepSource platform.
          </p>
        </div>
        <z-button
          icon="trash-2"
          button-type="danger"
          size="small"
          label="Delete team"
          @click="$emit('open-delete-team-confirm')"
        />
      </div>
    </z-accordion-item>
  </z-accordion>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { ZIcon, ZAccordion, ZAccordionItem, ZButton } from '@deepsource/zeal'

@Component({
  components: {
    ZIcon,
    ZAccordion,
    ZAccordionItem,
    ZButton
  }
})
export default class DeleteTeamAccordion extends Vue {
  chevronIconAnimateClass = ''

  /**
   * Handler for the `isOpen` event emitted by `ZAccordionItem`
   *
   * @param {boolean} open
   * @returns {void}
   */
  isOpenHandler(open: boolean): void {
    this.chevronIconAnimateClass = open
      ? 'animate-first-quarter-spin rotate-90'
      : 'animate-reverse-quarter-spin rotate-0'
  }
}
</script>
