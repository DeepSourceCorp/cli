import {
  state,
  mutations,
  actions,
  RunListMutations,
  RunListActionContext,
  RunListModuleState,
  RunListActions
} from '~/store/run/list'
import { Maybe, Repository, RunConnection, RunEdge } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { mockRunListState } from './__mocks__/runList.mock'

let runListState: RunListModuleState
let actionCxt: RunListActionContext
let spy: jest.SpyInstance
let commit: jest.Mock
let localThis: any

describe('[Store] Run/List', () => {
  beforeEach(() => {
    runListState = mockRunListState()
    commit = jest.fn()

    actionCxt = {
      rootGetters: jest.fn(),
      state: runListState,
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
      expect(initState.runList).toEqual({
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
    describe(`Action "${RunListActions.FETCH_RUN_LIST}"`, () => {
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
            async $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return new Promise<GraphqlQueryResponse>((resolve) =>
                resolve({ data: { repository: <Repository>{ runs: mockRunListState().runList } } })
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RunListActions.FETCH_RUN_LIST].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'asgard',
            currentPageNumber: 1,
            limit: 5,
            refetch: false
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', async () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunListMutations.SET_LOADING}`, async () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RunListMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RunListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RunListMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RunListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RunListMutations.SET_RUN_LIST}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RunListMutations.SET_RUN_LIST` is being commited or not.
          expect(secondCall[0]).toEqual(RunListMutations.SET_RUN_LIST)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.repository.runs)
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
            async $fetchGraphqlData(): Promise<Error> {
              return new Promise<Error>((resolve, reject) => reject(new Error('ERR1')))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RunListActions.FETCH_RUN_LIST].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'asgard',
            currentPageNumber: 1,
            limit: 5,
            refetch: false
          })
        })

        test('successfully commits mutations', async () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunListMutations.SET_LOADING}`, async () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RunListMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RunListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RunListMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RunListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RunListMutations.SET_ERROR}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RunListMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(RunListMutations.SET_ERROR)

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
    describe(`Mutation "${RunListMutations.SET_LOADING}"`, () => {
      test('successfully updates loading field in state', () => {
        mutations[RunListMutations.SET_LOADING](runListState, true)
        expect(runListState.loading).toEqual(true)
      })
    })

    describe(`Mutation "${RunListMutations.SET_ERROR}"`, () => {
      test('successfully updates loading field in state', () => {
        const dummyError = {
          graphQLErrors: {
            message: 'Dummy error',
            locations: [],
            path: []
          }
        }
        mutations[RunListMutations.SET_ERROR](runListState, dummyError)
        expect(runListState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${RunListMutations.SET_RUN_LIST}"`, () => {
      beforeEach(() => {
        runListState.runList = {} as RunConnection
      })
      test('successfully adds new run list to the state', () => {
        const newRunList: RunConnection = {
          totalCount: 0,
          edges: [] as Array<Maybe<RunEdge>>
        } as RunConnection

        mutations[RunListMutations.SET_RUN_LIST](runListState, newRunList)
        expect(runListState.runList).toEqual(newRunList)
      })

      test('successfully appends data', () => {
        const newRunList: RunConnection = mockRunListState().runList as RunConnection

        if (newRunList.totalCount) {
          newRunList.totalCount = 10
        }
        mutations[RunListMutations.SET_RUN_LIST](runListState, newRunList)
        expect(runListState.runList.totalCount).toEqual(newRunList.totalCount)
      })
    })
  })
})
