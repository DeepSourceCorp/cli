<template>
  <section>
    <section class="px-4 py-3.5 min-h-13 border-b border-ink-200 flex flex-row items-center">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item class="text-vanilla-400">
          <nuxt-link :to="$generateRoute(['settings', 'webhooks'])">All endpoints</nuxt-link>
        </z-breadcrumb-item>
        <z-breadcrumb-item>
          {{ title }}
        </z-breadcrumb-item>
      </z-breadcrumb>
    </section>
    <section v-if="$fetchState.pending" class="max-w-2xl p-4 space-y-8 animate-pulse">
      <div class="grid grid-cols-4 gap-2">
        <div class="h-8 col-span-2 bg-ink-300"></div>
        <div></div>
        <div class="h-8 bg-ink-300"></div>
        <div class="h-4 col-span-2 bg-ink-300"></div>
      </div>
      <div class="grid grid-cols-1 gap-4">
        <div v-for="ii in 4" :key="ii" class="h-20 bg-ink-300"></div>
      </div>
    </section>
    <section v-else class="w-full p-4 mb-10" :key="$route.fullPath">
      <page-title
        class="max-w-2xl"
        :title="title"
        :description="`Created ${formatDate(localEndpoint.createdAt)}`"
      >
        <template slot="title-info">
          <z-label v-if="localEndpoint.active" class="inline-block select-none" state="success">
            Enabled
          </z-label>
          <z-label v-else class="inline-block select-none" state="warning"> Disabled </z-label>
        </template>
        <template slot="actions" v-if="allowEdit">
          <template v-if="readOnly">
            <z-button @click="readOnly = false" size="small" buttonType="secondary" icon="edit">
              Edit
            </z-button>
            <test-webhook-endpoint v-if="localEndpoint.active"></test-webhook-endpoint>
            <enable-webhook-endpoint v-if="!localEndpoint.active" @reset="reset(false)">
              <template v-slot:default="{ toggleModal }">
                <z-button @click="toggleModal" size="small" icon="play-circle">
                  Enable endpoint
                </z-button>
              </template>
            </enable-webhook-endpoint>
          </template>
          <template v-else>
            <z-button
              @click="reset"
              size="small"
              buttonType="ghost"
              iconColor="vanilla-300"
              v-tooltip="'Discard changes'"
              icon="corner-up-left"
            />
            <z-button @click="showSaveModal = true" size="small" icon="save">
              Save Configuration
            </z-button>
            <portal to="modal">
              <z-confirm
                v-if="showSaveModal"
                @onClose="showSaveModal = false"
                title="Save endpoint configuration"
                subtitle="Once updated, you won't be able to revert to previous changes"
              >
                <template v-slot:footer="{ close }">
                  <div
                    class="flex items-center justify-end mt-6 space-x-4 text-right text-vanilla-100"
                  >
                    <z-button
                      buttonType="ghost"
                      class="text-vanilla-100"
                      size="small"
                      @click="close"
                    >
                      Cancel
                    </z-button>
                    <z-button
                      :isLoading="savingConfig"
                      loadingLabel="Updating endpoint"
                      icon="save"
                      class="modal-primary-action"
                      size="small"
                      @click="saveConifg(close)"
                      >Yes, update this endpoint</z-button
                    >
                  </div>
                </template>
              </z-confirm>
            </portal>
          </template>
        </template>
      </page-title>
      <!-- Endpoint configuration -->
      <div class="space-y-6">
        <form-group label="Configuration" :divide="false" bodyWidthClass="max-w-2xl">
          <text-input
            inputWidth="wide"
            label="Endpoint URL"
            description="A public url to send events to as they happen."
            inputId="webhook-endpoint-url"
            v-model="localEndpoint.url"
            :readOnly="readOnly"
          ></text-input>
          <toggle-input
            v-if="Object.keys(localEndpoint).includes('apiSigning')"
            label="Enable API signing"
            inputId="enable-api-signing"
            :disabled="readOnly"
            v-model="localEndpoint.apiSigning"
          >
            <template slot="description">
              Signing of the webhook payload allows you to verify incoming requests.
              <span class="font-medium text-vanilla-200">We recommend enabling this.</span>
            </template>
          </toggle-input>
          <password-input
            v-if="localEndpoint.apiSigning"
            :value="localEndpoint.secret"
            input-id="webhook-endpoint-secret"
            input-width="wide"
            label="Secret"
            description="This secret will be used to sign the payload sent from DeepSource."
            :read-only="true"
            :show-password="!isSecretHidden"
          >
            <template #input-utilities>
              <div class="absolute flex top-1 right-1 gap-x-1 bg-ink-400">
                <z-button
                  v-tooltip="isSecretHidden ? 'Reveal secret' : 'Hide secret'"
                  button-type="secondary"
                  :icon="isSecretHidden ? 'eye' : 'eye-off'"
                  size="x-small"
                  icon-size="x-small"
                  :disabled="!localEndpoint.secret"
                  @click="toggleSecretVisibility"
                />
                <z-button
                  v-if="!readOnly"
                  v-tooltip="'Generate new secret'"
                  button-type="secondary"
                  icon="refresh-cw"
                  size="x-small"
                  icon-size="x-small"
                  @click="generateSecret"
                />
                <copy-button
                  v-tooltip="'Copy secret'"
                  :value="localEndpoint.secret"
                  :icon-only="true"
                  :disabled="!localEndpoint.secret"
                  size="x-small"
                  icon-size="x-small"
                />
              </div>
            </template>
          </password-input>
          <div class="py-4">
            <h4 class="mb-2 text-sm text-vanilla-100">Selected events</h4>
            <div class="border rounded-md border-ink-200">
              <template v-if="readOnly">
                <span
                  v-for="(event, position) in subscribedEvents"
                  :key="event.shortcode"
                  class="block px-3 pt-2 pb-3 border-ink-200 space-y-0.5"
                  :class="{
                    'border-t': position !== 0
                  }"
                >
                  <code class="text-sm">{{ event.shortcode }}</code>
                  <p class="text-xs text-vanilla-400">{{ event.shortDescription }}</p>
                </span>
              </template>
              <template v-else>
                <label
                  v-for="(event, position) in allEventsList"
                  :key="event.shortcode"
                  class="block p-3 cursor-pointer border-ink-200"
                  :class="{
                    'border-t': position !== 0,
                    'bg-ink-300': selectedEvents.includes(event.shortcode)
                  }"
                >
                  <div class="flex items-center mb-1">
                    <z-checkbox
                      v-model="selectedEvents"
                      :value="event.shortcode"
                      :name="event.shortcode"
                      size="small"
                    >
                    </z-checkbox>
                    <code class="text-sm">{{ event.shortcode }}</code>
                  </div>
                  <p class="ml-6 text-xs text-vanilla-400">{{ event.shortDescription }}</p>
                </label>
              </template>
            </div>
          </div>
          <section v-if="endpointDeliveriesCount && readOnly" class="py-4 space-y-2">
            <h4 class="text-sm text-vanilla-100">Webhook deliveries</h4>
            <webhook-log-list
              :key="$route.params.webhookId"
              :endpoint-deliveries="endpointDeliveries"
              :endpoint-deliveries-count="endpointDeliveriesCount"
              @update-page-number="fetchEndpointDeliveriesList"
            />
          </section>
        </form-group>

        <!-- Endpoint Settings -->
        <form-group
          v-if="allowEdit && readOnly"
          label="Settings"
          :divide="false"
          bodyWidthClass="max-w-2xl"
        >
          <button-input
            v-if="localEndpoint.active"
            inputId="webhook-settings-disable"
            buttonLabel="Disable endpoint"
            buttonType="secondary"
            icon="pause-circle"
            description="This will immediately disable all events for this endpoint."
            @click="disable"
          >
            <template slot="label">
              Disable <b>{{ title }}</b>
            </template>
          </button-input>
          <enable-webhook-endpoint v-else @reset="reset(false)">
            <template v-slot:default="{ toggleModal }">
              <button-input
                inputId="webhook-settings-enable"
                buttonLabel="Enable endpoint"
                buttonType="secondary"
                icon="play-circle"
                description="This will enable all events for this endpoint."
                @click="toggleModal"
              >
                <template slot="label">
                  Enable <b>{{ title }}</b>
                </template>
              </button-input>
            </template></enable-webhook-endpoint
          >
          <delete-webhook-endpoint :title="title" :webhookId="$route.params.webhookId" />
        </form-group>
      </div>
    </section>
  </section>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import {
  ZIcon,
  ZTag,
  ZLabel,
  ZInput,
  ZButton,
  ZConfirm,
  ZBreadcrumb,
  ZBreadcrumbItem,
  ZCheckbox
} from '@deepsourcelabs/zeal'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import WebhookMixin from '~/mixins/webhookMixin'
import { WebhookEventTypes, Webhook } from '~/types/types'
import { formatDate } from '~/utils/date'
import { TeamPerms } from '~/types/permTypes'
import { resolveNodes } from '~/utils/array'
import Shifty from '@deepsource/shifty'

@Component({
  components: {
    ZIcon,
    ZTag,
    ZLabel,
    ZInput,
    ZButton,
    ZConfirm,
    ZBreadcrumb,
    ZBreadcrumbItem,
    ZCheckbox
  },
  meta: {
    auth: {
      teamPerms: [TeamPerms.MANAGE_WEBHOOKS]
    }
  },
  methods: {
    formatDate
  },
  middleware: ['perm', 'teamOnly'],
  layout: 'dashboard'
})
export default class WebhookEndpoint extends mixins(WebhookMixin, ActiveUserMixin) {
  public readOnly = true
  public allowEdit = true
  public showSaveModal = false
  public savingConfig = false
  public selectedEvents: string[] = []
  public localEndpoint: Webhook = { url: '' } as Webhook
  public engine: Shifty
  isSecretHidden = true

  /**
   * Nuxt fetch hook
   *
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    const { webhookId } = this.$route.params

    await Promise.all([
      this.fetchSingleEndpoint({ webhookId }),
      this.fetchWebhookEventTypesList(),
      this.fetchEndpointDeliveriesList()
    ])

    this.localEndpoint = JSON.parse(JSON.stringify(this.endpoint))
    this.selectedEvents = this.subscribedEvents.map((event) => event.shortcode)
  }

  /**
   * Reset form and discard edits
   *
   * @param {any} refetch=true
   *
   * @return {Promise<void>}
   */
  async reset(refetch = true): Promise<void> {
    const { webhookId } = this.$route.params
    await this.fetchSingleEndpoint({ webhookId, refetch: refetch })
    this.localEndpoint = JSON.parse(JSON.stringify(this.endpoint))
    this.selectedEvents = this.subscribedEvents.map((event) => event.shortcode)
    this.readOnly = true
    this.showSaveModal = false
  }

  /**
   * Hide modal before destroy
   *
   * @return {void}
   */
  beforeDestroy(): void {
    this.showSaveModal = false
  }

  /**
   * Disable webhook endpoint
   *
   * @return {Promise<void>}
   */
  async disable(): Promise<void> {
    const { webhookId } = this.$route.params
    try {
      const response = await this.disableEndpoint({ webhookId: webhookId })
      if (response.ok) {
        await this.reset()
        this.$toast.success('You disabled this webhook.')
      }
    } catch (e) {
      this.logErrorForUser(e as Error, 'Disable webhook', { webhookId: webhookId })
      this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
    }
  }

  /**
   * Method to fetch the webhook endpoint deliveries list
   *
   * @param {number} [currentPage]
   * @returns {Promise<void>}
   */
  fetchEndpointDeliveriesList(currentPage?: number): Promise<void> {
    const { webhookId } = this.$route.params

    return this.fetchEndpointDeliveries({
      webhookId,
      currentPage: currentPage || 1,
      limit: 8
    })
  }

  /**
   * Validate and save webhook endpoint
   *
   * @return {Promise<void>}
   */
  async saveConifg(close?: () => {}): Promise<void> {
    try {
      this.validateWebhookForm(
        this.localEndpoint.url,
        this.localEndpoint.apiSigning,
        this.localEndpoint.secret,
        this.selectedEvents
      )
    } catch (e) {
      this.$toast.info((e as Error).message)
      return
    }

    const { webhookId } = this.$route.params
    this.savingConfig = true
    try {
      await this.updateEndpoint({
        webhookId: webhookId,
        url: this.localEndpoint.url,
        secret: this.localEndpoint.secret,
        apiSigning: this.localEndpoint.apiSigning,
        eventsSubscribed: this.selectedEvents
      })
      await this.reset()
      if (close) close()
      this.$toast.success('Successfully updated the endpoint details.')
    } catch (e) {
      this.logErrorForUser(e as Error, 'Update webhook', { webhookId: webhookId })
      this.$toast.danger((e as Error).message.replace('GraphQL error: ', ''))
    } finally {
      this.savingConfig = false
    }
  }

  get title(): string {
    if (this.endpoint.url) {
      const url = new URL(this.endpoint.url)
      return url.hostname
    }
    return ''
  }

  get subscribedEvents(): WebhookEventTypes[] {
    return resolveNodes(this.localEndpoint.eventsSubscribed) as WebhookEventTypes[]
  }

  get allEventsList(): WebhookEventTypes[] {
    return this.webhookEventTypes
  }

  /**
   * Generate secret using Shifty
   *
   * @return {void}
   */
  generateSecret(): void {
    if (!this.engine) this.engine = new Shifty(false, 32)
    this.localEndpoint.secret = this.engine.generate()
    if (this.isSecretHidden) {
      this.isSecretHidden = false
      setTimeout(() => {
        this.isSecretHidden = true
      }, 1000)
    }
  }

  /**
   * Toggle secret visibility
   *
   * @return {void}
   */
  toggleSecretVisibility(): void {
    this.isSecretHidden = !this.isSecretHidden
  }
}
</script>
