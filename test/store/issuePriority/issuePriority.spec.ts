import {
  issuePriorityListResponse,
  issueWithPriorityList,
  mockStateEmpty,
  mockStateFilled,
  updateIssuePriorityResponse
} from './__mocks__/issuePriorityMocks'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  actions,
  IssuePriorityListActionContext,
  IssuePriorityListActions,
  IssuePriorityListModuleState,
  IssuePriorityListMutations,
  mutations
} from '~/store/issuePriority/list'
import {
  IssuePriorityLevel,
  UnsetIssuePriorityPayload,
  UpdateIssuePriorityPayload
} from '~/types/types'

let actionCxt: IssuePriorityListActionContext
let commit: jest.Mock
let issuePriorityListState: IssuePriorityListModuleState
let localThis: any
let spy: jest.SpyInstance

describe('[[ MUTATIONS ]]', () => {
  beforeEach(() => {
    issuePriorityListState = mockStateEmpty()
  })
  test(`Mutation "${IssuePriorityListMutations.SET_ISSUES_WITH_PRIORITY}"`, () => {
    mutations[IssuePriorityListMutations.SET_ISSUES_WITH_PRIORITY](
      issuePriorityListState,
      issueWithPriorityList
    )
    expect(issuePriorityListState.issuesWithPriority).toMatchObject(issueWithPriorityList)
  })
})

describe('[[ ACTIONS ]]', () => {
  beforeEach(() => {
    commit = jest.fn()
    issuePriorityListState = mockStateFilled()

    actionCxt = {
      state: issuePriorityListState,
      commit,
      dispatch: jest.fn(),
      getters: jest.fn(),
      rootGetters: jest.fn(),
      rootState: {}
    }
  })

  describe(`Runs ${IssuePriorityListActions.FETCH_ISSUES_WITH_PRIORITY}`, () => {
    beforeEach(async () => {
      localThis = {
        $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
          return new Promise<GraphqlQueryResponse>((resolve) =>
            setTimeout(() => resolve(issuePriorityListResponse), 10)
          )
        }
      }

      // Setting the global spy on `localThis.$fetchGraphqlData`
      spy = jest.spyOn(localThis, '$fetchGraphqlData')

      await actions[IssuePriorityListActions.FETCH_ISSUES_WITH_PRIORITY].call(
        localThis,
        actionCxt,
        {
          isIssuePrioritySet: true,
          objectId: 'UmVwb3NpdG9yeTp6ZXBqZWI=',
          level: IssuePriorityLevel.Repository,
          q: '',
          first: 10,
          offset: 0,
          sort: '',
          analyzerShortcode: ''
        }
      )
    })
    test('successfully calls the api', () => {
      expect(spy).toHaveBeenCalledTimes(1)
    })
    test('successfully commits mutations', () => {
      expect(commit).toHaveBeenCalledTimes(1)
    })

    test(`successfully commits mutation ${IssuePriorityListMutations.SET_ISSUES_WITH_PRIORITY}`, () => {
      // Storing the first commit call made
      const {
        mock: {
          calls: [firstCall]
        }
      } = commit

      expect(firstCall[0]).toEqual(IssuePriorityListMutations.SET_ISSUES_WITH_PRIORITY)

      expect(firstCall[1]).toEqual(issueWithPriorityList)
    })
  })

  describe(`Runs ${IssuePriorityListActions.FETCH_ISSUES_WITH_PRIORITY_COUNT}`, () => {
    let resp: number
    beforeEach(async () => {
      localThis = {
        $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
          return new Promise<GraphqlQueryResponse>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: {
                    // @ts-ignore
                    issuesWithPriority: {
                      totalCount: 4
                    }
                  }
                }),
              10
            )
          )
        }
      }

      // Setting the global spy on `localThis.$fetchGraphqlData`
      spy = jest.spyOn(localThis, '$fetchGraphqlData')

      resp = await actions[IssuePriorityListActions.FETCH_ISSUES_WITH_PRIORITY_COUNT].call(
        localThis,
        actionCxt,
        {
          isIssuePrioritySet: true,
          objectId: 'UmVwb3NpdG9yeTp6ZXBqZWI=',
          level: IssuePriorityLevel.Repository
        }
      )
    })
    test('successfully calls the api', () => {
      expect(spy).toHaveBeenCalledTimes(1)
    })
    test('successfully commits mutations', () => {
      expect(commit).toHaveBeenCalledTimes(0)
    })
    test('response is ok', () => {
      expect(resp).toBe(4)
    })
  })

  describe(`Runs ${IssuePriorityListActions.UNSET_ISSUE_PRIORITY}`, () => {
    let resp: UnsetIssuePriorityPayload
    beforeEach(async () => {
      localThis = {
        $applyGraphqlMutation(): Promise<unknown> {
          return new Promise<unknown>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: {
                    unsetIssuePriority: {
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

      resp = await actions[IssuePriorityListActions.UNSET_ISSUE_PRIORITY].call(
        localThis,
        actionCxt,
        {
          input: {
            issueShortcode: 'PYL-E1301',
            objectId: 'UmVwb3NpdG9yeTp6ZXBqZWI=',
            level: IssuePriorityLevel.Repository
          }
        }
      )
    })
    test('successfully calls the api', () => {
      expect(spy).toHaveBeenCalledTimes(1)
    })
    test('successfully commits mutations', () => {
      expect(commit).toHaveBeenCalledTimes(0)
    })
    test('response is ok', () => {
      expect(resp.ok).toBe(true)
    })
  })

  describe(`Runs ${IssuePriorityListActions.UPDATE_ISSUE_PRIORITY}`, () => {
    let resp: UpdateIssuePriorityPayload
    beforeEach(async () => {
      localThis = {
        $applyGraphqlMutation(): Promise<unknown> {
          return new Promise<unknown>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: {
                    updateIssuePriority: {
                      issue: {
                        id: 'SXNzdWU6Ym93d3di',
                        issueType: 'typecheck',
                        title: 'Invalid `Literal[...]` type hint',
                        shortcode: 'TYP-041',
                        description:
                          'Arbitrary arguments are given to `Literal[...]`, which makes it an invalid type. It is recommended to remove the arbitrary arguments.',
                        analyzer: {
                          name: 'Python',
                          logo: 'analyzer_logos/python.svg'
                        },
                        issuePriority: {
                          cascadingIssuePriority: {
                            slug: 'low',
                            verboseName: 'Low',
                            weight: 25
                          },
                          source: 'OWNER'
                        }
                      }
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

      resp = await actions[IssuePriorityListActions.UPDATE_ISSUE_PRIORITY].call(
        localThis,
        actionCxt,
        {
          objectId: 'T3duZXI6cXpscnh6',
          level: IssuePriorityLevel.Owner,
          input: {
            issueShortcode: 'TYP-041',
            objectId: 'T3duZXI6cXpscnh6',
            level: IssuePriorityLevel.Owner,
            issuePriorityType: 'low'
          }
        }
      )
    })
    test('successfully calls the api', () => {
      expect(spy).toHaveBeenCalledTimes(1)
    })
    test('successfully commits mutations', () => {
      expect(commit).toHaveBeenCalledTimes(0)
    })
    test('response is ok', () => {
      expect(resp).toStrictEqual(updateIssuePriorityResponse)
    })
  })
})
