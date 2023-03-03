import { mockOwnerDetail, OWNER_DETAILS } from './__mocks__/owner-detail.mock'
import {
  state,
  mutations,
  getters,
  actions,
  OwnerDetailModuleState,
  OwnerDetailModuleActionContext,
  OwnerDetailGetters,
  OwnerDetailActions,
  OwnerDetailMutations
} from '~/store/owner/detail'
import {
  IssueTypeSetting,
  Owner,
  SubscriptionStatusChoice,
  UpdatePaymentActionChoice
} from '~/types/types'
import { GraphqlMutationResponse, GraphqlQueryResponse } from '~/types/apollo-graphql-types'

let actionCxt: OwnerDetailModuleActionContext
let commit: jest.Mock
let localThis: any
let spy: jest.SpyInstance
let ownerState: OwnerDetailModuleState

describe('[Store] Owner/Details', () => {
  beforeEach(() => {
    commit = jest.fn()
    ownerState = mockOwnerDetail()

    actionCxt = {
      state: ownerState,
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
      expect(initState.owner.ownerSetting?.issueTypeSettings).toEqual([])
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ GETTERS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Getters]]', () => {
    describe(`Getter "${OwnerDetailGetters.ISSUE_PREFERENCES}"`, () => {
      test('returns data with equal length as issueTypeSettings', () => {
        const refinedSettings = getters[OwnerDetailGetters.ISSUE_PREFERENCES](ownerState)
        expect(ownerState.owner.ownerSetting?.issueTypeSettings?.length).toEqual(
          refinedSettings.length
        )
      })

      test('returns data as intended', () => {
        const refinedSettings = getters[OwnerDetailGetters.ISSUE_PREFERENCES](ownerState)

        // Should return `slug` field at same index
        expect(ownerState.owner.ownerSetting?.issueTypeSettings?.[0]?.slug).toEqual(
          refinedSettings[0].slug
        )

        // // Should return `isIgnoredInCheckStatus` field at same index
        expect(
          ownerState.owner.ownerSetting?.issueTypeSettings?.[0]?.isIgnoredInCheckStatus
        ).toEqual(refinedSettings[0].isIgnoredInCheckStatus)

        // Should return `isIgnoredToDisplay` field at same index
        expect(ownerState.owner.ownerSetting?.issueTypeSettings?.[0]?.isIgnoredToDisplay).toEqual(
          refinedSettings[0].isIgnoredToDisplay
        )
      })
    })

    describe(`Getter "${OwnerDetailGetters.CAN_ONBOARD}"`, () => {
      test('returns data as intended', () => {
        const canOnboard = getters[OwnerDetailGetters.CAN_ONBOARD](ownerState)
        expect(canOnboard).toBe(false)

        const canOnboardAfterUpdatingState = getters[OwnerDetailGetters.CAN_ONBOARD]({
          ...ownerState,
          owner: {
            ...OWNER_DETAILS,
            canOnboard: true
          }
        })
        expect(canOnboardAfterUpdatingState).toBe(true)
      })
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    describe(`Action "${OwnerDetailActions.FETCH_OWNER_ID}"`, () => {
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
            $fetchGraphqlData(): Promise<unknown> {
              return new Promise<unknown>((resolve) =>
                setTimeout(
                  () => resolve({ data: { owner: { id: mockOwnerDetail().owner.id } } }),
                  10
                )
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_OWNER_ID].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits the mutation', () => {
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_OWNER}`, async () => {
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `OwnerDetailMutations.SET_OWNER` is being commited or not.
          expect(commit).toHaveBeenCalledWith(
            OwnerDetailMutations.SET_OWNER,
            apiResponse.data.owner
          )
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
            $logErrorAndToast: jest.fn(),
            $fetchGraphqlData(): Promise<Error> {
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_OWNER_ID].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test(`successfully invokes $logErrorAndToast plugin`, () => {
          expect(localThis.$logErrorAndToast).toHaveBeenCalledWith(Error('ERR1'))
        })
      })
    })

    describe(`Action "${OwnerDetailActions.FETCH_OWNER_DETAILS}"`, () => {
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
                setTimeout(() => resolve({ data: { owner: OWNER_DETAILS } }), 10)
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_OWNER_DETAILS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_OWNER}`, async () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `OwnerDetailMutations.SET_OWNER` is being committed or not.
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_OWNER)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.owner)
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
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_OWNER_DETAILS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being committed or not.
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `OwnerDetailMutations.SET_LOADING` is being committed or not.
          expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_ERROR}`, () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_ERROR` is being committed or not.
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)

          // Assert if the right data is passed to the mutation
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${OwnerDetailActions.FETCH_ISSUE_TYPE_SETTINGS}"`, () => {
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
                setTimeout(() => resolve({ data: { owner: mockOwnerDetail().owner } }), 10)
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_ISSUE_TYPE_SETTINGS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_OWNER}`, async () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `OwnerDetailMutations.SET_ISSUE_TYPE_SETTING` is being commited or not.
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_OWNER)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.owner)
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
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_ISSUE_TYPE_SETTINGS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_ERROR}`, () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)

          // Assert if the right data is passed to the mutation
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${OwnerDetailActions.FETCH_ISSUE_TRENDS}"`, () => {
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
                setTimeout(() => resolve({ data: { owner: mockOwnerDetail().owner } }), 10)
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_ISSUE_TRENDS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh',
            lastDays: 30
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(4)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_OWNER_ISSUES_TREND}`, async () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `OwnerDetailMutations.FETCH_ISSUE_TRENDS` is being commited or not.
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_OWNER_ISSUES_TREND)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.owner)
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
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_ISSUE_TRENDS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh',
            lastDays: 30
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_ERROR}`, () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)

          // Assert if the right data is passed to the mutation
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${OwnerDetailActions.FETCH_AUTOFIX_TRENDS}"`, () => {
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
                setTimeout(() => resolve({ data: { owner: mockOwnerDetail().owner } }), 10)
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_AUTOFIX_TRENDS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh',
            lastDays: 30
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_OWNER_AUTOFIX_TREND}`, async () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `OwnerDetailMutations.SET_OWNER_AUTOFIX_TREND` is being commited or not
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_OWNER_AUTOFIX_TREND)

          // Assert if the response from api is same as the one passed to the mutation
          expect(secondCall[1]).toEqual(apiResponse.data.owner)
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
              return Promise.reject(new Error('ERR1'))
            },
            $logErrorAndToast: jest.fn()
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_AUTOFIX_TRENDS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh',
            lastDays: 30
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation
          expect(firstCall[1]).toEqual(true)

          expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_ERROR}`, () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_ERROR` is being commited or not
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${OwnerDetailActions.FETCH_ACCOUNT_SETUP_STATUS}"`, () => {
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
                setTimeout(() => resolve({ data: { owner: mockOwnerDetail().owner } }), 10)
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_ACCOUNT_SETUP_STATUS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not
          expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_OWNER}`, async () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `OwnerDetailMutations.SET_OWNER` is being commited or not
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_OWNER)

          // Assert if the response from api is same as the one passed to the mutation
          expect(secondCall[1]).toEqual(apiResponse.data.owner)
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
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_ACCOUNT_SETUP_STATUS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_ERROR}`, () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_ERROR` is being commited or not
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${OwnerDetailActions.FETCH_ACCOUNT_SETUP_STATUS}"`, () => {
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
                setTimeout(() => resolve({ data: { owner: mockOwnerDetail().owner } }), 10)
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_ACCOUNT_SETUP_STATUS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first and last commit calls made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not
          expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_OWNER}`, async () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `OwnerDetailMutations.SET_OWNER` is being commited or not
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_OWNER)

          // Assert if the response from api is same as the one passed to the mutation
          expect(secondCall[1]).toEqual(apiResponse.data.owner)
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
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_ACCOUNT_SETUP_STATUS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_ERROR}`, () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${OwnerDetailActions.FETCH_APP_CONFIG}"`, () => {
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
                setTimeout(() => resolve({ data: { owner: mockOwnerDetail().owner } }), 10)
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_APP_CONFIG].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_OWNER}`, async () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit

          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `OwnerDetailMutations.SET_OWNER` is being commited or not
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_OWNER)

          // Assert if the response from api is same as the one passed to the mutation
          expect(firstCall[1]).toEqual(apiResponse.data.owner)
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
              return Promise.reject(new Error('ERR1'))
            },
            $logErrorAndToast: jest.fn()
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_APP_CONFIG].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('no mutations are committed', () => {
          expect(commit).not.toHaveBeenCalled()
        })

        test('error handler', () => {
          expect(localThis.$logErrorAndToast).toBeCalledWith(
            new Error('ERR1'),
            'There was an error fetching configuration from VCS provider.'
          )
        })
      })
    })

    describe(`Action "${OwnerDetailActions.FETCH_BILLING_DETAILS}"`, () => {
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
                setTimeout(() => resolve({ data: { owner: mockOwnerDetail().owner } }), 10)
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_BILLING_DETAILS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first and third commit calls made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not
          expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_OWNER}`, async () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `OwnerDetailMutations.SET_OWNER` is being commited or not
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_OWNER)

          // Assert if the response from api is same as the one passed to the mutation
          expect(secondCall[1]).toEqual(apiResponse.data.owner)
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
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_BILLING_DETAILS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_ERROR}`, () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)

          // Assert if the right data is passed to the mutation
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${OwnerDetailActions.FETCH_SEATS_INFO}"`, () => {
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
                setTimeout(() => resolve({ data: { owner: mockOwnerDetail().owner } }), 10)
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_SEATS_INFO].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_OWNER}`, async () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit

          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `OwnerDetailMutations.SET_OWNER` is being commited or not
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_OWNER)

          // Assert if the response from api is same as the one passed to the mutation
          expect(firstCall[1]).toEqual(apiResponse.data.owner)
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
              return Promise.reject(new Error('ERR1'))
            },
            $logErrorAndToast: jest.fn()
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_SEATS_INFO].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('no mutations are committed', () => {
          expect(commit).not.toHaveBeenCalled()
        })

        test('error handler', () => {
          expect(localThis.$logErrorAndToast).toBeCalledWith(
            Error('ERR1'),
            'Something went wrong while fetching seats used information.'
          )
        })
      })
    })

    describe(`Action "${OwnerDetailActions.FETCH_BILLING_STATUS}"`, () => {
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
                setTimeout(
                  () =>
                    resolve({
                      data: {
                        owner: {
                          ...mockOwnerDetail().owner,
                          billingInfo: { status: SubscriptionStatusChoice.Active }
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

          await actions[OwnerDetailActions.FETCH_BILLING_STATUS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(2)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first and second commit calls made
          const {
            mock: {
              calls: [firstCall, secondCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(secondCall[1]).toEqual(false)
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
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_BILLING_STATUS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_ERROR}`, () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)

          // Assert if the right data is passed to the mutation
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${OwnerDetailActions.SUBMIT_ISSUE_TYPE_SETTINGS}"`, () => {
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
            $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
              return new Promise<GraphqlMutationResponse>((resolve) =>
                setTimeout(() => resolve({ data: { updateOwnerSettings: { ok: true } } }), 10)
              )
            },
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return new Promise<GraphqlQueryResponse>((resolve) =>
                setTimeout(() => resolve({ data: { owner: mockOwnerDetail().owner } }), 10)
              )
            }
          }

          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')

          await actions[OwnerDetailActions.SUBMIT_ISSUE_TYPE_SETTINGS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh',
            preferences: []
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [loadingCall, setOwnerCall, setLoadingFalseCall]
            }
          } = commit

          expect(loadingCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
          expect(loadingCall[1]).toEqual(true)

          expect(setOwnerCall[0]).toEqual(OwnerDetailMutations.SET_OWNER)
          expect(setOwnerCall[1].id).toEqual('T3duZXI6NjM=')

          expect(setLoadingFalseCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
          expect(setLoadingFalseCall[1]).toEqual(false)
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
            $applyGraphqlMutation(): Promise<Error> {
              return Promise.reject(new Error('OwnerDetailMutations.ERR1'))
            }
          }

          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')

          await actions[OwnerDetailActions.SUBMIT_ISSUE_TYPE_SETTINGS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh',
            preferences: []
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_ERROR}`, () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)

          // Assert if the right data is passed to the mutation
          expect(secondCall[1]).toEqual(Error('OwnerDetailMutations.ERR1'))
        })
      })
    })

    describe(`Action "${OwnerDetailActions.SET_OWNER}"`, () => {
      beforeEach(() => {
        actions[OwnerDetailActions.SET_OWNER](actionCxt, mockOwnerDetail().owner)
      })

      test('successfully commits mutation', () => {
        expect(commit).toHaveBeenCalledTimes(1)

        // Storing the first commit call made
        const {
          mock: {
            calls: [firstCall, ,]
          }
        } = commit

        // Assert if `OwnerDetailMutations.SET_OWNER` is being commited or not.
        expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_OWNER)

        // Assert if the data passed to the mutation is correct.
        expect(firstCall[1]).toEqual(mockOwnerDetail().owner)
      })
    })

    describe(`Action "${OwnerDetailActions.SET_ISSUE_TYPE_SETTING}"`, () => {
      beforeEach(() => {
        actions[OwnerDetailActions.SET_ISSUE_TYPE_SETTING](actionCxt, {
          isIgnoredInCheckStatus: true,
          isIgnoredToDisplay: true,
          issueTypeSettingSlug: 'performance'
        })
      })

      test('successfully commits mutation', () => {
        expect(commit).toHaveBeenCalledTimes(1)

        // Storing the first commit call made
        const {
          mock: {
            calls: [firstCall]
          }
        } = commit

        // Assert if `OwnerDetailMutations.SET_ISSUE_TYPE_SETTING` is being commited or not.
        expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_ISSUE_TYPE_SETTING)

        // Assert if the data passed to the mutation is correct.
        expect(firstCall[1]).toEqual({
          isIgnoredInCheckStatus: true,
          isIgnoredToDisplay: true,
          issueTypeSettingSlug: 'performance'
        })
      })
    })
  })

  describe(`Action "${OwnerDetailActions.APPLY_CREDITS}"`, () => {
    test('successfully commits mutation', async () => {
      localThis = {
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((resolve) =>
            setTimeout(() => resolve({ data: {} }), 10)
          )
        }
      }
      await actions[OwnerDetailActions.APPLY_CREDITS].call(localThis, actionCxt, {
        amount: 123
      })

      // Storing the commit calls made
      const {
        mock: {
          calls: [firstCall, secondCall]
        }
      } = commit

      // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
      expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
      expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
    })

    test('successfully commits error', async () => {
      localThis = {
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((_resolve, reject) =>
            setTimeout(() => reject(new Error('ERR1')), 10)
          )
        }
      }
      await actions[OwnerDetailActions.APPLY_CREDITS].call(localThis, actionCxt, {
        amount: 123
      })

      // Storing the commit calls made
      const {
        mock: {
          calls: [firstCall, secondCall, thirdCall]
        }
      } = commit

      // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
      expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
      expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)
      expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
    })
  })

  describe(`Action "${OwnerDetailActions.UPDATE_BILLING_INFO}"`, () => {
    test('successfully commits mutation', async () => {
      localThis = {
        $providerMetaMap: {
          gh: {
            text: 'Github',
            shortcode: 'gh',
            value: 'GITHUB'
          }
        },
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((resolve) =>
            setTimeout(() => resolve({ data: { updateBillingInfo: {} } }), 10)
          )
        }
      }
      await actions[OwnerDetailActions.UPDATE_BILLING_INFO].call(localThis, actionCxt, {
        billingAddress: 'lol',
        billingEmail: 'lol@lol.lol',
        login: 'lol-org',
        provider: 'gh'
      })

      // Storing the commit calls made
      const {
        mock: {
          calls: [firstCall, secondCall, thirdCall]
        }
      } = commit

      // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
      expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
      expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_OWNER)
      expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
    })

    test('successfully commits error', async () => {
      localThis = {
        $providerMetaMap: {
          gh: {
            text: 'Github',
            shortcode: 'gh',
            value: 'GITHUB'
          }
        },
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((_resolve, reject) =>
            setTimeout(() => reject(new Error('ERR1')), 10)
          )
        }
      }

      try {
        await actions[OwnerDetailActions.UPDATE_BILLING_INFO].call(localThis, actionCxt, {
          billingAddress: 'lol',
          billingEmail: 'lol@lol.lol',
          login: 'lol-org',
          provider: 'gh'
        })
      } catch (e) {
        // Storing the commit calls made
        const {
          mock: {
            calls: [firstCall, secondCall, thirdCall]
          }
        } = commit

        // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
        expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
        expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)
        expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
        expect((e as Error).message).toBe('ERR1')
      }
    })
  })

  describe(`Action "${OwnerDetailActions.GET_BILLING_INFO}"`, () => {
    test('successfully commits mutation', async () => {
      localThis = {
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((resolve) =>
            setTimeout(() => resolve({ data: { updateBillingInfo: {} } }), 10)
          )
        }
      }
      await actions[OwnerDetailActions.GET_BILLING_INFO].call(localThis, actionCxt, {
        productSlug: 'premium',
        planSlug: 'premium',
        quantity: 1,
        couponCode: '',
        isTrial: false
      })

      // Storing the commit calls made
      const {
        mock: {
          calls: [firstCall, secondCall, thirdCall]
        }
      } = commit

      // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
      expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
      expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_BILLING_INFO)
      expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
    })

    test('successfully commits error', async () => {
      localThis = {
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((_resolve, reject) =>
            setTimeout(() => reject(new Error('ERR1')), 10)
          )
        }
      }
      await actions[OwnerDetailActions.GET_BILLING_INFO].call(localThis, actionCxt, {
        productSlug: 'premium',
        planSlug: 'premium',
        quantity: 1,
        couponCode: '',
        isTrial: false
      })

      // Storing the commit calls made
      const {
        mock: {
          calls: [firstCall, secondCall, thirdCall]
        }
      } = commit

      // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
      expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
      expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)
      expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
    })
  })

  describe(`Action "${OwnerDetailActions.CHECKOUT}"`, () => {
    test('successfully commits mutation', async () => {
      localThis = {
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: {
                    subscriptionCheckout: {
                      nextAction: 'actopm',
                      clientMutationId: 'id',
                      clientSecret: 'secret'
                    }
                  }
                }),
              10
            )
          )
        }
      }
      const returnData = await actions[OwnerDetailActions.CHECKOUT].call(localThis, actionCxt, {
        coupon: '',
        email: 'lol@lol.lol',
        installationId: '123',
        name: 'vaibhav',
        planSlug: 'premium',
        seats: 10,
        token: '123'
      })

      // Storing the commit calls made
      const {
        mock: {
          calls: [firstCall, secondCall]
        }
      } = commit

      // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
      expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
      expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
      expect(returnData).toEqual({
        nextAction: 'actopm',
        clientMutationId: 'id',
        clientSecret: 'secret'
      })
    })

    test('successfully commits error', async () => {
      localThis = {
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((_resolve, reject) =>
            setTimeout(() => reject(new Error('ERR1')), 10)
          )
        }
      }

      try {
        await actions[OwnerDetailActions.CHECKOUT].call(localThis, actionCxt, {
          coupon: '',
          email: 'lol@lol.lol',
          installationId: '123',
          name: 'vaibhav',
          planSlug: 'premium',
          seats: 10,
          token: '123'
        })
      } catch (e) {
        // Storing the commit calls made
        const {
          mock: {
            calls: [firstCall, secondCall, thirdCall]
          }
        } = commit

        // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
        expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
        expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)
        expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
        expect((e as Error).message).toBe('ERR1')
      }
    })
  })

  describe(`Action "${OwnerDetailActions.UPDATE_SEATS}"`, () => {
    test('successfully commits mutation', async () => {
      localThis = {
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: {
                    updateCodeQualitySubscriptionSeats: {
                      clientMutationId: '123',
                      ok: true,
                      totalSeats: 10
                    }
                  }
                }),
              10
            )
          )
        }
      }
      const returnData = await actions[OwnerDetailActions.UPDATE_SEATS].call(localThis, actionCxt, {
        seats: 10,
        id: '123'
      })

      // Storing the commit calls made
      const {
        mock: {
          calls: [firstCall, secondCall]
        }
      } = commit

      // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
      expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
      expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
      expect(returnData).toEqual({
        clientMutationId: '123',
        ok: true,
        totalSeats: 10
      })
    })

    test('successfully commits error', async () => {
      localThis = {
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((_resolve, reject) =>
            setTimeout(() => reject(new Error('ERR1')), 10)
          )
        }
      }

      try {
        await actions[OwnerDetailActions.UPDATE_SEATS].call(localThis, actionCxt, {
          seats: 10,
          id: '123'
        })
      } catch (e) {
        // Storing the commit calls made
        const {
          mock: {
            calls: [firstCall, secondCall, thirdCall]
          }
        } = commit

        // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
        expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
        expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)
        expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
        expect((e as Error).message).toBe('ERR1')
      }
    })
  })

  describe(`Action "${OwnerDetailActions.UPDATE_PAYMENT_SOURCE}"`, () => {
    test('successfully commits mutation', async () => {
      localThis = {
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((resolve) =>
            setTimeout(
              () =>
                resolve({
                  data: {
                    updateDefaultPaymentSource: {
                      ok: true,
                      clientMutationId: '123',
                      card: { brand: 'visa', endingIn: '1234', expMonth: 14, expYear: 29 }
                    }
                  }
                }),
              10
            )
          )
        }
      }
      const returnData = await actions[OwnerDetailActions.UPDATE_PAYMENT_SOURCE].call(
        localThis,
        actionCxt,
        {
          id: '123',
          action: UpdatePaymentActionChoice.Update,
          token: '456'
        }
      )

      // Storing the commit calls made
      const {
        mock: {
          calls: [firstCall, secondCall]
        }
      } = commit

      // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
      expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
      expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
      expect(returnData).toEqual({
        ok: true,
        clientMutationId: '123',
        card: { brand: 'visa', endingIn: '1234', expMonth: 14, expYear: 29 }
      })
    })

    test('successfully commits error', async () => {
      localThis = {
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((_resolve, reject) =>
            setTimeout(() => reject(new Error('ERR1')), 10)
          )
        }
      }

      try {
        await actions[OwnerDetailActions.UPDATE_PAYMENT_SOURCE].call(localThis, actionCxt, {
          id: '123',
          action: UpdatePaymentActionChoice.Update,
          token: '456'
        })
      } catch (e) {
        // Storing the commit calls made
        const {
          mock: {
            calls: [firstCall, secondCall, thirdCall]
          }
        } = commit

        // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
        expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
        expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)
        expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
        expect((e as Error).message).toBe('ERR1')
      }
    })
  })

  describe(`Action "${OwnerDetailActions.CHANGE_SUBSCRIPTION_PLAN}"`, () => {
    test('successfully commits mutation', async () => {
      localThis = {
        $providerMetaMap: {
          gh: {
            text: 'Github',
            shortcode: 'gh',
            value: 'GITHUB'
          }
        },
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((resolve) =>
            setTimeout(() => resolve({ data: {} }), 10)
          )
        }
      }
      await actions[OwnerDetailActions.CHANGE_SUBSCRIPTION_PLAN].call(localThis, actionCxt, {
        id: '123',
        planSlug: 'premium'
      })

      // Storing the commit calls made
      const {
        mock: {
          calls: [firstCall, secondCall]
        }
      } = commit

      // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
      expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
      expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
    })

    test('successfully commits error', async () => {
      localThis = {
        $providerMetaMap: {
          gh: {
            text: 'Github',
            shortcode: 'gh',
            value: 'GITHUB'
          }
        },
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((_resolve, reject) =>
            setTimeout(() => reject(new Error('ERR1')), 10)
          )
        }
      }

      try {
        await actions[OwnerDetailActions.CHANGE_SUBSCRIPTION_PLAN].call(localThis, actionCxt, {
          id: '123',
          planSlug: 'premium'
        })
      } catch (e) {
        // Storing the commit calls made
        const {
          mock: {
            calls: [firstCall, secondCall, thirdCall]
          }
        } = commit

        // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
        expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
        expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)
        expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
        expect((e as Error).message).toBe('ERR1')
      }
    })
  })

  describe(`Action "${OwnerDetailActions.CANCEL_SUBSCRIPTION_PLAN}"`, () => {
    test('successfully commits mutation', async () => {
      localThis = {
        $providerMetaMap: {
          gh: {
            text: 'Github',
            shortcode: 'gh',
            value: 'GITHUB'
          }
        },
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((resolve) =>
            setTimeout(() => resolve({ data: {} }), 10)
          )
        }
      }
      await actions[OwnerDetailActions.CANCEL_SUBSCRIPTION_PLAN].call(localThis, actionCxt, {
        id: '123',
        planSlug: 'premium'
      })

      // Storing the commit calls made
      const {
        mock: {
          calls: [firstCall, secondCall]
        }
      } = commit

      // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
      expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
      expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
    })

    test('successfully commits error', async () => {
      localThis = {
        $providerMetaMap: {
          gh: {
            text: 'Github',
            shortcode: 'gh',
            value: 'GITHUB'
          }
        },
        $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
          return new Promise<GraphqlMutationResponse>((_resolve, reject) =>
            setTimeout(() => reject(new Error('ERR1')), 10)
          )
        }
      }

      try {
        await actions[OwnerDetailActions.CANCEL_SUBSCRIPTION_PLAN].call(localThis, actionCxt, {
          id: '123',
          planSlug: 'premium'
        })
      } catch (e) {
        // Storing the commit calls made
        const {
          mock: {
            calls: [firstCall, secondCall, thirdCall]
          }
        } = commit

        // Assert if `OwnerDetailMutations.SET_LOADING` is being commited or not.
        expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
        expect(secondCall[0]).toEqual(OwnerDetailMutations.SET_ERROR)
        expect(thirdCall[0]).toEqual(OwnerDetailMutations.SET_LOADING)
        expect((e as Error).message).toBe('ERR1')
      }
    })

    describe(`Action "${OwnerDetailActions.FETCH_OWNER_PREFERENCES}"`, () => {
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
                setTimeout(() => resolve({ data: { owner: mockOwnerDetail().owner } }), 10)
              )
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_OWNER_PREFERENCES].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.SET_OWNER}`, async () => {
          expect(commit).toHaveBeenCalledTimes(1)

          // Storing the second commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit

          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `OwnerDetailMutations.SET_OWNER` is being commited or not
          expect(firstCall[0]).toEqual(OwnerDetailMutations.SET_OWNER)

          // Assert if the response from api is same as the one passed to the mutation
          expect(firstCall[1]).toEqual(apiResponse.data.owner)
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
              return Promise.reject(new Error('ERR1'))
            },
            $logErrorAndToast: jest.fn()
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[OwnerDetailActions.FETCH_OWNER_PREFERENCES].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test(`successfully invokes $logErrorAndToast plugin`, () => {
          expect(localThis.$logErrorAndToast).toHaveBeenCalledWith(
            Error('ERR1'),
            'An error occured while fetching owner preferences.'
          )
        })
      })
    })

    describe(`Action "${OwnerDetailActions.SET_DATA_TIMEOUT_TRIGGER}"`, () => {
      const dataTriggerVal = true

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
            $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
              return new Promise<GraphqlMutationResponse>((resolve) =>
                setTimeout(() => resolve({ data: { updateTimeoutSetting: { ok: true } } }), 10)
              )
            },
            $toast: { success: jest.fn() }
          }

          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')

          await actions[OwnerDetailActions.SET_DATA_TIMEOUT_TRIGGER].call(localThis, actionCxt, {
            ownerId: '123',
            shouldTimeoutDataTrigger: dataTriggerVal
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${OwnerDetailMutations.UPDATE_DATA_TIMEOUT_TRIGGER}`, () => {
          expect(commit).toHaveBeenCalledTimes(1)

          // Storing the second commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit

          // Assert if `OwnerDetailMutations.SET_OWNER` is being commited or not
          expect(firstCall[0]).toEqual(OwnerDetailMutations.UPDATE_DATA_TIMEOUT_TRIGGER)

          // Assert if the response from api is same as the one passed to the mutation
          expect(firstCall[1]).toEqual(dataTriggerVal)
        })

        test(`successfully returns 'true' if action ${OwnerDetailActions.SET_DATA_TIMEOUT_TRIGGER} is successful`, async () => {
          const apiResponse = await actions[OwnerDetailActions.SET_DATA_TIMEOUT_TRIGGER].call(
            localThis,
            actionCxt,
            {
              ownerId: '123',
              shouldTimeoutDataTrigger: true
            }
          )

          expect(apiResponse).toBe(true)
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
            $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
              return new Promise<GraphqlMutationResponse>((_resolve, reject) =>
                setTimeout(() => reject(new Error('ERR1')), 10)
              )
            },
            $logErrorAndToast: jest.fn()
          }

          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')

          await actions[OwnerDetailActions.SET_DATA_TIMEOUT_TRIGGER].call(localThis, actionCxt, {
            ownerId: '123',
            shouldTimeoutDataTrigger: true
          })
        })

        test(`successfully invokes $logErrorAndToast plugin`, () => {
          expect(localThis.$logErrorAndToast).toHaveBeenCalledWith(
            Error('ERR1'),
            'An error occured while updating owner preferences.'
          )
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
    describe(`Mutation "${OwnerDetailMutations.SET_LOADING}"`, () => {
      test('successfully updates loading field in state', () => {
        mutations[OwnerDetailMutations.SET_LOADING](ownerState, true)
        expect(ownerState.loading).toEqual(true)
      })
    })

    describe(`Mutation "${OwnerDetailMutations.SET_ERROR}"`, () => {
      test('successfully updates loading field in state', () => {
        const dummyError = {
          graphQLErrors: {
            message: 'Dummy error',
            locations: [],
            path: []
          }
        }
        mutations[OwnerDetailMutations.SET_ERROR](ownerState, dummyError)
        expect(ownerState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${OwnerDetailMutations.SET_OWNER}"`, () => {
      beforeEach(() => {
        ownerState.owner = {} as Owner
      })
      test('successfully adds new owner to the state', () => {
        const newOwner: Owner = {
          id: 'DUMMY_OWNER_ID',
          ownerSetting: { id: 'DUMMY_OWNER_SETTING_ID' }
        } as Owner

        mutations[OwnerDetailMutations.SET_OWNER](ownerState, newOwner)
        expect(ownerState.owner).toEqual(newOwner)
      })

      test('successfully appends data', () => {
        const newOwner: Owner = mockOwnerDetail().owner as Owner

        // Change owner setting id
        if (newOwner.ownerSetting) {
          newOwner.ownerSetting.id = 'DUMMY_ID'
        }
        mutations[OwnerDetailMutations.SET_OWNER](ownerState, newOwner)
        expect(ownerState.owner.ownerSetting?.id).toEqual(newOwner.ownerSetting?.id)
      })
    })

    describe(`Mutation "${OwnerDetailMutations.SET_ISSUE_TYPE_SETTING}"`, () => {
      test('successfully appends issue type setting', () => {
        const newIssueTypeSetting: IssueTypeSetting = {
          slug: 'new-issue-type',
          name: 'New Issue Type',
          isIgnoredInCheckStatus: false,
          isIgnoredToDisplay: true,
          description: null
        }

        mutations[OwnerDetailMutations.SET_ISSUE_TYPE_SETTING](ownerState, newIssueTypeSetting)
        const length = ownerState.owner.ownerSetting?.issueTypeSettings?.length || 1
        expect(ownerState.owner.ownerSetting?.issueTypeSettings?.[length - 1]).toEqual(
          newIssueTypeSetting
        )
      })
    })

    describe(`Mutation "${OwnerDetailMutations.UPDATE_DATA_TIMEOUT_TRIGGER}"`, () => {
      test('successfully appends shouldTimeoutDataTrigger', () => {
        const newshouldTimeoutDataTrigger = false

        mutations[OwnerDetailMutations.UPDATE_DATA_TIMEOUT_TRIGGER](
          ownerState,
          newshouldTimeoutDataTrigger
        )

        expect(ownerState.owner.ownerSetting?.shouldTimeoutDataTrigger).toEqual(false)
      })
    })
  })
})
