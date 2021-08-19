import {
  state,
  mutations,
  actions,
  ActiveUserActionContext,
  ActiveUserState,
  ActiveUserActions,
  ActiveUserMutations
} from '~/store/user/active'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { mockActiveUserState } from './__mocks__/active.mock'
import { User } from '~/types/types'

let activeUserState: ActiveUserState
let actionCxt: ActiveUserActionContext
let spy: jest.SpyInstance
let commit: jest.Mock
let localThis: any

describe('[Store] User/Active', () => {
  beforeEach(() => {
    activeUserState = mockActiveUserState()
    commit = jest.fn()

    actionCxt = {
      rootGetters: jest.fn(),
      state: activeUserState,
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
      expect(initState.viewer).toEqual({})
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    describe(`Action "${ActiveUserActions.FETCH_VIEWER_INFO}"`, () => {
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
            async $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return new Promise<GraphqlQueryResponse>((resolve) =>
                resolve({ data: { viewer: <User>{} } })
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[ActiveUserActions.FETCH_VIEWER_INFO].call(localThis, actionCxt, {})
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', async () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${ActiveUserMutations.SET_LOADING}`, async () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `ActiveUserMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(ActiveUserMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `ActiveUserMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(ActiveUserMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${ActiveUserMutations.SET_VIEWER}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `ActiveUserMutations.SET_VIEWER` is being commited or not.
          expect(secondCall[0]).toEqual(ActiveUserMutations.SET_VIEWER)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.viewer)
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

          await actions[ActiveUserActions.FETCH_VIEWER_INFO].call(localThis, actionCxt, {})
        })

        test('successfully commits mutations', async () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${ActiveUserMutations.SET_LOADING}`, async () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `ActiveUserMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(ActiveUserMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `ActiveUserMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(ActiveUserMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${ActiveUserMutations.SET_ERROR}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `ActiveUserMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(ActiveUserMutations.SET_ERROR)

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
    describe(`Mutation "${ActiveUserMutations.SET_LOADING}"`, () => {
      test('successfully updates loading field in state', () => {
        mutations[ActiveUserMutations.SET_LOADING](activeUserState, true)
        expect(activeUserState.loading).toEqual(true)
      })
    })

    describe(`Mutation "${ActiveUserMutations.SET_ERROR}"`, () => {
      test('successfully updates loading field in state', () => {
        const dummyError = {
          graphQLErrors: {
            message: 'Dummy error',
            locations: [],
            path: []
          }
        }
        mutations[ActiveUserMutations.SET_ERROR](activeUserState, dummyError)
        expect(activeUserState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${ActiveUserMutations.SET_VIEWER}"`, () => {
      beforeEach(() => {
        activeUserState.viewer = {} as User
      })
      test('successfully adds new viewer list to the state', () => {
        const newActiveUser: User = {
          firstName: 'John',
          email: 'john.doe@example.com'
        } as User

        mutations[ActiveUserMutations.SET_VIEWER](activeUserState, newActiveUser)
        expect(activeUserState.viewer).toEqual(newActiveUser)
      })

      test('successfully appends data', () => {
        const newActiveUser: User = mockActiveUserState().viewer as User

        if (newActiveUser.firstName) {
          newActiveUser.firstName = 'New'
        }
        mutations[ActiveUserMutations.SET_VIEWER](activeUserState, newActiveUser)
        expect(activeUserState.viewer.firstName).toEqual(newActiveUser.firstName)
      })
    })
  })
})