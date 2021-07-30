import {
  state,
  mutations,
  actions,
  TransformerRunMutations,
  TransformerRunDetailActionContext,
  TransformerRunDetailModuleState,
  TransformerRunActions
} from '~/store/transformerRun/detail'
import { mockTransformerRunDetailState } from './__mocks__/detail.mock'
import { TransformerRun } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

let actionCxt: TransformerRunDetailActionContext
let commit: jest.Mock
let localThis: any
let spy: jest.SpyInstance
let transformerRunDetailState: TransformerRunDetailModuleState

describe('[Store] TransformerRun/Detail', () => {
  beforeEach(() => {
    commit = jest.fn()
    transformerRunDetailState = mockTransformerRunDetailState()

    actionCxt = {
      state: transformerRunDetailState,
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
      expect(initState.loading).toEqual(false)
      expect(initState.error).toEqual({})
      expect(initState.transformerRun).toEqual({})
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    describe(`Action "${TransformerRunActions.FETCH_TRANSFORMER_RUN}"`, () => {
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
                resolve({
                  data: { transformerRun: mockTransformerRunDetailState().transformerRun }
                })
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[TransformerRunActions.FETCH_TRANSFORMER_RUN].call(localThis, actionCxt, {
            runId: 'string'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', async () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${TransformerRunMutations.SET_LOADING}`, async () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `TransformerRunMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(TransformerRunMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `TransformerRunMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(TransformerRunMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${TransformerRunMutations.SET_TRANSFORMER_RUN}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `TransformerRunMutations.SET_TRANSFORMER_RUN` is being commited or not.
          expect(secondCall[0]).toEqual(TransformerRunMutations.SET_TRANSFORMER_RUN)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.transformerRun)
        })
      })
      describe(`Failure`, () => {
        beforeEach(async () => {
          localThis = {
            $providerMetaMap: {
              gh: {
                text: 'Github',
                shortcode: 'gh',
                value: 'GITHUB'
              }
            },
            async $fetchGraphqlData(): Promise<Error> {
              return new Promise<Error>((resolve, reject) => reject(new Error('ERR1')))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[TransformerRunActions.FETCH_TRANSFORMER_RUN].call(localThis, actionCxt, {
            runId: 'string'
          })
        })

        test('successfully commits mutations', async () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${TransformerRunMutations.SET_LOADING}`, async () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `TransformerRunMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(TransformerRunMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `TransformerRunMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(TransformerRunMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${TransformerRunMutations.SET_ERROR}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `TransformerRunMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(TransformerRunMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
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
    describe(`Mutation "${TransformerRunMutations.SET_LOADING}"`, () => {
      test('successfully updates loading field in state', () => {
        mutations[TransformerRunMutations.SET_LOADING](transformerRunDetailState, true)
        expect(transformerRunDetailState.loading).toEqual(true)
      })
    })

    describe(`Mutation "${TransformerRunMutations.SET_ERROR}"`, () => {
      test('successfully updates loading field in state', () => {
        const dummyError = {
          graphQLErrors: {
            message: 'Dummy error',
            locations: [],
            path: []
          }
        }
        mutations[TransformerRunMutations.SET_ERROR](transformerRunDetailState, dummyError)
        expect(transformerRunDetailState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${TransformerRunMutations.SET_TRANSFORMER_RUN}"`, () => {
      beforeEach(() => {
        transformerRunDetailState.transformerRun = {} as TransformerRun
      })
      test('successfully adds new run detail to the state', () => {
        const newTransformerRun: TransformerRun = {
          id: 'string',
          status: 'FAIL'
        } as TransformerRun

        mutations[TransformerRunMutations.SET_TRANSFORMER_RUN](
          transformerRunDetailState,
          newTransformerRun
        )
        expect(transformerRunDetailState.transformerRun).toEqual(newTransformerRun)
      })

      test('successfully appends data', () => {
        const newTransformerRun: TransformerRun = mockTransformerRunDetailState()
          .transformerRun as TransformerRun

        if (newTransformerRun.id) {
          newTransformerRun.id = 'new_id'
        }
        mutations[TransformerRunMutations.SET_TRANSFORMER_RUN](
          transformerRunDetailState,
          newTransformerRun
        )
        expect(transformerRunDetailState.transformerRun.id).toEqual(newTransformerRun.id)
      })
    })
  })
})
