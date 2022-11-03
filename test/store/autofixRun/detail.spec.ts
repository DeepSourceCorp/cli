import {
  state,
  mutations,
  actions,
  AutofixRunDetailActionContext,
  AutofixRunDetailMutations,
  AutofixRunDetailModuleState,
  AutofixRunDetailActions
} from '~/store/autofixRun/detail'
import { mockAutofixRunDetailState } from './__mocks__/detail.mock'
import { AutofixRun } from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

let actionCxt: AutofixRunDetailActionContext
let commit: jest.Mock
let localThis: any
let spy: jest.SpyInstance
let autofixRunDetailState: AutofixRunDetailModuleState

describe('[Store] AutofixRun/Detail', () => {
  beforeEach(() => {
    commit = jest.fn()
    autofixRunDetailState = mockAutofixRunDetailState()

    actionCxt = {
      state: autofixRunDetailState,
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
      expect(initState.autofixRun).toEqual({})
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    describe(`Action "${AutofixRunDetailActions.FETCH_AUTOFIX_RUN}"`, () => {
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
              return new Promise<GraphqlQueryResponse>((resolve) =>
                resolve({ data: { autofixRun: mockAutofixRunDetailState().autofixRun } })
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[AutofixRunDetailActions.FETCH_AUTOFIX_RUN].call(localThis, actionCxt, {
            runId: 'string'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${AutofixRunDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `AutofixRunDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(AutofixRunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `AutofixRunDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(AutofixRunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${AutofixRunDetailMutations.SET_AUTOFIX_RUN}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `AutofixRunDetailMutations.SET_AUTOFIX_RUN` is being commited or not.
          expect(secondCall[0]).toEqual(AutofixRunDetailMutations.SET_AUTOFIX_RUN)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.autofixRun)
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
            $fetchGraphqlData(): Promise<Error> {
              return new Promise<Error>((resolve, reject) => reject(new Error('ERR1')))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[AutofixRunDetailActions.FETCH_AUTOFIX_RUN].call(localThis, actionCxt, {
            runId: 'string'
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${AutofixRunDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `AutofixRunDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(AutofixRunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `AutofixRunDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(AutofixRunDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${AutofixRunDetailMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `AutofixRunDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(AutofixRunDetailMutations.SET_ERROR)

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
    describe(`Mutation "${AutofixRunDetailMutations.SET_LOADING}"`, () => {
      test('successfully updates loading field in state', () => {
        mutations[AutofixRunDetailMutations.SET_LOADING](autofixRunDetailState, true)
        expect(autofixRunDetailState.loading).toEqual(true)
      })
    })

    describe(`Mutation "${AutofixRunDetailMutations.SET_ERROR}"`, () => {
      test('successfully updates loading field in state', () => {
        const dummyError = {
          graphQLErrors: {
            message: 'Dummy error',
            locations: [],
            path: []
          }
        }
        mutations[AutofixRunDetailMutations.SET_ERROR](autofixRunDetailState, dummyError)
        expect(autofixRunDetailState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${AutofixRunDetailMutations.SET_AUTOFIX_RUN}"`, () => {
      beforeEach(() => {
        autofixRunDetailState.autofixRun = {} as AutofixRun
      })
      test('successfully adds new run detail to the state', () => {
        const newAutofixRun: AutofixRun = {
          id: 'string',
          status: 'FAIL'
        } as AutofixRun

        mutations[AutofixRunDetailMutations.SET_AUTOFIX_RUN](autofixRunDetailState, newAutofixRun)
        expect(autofixRunDetailState.autofixRun).toEqual(newAutofixRun)
      })

      test('successfully appends data', () => {
        const newAutofixRun: AutofixRun = mockAutofixRunDetailState().autofixRun as AutofixRun

        if (newAutofixRun.id) {
          newAutofixRun.id = 'new_id'
        }
        mutations[AutofixRunDetailMutations.SET_AUTOFIX_RUN](autofixRunDetailState, newAutofixRun)
        expect(autofixRunDetailState.autofixRun.id).toEqual(newAutofixRun.id)
      })
    })
  })
})
