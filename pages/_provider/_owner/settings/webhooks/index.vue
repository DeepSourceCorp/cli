<template>
  <section class="grid grid-cols-1 max-w-3xl p-4">
    <div class="flex justify-between mb-4">
      <h2 class="text-lg font-medium">Endpoints</h2>
      <z-button
        v-if="webhookEndpoints.length"
        @click="showAddEndpointModal = true"
        size="small"
        buttonType="primary"
        icon="plus"
      >
        Add new endpoint
      </z-button>
      <portal to="modal">
        <create-webhook-modal v-if="showAddEndpointModal" @close="showAddEndpointModal = false" />
      </portal>
    </div>
    <div class="grid grid-cols-1 gap-2">
      <template v-if="endpointsLoading">
        <div v-for="index in 3" :key="index" class="h-20 bg-ink-300 animate-pulse rounded-md"></div>
      </template>
      <template v-else-if="totalWebhookEndpoints">
        <webhook-card v-for="endpoint in webhookEndpoints" :key="endpoint.id" v-bind="endpoint" />
        <z-pagination
          class="flex justify-center"
          v-if="pageCount > 1"
          :totalPages="pageCount"
          :totalVisible="5"
          @selected="updateCurrentPage"
        ></z-pagination>
      </template>
      <empty-state
        v-else
        class="border border-dashed rounded-lg border-2 border-ink-200 py-20"
        title="Add your first endpoint"
        subtitle="Configure webhook endpoints to let your apps and services know about events in DeepSource as they happen. Start with a new endpoint."
      >
        <template slot="action">
          <z-button size="small" @click="showAddEndpointModal = true" icon="plus">
            Add a new endpoint
          </z-button>
        </template>
      </empty-state>
    </div>
  </section>
</template>

<script lang="ts">
import { mixins, Component } from 'nuxt-property-decorator'
import { ZIcon, ZButton, ZPagination } from '@deepsourcelabs/zeal'
import { TeamPerms } from '~/types/permTypes'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import WebhookMixin from '~/mixins/webhookMixin'

@Component({
  components: {
    ZIcon,
    ZButton,
    ZPagination
  },
  meta: {
    auth: {
      teamPerms: [TeamPerms.MANAGE_WEBHOOKS]
    }
  },
  middleware: ['perm', 'teamOnly'],
  layout: 'dashboard'
})
export default class AutoOnboard extends mixins(ActiveUserMixin, WebhookMixin) {
  public endpointsLoading = false
  public showAddEndpointModal = false
  public pageSize = 25
  public currentPage = 1

  get pageCount(): number {
    if (this.totalWebhookEndpoints) {
      return Math.ceil(this.totalWebhookEndpoints / this.pageSize)
    }

    return 0
  }

  updateCurrentPage(pageNumber: number): void {
    this.currentPage = pageNumber
    this.$fetch()
  }

  async fetch(): Promise<void> {
    this.endpointsLoading = true
    const { owner, provider } = this.$route.params
    this.fetchWebhookEventTypesList()
    await this.fetchWebhookEndpoints({
      login: owner,
      limit: this.pageSize,
      currentPage: this.currentPage,
      provider
    })
    this.endpointsLoading = false
  }
}
</script>
