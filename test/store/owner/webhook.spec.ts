import { mockWebhookStoreInitialState, webhookStoreMock } from './__mocks__/webhook-detail.mock'
import {
  state,
  mutations,
  actions,
  WebhookActions,
  WebhookState,
  WebhookModuleActionContext,
  WebhookMutations
} from '~/store/owner/webhook'
import { GraphqlMutationResponse, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  Maybe,
  Owner,
  Webhook,
  WebhookEdge,
  WebhookEventDeliveryEdge,
  WebhookEventTypesEdge
} from '~/types/types'

let actionCxt: WebhookModuleActionContext
let commit: jest.Mock
let localThis: any
let spy: jest.SpyInstance
let webhookState: WebhookState

const localState = {
  $providerMetaMap: {
    gh: {
      text: 'Github',
      shortcode: 'gh',
      value: 'GITHUB'
    }
  },
  $getGQLAfter: () => {
    return 'hello-world'
  }
}

describe('[Store] Owner/Details', () => {
  beforeEach(() => {
    commit = jest.fn()
    webhookState = mockWebhookStoreInitialState()

    actionCxt = {
      state: webhookState,
      commit,
      dispatch: jest.fn(),
      getters: jest.fn(),
      rootGetters: jest.fn(),
      rootState: {}
    }
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ STATE +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[State]]', () => {
    test('has the right initial data', () => {
      const initState = state()
      expect(initState).toMatchObject(mockWebhookStoreInitialState())
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    test(`Action "${WebhookActions.FETCH_WEBHOOK_EVENT_TYPES_LIST}"`, async () => {
      const mockResponse = {
        data: {
          webhookEventTypes: {
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false
            },
            edges: webhookStoreMock.webhookEventTypes.map((event) => ({
              node: event
            })) as Maybe<WebhookEventTypesEdge>[]
          }
        }
      }
      localThis = {
        ...localState,
        $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
          return Promise.resolve(mockResponse)
        }
      }
      spy = jest.spyOn(localThis, '$fetchGraphqlData')
      await actions[WebhookActions.FETCH_WEBHOOK_EVENT_TYPES_LIST].call(localThis, actionCxt)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledTimes(1)
      expect(commit).toBeCalledWith(
        WebhookMutations.SET_WEBHOOK_EVENTS_TYPES_LIST,
        mockResponse.data.webhookEventTypes
      )
    })

    test(`Action "${WebhookActions.FETCH_WEBHOOK_ENDPOINTS}"`, async () => {
      const mockResponse = {
        data: {
          owner: {
            id: 'test-owner',
            webhooks: {
              totalCount: 5,
              pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false
              },
              edges: webhookStoreMock.webhookEndpoints.map((event) => ({
                node: event
              })) as Maybe<WebhookEdge>[]
            }
          } as Owner
        }
      }
      localThis = {
        ...localState,
        $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
          return Promise.resolve(mockResponse)
        }
      }

      spy = jest.spyOn(localThis, '$fetchGraphqlData')
      await actions[WebhookActions.FETCH_WEBHOOK_ENDPOINTS].call(localThis, actionCxt, {
        login: 'test',
        provider: 'gh',
        currentPage: 1,
        limit: 10,
        refetch: false
      })

      expect(spy).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledWith(
        WebhookMutations.SET_WEBHOOK_ENDPOINTS,
        mockResponse.data.owner.webhooks
      )
    })

    test(`Action "${WebhookActions.FETCH_SINGLE_ENDPOINT}"`, async () => {
      localThis = {
        ...localState,
        $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
          return Promise.resolve({ data: { webhook: webhookStoreMock.endpoint } })
        }
      }

      spy = jest.spyOn(localThis, '$fetchGraphqlData')
      const response = await actions[WebhookActions.FETCH_SINGLE_ENDPOINT].call(
        localThis,
        {
          ...actionCxt,
          state: {
            ...mockWebhookStoreInitialState(),
            endpoint: webhookStoreMock.endpoint
          }
        },
        {
          webhookId: 'test'
        }
      )

      expect(spy).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledTimes(2)
      expect(commit).toHaveBeenCalledWith(WebhookMutations.SET_ENDPOINT, response)
    })

    test(`Action "${WebhookActions.FETCH_SINGLE_DELIVERY}"`, async () => {
      localThis = {
        ...localState,
        $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
          return Promise.resolve({ data: { webhookEventDelivery: webhookStoreMock.delivery } })
        }
      }

      spy = jest.spyOn(localThis, '$fetchGraphqlData')
      await actions[WebhookActions.FETCH_SINGLE_DELIVERY].call(localThis, actionCxt, {
        ownerId: 'testing',
        deliveryId: 'test'
      })

      expect(spy).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledWith(WebhookMutations.SET_DELIVERY, webhookStoreMock.delivery)
    })

    test(`Action "${WebhookActions.FETCH_ENDPOINT_DELIVERIES}"`, async () => {
      const mockResponse = {
        data: {
          webhook: {
            id: '232423423',
            deliveries: {
              totalCount: 12,
              pageInfo: {
                hasNextPage: false,
                hasPreviousPage: false
              },
              edges: webhookStoreMock.endpointDeliveries.map((event) => ({
                node: event
              })) as Maybe<WebhookEventDeliveryEdge>[]
            }
          } as Webhook
        }
      }

      localThis = {
        ...localState,
        $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
          return Promise.resolve(mockResponse)
        }
      }

      spy = jest.spyOn(localThis, '$fetchGraphqlData')
      await actions[WebhookActions.FETCH_ENDPOINT_DELIVERIES].call(localThis, actionCxt, {
        webhookId: 'test',
        currentPage: 0,
        limit: 15
      })

      expect(spy).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledWith(
        WebhookMutations.SET_ENDPOINT_DELIVERIES,
        mockResponse.data.webhook.deliveries
      )
    })

    test(`Action "${WebhookActions.CREATE_ENDPOINT}"`, async () => {
      const mockResponse = {
        data: {
          createWebhook: {
            webhook: {
              id: '232423423'
            } as Webhook
          }
        }
      }

      localThis = {
        ...localState,
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return Promise.resolve(mockResponse)
        }
      }

      spy = jest.spyOn(localThis, '$applyGraphqlMutation')
      const returnValue = await actions[WebhookActions.CREATE_ENDPOINT].call(localThis, actionCxt, {
        url: 'https://test.deepsource.io',
        secret: 'nsjjfnsajkldfasdjklfnadsjfnaioe',
        apiSigning: true,
        ownerId: '22423',
        eventsSubscribed: ['test-event']
      })

      expect(spy).toHaveBeenCalledTimes(1)
      expect(commit).toHaveBeenCalledTimes(0)
      expect(returnValue).toMatchObject(mockResponse.data.createWebhook)
    })
  })

  test(`Action "${WebhookActions.CREATE_ENDPOINT}"`, async () => {
    const mockResponse = {
      data: {
        createWebhook: {
          webhook: {
            id: '232423423'
          } as Webhook
        }
      }
    }

    localThis = {
      ...localState,
      $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
        return Promise.resolve(mockResponse)
      }
    }

    spy = jest.spyOn(localThis, '$applyGraphqlMutation')
    const returnValue = await actions[WebhookActions.CREATE_ENDPOINT].call(localThis, actionCxt, {
      url: 'https://test.deepsource.io',
      secret: 'nsjjfnsajkldfasdjklfnadsjfnaioe',
      apiSigning: true,
      ownerId: '22423',
      eventsSubscribed: ['test-event']
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(commit).toHaveBeenCalledTimes(0)
    expect(returnValue).toMatchObject(mockResponse.data.createWebhook)
  })

  test(`Action "${WebhookActions.DELETE_ENDPOINT}"`, async () => {
    const mockResponse = {
      data: {
        deleteWebhook: {
          ok: true
        }
      }
    }

    localThis = {
      ...localState,
      $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
        return Promise.resolve(mockResponse)
      }
    }

    spy = jest.spyOn(localThis, '$applyGraphqlMutation')
    const returnValue = await actions[WebhookActions.DELETE_ENDPOINT].call(localThis, actionCxt, {
      webhookId: '23423423423'
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(commit).toHaveBeenCalledTimes(0)
    expect(returnValue).toMatchObject(mockResponse.data.deleteWebhook)
  })

  test(`Action "${WebhookActions.DISABLE_ENDPOINT}"`, async () => {
    const mockResponse = {
      data: {
        disableWebhook: {
          ok: true
        }
      }
    }

    localThis = {
      ...localState,
      $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
        return Promise.resolve(mockResponse)
      }
    }

    spy = jest.spyOn(localThis, '$applyGraphqlMutation')
    const returnValue = await actions[WebhookActions.DISABLE_ENDPOINT].call(localThis, actionCxt, {
      webhookId: '23423423423'
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(commit).toHaveBeenCalledTimes(0)
    expect(returnValue).toMatchObject(mockResponse.data.disableWebhook)
  })

  test(`Action "${WebhookActions.TEST_ENDPOINT}"`, async () => {
    const mockResponse = {
      data: {
        testWebhook: {
          ok: true
        }
      }
    }

    localThis = {
      ...localState,
      $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
        return Promise.resolve(mockResponse)
      }
    }

    spy = jest.spyOn(localThis, '$applyGraphqlMutation')
    const returnValue = await actions[WebhookActions.TEST_ENDPOINT].call(localThis, actionCxt, {
      webhookId: '23423423423'
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(commit).toHaveBeenCalledTimes(0)
    expect(returnValue).toMatchObject(mockResponse.data.testWebhook)
  })

  test(`Action "${WebhookActions.UPDATE_ENDPOINT}"`, async () => {
    const mockResponse = {
      data: {
        updateWebhook: {
          webhook: {
            id: '24323432432'
          } as Webhook
        }
      }
    }

    localThis = {
      ...localState,
      $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
        return Promise.resolve(mockResponse)
      }
    }

    spy = jest.spyOn(localThis, '$applyGraphqlMutation')
    const returnValue = await actions[WebhookActions.UPDATE_ENDPOINT].call(localThis, actionCxt, {
      webhookId: '23423423423'
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(commit).toHaveBeenCalledTimes(0)
    expect(returnValue).toMatchObject(mockResponse.data.updateWebhook)
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ MUTATIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Mutations]]', () => {
    // describe(`Mutation "${OwnerDetailMutations.SET_LOADING}"`, () => {
    //   test('successfully updates loading field in state', () => {
    //     mutations[OwnerDetailMutations.SET_LOADING](webhookState, true)
    //     expect(webhookState.loading).toEqual(true)
    //   })
    // })
  })
})
