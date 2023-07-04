import {
  IssueDetailActionContext,
  IssueDetailActions,
  IssueDetailModuleState,
  IssueDetailMutations,
  actions
} from '~/store/issue/detail'
import { GraphqlMutationResponse, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  IgnoreCheckIssueActionChoice,
  Issue,
  Owner,
  Repository,
  RepositoryIssue,
  SilenceRule,
  SilenceRuleConnection,
  SilenceRuleSilenceLevel,
  VcsProviderChoices
} from '~/types/types'
import { mockIssueDetailState } from '../__mocks__/detail.mock'

import { providerMetaMap } from '~/plugins/helpers/provider'
import { resolveNodes } from '~/utils/array'

let issueDetailState: IssueDetailModuleState
let actionCxt: IssueDetailActionContext
let spy: jest.SpyInstance
let commit: jest.Mock
let localThis: any

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

    describe(`Action "${IssueDetailActions.FETCH_ISSUE_CHILDREN}"`, () => {
      beforeEach(async () => {
        localThis = {
          $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
            return Promise.resolve({
              data: {
                node: {
                  shortcode: 'python',
                  checkIssues: issueDetailState.checkIssues,
                  repositoryInstance: {
                    owner: {
                      id: 'test-owner-id',
                      runnerApp: issueDetailState.runnerInfo
                    } as Owner
                  }
                } as RepositoryIssue
              }
            })
          },
          $getGQLAfter: () => ''
        }

        // Setting the global spy on `localThis.$fetchGraphqlData`
        spy = jest.spyOn(localThis, '$fetchGraphqlData')
        await actions[IssueDetailActions.FETCH_ISSUE_CHILDREN].call(localThis, actionCxt, {
          nodeId: 'test-node-id',
          currentPageNumber: 1,
          limit: 25,
          isRunner: true
        })
      })

      test('successfully calls the api', () => {
        expect(spy).toHaveBeenCalledTimes(1)
      })

      test('commits the necessary mutations', () => {
        expect(commit).toHaveBeenCalledTimes(2)

        const {
          mock: {
            calls: [firstCall, secondCall]
          }
        } = commit

        expect(firstCall[0]).toBe(IssueDetailMutations.SET_ISSUE_CHILDREN)
        expect(firstCall[1]).toEqual(issueDetailState.checkIssues)

        expect(secondCall[0]).toBe(IssueDetailMutations.SET_RUNNER_INFO)
        expect(secondCall[1]).toEqual(issueDetailState.runnerInfo)
      })
    })

    describe(`Action "${IssueDetailActions.FETCH_SINGLE_ISSUE}"`, () => {
      describe('Success', () => {
        beforeEach(async () => {
          localThis = {
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: {
                  issue: issueDetailState.singleIssue as Issue
                }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')
          await actions[IssueDetailActions.FETCH_SINGLE_ISSUE].call(localThis, actionCxt, {
            shortcode: 'python'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('commits the necessary mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)

          const {
            mock: {
              calls: [firstCall, secondCall, thirdCall]
            }
          } = commit

          expect(firstCall[0]).toBe(IssueDetailMutations.SET_LOADING)
          expect(firstCall[1]).toBe(true)

          expect(secondCall[0]).toBe(IssueDetailMutations.SET_SINGLE_ISSUE)
          expect(secondCall[1]).toEqual(issueDetailState.singleIssue)

          expect(thirdCall[0]).toBe(IssueDetailMutations.SET_LOADING)
          expect(thirdCall[1]).toBe(false)
        })
      })

      describe('Failure', () => {
        beforeEach(async () => {
          localThis = {
            $fetchGraphqlData(): Promise<Error> {
              return Promise.reject(new Error())
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')
          await actions[IssueDetailActions.FETCH_SINGLE_ISSUE].call(localThis, actionCxt, {
            shortcode: 'python'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('commits the necessary mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)

          const {
            mock: {
              calls: [firstCall, secondCall, thirdCall]
            }
          } = commit

          expect(firstCall[0]).toBe(IssueDetailMutations.SET_LOADING)
          expect(firstCall[1]).toBe(true)

          expect(secondCall[0]).toBe(IssueDetailMutations.SET_ERROR)
          expect(secondCall[1]).toEqual(new Error())

          expect(thirdCall[0]).toBe(IssueDetailMutations.SET_LOADING)
          expect(thirdCall[1]).toBe(false)
        })
      })
    })

    describe(`Action "${IssueDetailActions.FETCH_SILENCE_RULES}"`, () => {
      let result = [] as Array<SilenceRule>

      const silenceRules: SilenceRuleConnection = {
        totalCount: 3,
        edges: [
          {
            node: {
              silenceLevel: SilenceRuleSilenceLevel.Rl,
              id: 'U2lsZW5jZVJ1bGU6YmFkbXZr',
              filePath: null,
              createdAt: '2023-06-12T11:15:21.167286+00:00',
              metadata: {
                type: 'pattern',
                glob_pattern: 'test.js'
              },
              issue: {
                shortcode: 'JS-0111',
                title: 'Unnecessary `return await` function found',
                analyzer: {
                  shortcode: 'javascript',
                  __typename: 'Analyzer'
                }
              },
              creator: {
                firstName: 'James',
                lastName: 'George',
                email: 'james@deepsource.io',
                avatar: 'https://static.deepsource.com/dashboard/images/empty-avatar.svg'
              }
            }
          },
          {
            node: {
              silenceLevel: SilenceRuleSilenceLevel.Fl,
              id: 'U2lsZW5jZVJ1bGU6enh5cXdy',
              filePath: 'src/commands/init/index.js',
              createdAt: '2023-01-11T07:47:54.687550+00:00',
              metadata: {
                type: 'forever'
              },
              issue: {
                shortcode: 'JS-C1003',
                title: 'Avoid using wildcard imports',
                analyzer: {
                  shortcode: 'javascript'
                }
              },
              creator: {
                firstName: 'James',
                lastName: 'George',
                email: 'james@deepsource.io',
                avatar: 'https://static.deepsource.com/dashboard/images/empty-avatar.svg'
              }
            }
          },
          {
            node: {
              silenceLevel: SilenceRuleSilenceLevel.Rl,
              id: 'U2lsZW5jZVJ1bGU6emtxb3dk',
              filePath: null,
              createdAt: '2023-01-11T07:46:56.765677+00:00',
              metadata: {
                type: 'forever'
              },
              issue: {
                shortcode: 'JS-0049',
                title: 'Avoid square-bracket notation when accessing properties',
                analyzer: {
                  shortcode: 'javascript',
                  __typename: 'Analyzer'
                }
              },
              creator: {
                firstName: 'James',
                lastName: 'George',
                email: 'james@deepsource.io',
                avatar: 'https://static.deepsource.com/dashboard/images/empty-avatar.svg'
              }
            }
          }
        ]
      } as SilenceRuleConnection

      beforeEach(async () => {
        localThis = {
          $providerMetaMap: providerMetaMap,
          $fetchGraphqlData() {
            return Promise.resolve({
              data: {
                repository: {
                  id: 'UmVwb3NpdG9yeTp3eWxsdmc=',
                  hasViewerEditAccess: true,
                  silenceRules
                }
              }
            })
          },
          $getGQLAfter: () => ''
        }

        // Setting the global spy on `localThis.$fetchGraphqlData`
        spy = jest.spyOn(localThis, '$fetchGraphqlData')

        result = await actions[IssueDetailActions.FETCH_SILENCE_RULES].call(localThis, actionCxt, {
          provider: VcsProviderChoices.Github,
          owner: 'deepsourcelabs',
          name: 'test-repo'
        })
      })

      test('successfully calls the api', () => {
        expect(spy).toHaveBeenCalledTimes(1)
      })

      test('returns the silence rules as a flat array', () => {
        expect(result).toEqual(resolveNodes(silenceRules))
      })
    })
  })
})
