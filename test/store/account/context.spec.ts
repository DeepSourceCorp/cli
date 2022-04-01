import { mockContextStore } from './__mocks__/context.mocks'

import {
  state,
  mutations,
  getters,
  actions,
  ContextModuleState,
  ContextActionContext,
  ContextGetterTypes,
  ContextActionTypes,
  ContextMutationTypes
} from '~/store/account/context'
import { Changelog, Context } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

let commit: jest.Mock
let contextState: ContextModuleState
let actionCxt: ContextActionContext
let localThis: any
let spy: jest.SpyInstance

describe('[Store] Account/Context', () => {
  beforeEach(() => {
    commit = jest.fn()
    contextState = mockContextStore()

    actionCxt = {
      state: contextState,
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
      expect(initState.context).toEqual(<Context>{})
      expect(initState.changelog).toEqual(<Changelog>{})
      expect(initState.loading).toEqual(false)
      expect(initState.error).toEqual(<Record<string, any>>{})
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ GETTERS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Getters]]', () => {
    describe(`Getter "${ContextGetterTypes.TO_ONBOARD}"`, () => {
      test('returns same data as "toOnboard" in context', () => {
        const getToOnboard = getters[ContextGetterTypes.TO_ONBOARD](contextState, {}, {}, {})
        expect(contextState.context.toOnboard).toEqual(getToOnboard)
      })
    })

    describe(`Getter "${ContextGetterTypes.INSTALLATION_URL}"`, () => {
      test('returns same data as given instalaltion url in context', () => {
        const getInstallationUrl = getters[ContextGetterTypes.INSTALLATION_URL](
          contextState,
          {},
          {},
          {}
        )

        expect(contextState.context.installationUrls['github']).toEqual(
          getInstallationUrl('github')
        )
      })
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    describe(`Action "${ContextActionTypes.FETCH_CONTEXT}"`, () => {
      describe(`Success`, () => {
        beforeEach(async () => {
          localThis = {
            $providerMetaMap: {
              gh: {
                text: 'Github',
                shortcode: 'gh',
                value: 'GITHUB'
              }
            },
            async $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return new Promise<GraphqlQueryResponse>((resolve) =>
                setTimeout(() => resolve({ data: { context: mockContextStore().context } }), 10)
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[ContextActionTypes.FETCH_CONTEXT].call(localThis, actionCxt, {
            refetch: true
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', async () => {
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${ContextMutationTypes.SET_CONTEXT}`, async () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `ContextMutationTypes.SET_CONTEXT` is being commited or not.
          expect(firstCall[0]).toEqual(ContextMutationTypes.SET_CONTEXT)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(firstCall[1]).toEqual(apiResponse.data.context)
        })
      })
    })

    describe(`Action "${ContextActionTypes.FETCH_CHANGELOG}"`, () => {
      describe('Success', () => {
        beforeEach(async () => {
          localThis = {
            $providerMetaMap: {
              gh: {
                text: 'Github',
                shortcode: 'gh',
                value: 'GITHUB'
              }
            },
            async $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return new Promise<GraphqlQueryResponse>((resolve) =>
                setTimeout(() => resolve({ data: { changelog: mockContextStore().changelog } }), 10)
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[ContextActionTypes.FETCH_CHANGELOG].call(localThis, actionCxt)
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', async () => {
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${ContextMutationTypes.SET_CHANGELOG}`, async () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `ContextMutationTypes.SET_CONTEXT` is being commited or not.
          expect(firstCall[0]).toEqual(ContextMutationTypes.SET_CHANGELOG)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(firstCall[1]).toEqual(apiResponse.data.changelog)
        })
      })
    })
  })

  /*
      +++++++++++++++++++++++++++++++++++++++++++++++++
      +++++++++++++++++++ MUTATIONS +++++++++++++++++++
      +++++++++++++++++++++++++++++++++++++++++++++++++
    */
  describe('[[Mutations]]', () => {
    describe(`Mutation "${ContextMutationTypes.SET_CONTEXT}"`, () => {
      test('successfully updates context field in state', () => {
        mutations[ContextMutationTypes.SET_CONTEXT](contextState, mockContextStore().context)
        expect(contextState.context).toEqual(mockContextStore().context)
      })
    })

    describe(`Mutation "${ContextMutationTypes.SET_CHANGELOG}"`, () => {
      test('successfully updates context field in state', () => {
        mutations[ContextMutationTypes.SET_CHANGELOG](contextState, mockContextStore().changelog)
        expect(contextState.changelog).toEqual(mockContextStore().changelog)
      })
    })
  })
})
