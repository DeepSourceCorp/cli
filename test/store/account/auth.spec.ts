import { providerMetaMap } from '~/plugins/helpers/provider'
import {
  AuthActionContext,
  AuthActionTypes,
  AuthGetterTypes,
  AuthModuleState,
  AuthMutationTypes,
  actions,
  getters
} from '~/store/account/auth'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { VcsProviderChoices } from '~/types/types'

let actionCxt: AuthActionContext
let localThis: any // skipcq JS-0323
let commit: jest.Mock
const authModuleState: AuthModuleState = {
  token: 'test-token',
  tokenExpiresIn: 123456,
  loggedIn: true,
  authUrls: [{ provider: VcsProviderChoices.Github, name: 'GitHub', url: 'test-url' }],
  error: {}
}

describe('[Store] account/auth', () => {
  beforeEach(() => {
    commit = jest.fn()

    actionCxt = {
      state: authModuleState,
      commit,
      dispatch: jest.fn(),
      getters: jest.fn(),
      rootGetters: jest.fn(),
      rootState: {}
    }
  })

  describe('[[ Getters ]]', () => {
    test(`Getter ${AuthGetterTypes.GET_LOGGED_IN}`, () => {
      expect(getters[AuthGetterTypes.GET_LOGGED_IN](authModuleState, {}, {}, {})).toBe(true)
    })

    test(`Getter ${AuthGetterTypes.TOKEN}`, () => {
      expect(getters[AuthGetterTypes.TOKEN](authModuleState, {}, {}, {})).toBe('test-token')
    })

    test(`Getter ${AuthGetterTypes.EXPIRY}`, () => {
      expect(getters[AuthGetterTypes.EXPIRY](authModuleState, {}, {}, {})).toBe(123456)
    })
  })

  describe('[[ Actions ]]', () => {
    test(`Action ${AuthActionTypes.FETCH_AUTH_URLS}`, async () => {
      const socialAuthUrlsQueryResponse = {
        socialUrls: [{ provider: VcsProviderChoices.Github, name: 'GitHub', url: 'test-url' }]
      }

      localThis = {
        $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
          return Promise.resolve({
            data: {
              oauth: socialAuthUrlsQueryResponse
            }
          })
        }
      }

      await actions[AuthActionTypes.FETCH_AUTH_URLS].call(localThis, actionCxt)

      const {
        mock: {
          calls: [firstCall]
        }
      } = commit

      expect(firstCall[0]).toBe(AuthMutationTypes.SET_AUTH_URLS)
      expect(firstCall[1]).toEqual(socialAuthUrlsQueryResponse)
    })

    test(`Action ${AuthActionTypes.LOG_IN}`, async () => {
      const socialAuthMutationPayload = {
        token: 'test-token',
        tokenExpiresIn: 123456,
        refreshToken: 'test-refresh-token',
        refreshExpiresIn: 123456
      }

      localThis = {
        $applyGraphqlMutation(): Promise<unknown> {
          return Promise.resolve({
            data: {
              socialAuth: socialAuthMutationPayload
            }
          })
        }
      }

      await actions[AuthActionTypes.LOG_IN].call(localThis, actionCxt, {
        provider: providerMetaMap[VcsProviderChoices.Github].auth,
        code: 'test-code',
        appId: 'test-app-id'
      })

      const {
        mock: {
          calls: [firstCall]
        }
      } = commit

      expect(firstCall[0]).toBe(AuthMutationTypes.SET_LOGGED_IN)
      expect(firstCall[1]).toBe(socialAuthMutationPayload.token)
    })

    describe(`Action ${AuthActionTypes.REFRESH}`, () => {
      test('Success', async () => {
        const refreshTokenMutationPayload = {
          token: 'new-refresh-token'
        }

        localThis = {
          $applyGraphqlMutation(): Promise<unknown> {
            return Promise.resolve({
              data: {
                refreshToken: refreshTokenMutationPayload
              }
            })
          }
        }

        await actions[AuthActionTypes.REFRESH].call(localThis, actionCxt)

        const {
          mock: {
            calls: [firstCall]
          }
        } = commit

        expect(firstCall[0]).toBe(AuthMutationTypes.SET_LOGGED_IN)
        expect(firstCall[1]).toBe(refreshTokenMutationPayload.token)
      })

      test('Failure', async () => {
        const refreshTokenMutationPayload = {
          token: ''
        }

        localThis = {
          $applyGraphqlMutation(): Promise<unknown> {
            return Promise.resolve({
              data: {
                refreshToken: refreshTokenMutationPayload
              }
            })
          }
        }

        await expect(
          actions[AuthActionTypes.REFRESH].call(localThis, actionCxt)
        ).rejects.toThrowError(new Error('Failed to refresh token, please login again'))
      })
    })

    describe(`Action ${AuthActionTypes.LOG_OUT}`, () => {
      test('Success', async () => {
        const logoutMutationPayload = {
          ok: true
        }

        localThis = {
          $applyGraphqlMutation(): Promise<unknown> {
            return Promise.resolve({
              data: {
                logout: logoutMutationPayload
              }
            })
          }
        }

        await actions[AuthActionTypes.LOG_OUT].call(localThis, actionCxt, { onPrem: false })

        const {
          mock: {
            calls: [commitCall]
          }
        } = commit

        const {
          mock: {
            calls: [dispatchCall]
          }
        } = actionCxt.dispatch as jest.Mock

        expect(commitCall[0]).toBe(AuthMutationTypes.SET_LOGGED_OUT)

        expect(dispatchCall[0]).toBe(AuthActionTypes.PURGE_CLIENT_DATA)
        expect(dispatchCall[1]).toEqual({ onPrem: false })
      })

      describe('Failure', () => {
        afterEach(() => jest.resetModules())

        test('invokes `$logErrorAndToast` in production environment', async () => {
          localThis = {
            $applyGraphqlMutation(): Promise<unknown> {
              return Promise.reject(new Error())
            },
            $logErrorAndToast: jest.fn()
          }

          await actions[AuthActionTypes.LOG_OUT].call(localThis, actionCxt, { onPrem: false })

          expect(localThis.$logErrorAndToast).toBeCalled()
        })

        test('throws an error in the local development environment', async () => {
          process.env.NODE_ENV = 'development'

          localThis = {
            $applyGraphqlMutation(): Promise<unknown> {
              return Promise.reject(new Error())
            }
          }

          await expect(
            actions[AuthActionTypes.LOG_OUT].call(localThis, actionCxt, { onPrem: false })
          ).rejects.toThrowError(new Error('Something went wrong while logging you out.'))
        })
      })
    })
  })
})
