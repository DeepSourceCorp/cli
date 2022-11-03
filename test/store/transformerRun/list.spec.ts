import {
  state,
  mutations,
  actions,
  TransformListMutations,
  TransformerRunListActionContext,
  TransformerRunListModuleState,
  TransformListActions
} from '~/store/transformerRun/list'

import { mockTransformerRunListState } from './__mocks__/list.mock'
import { Repository, TransformerRunConnection } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

let actionCxt: TransformerRunListActionContext
let commit: jest.Mock
let localThis: any
let spy: jest.SpyInstance
let transformerRunListState: TransformerRunListModuleState

describe('[Store] TransformerRun/List', () => {
  beforeEach(() => {
    commit = jest.fn()
    transformerRunListState = mockTransformerRunListState()

    actionCxt = {
      state: transformerRunListState,
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
      expect(initState.transformerRunList).toEqual({
        pageInfo: {},
        edges: []
      })
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    describe(`Action "${TransformListActions.FETCH_TRANSFORMER_RUN_LIST}"`, () => {
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
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: {
                  repository: <Repository>{
                    groupedTransformerRuns: mockTransformerRunListState().transformerRunList
                  }
                }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[TransformListActions.FETCH_TRANSFORMER_RUN_LIST].call(
            localThis,
            actionCxt,
            {
              provider: 'gh',
              owner: 'deepsourcelabs',
              name: 'asgard',
              currentPageNumber: 2,
              limit: 10
            }
          )
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${TransformListMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `TransformListMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(TransformListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `TransformListMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(TransformListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${TransformListMutations.SET_TRANSFORMER_RUN_LIST}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `TransformListMutations.SET_TRANSFORMER_RUN_LIST` is being commited or not.
          expect(secondCall[0]).toEqual(TransformListMutations.SET_TRANSFORMER_RUN_LIST)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.repository.groupedTransformerRuns)
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
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<Error> {
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[TransformListActions.FETCH_TRANSFORMER_RUN_LIST].call(
            localThis,
            actionCxt,
            {
              provider: 'gh',
              owner: 'deepsourcelabs',
              name: 'asgard',
              currentPageNumber: 2,
              limit: 10
            }
          )
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${TransformListMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `TransformListMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(TransformListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `TransformListMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(TransformListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${TransformListMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `TransformListMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(TransformListMutations.SET_ERROR)

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
    describe(`Mutation "${TransformListMutations.SET_LOADING}"`, () => {
      test('successfully updates loading field in state', () => {
        mutations[TransformListMutations.SET_LOADING](transformerRunListState, true)
        expect(transformerRunListState.loading).toEqual(true)
      })
    })

    describe(`Mutation "${TransformListMutations.SET_ERROR}"`, () => {
      test('successfully updates loading field in state', () => {
        const dummyError = {
          graphQLErrors: {
            message: 'Dummy error',
            locations: [],
            path: []
          }
        }
        mutations[TransformListMutations.SET_ERROR](transformerRunListState, dummyError)
        expect(transformerRunListState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${TransformListMutations.SET_TRANSFORMER_RUN_LIST}"`, () => {
      beforeEach(() => {
        transformerRunListState.transformerRunList = {} as TransformerRunConnection
      })
      test('successfully adds new run list to the state', () => {
        const newTransformerRunList: TransformerRunConnection = {
          totalCount: 10
        } as TransformerRunConnection

        mutations[TransformListMutations.SET_TRANSFORMER_RUN_LIST](
          transformerRunListState,
          newTransformerRunList
        )
        expect(transformerRunListState.transformerRunList).toEqual(newTransformerRunList)
      })

      test('successfully appends data', () => {
        const newTransformerRunList: TransformerRunConnection = mockTransformerRunListState()
          .transformerRunList as TransformerRunConnection

        if (newTransformerRunList.edges[0]?.node?.changedFilesCount) {
          newTransformerRunList.edges[0].node.changedFilesCount = 2
        }
        mutations[TransformListMutations.SET_TRANSFORMER_RUN_LIST](
          transformerRunListState,
          newTransformerRunList
        )
        expect(
          transformerRunListState.transformerRunList.edges[0]?.node?.changedFilesCount
        ).toEqual(newTransformerRunList.edges[0]?.node?.changedFilesCount)
      })
    })
  })
})
