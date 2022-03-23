import { RootState } from '~/store'
import { ActionTree, MutationTree, ActionContext, Store } from 'vuex'
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
  WebhookConnection,
  WebhookEventDelivery,
  WebhookEventDeliveryConnection,
  WebhookEventTypes,
  WebhookEventTypesConnection
} from '~/types/types'

// Queries
import listEventTypes from '~/apollo/queries/owner/webhooks/listEventTypes.gql'
import listWebhookEndpoints from '~/apollo/queries/owner/webhooks/list.gql'
import fetchSingleEndpoint from '~/apollo/queries/owner/webhooks/single.gql'
import fetchWebhookDeliveries from '~/apollo/queries/owner/webhooks/deliveries/webhookDeliveries.gql'
import fetchSingleDelivery from '~/apollo/queries/owner/webhooks/deliveries/single.gql'

// Mutations
import createEndpoint from '~/apollo/mutations/owner/webhooks/create.gql'
import disableEndpoint from '~/apollo/mutations/owner/webhooks/disable.gql'
import deleteEndpoint from '~/apollo/mutations/owner/webhooks/delete.gql'
import testEndpoint from '~/apollo/mutations/owner/webhooks/test.gql'
import updateEndpoint from '~/apollo/mutations/owner/webhooks/update.gql'

import { resolveNodes } from '~/utils/array'

export interface WebhookState {
  endpoint: Webhook
  delivery: WebhookEventDelivery
  endpointDeliveries: WebhookEventDelivery[]
  endpointDeliveriesCount: number
  webhookEndpoints: Webhook[]
  totalWebhookEndpoints: number
  webhookEventTypes: WebhookEventTypes[]
}

// Mutation -----------------------------------------

export enum WebhookMutations {
  SET_WEBHOOK_EVENTS_TYPES_LIST = 'setWebhookEventTypesList',
  SET_WEBHOOK_ENDPOINTS = 'setWebhookEndpoints',
  SET_ENDPOINT_DELIVERIES = 'setWebhookEndpointDeliveries',
  EMPTY_ENDPOINT_DELIVERIES = 'emptyEndpointDeliveries',
  SET_ENDPOINT = 'setEndpoint',
  SET_DELIVERY = 'setDelivery'
}

export const mutations: MutationTree<WebhookState> = {
  [WebhookMutations.SET_WEBHOOK_EVENTS_TYPES_LIST]: (state, value: WebhookEventTypesConnection) => {
    const nodes = resolveNodes(value) as WebhookEventTypes[]
    state.webhookEventTypes = nodes.filter((node) => node?.shortcode !== 'test.event')
  },
  [WebhookMutations.SET_ENDPOINT]: (state, value: Webhook) => {
    state.endpoint = value
  },
  [WebhookMutations.SET_DELIVERY]: (state, value: WebhookEventDelivery) => {
    state.delivery = value
  },
  [WebhookMutations.SET_ENDPOINT_DELIVERIES]: (state, value: WebhookEventDeliveryConnection) => {
    state.endpointDeliveries = resolveNodes(value) as WebhookEventDelivery[]
    state.endpointDeliveriesCount = value.totalCount ?? 0
  },
  [WebhookMutations.EMPTY_ENDPOINT_DELIVERIES]: (state) => {
    state.endpointDeliveries = []
    state.endpointDeliveriesCount = 0
  },
  [WebhookMutations.SET_WEBHOOK_ENDPOINTS]: (state, value: WebhookConnection) => {
    state.totalWebhookEndpoints = value.totalCount || 0
    state.webhookEndpoints = resolveNodes(value) as Webhook[]
  }
}

// Actions ------------------------------------------
export enum WebhookActions {
  FETCH_WEBHOOK_EVENT_TYPES_LIST = 'fetchWebhookEventTypesList',
  FETCH_WEBHOOK_ENDPOINTS = 'fetchWebhookEndpoints',
  FETCH_SINGLE_ENDPOINT = 'fetchSingleEndpoint',
  FETCH_SINGLE_DELIVERY = 'fetchSingleDelivery',
  FETCH_ENDPOINT_DELIVERIES = 'fetchEndpointDeliveries',
  CREATE_ENDPOINT = 'createEndpoint',
  DELETE_ENDPOINT = 'deleteEndpoint',
  DISABLE_ENDPOINT = 'disableEndpoint',
  TEST_ENDPOINT = 'testEndpoint',
  UPDATE_ENDPOINT = 'updateEndpoint'
}

export type WebhookModuleActionContext = ActionContext<WebhookState, RootState>

interface WebhookModuleActions extends ActionTree<WebhookState, RootState> {
  [WebhookActions.FETCH_WEBHOOK_EVENT_TYPES_LIST]: (
    this: Store<RootState>,
    injectee: WebhookModuleActionContext
  ) => Promise<void>
  [WebhookActions.FETCH_WEBHOOK_ENDPOINTS]: (
    this: Store<RootState>,
    injectee: WebhookModuleActionContext,
    args: {
      login: string
      provider: string
      currentPage: number
      limit: number
      refetch?: boolean
    }
  ) => Promise<void>
  [WebhookActions.FETCH_SINGLE_ENDPOINT]: (
    this: Store<RootState>,
    injectee: WebhookModuleActionContext,
    args: {
      webhookId: string
      refetch?: boolean
    }
  ) => Promise<Webhook>
  [WebhookActions.FETCH_SINGLE_DELIVERY]: (
    this: Store<RootState>,
    injectee: WebhookModuleActionContext,
    args: {
      ownerId: string
      deliveryId: string
      refetch?: boolean
    }
  ) => Promise<void>
  [WebhookActions.FETCH_ENDPOINT_DELIVERIES]: (
    this: Store<RootState>,
    injectee: WebhookModuleActionContext,
    args: {
      webhookId: string
      limit: number
      currentPage: number
    }
  ) => Promise<void>
  [WebhookActions.CREATE_ENDPOINT]: (
    this: Store<RootState>,
    injectee: WebhookModuleActionContext,
    args: CreateWebhookInput
  ) => Promise<CreateWebhookPayload>
  [WebhookActions.DELETE_ENDPOINT]: (
    this: Store<RootState>,
    injectee: WebhookModuleActionContext,
    args: DeleteWebhookInput
  ) => Promise<DeleteWebhookPayload>
  [WebhookActions.DISABLE_ENDPOINT]: (
    this: Store<RootState>,
    injectee: WebhookModuleActionContext,
    args: DisableWebhookInput
  ) => Promise<DisableWebhookPayload>
  [WebhookActions.TEST_ENDPOINT]: (
    this: Store<RootState>,
    injectee: WebhookModuleActionContext,
    args: TestWebhookInput
  ) => Promise<TestWebhookPayload>
  [WebhookActions.UPDATE_ENDPOINT]: (
    this: Store<RootState>,
    injectee: WebhookModuleActionContext,
    args: UpdateWebhookInput
  ) => Promise<UpdateWebhookPayload>
}

export const actions: WebhookModuleActions = {
  async [WebhookActions.FETCH_WEBHOOK_EVENT_TYPES_LIST]({ commit }) {
    const response = await this.$fetchGraphqlData(listEventTypes, {})
    commit(WebhookMutations.SET_WEBHOOK_EVENTS_TYPES_LIST, response.data.webhookEventTypes)
  },
  async [WebhookActions.FETCH_WEBHOOK_ENDPOINTS]({ commit }, args) {
    const response = await this.$fetchGraphqlData(
      listWebhookEndpoints,
      {
        login: args.login,
        provider: this.$providerMetaMap[args.provider].value,
        after: this.$getGQLAfter(args.currentPage, args.limit),
        limit: args.limit
      },
      args.refetch
    )
    commit(WebhookMutations.SET_WEBHOOK_ENDPOINTS, response.data.owner.webhooks)
  },
  async [WebhookActions.FETCH_ENDPOINT_DELIVERIES]({ commit }, args) {
    const response = await this.$fetchGraphqlData(
      fetchWebhookDeliveries,
      {
        webhookId: args.webhookId,
        after: this.$getGQLAfter(args.currentPage, args.limit),
        limit: args.limit
      },
      true
    )
    commit(WebhookMutations.SET_ENDPOINT_DELIVERIES, response.data.webhook.deliveries)
  },
  async [WebhookActions.FETCH_SINGLE_ENDPOINT]({ commit, state }, { webhookId, refetch }) {
    if (state.endpoint?.id && webhookId !== state.endpoint.id) {
      commit(WebhookMutations.EMPTY_ENDPOINT_DELIVERIES)
    }
    const response = await this.$fetchGraphqlData(fetchSingleEndpoint, { webhookId }, refetch)
    commit(WebhookMutations.SET_ENDPOINT, response.data.webhook)
    return response.data.webhook
  },
  async [WebhookActions.FETCH_SINGLE_DELIVERY]({ commit }, { ownerId, deliveryId, refetch }) {
    const response = await this.$fetchGraphqlData(
      fetchSingleDelivery,
      { ownerId, deliveryId },
      refetch
    )
    commit(WebhookMutations.SET_DELIVERY, response.data.webhookEventDelivery)
  },
  async [WebhookActions.CREATE_ENDPOINT](_, args) {
    const response = await this.$applyGraphqlMutation(createEndpoint, args)
    return response.data.createWebhook
  },
  async [WebhookActions.DELETE_ENDPOINT](_, args) {
    const response = await this.$applyGraphqlMutation(deleteEndpoint, args)
    return response.data.deleteWebhook
  },
  async [WebhookActions.DISABLE_ENDPOINT](_, args) {
    const response = await this.$applyGraphqlMutation(disableEndpoint, args)
    return response.data.disableWebhook
  },
  async [WebhookActions.TEST_ENDPOINT](_, args) {
    const response = await this.$applyGraphqlMutation(testEndpoint, args)
    return response.data.testWebhook
  },
  async [WebhookActions.UPDATE_ENDPOINT](_, args) {
    const response = await this.$applyGraphqlMutation(updateEndpoint, args)
    return response.data.updateWebhook
  }
}

export const state = (): WebhookState => ({
  endpoint: {
    url: ''
  } as Webhook,
  delivery: {} as WebhookEventDelivery,
  endpointDeliveries: [],
  endpointDeliveriesCount: 0,
  webhookEventTypes: [],
  webhookEndpoints: [],
  totalWebhookEndpoints: 0
})
