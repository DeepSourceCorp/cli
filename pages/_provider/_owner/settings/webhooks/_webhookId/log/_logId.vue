<template>
  <section>
    <section class="px-4 py-3.5 min-h-13 border-b border-slate-400 flex flex-row items-center">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item class="text-vanilla-400">
          <nuxt-link :to="$generateRoute(['settings', 'webhooks'])">All endpoints</nuxt-link>
        </z-breadcrumb-item>
        <z-breadcrumb-item class="text-vanilla-400">
          <nuxt-link :to="$generateRoute(['settings', 'webhooks', $route.params.webhookId])">{{
            webhookTitle
          }}</nuxt-link>
        </z-breadcrumb-item>
        <z-breadcrumb-item>
          {{ delivery.eventId }}
        </z-breadcrumb-item>
      </z-breadcrumb>
    </section>
    <section v-if="$fetchState.pending" class="max-w-2xl p-4 space-y-8 animate-pulse">
      <div class="space-y-2">
        <div class="w-2/3 h-8 rounded-sm bg-ink-300"></div>
        <div class="w-1/3 h-3 rounded-sm bg-ink-300"></div>
      </div>
      <div class="grid grid-cols-3 gap-5">
        <div v-for="ii in 5" :key="ii" class="h-12 rounded-sm bg-ink-300"></div>
        <div></div>
        <div class="h-12 col-span-3 rounded-sm bg-ink-300"></div>
        <div class="h-32 col-span-3 rounded-sm bg-ink-300"></div>
      </div>
    </section>
    <section v-else :key="$route.fullPath" class="w-full p-4 mb-10">
      <page-title class="max-w-2xl">
        <template v-if="delivery.eventType" #title>
          {{ delivery.eventType.name }}
          <span class="text-slate">({{ delivery.eventType.shortcode }})</span>
        </template>
        <template #description>
          Created {{ formatDate(delivery.createdAt) }} · Finished in {{ delivery.finishedIn }}s
        </template>
      </page-title>
      <div class="grid max-w-2xl grid-cols-2 mt-8 rounded-md sm:grid-cols-3 gap-y-6 gap-x-5">
        <template v-for="stat in stats">
          <div
            v-if="stat.value !== null || stat.value !== undefined"
            :key="stat.label"
            class="flex flex-col space-y-1"
            :class="{ 'col-span-full': stat.fullwidth }"
          >
            <div class="flex items-center space-x-2 text-xs font-medium text-vanilla-400">
              <span>{{ stat.label }}</span>
              <z-icon
                v-if="stat.help"
                v-tooltip="{ content: stat.help, delay: { show: 0, hide: 100 } }"
                icon="help"
                class="stroke-1.5 transition-opacity duration-75 flex-shrink-0"
                color="vanilla-400"
              />
            </div>
            <div
              v-if="stat.isCode && stat.value"
              class="p-3 text-sm rounded-md bg-ink-300 overflow-x-auto"
            >
              <highlightjs langugage="json" :code="stat.value" />
            </div>
            <span v-else>
              {{ stat.value }}
            </span>
          </div>
        </template>
      </div>
    </section>
  </section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZTag, ZLabel, ZBreadcrumb, ZBreadcrumbItem } from '@deepsource/zeal'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import WebhookMixin from '~/mixins/webhookMixin'
import { formatDate } from '~/utils/date'
import { TeamPerms } from '~/types/permTypes'

@Component({
  components: {
    ZIcon,
    ZTag,
    ZLabel,
    ZBreadcrumb,
    ZBreadcrumbItem
  },
  meta: {
    auth: {
      teamPerms: [TeamPerms.MANAGE_WEBHOOKS]
    }
  },
  methods: { formatDate },
  middleware: ['perm', 'teamOnly'],
  layout: 'dashboard'
})
export default class WebhookEndpoint extends mixins(WebhookMixin, ActiveUserMixin) {
  async fetch(): Promise<void> {
    const { webhookId, logId } = this.$route.params
    const { owner, provider } = this.$route.params
    await this.fetchOwnerDetails({
      login: owner,
      provider
    })
    await this.fetchSingleDelivery({ ownerId: this.owner.id, deliveryId: logId })
    await this.fetchSingleEndpoint({ webhookId })
  }

  get stats(): {
    label: string
    value?: string | number | null
    help?: string
    link?: string
    fullwidth?: boolean
    isCode?: boolean
  }[] {
    return [
      {
        label: 'HTTP status code',
        value: this.delivery.httpStatusCode
      },
      {
        label: 'Event triggered at',
        value: this.delivery.createdAt ? formatDate(this.delivery.createdAt, 'LLL') : null
      },
      {
        label: 'Retry count',
        value: this.delivery.retryCount,
        help: 'Events are retried for upto 5 times on failures'
      },
      {
        label: 'Webhook ID',
        value: this.delivery.webhook?.id,
        link: this.$generateRoute(['settings', 'webhooks', this.delivery.webhook?.id])
      },
      {
        label: 'Event ID',
        value: this.delivery.eventId
      },
      {
        label: 'URL',
        value: this.delivery.webhook?.url,
        fullwidth: true
      },
      {
        label: 'Payload',
        value: JSON.stringify(this.delivery.payload, null, 2) || '{}',
        fullwidth: true,
        isCode: true,
        help: 'The payload sent with the webhook'
      }
    ]
  }

  get webhookTitle(): string {
    if (this.endpoint.url) {
      const url = new URL(this.endpoint.url)
      return url.hostname
    }
    return ''
  }
}
</script>
