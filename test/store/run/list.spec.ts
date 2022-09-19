import {
  state,
  mutations,
  actions,
  RunListMutations,
  RunListActionContext,
  RunListModuleState,
  RunListActions
} from '~/store/run/list'
import { Maybe, PrConnection, PrStatus, Repository, RunConnection, RunEdge } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { mockRunListState, mockBranchName } from './__mocks__/runList.mock'

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
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: { repository: <Repository>{ runs: mockRunListState().runList } }
              })
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

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunListMutations.SET_LOADING}`, () => {
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
            $fetchGraphqlData(): Promise<Error> {
              return Promise.reject(new Error('ERR1'))
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

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunListMutations.SET_LOADING}`, () => {
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

        test(`successfully commits mutation ${RunListMutations.SET_ERROR}`, () => {
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

    describe(`Action "${RunListActions.FETCH_GROUPED_RUN_LIST}"`, () => {
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
                data: { repository: <Repository>{ groupedRuns: mockRunListState().groupedRunList } }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RunListActions.FETCH_GROUPED_RUN_LIST].call(localThis, actionCxt, {
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

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunListMutations.SET_LOADING}`, () => {
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

        test(`successfully commits mutation ${RunListMutations.SET_GROUPED_RUN_LIST}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RunListMutations.SET_RUN_LIST` is being commited or not.
          expect(secondCall[0]).toEqual(RunListMutations.SET_GROUPED_RUN_LIST)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.repository.groupedRuns)
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

          await actions[RunListActions.FETCH_GROUPED_RUN_LIST].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'asgard',
            currentPageNumber: 1,
            limit: 5,
            refetch: false
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunListMutations.SET_LOADING}`, () => {
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

        test(`successfully commits mutation ${RunListMutations.SET_ERROR}`, () => {
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

    describe(`Action "${RunListActions.FETCH_BRANCH_RUNS_LIST}"`, () => {
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
                    branchRuns: mockRunListState().branchRunList[mockBranchName]
                  }
                }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RunListActions.FETCH_BRANCH_RUNS_LIST].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'asgard',
            branchName: mockBranchName,
            limit: 5,
            refetch: false
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunListMutations.SET_LOADING}`, () => {
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

        test(`successfully commits mutation ${RunListMutations.SET_BRANCH_RUNS_LIST}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RunListMutations.SET_RUN_LIST` is being commited or not.
          expect(secondCall[0]).toEqual(RunListMutations.SET_BRANCH_RUNS_LIST)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual({
            [mockBranchName]: apiResponse.data.repository.branchRuns
          })
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

          await actions[RunListActions.FETCH_BRANCH_RUNS_LIST].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'asgard',
            branchName: mockBranchName,
            limit: 5,
            refetch: false
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunListMutations.SET_LOADING}`, () => {
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

        test(`successfully commits mutation ${RunListMutations.SET_ERROR}`, () => {
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

    describe(`Action "${RunListActions.FETCH_PR_LIST}"`, () => {
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
                data: { repository: <Repository>{ prs: mockRunListState().prList } }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RunListActions.FETCH_PR_LIST].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'asgard',
            currentPageNumber: 1,
            limit: 5,
            refetch: false,
            prState: PrStatus.Open
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunListMutations.SET_LOADING}`, () => {
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

        test(`successfully commits mutation ${RunListMutations.SET_PR_LIST}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RunListMutations.SET_RUN_LIST` is being commited or not.
          expect(secondCall[0]).toEqual(RunListMutations.SET_PR_LIST)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.repository.prs)
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

          await actions[RunListActions.FETCH_PR_LIST].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'asgard',
            currentPageNumber: 1,
            limit: 5,
            refetch: false,
            prState: PrStatus.Closed
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunListMutations.SET_LOADING}`, () => {
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

        test(`successfully commits mutation ${RunListMutations.SET_ERROR}`, () => {
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

  describe(`Mutation "${RunListMutations.SET_GROUPED_RUN_LIST}"`, () => {
    beforeEach(() => {
      runListState.groupedRunList = {} as RunConnection
    })
    test('successfully adds new grouped run list to the state', () => {
      const newRunList: RunConnection = {
        totalCount: 0,
        edges: [] as Array<Maybe<RunEdge>>
      } as RunConnection

      mutations[RunListMutations.SET_GROUPED_RUN_LIST](runListState, newRunList)
      expect(runListState.groupedRunList).toEqual(newRunList)
    })

    test('successfully appends data', () => {
      const newRunList: RunConnection = mockRunListState().groupedRunList as RunConnection

      if (newRunList.totalCount) {
        newRunList.totalCount = 10
      }
      mutations[RunListMutations.SET_GROUPED_RUN_LIST](runListState, newRunList)
      expect(runListState.groupedRunList.totalCount).toEqual(newRunList.totalCount)
    })
  })

  describe(`Mutation "${RunListMutations.SET_BRANCH_RUNS_LIST}"`, () => {
    beforeEach(() => {
      runListState.branchRunList = {} as Record<string, RunConnection>
    })

    test('successfully adds new branch run list to the state', () => {
      const newRunList: RunConnection = {
        totalCount: 0,
        edges: [] as Array<Maybe<RunEdge>>
      } as RunConnection

      mutations[RunListMutations.SET_BRANCH_RUNS_LIST](runListState, {
        [mockBranchName]: newRunList
      })
      expect(runListState.branchRunList[mockBranchName]).toEqual(newRunList)
    })

    test('successfully appends data', () => {
      const newRunList: Record<string, RunConnection> = mockRunListState().branchRunList as Record<
        string,
        RunConnection
      >

      if (newRunList[mockBranchName].totalCount) {
        newRunList[mockBranchName].totalCount = 10
      }
      mutations[RunListMutations.SET_BRANCH_RUNS_LIST](runListState, newRunList)
      expect(runListState.branchRunList[mockBranchName].totalCount).toEqual(
        newRunList[mockBranchName].totalCount
      )
    })
  })

  describe(`Mutation "${RunListMutations.SET_PR_LIST}"`, () => {
    beforeEach(() => {
      runListState.prList = {} as PrConnection
    })
    test('successfully adds new pr list to the state', () => {
      const newPrList: PrConnection = {
        totalCount: 0,
        edges: [] as Array<Maybe<RunEdge>>
      } as PrConnection

      mutations[RunListMutations.SET_PR_LIST](runListState, newPrList)
      expect(runListState.prList).toEqual(newPrList)
    })

    test('successfully appends data', () => {
      const newPrList: PrConnection = mockRunListState().prList as PrConnection

      if (newPrList.totalCount) {
        newPrList.totalCount = 10
      }
      mutations[RunListMutations.SET_PR_LIST](runListState, newPrList)
      expect(runListState.prList.totalCount).toEqual(newPrList.totalCount)
    })
  })
})
