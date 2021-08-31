<template>
  <section>
    <section class="px-4 py-3.5 min-h-13 border-b border-ink-200 flex flex-row items-center">
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
    <section v-if="$fetchState.pending" class="animate-pulse max-w-2xl p-4 space-y-8">
      <div class="space-y-2">
        <div class="h-8 bg-ink-300 w-2/3 rounded-sm"></div>
        <div class="h-3 bg-ink-300 w-1/3 rounded-sm"></div>
      </div>
      <div class="grid grid-cols-3 gap-5">
        <div v-for="ii in 5" :key="ii" class="h-12 bg-ink-300 rounded-sm"></div>
        <div></div>
        <div class="h-12 bg-ink-300 rounded-sm col-span-3"></div>
        <div class="h-32 bg-ink-300 rounded-sm col-span-3"></div>
      </div>
    </section>
    <section v-else class="w-full mb-10 p-4" :key="$route.fullPath">
      <page-title class="max-w-2xl">
        <template slot="title" v-if="delivery.eventType">
          {{ delivery.eventType.name }}
          <span class="text-slate">({{ delivery.eventType.shortcode }})</span>
        </template>
        <template slot="description">
          Created {{ formatDate(delivery.createdAt) }} · Finished in {{ delivery.finishedIn }}s
        </template>
      </page-title>
      <div class="rounded-md max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-5 mt-8">
        <template v-for="stat in stats">
          <div
            v-if="stat.value !== null || stat.value !== undefined"
            :key="stat.label"
            class="flex flex-col space-y-1"
            :class="{ 'col-span-full': stat.fullwidth }"
          >
            <div class="text-xs text-vanilla-400 font-medium flex items-center space-x-2">
              <span>{{ stat.label }}</span>
              <z-icon
                v-if="stat.help"
                icon="help"
                class="stroke-1.5 transition-opacity duration-75 flex-shrink-0"
                color="vanilla-400"
                v-tooltip="{ content: stat.help, delay: { show: 0, hide: 100 } }"
              ></z-icon>
            </div>
            <div v-if="stat.isCode && stat.value" class="p-3 bg-ink-300 rounded-md text-sm">
              <highlightjs langugage="json" :code="stat.value"></highlightjs>
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
import { ZIcon, ZTag, ZLabel, ZBreadcrumb, ZBreadcrumbItem } from '@deepsourcelabs/zeal'

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
  middleware: ['perm', 'teamOnly'],
  layout: 'dashboard'
})
export default class WebhookEndpoint extends mixins(WebhookMixin, ActiveUserMixin) {
  public formatDate = formatDate

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
