import {
  state,
  mutations,
  actions,
  AnalyzerListMutations,
  AnalyzerListModuleState,
  AnalyzerListActionContext,
  AnalyzerListActions
} from '~/store/analyzer/list'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { mockAnalyzerListState } from './__mocks__/list.mock'
import { AnalyzerConnection } from '~/types/types'

let analyzerListState: AnalyzerListModuleState
let actionCxt: AnalyzerListActionContext
let spy: jest.SpyInstance
let commit: jest.Mock
let localThis: any

describe('[Store] Analyzer/List', () => {
  beforeEach(() => {
    analyzerListState = mockAnalyzerListState()
    commit = jest.fn()

    actionCxt = {
      rootGetters: jest.fn(),
      state: analyzerListState,
      dispatch: jest.fn(),
      getters: jest.fn(),
      rootState: {},
      commit
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
      expect(initState.analyzerList).toEqual({
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
    describe(`Action "${AnalyzerListActions.FETCH_ANALYZER_LIST}"`, () => {
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
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({ data: { analyzers: <AnalyzerConnection>{} } })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[AnalyzerListActions.FETCH_ANALYZER_LIST].call(localThis, actionCxt)
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${AnalyzerListMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `AnalyzerListMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(AnalyzerListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `AnalyzerListMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(AnalyzerListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${AnalyzerListMutations.SET_ANALYZER_LIST}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `AnalyzerListMutations.SET_ANALYZER_LIST` is being commited or not.
          expect(secondCall[0]).toEqual(AnalyzerListMutations.SET_ANALYZER_LIST)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.analyzers)
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

          await actions[AnalyzerListActions.FETCH_ANALYZER_LIST].call(localThis, actionCxt)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${AnalyzerListMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `AnalyzerListMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(AnalyzerListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `AnalyzerListMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(AnalyzerListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${AnalyzerListMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `AnalyzerListMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(AnalyzerListMutations.SET_ERROR)

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
    describe(`Mutation "${AnalyzerListMutations.SET_LOADING}"`, () => {
      test('successfully updates loading field in state', () => {
        mutations[AnalyzerListMutations.SET_LOADING](analyzerListState, true)
        expect(analyzerListState.loading).toEqual(true)
      })
    })

    describe(`Mutation "${AnalyzerListMutations.SET_ERROR}"`, () => {
      test('successfully updates loading field in state', () => {
        const dummyError = {
          graphQLErrors: {
            message: 'Dummy error',
            locations: [],
            path: []
          }
        }
        mutations[AnalyzerListMutations.SET_ERROR](analyzerListState, dummyError)
        expect(analyzerListState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${AnalyzerListMutations.SET_ANALYZER_LIST}"`, () => {
      beforeEach(() => {
        analyzerListState.analyzerList = {} as AnalyzerConnection
      })
      test('successfully adds analyzer list to the state', () => {
        const newAnalyzerList: AnalyzerConnection = {
          totalCount: 10
        } as AnalyzerConnection

        mutations[AnalyzerListMutations.SET_ANALYZER_LIST](analyzerListState, newAnalyzerList)
        expect(analyzerListState.analyzerList).toEqual(newAnalyzerList)
      })
    })
  })
})
