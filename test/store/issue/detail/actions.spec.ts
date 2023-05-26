import {
  actions,
  IssueDetailMutations,
  IssueDetailModuleState,
  IssueDetailActionContext,
  IssueDetailActions
} from '~/store/issue/detail'
import { mockIssueDetailState } from '../__mocks__/detail.mock'
import { Repository, IgnoreCheckIssueActionChoice } from '~/types/types'
import { GraphqlMutationResponse, GraphqlQueryResponse } from '~/types/apollo-graphql-types'

let issueDetailState: IssueDetailModuleState
let actionCxt: IssueDetailActionContext
let spy: jest.SpyInstance
let commit: jest.Mock
let localThis: any

const providerMetaMap = {
  gh: {
    text: 'Github',
    shortcode: 'gh',
    value: 'GITHUB'
  }
}

describe('[Store] Issue/Detail', () => {
  beforeEach(() => {
    issueDetailState = mockIssueDetailState()
    commit = jest.fn()

    actionCxt = {
      rootGetters: jest.fn(),
      state: issueDetailState,
      dispatch: jest.fn(),
      getters: jest.fn(),
      rootState: {},
      commit
    }
  })

  describe('[[Actions]]', () => {
    describe(`Action "${IssueDetailActions.FETCH_ISSUE}"`, () => {
      describe('Success', () => {
        beforeEach(async () => {
          localThis = {
            $providerMetaMap: providerMetaMap,
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({ data: { repository: <Repository>{ issue: {} } } })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[IssueDetailActions.FETCH_ISSUE].call(localThis, actionCxt, {
            repositoryId: 'string',
            shortcode: 'string'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${IssueDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `IssueDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(IssueDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `IssueDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(IssueDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${IssueDetailMutations.SET_ISSUE}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `IssueDetailMutations.SET_ISSUE` is being commited or not.
          expect(secondCall[0]).toEqual(IssueDetailMutations.SET_ISSUE)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.repository.issue)
        })
      })
      describe('Failure', () => {
        beforeEach(async () => {
          localThis = {
            $providerMetaMap: providerMetaMap,
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<Error> {
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[IssueDetailActions.FETCH_ISSUE].call(localThis, actionCxt, {
            repositoryId: 'string',
            shortcode: 'string'
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${IssueDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `IssueDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(IssueDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `IssueDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(IssueDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${IssueDetailMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `IssueDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(IssueDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })
    describe(`Action "${IssueDetailActions.IGNORE_ISSUE_FILE_PATTERN}"`, () => {
      describe('Success', () => {
        beforeEach(async () => {
          localThis = {
            $providerMetaMap: providerMetaMap,
            $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
              return new Promise<GraphqlMutationResponse>((resolve) =>
                setTimeout(
                  () => resolve({ data: { ignoreIssueForFilePatternInRepository: { ok: true } } }),
                  10
                )
              )
            }
          }
          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')
          await actions[IssueDetailActions.IGNORE_ISSUE_FILE_PATTERN].call(localThis, actionCxt, {
            repoIssueId: 'string',
            pattern: 'string'
          })
        })
        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })
      })
    })
    describe(`Action "${IssueDetailActions.IGNORE_ISSUE_TEST_PATTERN}"`, () => {
      describe('Success', () => {
        beforeEach(async () => {
          localThis = {
            $providerMetaMap: providerMetaMap,
            $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
              return new Promise<GraphqlMutationResponse>((resolve) =>
                setTimeout(
                  () => resolve({ data: { ignoreIssueForTestPatternsInRepository: { ok: true } } }),
                  10
                )
              )
            }
          }
          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')
          await actions[IssueDetailActions.IGNORE_ISSUE_TEST_PATTERN].call(localThis, actionCxt, {
            repoIssueId: 'string'
          })
        })
        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })
      })
    })
    describe(`Action "${IssueDetailActions.IGNORE_ISSUE_REPOSITORY}"`, () => {
      describe('Success', () => {
        beforeEach(async () => {
          localThis = {
            $providerMetaMap: providerMetaMap,
            $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
              return new Promise<GraphqlMutationResponse>((resolve) =>
                setTimeout(() => resolve({ data: { ignoreIssueForRepository: { ok: true } } }), 10)
              )
            }
          }
          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')
          await actions[IssueDetailActions.IGNORE_ISSUE_REPOSITORY].call(localThis, actionCxt, {
            repoIssueId: 'string'
          })
        })
        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })
      })
    })
    describe(`Action "${IssueDetailActions.IGNORE_ISSUE_FOR_FILE}"`, () => {
      describe('Success', () => {
        beforeEach(async () => {
          localThis = {
            $providerMetaMap: providerMetaMap,
            $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
              return new Promise<GraphqlMutationResponse>((resolve) =>
                setTimeout(() => resolve({ data: { ignoreIssueForRepository: { ok: true } } }), 10)
              )
            }
          }
          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')
          await actions[IssueDetailActions.IGNORE_ISSUE_FOR_FILE].call(localThis, actionCxt, {
            repoIssueId: 'string',
            filePath: 'string'
          })
        })
        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })
      })
    })
    describe(`Action "${IssueDetailActions.IGNORE_ISSUE_CHECK_ISSUE}"`, () => {
      describe('Success', () => {
        beforeEach(async () => {
          localThis = {
            $providerMetaMap: providerMetaMap,
            $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
              return new Promise<GraphqlMutationResponse>((resolve) =>
                setTimeout(() => resolve({ data: { ignoreCheckIssue: { ok: true } } }), 10)
              )
            }
          }
          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')
          await actions[IssueDetailActions.IGNORE_ISSUE_CHECK_ISSUE].call(localThis, actionCxt, {
            checkIssueId: 'string',
            action: IgnoreCheckIssueActionChoice.Delete
          })
        })
        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })
      })
    })
    describe(`Action "${IssueDetailActions.IGNORE_ISSUE_FALSE_POSITIVE}"`, () => {
      describe('Success', () => {
        beforeEach(async () => {
          localThis = {
            $providerMetaMap: providerMetaMap,
            $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
              return new Promise<GraphqlMutationResponse>((resolve) =>
                setTimeout(() => resolve({ data: { reportIssueFalsePositive: { ok: true } } }), 10)
              )
            }
          }
          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')
          await actions[IssueDetailActions.IGNORE_ISSUE_FALSE_POSITIVE].call(localThis, actionCxt, {
            checkIssueId: 'string',
            comment: 'string'
          })
        })
        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })
      })
    })
  })
})
