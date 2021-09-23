<template>
  <div class="border border-ink-200 rounded-md">
    <div class="p-3 grid grid-cols-6 text-sm">
      <span> Status </span>
      <span class="col-span-3"> Event name </span>
      <span class="col-span-1 text-right"> Created </span>
      <span class="col-span-1 text-right"> Finished in </span>
    </div>
    <ul
      class="divide-y divide-ink-200 border-t border-ink-200 max-h-96 overflow-scroll default-scroll"
    >
      <webhook-log-list-item v-for="event in endpointDeliveries" :key="event.id" v-bind="event" />
    </ul>
    <div class="p-3 flex justify-center border-t border-ink-200" v-if="pageCount > 1">
      <z-pagination
        class="flex justify-center"
        :totalPages="pageCount"
        :totalVisible="5"
        :page="currentPage"
        @selected="updateCurrentPage"
      ></z-pagination>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZPagination } from '@deepsourcelabs/zeal'
import WebhookMixin from '~/mixins/webhookMixin'

@Component({
  components: {
    ZPagination
  }
})
export default class WebhookLogList extends mixins(WebhookMixin) {
  currentPage = 1
  limit = 8

  get pageCount() {
    return Math.ceil(this.endpointDeliveriesCount / this.limit)
  }

  updateCurrentPage(pageNumber: number): void {
    this.currentPage = pageNumber
    this.$fetch()
  }

  get totalVisible(): number {
    return this.pageCount >= 5 ? 5 : this.pageCount
  }

  async fetch(): Promise<void> {
    const { webhookId } = this.$route.params
    await this.fetchEndpointDeliveries({
      webhookId,
      currentPage: this.currentPage,
      limit: this.limit
    })
  }
}
</script>
