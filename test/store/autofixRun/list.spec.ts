import {
  state,
  mutations,
  actions,
  AutofixRunListMutations,
  AutofixRunListActions,
  AutofixRunListActionContext,
  AutofixRunListModuleState
} from '~/store/autofixRun/list'
import { mockAutofixRunListState } from './__mocks__/list.mock'
import { Repository, AutofixRunConnection } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

let actionCxt: AutofixRunListActionContext
let commit: jest.Mock
let localThis: any
let spy: jest.SpyInstance
let autofixRunListState: AutofixRunListModuleState

describe('[Store] AutofixRun/List', () => {
  beforeEach(() => {
    commit = jest.fn()
    autofixRunListState = mockAutofixRunListState()

    actionCxt = {
      state: autofixRunListState,
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
      expect(initState.error).toEqual({})
      expect(initState.autofixRunList).toEqual({
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
    describe(`Action "${AutofixRunListActions.FETCH_AUTOFIX_RUN_LIST}"`, () => {
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
                data: {
                  repository: <Repository>{
                    autofixRuns: mockAutofixRunListState().autofixRunList
                  }
                }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[AutofixRunListActions.FETCH_AUTOFIX_RUN_LIST].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'asgard',
            currentPageNumber: 2,
            limit: 10
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${AutofixRunListMutations.SET_AUTOFIX_RUN_LIST}`, async () => {
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `AutofixRunListMutations.SET_AUTOFIX_RUN_LIST` is being commited or not.
          expect(firstCall[0]).toEqual(AutofixRunListMutations.SET_AUTOFIX_RUN_LIST)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(firstCall[1]).toEqual(apiResponse.data.repository.autofixRuns)
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

          await actions[AutofixRunListActions.FETCH_AUTOFIX_RUN_LIST].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'asgard',
            currentPageNumber: 2,
            limit: 10
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${AutofixRunListMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit

          // Assert if `AutofixRunListMutations.SET_ERROR` is being commited or not.
          expect(firstCall[0]).toEqual(AutofixRunListMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(firstCall[1]).toEqual(Error('ERR1'))
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
    describe(`Mutation "${AutofixRunListMutations.SET_ERROR}"`, () => {
      test('successfully updates loading field in state', () => {
        const dummyError = {
          graphQLErrors: {
            message: 'Dummy error',
            locations: [],
            path: []
          }
        }
        mutations[AutofixRunListMutations.SET_ERROR](autofixRunListState, dummyError)
        expect(autofixRunListState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${AutofixRunListMutations.SET_AUTOFIX_RUN_LIST}"`, () => {
      beforeEach(() => {
        autofixRunListState.autofixRunList = {} as AutofixRunConnection
      })
      test('successfully adds new run list to the state', () => {
        const newAutofixRunList: AutofixRunConnection = {
          totalCount: 10
        } as AutofixRunConnection

        mutations[AutofixRunListMutations.SET_AUTOFIX_RUN_LIST](
          autofixRunListState,
          newAutofixRunList
        )
        expect(autofixRunListState.autofixRunList).toEqual(newAutofixRunList)
      })

      test('successfully appends data', () => {
        const newAutofixRunList: AutofixRunConnection = mockAutofixRunListState()
          .autofixRunList as AutofixRunConnection

        if (newAutofixRunList.edges[0]?.node?.filesAffected) {
          newAutofixRunList.edges[0].node.filesAffected = 2
        }
        mutations[AutofixRunListMutations.SET_AUTOFIX_RUN_LIST](
          autofixRunListState,
          newAutofixRunList
        )
        expect(autofixRunListState.autofixRunList.edges[0]?.node?.filesAffected).toEqual(
          newAutofixRunList.edges[0]?.node?.filesAffected
        )
      })
    })
  })
})
