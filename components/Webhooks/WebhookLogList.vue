<template>
  <div class="rounded-md border border-slate-400">
    <div class="grid grid-cols-6 p-3 text-sm">
      <span> Status </span>
      <span class="col-span-3"> Event name </span>
      <span class="col-span-1 text-right"> Created </span>
      <span class="col-span-1 text-right"> Finished in </span>
    </div>
    <ul
      class="default-scroll max-h-96 divide-y divide-ink-200 overflow-scroll border-t border-slate-400"
    >
      <webhook-log-list-item v-for="event in endpointDeliveries" :key="event.id" v-bind="event" />
    </ul>
    <div v-if="pageCount > 1" class="flex justify-center border-t border-slate-400 p-3">
      <z-pagination
        :total-pages="pageCount"
        :total-visible="5"
        :page="currentPage"
        class="flex justify-center"
        @selected="updateCurrentPage"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

import { WebhookEventDelivery } from '~/types/types'

/**
 * Component representing the webhook logs list
 */
@Component({})
export default class WebhookLogList extends Vue {
  @Prop({ required: true })
  endpointDeliveries: Array<WebhookEventDelivery>

  @Prop({ required: true })
  endpointDeliveriesCount: number

  currentPage = 1
  limit = 8

  get pageCount() {
    return Math.ceil(this.endpointDeliveriesCount / this.limit)
  }

  /**
   * Method to update the current page number
   *
   * @param {number} pageNumber
   * @returns {void}
   */
  updateCurrentPage(pageNumber: number): void {
    this.currentPage = pageNumber

    // Emit an event supplying the page number
    this.$emit('update-page-number', pageNumber)
  }
}
</script>
