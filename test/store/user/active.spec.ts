import {
  state,
  mutations,
  actions,
  getters,
  ActiveUserActionContext,
  ActiveUserState,
  ActiveUserActions,
  ActiveUserMutations,
  ActiveUserGetterTypes
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
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({ data: { viewer: <User>{} } })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[ActiveUserActions.FETCH_VIEWER_INFO].call(localThis, actionCxt, {})
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${ActiveUserMutations.SET_VIEWER}`, async () => {
          const {
            mock: {
              calls: [mutationCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `ActiveUserMutations.SET_VIEWER` is being commited or not.
          expect(mutationCall[0]).toEqual(ActiveUserMutations.SET_VIEWER)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(mutationCall[1]).toEqual(apiResponse.data.viewer)
        })
      })
      describe(`Success with refetch`, () => {
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
              return Promise.resolve({ data: { viewer: <User>{} } })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[ActiveUserActions.FETCH_VIEWER_INFO].call(localThis, actionCxt, {
            refetch: true
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${ActiveUserMutations.SET_VIEWER}`, async () => {
          const {
            mock: {
              calls: [mutationCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `ActiveUserMutations.SET_VIEWER` is being commited or not.
          expect(mutationCall[0]).toEqual(ActiveUserMutations.SET_VIEWER)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(mutationCall[1]).toEqual(apiResponse.data.viewer)
        })
      })
      describe(`Failure`, () => {
        let loggerFn: jest.SpyInstance

        beforeEach(async () => {
          localThis = {
            $providerMetaMap: {
              gh: {
                text: 'Github',
                shortcode: 'gh',
                value: 'GITHUB'
              }
            },
            $logErrorAndToast(): boolean {
              return true
            },
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.reject(
                new Error(
                  "To go wrong in one's own way is better than to go right in someone else's."
                )
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')
          loggerFn = jest.spyOn(localThis, '$logErrorAndToast')

          await actions[ActiveUserActions.FETCH_VIEWER_INFO].call(localThis, actionCxt, {})
        })

        test('successfully calls the api and reports it to the monitoring service', () => {
          expect(spy).toHaveBeenCalledTimes(1)
          expect(loggerFn).toHaveBeenCalledTimes(1)
        })

        test('commits no mutations', () => {
          expect(commit).toHaveBeenCalledTimes(0)
        })
      })
    })
    describe(`Action "${ActiveUserActions.UPDATE_DEFAULT_CONTEXT}"`, () => {
      describe(`Success`, () => {
        beforeEach(async () => {
          localThis = {
            $applyGraphqlMutation(): Promise<boolean> {
              return Promise.resolve(true)
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')

          await actions[ActiveUserActions.UPDATE_DEFAULT_CONTEXT].call(localThis, actionCxt, {
            contextOwnerId: 32423
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })
      })
      describe(`Failure`, () => {
        let loggerFn: jest.SpyInstance

        beforeEach(async () => {
          localThis = {
            $logErrorAndToast(): boolean {
              return true
            },
            $applyGraphqlMutation(): Promise<GraphqlQueryResponse> {
              return Promise.reject(
                new Error(
                  "To go wrong in one's own way is better than to go right in someone else's."
                )
              )
            }
          }

          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')
          loggerFn = jest.spyOn(localThis, '$logErrorAndToast')

          await actions[ActiveUserActions.UPDATE_DEFAULT_CONTEXT].call(localThis, actionCxt, {
            contextOwnerId: 32423
          })
        })

        test('successfully calls the api and reports it to the monitoring service', () => {
          expect(spy).toHaveBeenCalledTimes(1)
          expect(loggerFn).toHaveBeenCalledTimes(1)
        })

        test('commits no mutations', () => {
          expect(commit).toHaveBeenCalledTimes(0)
        })
      })
    })
    describe(`Action "${ActiveUserActions.UPDATE_STARRED_REPO}"`, () => {
      beforeEach(async () => {
        localThis = {
          $applyGraphqlMutation(): Promise<{
            data: {
              updateStarredRepository: boolean
            }
          }> {
            return Promise.resolve({
              data: {
                updateStarredRepository: true
              }
            })
          }
        }

        // Setting the global spy on `localThis.$fetchGraphqlData`
        spy = jest.spyOn(localThis, '$applyGraphqlMutation')

        await actions[ActiveUserActions.UPDATE_STARRED_REPO].call(localThis, actionCxt, {
          repoId: '32423',
          action: 'ADD'
        })
      })

      test('successfully calls the api', () => {
        expect(spy).toHaveBeenCalledTimes(1)
      })
    })
    describe(`Action "${ActiveUserActions.UPDATE_USER_DETAILS}"`, () => {
      beforeEach(async () => {
        localThis = {
          $applyGraphqlMutation(): Promise<{
            data: {
              updateUserDetails: {
                viewer: Pick<User, 'fullName' | 'firstName' | 'lastName' | 'email' | 'avatar'>
              }
            }
          }> {
            return Promise.resolve({
              data: {
                updateUserDetails: {
                  viewer: {
                    fullName: 'Rohan',
                    firstName: 'Rohan',
                    lastName: '',
                    email: 'rohan@deepsource.io',
                    avatar:
                      'https://local-asgard-static.s3.us-east-1.amazonaws.com/avatars/9f8ae9fd-ba73-41c4-a664-fa768ef37ee0'
                  }
                }
              }
            })
          }
        }

        // Setting the global spy on `localThis.$fetchGraphqlData`
        spy = jest.spyOn(localThis, '$applyGraphqlMutation')

        await actions[ActiveUserActions.UPDATE_USER_DETAILS].call(localThis, actionCxt, {
          input: {
            displayName: 'Rohan',
            email: 'rohan@deepsource.io'
          }
        })
      })
      test('successfully calls the api', () => {
        expect(spy).toHaveBeenCalledTimes(1)
      })
    })
    describe(`Actions "${[
      ActiveUserActions.FETCH_STARRED_REPOS,
      ActiveUserActions.FETCH_GITLAB_ACCOUNTS,
      ActiveUserActions.FETCH_GSR_PROJECTS,
      ActiveUserActions.FETCH_RECOMMENDED_ISSUES,
      ActiveUserActions.FETCH_WORKSPACES,
      ActiveUserActions.FETCH_ADS_ORGANIZATIONS
    ].join(', ')}"`, () => {
      beforeEach(() => {
        if (spy) spy.mockReset()

        localThis = {
          $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
            return Promise.resolve({ data: { viewer: <User>{} } })
          }
        }

        // Setting the global spy on `localThis.$fetchGraphqlData`
        spy = jest.spyOn(localThis, '$fetchGraphqlData')
      })

      const actionsToTest = [
        ActiveUserActions.FETCH_STARRED_REPOS,
        ActiveUserActions.FETCH_GITLAB_ACCOUNTS,
        ActiveUserActions.FETCH_GSR_PROJECTS,
        ActiveUserActions.FETCH_RECOMMENDED_ISSUES,
        ActiveUserActions.FETCH_WORKSPACES,
        ActiveUserActions.FETCH_ADS_ORGANIZATIONS
      ]

      actionsToTest.forEach((actionName) => {
        test(`successfully runs ${actionName}`, async () => {
          // @ts-ignore
          await actions[actionName].call(localThis, actionCxt, {})

          expect(spy).toHaveBeenCalledTimes(1)
          expect(commit).toHaveBeenCalledTimes(1)
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

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++++
    ++++++++++++++++++++ GETTERS ++++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Getters]]', () => {
    describe(`Getters "${ActiveUserGetterTypes.GET_HOME_URL}"`, () => {
      beforeEach(() => {
        activeUserState.viewer = {} as User
      })
      test('Gets the default context url', () => {
        const newActiveUser: User = {
          firstName: 'John',
          email: 'john.doe@example.com',
          dashboardContext: [
            {
              vcs_provider: 'gh',
              login: 'hki'
            },
            {
              vcs_provider: 'gh',
              login: 'deepsourcelabs',
              is_default: true
            }
          ]
        } as User

        mutations[ActiveUserMutations.SET_VIEWER](activeUserState, newActiveUser)

        const url = getters[ActiveUserGetterTypes.GET_HOME_URL](activeUserState, {}, {}, {})
        expect(url).toEqual('/gh/deepsourcelabs')
      })

      test('Gets the url from priamry ownership', () => {
        // @ts-ignore
        const newActiveUser: User = {
          firstName: 'John',
          email: 'john.doe@example.com',
          primaryOwner: {
            vcsProvider: 'gh-primary',
            login: 'deepsource-primary'
          }
        } as User

        mutations[ActiveUserMutations.SET_VIEWER](activeUserState, newActiveUser)
        const url = getters[ActiveUserGetterTypes.GET_HOME_URL](activeUserState, {}, {}, {})
        expect(url).toEqual('/gh-primary/deepsource-primary')
      })

      test('Gets the context url if no default is preset', () => {
        const newActiveUser: User = {
          firstName: 'John',
          email: 'john.doe@example.com',
          dashboardContext: [
            {
              vcs_provider: 'gh-hki',
              login: 'hki'
            },
            {
              vcs_provider: 'gh',
              login: 'deepsourcelabs'
            }
          ]
        } as User

        mutations[ActiveUserMutations.SET_VIEWER](activeUserState, newActiveUser)

        const url = getters[ActiveUserGetterTypes.GET_HOME_URL](activeUserState, {}, {}, {})
        expect(url).toEqual('/gh-hki/hki')
      })

      test('Gets the installation url if all fails', () => {
        const url = getters[ActiveUserGetterTypes.GET_HOME_URL](activeUserState, {}, {}, {})
        expect(url).toEqual('/installation/providers')
      })
    })
    describe(`Getters "${ActiveUserGetterTypes.GET_VIEWER}"`, () => {
      test('Gets the default context url', () => {
        activeUserState.viewer = {} as User

        const newActiveUser: User = {
          firstName: 'John',
          email: 'john.doe@example.com',
          dashboardContext: [
            {
              vcs_provider: 'gh',
              login: 'hki'
            },
            {
              vcs_provider: 'gh',
              login: 'deepsourcelabs',
              is_default: true
            }
          ]
        } as User

        mutations[ActiveUserMutations.SET_VIEWER](activeUserState, newActiveUser)

        const viewer = getters[ActiveUserGetterTypes.GET_VIEWER](activeUserState, {}, {}, {})
        expect(viewer).toMatchObject(newActiveUser)
      })
    })
  })
})
