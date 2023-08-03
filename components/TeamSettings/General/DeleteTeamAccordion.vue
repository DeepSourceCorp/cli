<template>
  <z-accordion>
    <z-accordion-item class="p-4" @isOpen="isOpenHandler">
      <template #title="{ toggleAccordion }">
        <div class="flex cursor-pointer items-center gap-1" @click="toggleAccordion">
          <z-icon icon="chevron-right" :class="chevronIconAnimateClass" class="transform" />
          <span class="text-xs font-medium uppercase tracking-wider text-vanilla-400">
            Advanced settings
          </span>
        </div>
      </template>

      <div
        class="mt-4 flex flex-col items-start justify-between gap-8 rounded-md border border-cherry border-opacity-20 bg-cherry bg-opacity-5 p-4 sm:flex-row"
      >
        <div>
          <p class="text-sm leading-4 tracking-wide text-cherry-500">Delete team</p>
          <p class="mt-1.5 text-xs leading-6 text-cherry-300">
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

@Component({})
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
