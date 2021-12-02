import { Component, namespace, mixins } from 'nuxt-property-decorator'
import { WebhookActions } from '~/store/owner/webhook'
import {
  CreateWebhookInput,
  CreateWebhookPayload,
  DeleteWebhookInput,
  DeleteWebhookPayload,
  DisableWebhookInput,
  DisableWebhookPayload,
  TestWebhookInput,
  TestWebhookPayload,
  UpdateWebhookInput,
  UpdateWebhookPayload,
  Webhook,
  WebhookEventDelivery,
  WebhookEventTypes
} from '~/types/types'
import OwnerDetailMixin from './ownerDetailMixin'

const webhook = namespace('owner/webhook')

@Component
export default class WebhookMixin extends mixins(OwnerDetailMixin) {
  @webhook.State
  webhookEndpoints: Webhook[]

  @webhook.State
  endpoint: Webhook

  @webhook.State
  delivery: WebhookEventDelivery

  @webhook.State
  endpointDeliveries: WebhookEventDelivery[]

  @webhook.State
  endpointDeliveriesCount: number

  @webhook.State
  webhookEventTypes: WebhookEventTypes[]

  @webhook.State
  totalWebhookEndpoints: number

  @webhook.Action(WebhookActions.CREATE_ENDPOINT)
  createEndpoint: (args: CreateWebhookInput) => Promise<CreateWebhookPayload>

  @webhook.Action(WebhookActions.DISABLE_ENDPOINT)
  disableEndpoint: (args: DisableWebhookInput) => Promise<DisableWebhookPayload>

  @webhook.Action(WebhookActions.DELETE_ENDPOINT)
  deleteEndpoint: (args: DeleteWebhookInput) => Promise<DeleteWebhookPayload>

  @webhook.Action(WebhookActions.TEST_ENDPOINT)
  testEndpoint: (args: TestWebhookInput) => Promise<TestWebhookPayload>

  @webhook.Action(WebhookActions.UPDATE_ENDPOINT)
  updateEndpoint: (args: UpdateWebhookInput) => Promise<UpdateWebhookPayload>

  @webhook.Action(WebhookActions.FETCH_SINGLE_ENDPOINT)
  fetchSingleEndpoint: (args: { webhookId: string; refetch?: boolean }) => Promise<Webhook>

  @webhook.Action(WebhookActions.FETCH_SINGLE_DELIVERY)
  fetchSingleDelivery: (args: {
    ownerId: string
    deliveryId: string
    refetch?: boolean
  }) => Promise<Webhook>

  @webhook.Action(WebhookActions.FETCH_WEBHOOK_ENDPOINTS)
  fetchWebhookEndpoints: (args: {
    login: string
    provider: string
    currentPage: number
    limit: number
    refetch?: boolean
  }) => Promise<void>

  @webhook.Action(WebhookActions.FETCH_ENDPOINT_DELIVERIES)
  fetchEndpointDeliveries: (args: {
    webhookId: string
    currentPage: number
    limit: number
  }) => Promise<void>

  @webhook.Action(WebhookActions.FETCH_WEBHOOK_EVENT_TYPES_LIST)
  fetchWebhookEventTypesList: () => Promise<void>

  @webhook.Action(WebhookActions.GENERATE_WEBHOOK_SECRET)
  generateWebhookSecret: () => Promise<string>

  async refetchEndpointList(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchWebhookEndpoints({
      login: owner,
      limit: 25,
      currentPage: 1,
      provider,
      refetch: true
    })
  }

  validateWebhookForm(
    url: string,
    enableApiSigning: boolean,
    secret: string,
    selectedEvents: unknown[]
  ): void {
    if (!url) {
      throw new Error('Please add a URL for the endpoint.')
    }

    try {
      const parsedURL = new URL(url)
      if (parsedURL.protocol !== 'http:' && parsedURL.protocol !== 'https:') {
        throw new Error('Please enter a valid URL.')
      }
    } catch (_) {
      throw new Error('Please enter a valid URL.')
    }

    if (enableApiSigning) {
      if (!secret) {
        throw new Error('Please add a secret for the endpoint.')
      }

      if (secret.length < 16) {
        throw new Error('The secret should be at least 16 characters.')
      }
    }

    if (selectedEvents.length === 0) {
      throw new Error('Please add at least one event before submitting.')
    }
  }
}
