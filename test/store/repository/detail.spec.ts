import {
  mockRepositoryDetailState,
  mockRepositoryDetailStateForSettingsGeneral,
  mockRepositoryDetailStateForSettingsIgnoreRules,
  mockRepositoryDetailStateForSettingsManageAccess,
  mockRepositoryDetailStateForSettingsSsh,
  mockRepositoryDetailStateForMetrics,
  mockRepositoryDetailStateForWidgets
} from './__mocks__/detail.mock'
import {
  state,
  mutations,
  actions,
  RepositoryDetailActionContext,
  RepositoryDetailModuleState,
  RepositoryDetailActions,
  RepositoryDetailMutations
} from '~/store/repository/detail'
import { Repository } from '~/types/types'
import { GraphqlMutationResponse, GraphqlQueryResponse } from '~/types/apollo-graphql-types'

let actionCxt: RepositoryDetailActionContext
let commit: jest.Mock
let localThis: any
let spy: jest.SpyInstance
let repositoryDetailState: RepositoryDetailModuleState

describe('[Store] Repository/Detail', () => {
  beforeEach(() => {
    commit = jest.fn()
    repositoryDetailState = mockRepositoryDetailState()

    actionCxt = {
      state: repositoryDetailState,
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
      expect(initState.repository).toEqual({})
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    describe(`Action "${RepositoryDetailActions.FETCH_WIDGETS}"`, () => {
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
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: { repository: mockRepositoryDetailStateForWidgets().repository }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_WIDGETS].call(localThis, actionCxt, {
            owner: 'deepsourcelabs',
            provider: 'gh',
            name: 'asgard'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_REPOSITORY}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RepositoryDetailMutations.SET_REPOSITORY` is being commited or not.
          expect(secondCall[0]).toEqual(RepositoryDetailMutations.SET_REPOSITORY)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.repository)
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
            $fetchGraphqlData(): Promise<Error> {
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_WIDGETS].call(localThis, actionCxt, {
            owner: 'deepsourcelabs',
            provider: 'gh',
            name: 'asgard'
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(RepositoryDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RepositoryDetailActions.FETCH_REPOSITORY_ID}"`, () => {
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
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<unknown> {
              const repositoryId = mockRepositoryDetailState().repository.id
              return Promise.resolve({ data: { repository: { id: repositoryId } } })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_REPOSITORY_ID].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'asgard'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_REPOSITORY}`, async () => {
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `OwnerDetailMutations.SET_REPOSITORY` is being commited or not
          expect(commit).toHaveBeenCalledWith(
            RepositoryDetailMutations.SET_REPOSITORY,
            apiResponse.data.repository
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
            $getGQLAfter: jest.fn(),
            $logErrorAndToast: jest.fn(),
            $fetchGraphqlData(): Promise<Error> {
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_REPOSITORY_ID].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'asgard'
          })
        })

        test(`successfully invokes $logErrorAndToast plugin`, () => {
          expect(localThis.$logErrorAndToast).toHaveBeenCalledWith(
            Error('ERR1'),
            'There was an error while fetching the repository id.'
          )
        })
      })
    })

    describe(`Action "${RepositoryDetailActions.FETCH_REPOSITORY_DETAIL}"`, () => {
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
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: { repository: mockRepositoryDetailState().repository }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_REPOSITORY_DETAIL].call(
            localThis,
            actionCxt,
            {
              provider: 'gh',
              owner: 'deepsourcelabs',
              name: 'asgard',
              lastDays: 15
            }
          )
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_REPOSITORY}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RepositoryDetailMutations.SET_REPOSITORY` is being commited or not.
          expect(secondCall[0]).toEqual(RepositoryDetailMutations.SET_REPOSITORY)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.repository)
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
            $fetchGraphqlData(): Promise<Error> {
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_REPOSITORY_DETAIL].call(
            localThis,
            actionCxt,
            {
              provider: 'gh',
              owner: 'deepsourcelabs',
              name: 'asgard',
              lastDays: 15
            }
          )
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(RepositoryDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_GENERAL}"`, () => {
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
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: { repository: mockRepositoryDetailStateForSettingsGeneral().repository }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_GENERAL].call(
            localThis,
            actionCxt,
            {
              provider: 'gh',
              owner: 'deepsourcelabs',
              name: 'asgard',
              q: 'string',
              limit: 10,
              currentPageNumber: 2
            }
          )
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_REPOSITORY}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RepositoryDetailMutations.SET_REPOSITORY` is being commited or not.
          expect(secondCall[0]).toEqual(RepositoryDetailMutations.SET_REPOSITORY)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.repository)
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
            $fetchGraphqlData(): Promise<Error> {
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_GENERAL].call(
            localThis,
            actionCxt,
            {
              provider: 'gh',
              owner: 'deepsourcelabs',
              name: 'asgard',
              q: 'string',
              limit: 10,
              currentPageNumber: 2
            }
          )
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(RepositoryDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_MANAGE_ACCESS}"`, () => {
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
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: {
                  repository: mockRepositoryDetailStateForSettingsManageAccess().repository
                }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_MANAGE_ACCESS].call(
            localThis,
            actionCxt,
            {
              provider: 'gh',
              owner: 'deepsourcelabs',
              name: 'asgard',
              q: 'string',
              limit: 10,
              currentPageNumber: 2,
              refetch: true
            }
          )
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_REPOSITORY}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RepositoryDetailMutations.SET_REPOSITORY` is being commited or not.
          expect(secondCall[0]).toEqual(RepositoryDetailMutations.SET_REPOSITORY)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.repository)
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
            $fetchGraphqlData(): Promise<Error> {
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_MANAGE_ACCESS].call(
            localThis,
            actionCxt,
            {
              provider: 'gh',
              owner: 'deepsourcelabs',
              name: 'asgard',
              q: 'string',
              limit: 10,
              currentPageNumber: 2,
              refetch: true
            }
          )
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(RepositoryDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_IGNORE_RULES}"`, () => {
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
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: { repository: mockRepositoryDetailStateForSettingsIgnoreRules().repository }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_IGNORE_RULES].call(
            localThis,
            actionCxt,
            {
              provider: 'gh',
              owner: 'deepsourcelabs',
              name: 'asgard',
              limit: 10,
              currentPageNumber: 2
            }
          )
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_REPOSITORY}`, async () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RepositoryDetailMutations.SET_REPOSITORY` is being commited or not.
          expect(secondCall[0]).toEqual(RepositoryDetailMutations.SET_REPOSITORY)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.repository)
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
            $fetchGraphqlData(): Promise<Error> {
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_IGNORE_RULES].call(
            localThis,
            actionCxt,
            {
              provider: 'gh',
              owner: 'deepsourcelabs',
              name: 'asgard',
              limit: 10,
              currentPageNumber: 2
            }
          )
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_ERROR}`, () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_ERROR` is being commited or firstCallnot.
          expect(secondCall[0]).toEqual(RepositoryDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_SSH}"`, () => {
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
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: { repository: mockRepositoryDetailStateForSettingsSsh().repository }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_SSH].call(
            localThis,
            actionCxt,
            {
              id: 'string'
            }
          )
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_REPOSITORY}`, async () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RepositoryDetailMutations.SET_REPOSITORY` is being commited or not.
          expect(secondCall[0]).toEqual(RepositoryDetailMutations.SET_REPOSITORY)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.repository)
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
            $fetchGraphqlData(): Promise<Error> {
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_SSH].call(
            localThis,
            actionCxt,
            {
              id: 'string'
            }
          )
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(RepositoryDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_AUDIT_LOGS}"`, () => {
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
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: { repository: mockRepositoryDetailStateForSettingsGeneral().repository }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_AUDIT_LOGS].call(
            localThis,
            actionCxt,
            {
              provider: 'gh',
              owner: 'deepsourcelabs',
              name: 'asgard'
            }
          )
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_REPOSITORY}`, async () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RepositoryDetailMutations.SET_REPOSITORY` is being commited or not.
          expect(secondCall[0]).toEqual(RepositoryDetailMutations.SET_REPOSITORY)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.repository)
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
            $fetchGraphqlData(): Promise<Error> {
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_REPOSITORY_SETTINGS_AUDIT_LOGS].call(
            localThis,
            actionCxt,
            {
              provider: 'gh',
              owner: 'deepsourcelabs',
              name: 'asgard'
            }
          )
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_LOADING}`, () => {
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepositoryDetailMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepositoryDetailMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_ERROR}`, () => {
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RepositoryDetailMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(RepositoryDetailMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RepositoryDetailActions.COMMIT_CONFIG_TO_VCS}"`, () => {
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
            $getGQLAfter: jest.fn(),
            $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
              return Promise.resolve({ data: { commitConfigToVcs: { ok: true } } })
            }
          }

          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')

          await actions[RepositoryDetailActions.COMMIT_CONFIG_TO_VCS].call(localThis, actionCxt, {
            repositoryId: 'string',
            config: 'string'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })
      })
    })

    describe(`Action "${RepositoryDetailActions.FETCH_METRICS}"`, () => {
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
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: { repository: mockRepositoryDetailStateForMetrics().repository }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_METRICS].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'marvin-python'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          // Loading and Metrics mutation
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${RepositoryDetailMutations.SET_REPOSITORY}`, async () => {
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RepositoryDetailMutations.SET_REPOSITORY` is being commited or not.
          expect(firstCall[0]).toEqual(RepositoryDetailMutations.SET_REPOSITORY)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(firstCall[1]).toEqual(apiResponse.data.repository)
        })
      })

      describe(`Failure`, () => {
        beforeEach(() => {
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
              return Promise.reject(new Error('ERR1'))
            },
            async $logErrorAndToast(): Promise<void> {}
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$logErrorAndToast')
        })

        test(`successfully throws an error`, async () => {
          try {
            await actions[RepositoryDetailActions.FETCH_METRICS].call(localThis, actionCxt, {
              provider: 'gh',
              owner: 'deepsourcelabs',
              name: 'demo-python'
            })
          } catch (e) {
            expect(spy).toHaveBeenCalledTimes(1)
          }
        })
      })
    })

    describe(`Action "${RepositoryDetailActions.FETCH_METRIC}"`, () => {
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
            $getGQLAfter: jest.fn(),
            $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return Promise.resolve({
                data: { repository: mockRepositoryDetailStateForMetrics().repository }
              })
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[RepositoryDetailActions.FETCH_METRIC].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'demo-python',
            shortcode: 'TCV',
            lastDays: 30
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test(`successfully returns mutation ${RepositoryDetailMutations.SET_REPOSITORY}`, async () => {
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if the response from api is same as the one passed to the mutation.
          expect(apiResponse.data.repository).toEqual(
            mockRepositoryDetailStateForMetrics().repository
          )
        })
      })

      describe(`Failure`, () => {
        beforeEach(() => {
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
              return Promise.reject(new Error('ERR1'))
            },
            async $logErrorAndToast(): Promise<void> {}
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$logErrorAndToast')
        })

        test(`successfully throws an error`, async () => {
          try {
            await actions[RepositoryDetailActions.FETCH_METRIC].call(localThis, actionCxt, {
              provider: 'gh',
              owner: 'deepsourcelabs',
              name: 'demo-python',
              shortcode: 'TCV',
              lastDays: 30
            })
          } catch (e) {
            expect(spy).toHaveBeenCalledTimes(1)
            expect(e).toEqual(new Error('ERR1'))
          }
        })
      })
    })

    describe(`Action "${RepositoryDetailActions.SET_METRIC_THRESHOLD}"`, () => {
      describe(`Success`, () => {
        beforeEach(() => {
          localThis = {
            $providerMetaMap: {
              gh: {
                text: 'Github',
                shortcode: 'gh',
                value: 'GITHUB'
              }
            },
            $getGQLAfter: jest.fn(),
            $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
              return Promise.resolve({ data: { updateRepoMetricThreshold: { ok: true } } })
            }
          }

          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')
        })

        test('successfully calls the api', async () => {
          await actions[RepositoryDetailActions.SET_METRIC_THRESHOLD].call(localThis, actionCxt, {
            metricShortcode: 'DCV',
            repositoryId: 'UmVwb3NpdG9yeTp6ZG95eWI',
            thresholdValue: 55,
            key: 'Python'
          })

          expect(spy).toHaveBeenCalledTimes(1)
        })

        test(`successfully returns action ${RepositoryDetailActions.SET_METRIC_THRESHOLD} result`, async () => {
          const apiResponse = await actions[RepositoryDetailActions.SET_METRIC_THRESHOLD].call(
            localThis,
            actionCxt,
            {
              metricShortcode: 'DCV',
              repositoryId: 'UmVwb3NpdG9yeTp6ZG95eWI',
              thresholdValue: 55,
              key: 'Python'
            }
          )

          expect(apiResponse.data.updateRepoMetricThreshold?.ok).toBeTruthy()
        })
      })

      describe(`Failure`, () => {
        beforeEach(() => {
          localThis = {
            $providerMetaMap: {
              gh: {
                text: 'Github',
                shortcode: 'gh',
                value: 'GITHUB'
              }
            },
            $getGQLAfter: jest.fn(),
            $applyGraphqlMutation(): Promise<Error> {
              return Promise.reject(new Error('ERR1'))
            }
          }

          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')
        })

        test(`successfully throws an error`, async () => {
          try {
            await actions[RepositoryDetailActions.SET_METRIC_THRESHOLD].call(localThis, actionCxt, {
              metricShortcode: 'DCV',
              repositoryId: 'UmVwb3NpdG9yeTp6ZG95eWI',
              thresholdValue: 55,
              key: 'Python'
            })
          } catch (e) {
            // Assert if the payload passed to the mutation was empty.
            expect(e).toEqual(Error('ERR1'))
          }
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
    describe(`Mutation "${RepositoryDetailMutations.SET_LOADING}"`, () => {
      test('successfully updates loading field in state', () => {
        mutations[RepositoryDetailMutations.SET_LOADING](repositoryDetailState, true)
        expect(repositoryDetailState.loading).toEqual(true)
      })
    })

    describe(`Mutation "${RepositoryDetailMutations.SET_ERROR}"`, () => {
      test('successfully updates loading field in state', () => {
        const dummyError = {
          graphQLErrors: {
            message: 'Dummy error',
            locations: [],
            path: []
          }
        }
        mutations[RepositoryDetailMutations.SET_ERROR](repositoryDetailState, dummyError)
        expect(repositoryDetailState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${RepositoryDetailMutations.SET_REPOSITORY}"`, () => {
      beforeEach(() => {
        repositoryDetailState.repository = {} as Repository
      })
      test('successfully adds new repository detail to the state', () => {
        const newRepo: Repository = {
          id: 'DUMMY_OWNER_ID',
          name: 'asgard'
        } as Repository

        mutations[RepositoryDetailMutations.SET_REPOSITORY](repositoryDetailState, newRepo)
        expect(repositoryDetailState.repository).toEqual(newRepo)
      })

      test('successfully appends data', () => {
        const newRepo: Repository = mockRepositoryDetailState().repository as Repository

        // Change repo name
        if (newRepo.name) {
          newRepo.name = 'bifrost'
        }
        mutations[RepositoryDetailMutations.SET_REPOSITORY](repositoryDetailState, newRepo)
        expect(repositoryDetailState.repository.name).toEqual(newRepo.name)
      })
    })
  })
})
