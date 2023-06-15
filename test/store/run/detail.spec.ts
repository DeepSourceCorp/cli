import {
  actions,
  mutations,
  PageRefetchStatusT,
  RunDetailActionContext,
  RunDetailActions,
  RunDetailModuleState,
  RunDetailMutations,
  state
} from '~/store/run/detail'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

import {
  IssueConnection,
  IssueEdge,
  Maybe,
  PageInfo,
  Repository,
  Run,
  RunnerApp,
  VcsProviderChoices
} from '~/types/types'
import {
  mockCheckDetail,
  mockCheckIssueList,
  mockRepositoryDetailStateForAutofixableIssues,
  mockRunDetailState,
  mockRunDetailStateForConcreteIssueList
} from './__mocks__/runDetail.mock'

let actionCxt: RunDetailActionContext
let commit: jest.Mock
let localThis: any // skipcq JS-0323
let spy: jest.SpyInstance
let runDetailState: RunDetailModuleState

describe('[Store] Run/Detail', () => {
  beforeEach(() => {
    commit = jest.fn()
    runDetailState = mockRunDetailState()

    actionCxt = {
      state: runDetailState,
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
      expect(initState.run).toEqual({})
      expect(initState.concreteIssueList).toEqual({
        edges: [],
        pageInfo: {}
      })
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    describe(`Action "${RunDetailActions.FETCH_RUN}"`, () => {
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
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: {
                  repository: {
                    id: 'hello',
                    run: mockRunDetailState().run,
                    owner: {
                      id: 'test-owner-id',
                      runnerApp: mockRunDetailState().runnerInfo
                    }
                  } as Repository
                }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RunDetailActions.FETCH_RUN].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'demo-python',
            runId: 'b2729b23-1126-4d84-a738-01d46da17978',
            isRunner: true
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(5)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , , fourthCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(fourthCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(fourthCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_RUN}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RunDetailMutations.SET_RUN` is being commited or not.
          expect(secondCall[0]).toEqual(RunDetailMutations.SET_RUN)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.repository.run)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_RUNNER_INFO}`, async () => {
          const {
            mock: {
              calls: [, , thirdCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RunDetailMutations.SET_RUNNER_INFO` is being commited or not.
          expect(thirdCall[0]).toEqual(RunDetailMutations.SET_RUNNER_INFO)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(thirdCall[1]).toEqual(apiResponse.data.repository.owner.runnerApp)
        })
      })
      describe('Failure', () => {
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

          await actions[RunDetailActions.FETCH_RUN].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'demo-python',
            runId: 'b2729b23-1126-4d84-a738-01d46da17978',
            isRunner: false
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(RunDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RunDetailActions.FETCH_CHECK}"`, () => {
      describe('Success', () => {
        beforeEach(async () => {
          localThis = {
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: { check: mockRunDetailState().check }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RunDetailActions.FETCH_CHECK].call(localThis, actionCxt, {
            checkId: 'Q2hlY2s6Ym5qZGFn'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_CHECK}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RunDetailMutations.SET_CHECK` is being commited or not.
          expect(secondCall[0]).toEqual(RunDetailMutations.SET_CHECK)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.check)
        })
      })
      describe('Failure', () => {
        beforeEach(async () => {
          localThis = {
            $fetchGraphqlData(): Promise<Error> {
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RunDetailActions.FETCH_CHECK].call(localThis, actionCxt, {
            checkId: 'string'
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(RunDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RunDetailActions.FETCH_CHECK_ISSUES}"`, () => {
      describe('Success', () => {
        beforeEach(async () => {
          localThis = {
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: { checkIssues: mockRunDetailState().checkIssues }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RunDetailActions.FETCH_CHECK_ISSUES].call(localThis, actionCxt, {
            checkId: 'string',
            shortcode: 'string',
            limit: 10,
            currentPageNumber: 1,
            isRunner: false
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_CHECK_ISSUES}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RunDetailMutations.SET_CHECK_ISSUES` is being commited or not.
          expect(secondCall[0]).toEqual(RunDetailMutations.SET_CHECK_ISSUES)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.checkIssues)
        })
      })
      describe('Failure', () => {
        beforeEach(async () => {
          localThis = {
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<Error> {
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RunDetailActions.FETCH_CHECK_ISSUES].call(localThis, actionCxt, {
            checkId: 'string',
            shortcode: 'string',
            limit: 10,
            currentPageNumber: 1,
            isRunner: false
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(RunDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RunDetailActions.FETCH_AUTOFIXABLE_ISSUES}"`, () => {
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
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: { check: mockRepositoryDetailStateForAutofixableIssues().check }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RunDetailActions.FETCH_AUTOFIXABLE_ISSUES].call(localThis, actionCxt, {
            checkId: 'string'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_RUN}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RunDetailMutations.SET_RUN` is being commited or not.
          expect(secondCall[0]).toEqual(RunDetailMutations.SET_RUN)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.check)
        })
      })
      describe('Failure', () => {
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

          await actions[RunDetailActions.FETCH_AUTOFIXABLE_ISSUES].call(localThis, actionCxt, {
            checkId: 'string'
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(RunDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RunDetailActions.FETCH_CONCRETE_ISSUE_LIST}"`, () => {
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
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: { check: mockRunDetailStateForConcreteIssueList().check }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RunDetailActions.FETCH_CONCRETE_ISSUE_LIST].call(localThis, actionCxt, {
            checkId: 'string',
            sort: 'string',
            issueType: 'string',
            limit: 10,
            currentPageNumber: 2
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_CONCRETE_ISSUE_LIST}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RunDetailMutations.SET_CONCRETE_ISSUE_LIST` is being commited or not.
          expect(secondCall[0]).toEqual(RunDetailMutations.SET_CONCRETE_ISSUE_LIST)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.check.concreteIssues)
        })
      })
      describe('Failure', () => {
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

          await actions[RunDetailActions.FETCH_CONCRETE_ISSUE_LIST].call(localThis, actionCxt, {
            checkId: 'string',
            sort: 'string',
            issueType: 'string',
            limit: 10,
            currentPageNumber: 2
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(RunDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RunDetailActions.CREATE_PR}"`, () => {
      describe('Success', () => {
        beforeEach(async () => {
          localThis = {
            $getGQLAfter: jest.fn(),
            $applyGraphqlMutation(): Promise<unknown> {
              return new Promise<unknown>((resolve) =>
                setTimeout(
                  () =>
                    resolve({
                      data: {
                        createdPullRequest: {
                          ok: true
                        }
                      }
                    }),
                  10
                )
              )
            }
          }

          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')

          await actions[RunDetailActions.CREATE_PR].call(localThis, actionCxt, {
            input: {
              patches: [416429, 416430],
              repoId: 'string',
              autofixRunId: 'string'
            }
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, secondCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(secondCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(secondCall[1]).toEqual(false)
        })
      })
    })

    describe(`Action "${RunDetailActions.CREATE_AUTOFIX_PR}"`, () => {
      test('Success', async () => {
        localThis = {
          $getGQLAfter: jest.fn(),
          $applyGraphqlMutation(): Promise<unknown> {
            return new Promise<unknown>((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    data: {
                      createAutofixRunForPullRequest: {
                        autofixRunId: 'string'
                      }
                    }
                  }),
                10
              )
            )
          }
        }

        // Setting the global spy on `localThis.$applyGraphqlMutation`
        spy = jest.spyOn(localThis, '$applyGraphqlMutation')

        const { autofixRunId } = await actions[RunDetailActions.CREATE_AUTOFIX_PR].call(
          localThis as any, // skipcq JS-0323
          actionCxt,
          {
            input: {
              issues: ['string'],
              checkId: 'string'
            }
          }
        )

        expect(autofixRunId).toBe('string')
        expect(spy).toHaveBeenCalledTimes(1)

        const {
          mock: {
            calls: [firstCall, secondCall]
          }
        } = commit

        // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
        expect(firstCall[0]).toEqual(RunDetailMutations.SET_LOADING)

        // Assert if right data is passed to the mutation.
        expect(firstCall[1]).toEqual(true)

        // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
        expect(secondCall[0]).toEqual(RunDetailMutations.SET_LOADING)

        // Assert if right data is passed to the mutation.
        expect(secondCall[1]).toEqual(false)
      })

      test('Failure', () => {
        localThis = {
          $getGQLAfter: jest.fn(),
          $applyGraphqlMutation(): Promise<unknown> {
            return Promise.reject(new Error('ERR1'))
          }
        }

        // Setting the global spy on `localThis.$applyGraphqlMutation`
        spy = jest.spyOn(localThis, '$applyGraphqlMutation')

        expect(
          actions[RunDetailActions.CREATE_AUTOFIX_PR].call(localThis, actionCxt, {
            input: {
              issues: ['string'],
              checkId: 'string'
            }
          })
        ).rejects.toThrowError(new Error('ERR1'))

        expect(spy).toHaveBeenCalledTimes(1)

        const {
          mock: {
            calls: [firstCall]
          }
        } = commit

        // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
        expect(firstCall[0]).toEqual(RunDetailMutations.SET_LOADING)

        // Assert if right data is passed to the mutation.
        expect(firstCall[1]).toEqual(true)
      })
    })

    describe(`Action "${RunDetailActions.COMMIT_TO_PR}"`, () => {
      describe('Success', () => {
        beforeEach(async () => {
          localThis = {
            $getGQLAfter: jest.fn(),
            $applyGraphqlMutation(): Promise<unknown> {
              return new Promise<unknown>((resolve) =>
                setTimeout(
                  () =>
                    resolve({
                      data: {
                        commitChangesToPr: {
                          ok: true
                        }
                      }
                    }),
                  10
                )
              )
            }
          }

          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')

          await actions[RunDetailActions.COMMIT_TO_PR].call(localThis, actionCxt, {
            input: {
              patches: [123, 456],
              autofixRunId: 'string',
              repoId: 'string'
            }
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${RunDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, secondCall]
            }
          } = commit

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RunDetailMutations.SET_LOADING` is being commited or not.
          expect(secondCall[0]).toEqual(RunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(secondCall[1]).toEqual(false)
        })
      })
    })

    describe(`Action "${RunDetailActions.IGNORE_CHECK_METRIC}"`, () => {
      describe('Success', () => {
        beforeEach(async () => {
          localThis = {
            $getGQLAfter: jest.fn(),
            $applyGraphqlMutation(): Promise<unknown> {
              return new Promise<unknown>((resolve) =>
                setTimeout(
                  () =>
                    resolve({
                      data: {
                        ignoreCheckMetric: {
                          ok: true
                        }
                      }
                    }),
                  10
                )
              )
            }
          }

          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')

          const status = await actions[RunDetailActions.IGNORE_CHECK_METRIC].call(
            localThis,
            actionCxt,
            {
              checkId: 'test-check-id',
              key: 'test-key',
              metricShortcode: 'test-metric-shortcode'
            }
          )

          expect(status).toBe(true)
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })
      })

      describe('Failure', () => {
        beforeEach(async () => {
          localThis = {
            $getGQLAfter: jest.fn(),
            $applyGraphqlMutation(): Promise<unknown> {
              return Promise.reject(new Error('ERR1'))
            },
            $logErrorAndToast: jest.fn()
          }

          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')

          const status = await actions[RunDetailActions.IGNORE_CHECK_METRIC].call(
            localThis,
            actionCxt,
            {
              checkId: 'test-check-id',
              key: 'test-key',
              metricShortcode: 'test-metric-shortcode'
            }
          )

          expect(status).toBe(false)
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)

          expect(localThis.$logErrorAndToast).toBeCalled()
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
    describe(`Mutation "${RunDetailMutations.SET_LOADING}"`, () => {
      test('successfully updates loading field in state', () => {
        mutations[RunDetailMutations.SET_LOADING](runDetailState, true)
        expect(runDetailState.loading).toEqual(true)
      })
    })

    describe(`Mutation "${RunDetailMutations.SET_ERROR}"`, () => {
      test('successfully updates loading field in state', () => {
        const dummyError = {
          graphQLErrors: {
            message: 'Dummy error',
            locations: [],
            path: []
          }
        }
        mutations[RunDetailMutations.SET_ERROR](runDetailState, dummyError)
        expect(runDetailState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${RunDetailMutations.SET_RUN}"`, () => {
      beforeEach(() => {
        runDetailState.run = {} as Run
      })
      test('successfully adds new run detail to the state', () => {
        const newRun = {
          id: 'string',
          status: 'FAIL'
        }

        mutations[RunDetailMutations.SET_RUN](runDetailState, newRun as Run)
        expect(runDetailState.run).toEqual(newRun)
      })

      test('successfully appends data', () => {
        const newRun: Run = mockRunDetailState().run as Run

        if (!newRun.id) {
          newRun.id = 'new_id'
        }
        mutations[RunDetailMutations.SET_RUN](runDetailState, newRun)
        expect(runDetailState.run.id).toEqual(newRun.id)
      })
    })

    describe(`Mutation "${RunDetailMutations.SET_CONCRETE_ISSUE_LIST}"`, () => {
      beforeEach(() => {
        runDetailState.concreteIssueList = {} as IssueConnection
      })
      test('successfully adds new run detail to the state', () => {
        const newConcreteIssueList: IssueConnection = {
          pageInfo: {} as PageInfo,
          edges: [
            {
              node: {
                id: 'string',
                title: 'Dummy concrete issue'
              }
            }
          ] as Array<Maybe<IssueEdge>>
        } as IssueConnection

        mutations[RunDetailMutations.SET_CONCRETE_ISSUE_LIST](runDetailState, newConcreteIssueList)
        expect(runDetailState.concreteIssueList).toEqual(newConcreteIssueList)
      })

      test('successfully appends data', () => {
        const newConcreteIssueList: IssueConnection = mockRunDetailStateForConcreteIssueList()
          .concreteIssueList as IssueConnection

        if (newConcreteIssueList.edges[0]?.node?.issueType) {
          newConcreteIssueList.edges[0].node.issueType = 'antipattern'
        }
        mutations[RunDetailMutations.SET_CONCRETE_ISSUE_LIST](runDetailState, newConcreteIssueList)
        expect(runDetailState.concreteIssueList.edges[0]?.node?.issueType).toEqual(
          newConcreteIssueList.edges[0]?.node?.issueType
        )
      })
    })

    describe(`Mutation "${RunDetailMutations.SET_CHECK}"`, () => {
      test('successfully adds new check details to the state', () => {
        const newCheckDetail = mockCheckDetail()

        mutations[RunDetailMutations.SET_CHECK](runDetailState, newCheckDetail)
        expect(runDetailState.check).toEqual(newCheckDetail)
      })
    })

    describe(`Mutation "${RunDetailMutations.SET_CHECK_ISSUES}"`, () => {
      test('successfully adds new check issue list to the state', () => {
        const newCheckIssueList = mockCheckIssueList()

        mutations[RunDetailMutations.SET_CHECK_ISSUES](runDetailState, newCheckIssueList)
        expect(runDetailState.checkIssues).toEqual(newCheckIssueList)
      })
    })

    describe(`Mutation "${RunDetailMutations.SET_PAGE_REFETCH_STATUS}"`, () => {
      test('successfully adds new page refetch status to the state', () => {
        const newPageRefetchStatus = {
          runs: { status: true }, // history/runs
          runDetail: {
            status: true,
            analyzer: 'test-analyzer',
            runId: 'test-run-id',
            pageOffset: 1
          }, // run/_runId/_analyzer
          issueOccurrences: {
            status: true,
            issueId: 'test-issue-id',
            page: 2
          }
        } as PageRefetchStatusT

        mutations[RunDetailMutations.SET_PAGE_REFETCH_STATUS](runDetailState, newPageRefetchStatus)
        expect(runDetailState.pageRefetchStatus).toEqual(newPageRefetchStatus)
      })
    })

    describe(`Mutation "${RunDetailMutations.SET_RUNNER_INFO}"`, () => {
      beforeAll(() => {
        runDetailState.runnerInfo = {} as RunnerApp
      })

      test('successfully adds runner related information to the state', () => {
        const runnerInfo: RunnerApp = {
          appId: 'test-app-id',
          codeSnippetUrl: 'test-code-snippet-url',
          id: 'test-id',
          name: 'test-runner',
          patchSnippetUrl: 'test-patch-snippet-url',
          vcsProvider: VcsProviderChoices.Github
        }

        mutations[RunDetailMutations.SET_RUNNER_INFO](runDetailState, runnerInfo)
        expect(runDetailState.runnerInfo).toEqual(runnerInfo)
      })
    })
  })
})
