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
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${ActiveUserMutations.SET_VIEWER}`, async () => {
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `ActiveUserMutations.SET_VIEWER` is being commited or not.
          expect(firstCall[0]).toEqual(ActiveUserMutations.SET_VIEWER)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(firstCall[1]).toEqual(apiResponse.data.viewer)
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
