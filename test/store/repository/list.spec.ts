import {
  RepoListActions,
  RepoListMutations,
  RepositoryListActionContext,
  RepositoryListModuleState,
  actions,
  mutations,
  state
} from '~/store/repository/list'
import { Owner, PageInfo, RepositoryConnection } from '~/types/types'
import { resolveNodes } from '~/utils/array'
import { mockRepositoryListState } from './__mocks__/list.mock'

let actionCxt: RepositoryListActionContext
let commit: jest.Mock
let localThis: any
let spy: jest.SpyInstance
let repositoryListState: RepositoryListModuleState

describe('[Store] Repository/List', () => {
  beforeEach(() => {
    commit = jest.fn()
    repositoryListState = mockRepositoryListState()

    actionCxt = {
      state: repositoryListState,
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
      expect(initState.repositoryList.edges).toEqual([])
      expect(initState.repositoryList.totalCount).toEqual(0)
      expect(initState.repositoryList.pageInfo).toEqual({})
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    describe(`Action "${RepoListActions.FETCH_REPOSITORY_LIST}"`, () => {
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
            $fetchGraphqlData(): Promise<{ data: { owner: Owner } }> {
              return new Promise<{ data: { owner: Owner } }>((resolve) =>
                setTimeout(
                  () =>
                    resolve({
                      data: {
                        owner: <Owner>{
                          repositories: mockRepositoryListState().repositoryList
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

          await actions[RepoListActions.FETCH_REPOSITORY_LIST].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh',
            limit: 10,
            query: '',
            currentPageNumber: 1
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepoListMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepoListMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepoListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepoListMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepoListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepoListMutations.SET_REPOSITORY_LIST}`, async () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RepoListMutations.SET_ISSUE_TYPE_SETTING` is being commited or not.
          expect(secondCall[0]).toEqual(RepoListMutations.SET_REPOSITORY_LIST)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.owner.repositories)
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

          await actions[RepoListActions.FETCH_REPOSITORY_LIST].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh',
            limit: 10,
            query: '',
            currentPageNumber: 1
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepoListMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepoListMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepoListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepoListMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepoListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepoListMutations.SET_ERROR}`, () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RepoListMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(RepoListMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RepoListActions.FETCH_PENDING_ADHOC_REPOSITORY_LIST}"`, () => {
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
            $fetchGraphqlData(): Promise<{ data: { owner: Owner } }> {
              return new Promise<{ data: { owner: Owner } }>((resolve) =>
                setTimeout(
                  () =>
                    resolve({
                      data: {
                        owner: <Owner>{
                          repositories: mockRepositoryListState().repositoryList
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

          await actions[RepoListActions.FETCH_PENDING_ADHOC_REPOSITORY_LIST].call(
            localThis,
            actionCxt,
            {
              login: 'deepsourcelabs',
              provider: 'gh'
            }
          )
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${RepoListMutations.SET_ADHOC_RUN_REPOS}`, async () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RepoListMutations.SET_ISSUE_TYPE_SETTING` is being commited or not.
          expect(firstCall[0]).toEqual(RepoListMutations.SET_ADHOC_RUN_REPOS)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(firstCall[1]).toEqual(apiResponse.data.owner.repositories)
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

          await actions[RepoListActions.FETCH_PENDING_ADHOC_REPOSITORY_LIST].call(
            localThis,
            actionCxt,
            {
              login: 'deepsourcelabs',
              provider: 'gh'
            }
          )
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${RepoListMutations.SET_ERROR}`, () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit

          // Assert if `RepoListMutations.SET_ERROR` is being commited or not.
          expect(firstCall[0]).toEqual(RepoListMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(firstCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RepoListActions.FETCH_NEW_REPOSITORY_LIST}"`, () => {
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
            $fetchGraphqlData(): Promise<{ data: { owner: Owner } }> {
              return new Promise<{ data: { owner: Owner } }>((resolve) =>
                setTimeout(
                  () =>
                    resolve({
                      data: {
                        owner: <Owner>{
                          repositories: mockRepositoryListState().repositoryList
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

          await actions[RepoListActions.FETCH_NEW_REPOSITORY_LIST].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh',
            limit: 10,
            query: '',
            currentPageNumber: 1
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepoListMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepoListMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepoListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepoListMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepoListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepoListMutations.SET_NEW_REPOSITORY_LIST}`, async () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RepoListMutations.SET_ISSUE_TYPE_SETTING` is being commited or not.
          expect(secondCall[0]).toEqual(RepoListMutations.SET_NEW_REPOSITORY_LIST)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.owner.repositories)
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

          await actions[RepoListActions.FETCH_NEW_REPOSITORY_LIST].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh',
            limit: 10,
            query: '',
            currentPageNumber: 1
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepoListMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepoListMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepoListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepoListMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepoListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepoListMutations.SET_ERROR}`, () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RepoListMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(RepoListMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RepoListActions.FETCH_ACTIVE_REPOSITORY_LIST}"`, () => {
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
            $fetchGraphqlData(): Promise<{ data: { owner: Owner } }> {
              return new Promise<{ data: { owner: Owner } }>((resolve) =>
                setTimeout(
                  () =>
                    resolve({
                      data: {
                        owner: <Owner>{
                          repositories: mockRepositoryListState().repositoryList
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

          await actions[RepoListActions.FETCH_ACTIVE_REPOSITORY_LIST].call(localThis, actionCxt, {
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

        test(`successfully commits mutation ${RepoListMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepoListMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepoListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepoListMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepoListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepoListMutations.SET_NEW_REPOSITORY_LIST}`, async () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RepoListMutations.SET_ISSUE_TYPE_SETTING` is being commited or not.
          expect(secondCall[0]).toEqual(RepoListMutations.SET_ACTIVE_REPOSITORY_LIST)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.owner.repositories)
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

          await actions[RepoListActions.FETCH_ACTIVE_REPOSITORY_LIST].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(3)
        })

        test(`successfully commits mutation ${RepoListMutations.SET_LOADING}`, () => {
          // Storing the first commit call made
          const {
            mock: {
              calls: [firstCall, , thirdCall]
            }
          } = commit

          // Assert if `RepoListMutations.SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(RepoListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `RepoListMutations.SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(RepoListMutations.SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${RepoListMutations.SET_ERROR}`, () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [, secondCall]
            }
          } = commit

          // Assert if `RepoListMutations.SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(RepoListMutations.SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error('ERR1'))
        })
      })
    })

    describe(`Action "${RepoListActions.FETCH_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS}"`, () => {
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
            $fetchGraphqlData(): Promise<{ data: { owner: Owner } }> {
              return new Promise<{ data: { owner: Owner } }>((resolve) =>
                setTimeout(
                  () =>
                    resolve({
                      data: {
                        owner: <Owner>{
                          repositories: mockRepositoryListState().repositoryList
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

          await actions[RepoListActions.FETCH_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS].call(
            localThis,
            actionCxt,
            {
              login: 'deepsourcelabs',
              provider: 'gh'
            }
          )
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1)
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${RepoListMutations.SET_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS}`, async () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `RepoListMutations.SET_ISSUE_TYPE_SETTING` is being commited or not.
          expect(firstCall[0]).toEqual(RepoListMutations.SET_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(firstCall[1]).toEqual(apiResponse.data.owner.repositories)
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

          await actions[RepoListActions.FETCH_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS].call(
            localThis,
            actionCxt,
            {
              login: 'deepsourcelabs',
              provider: 'gh'
            }
          )
        })

        test('successfully commits mutations', () => {
          expect(commit).toHaveBeenCalledTimes(1)
        })

        test(`successfully commits mutation ${RepoListMutations.SET_ERROR}`, () => {
          // Storing the second commit call made
          const {
            mock: {
              calls: [firstCall]
            }
          } = commit

          // Assert if `RepoListMutations.SET_ERROR` is being commited or not.
          expect(firstCall[0]).toEqual(RepoListMutations.SET_ERROR)

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
    describe(`Mutation "${RepoListMutations.SET_LOADING}"`, () => {
      test('successfully updates loading field in state', () => {
        mutations[RepoListMutations.SET_LOADING](repositoryListState, true)
        expect(repositoryListState.loading).toEqual(true)
      })
    })

    describe(`Mutation "${RepoListMutations.SET_ERROR}"`, () => {
      test('successfully updates loading field in state', () => {
        const dummyError = {
          graphQLErrors: {
            message: 'Dummy error',
            locations: [],
            path: []
          }
        }
        mutations[RepoListMutations.SET_ERROR](repositoryListState, dummyError)
        expect(repositoryListState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${RepoListMutations.SET_REPOSITORY_LIST}"`, () => {
      test('successfully adds new list of active repositories to the state', () => {
        const repositoryList: RepositoryConnection = {
          __typename: 'RepositoryConnection',
          pageInfo: {} as PageInfo,
          totalCount: 2,
          edges: []
        }

        mutations[RepoListMutations.SET_REPOSITORY_LIST](repositoryListState, repositoryList)
        expect(repositoryListState.repositoryList).toEqual(repositoryList)
      })

      test('successfully appends data', () => {
        const { repositoryList: newRepositoryList } = mockRepositoryListState()

        mutations[RepoListMutations.SET_REPOSITORY_LIST](repositoryListState, newRepositoryList)
        expect(repositoryListState.repositoryList).toEqual(newRepositoryList)
      })
    })

    describe(`Mutation "${RepoListMutations.SET_NEW_REPOSITORY_LIST}"`, () => {
      test('successfully adds new list of inactive repositories to the state', () => {
        const repositoryList: RepositoryConnection = {
          __typename: 'RepositoryConnection',
          pageInfo: {} as PageInfo,
          totalCount: 2,
          edges: []
        }

        mutations[RepoListMutations.SET_NEW_REPOSITORY_LIST](repositoryListState, repositoryList)
        expect(repositoryListState.newRepos).toEqual(repositoryList)
      })

      test('successfully appends data', () => {
        const { newRepos: newRepositoryList } = mockRepositoryListState()

        mutations[RepoListMutations.SET_NEW_REPOSITORY_LIST](repositoryListState, newRepositoryList)
        expect(repositoryListState.newRepos).toEqual(newRepositoryList)
      })
    })

    describe(`Mutation "${RepoListMutations.SET_ACTIVE_REPOSITORY_LIST}"`, () => {
      test('successfully adds the list of recently active repositories to the state', () => {
        const { repositoryList } = mockRepositoryListState()

        mutations[RepoListMutations.SET_ACTIVE_REPOSITORY_LIST](repositoryListState, repositoryList)
        expect(repositoryListState.repoWithActiveAnalysis).toEqual(resolveNodes(repositoryList))
      })
    })

    describe(`Mutation "${RepoListMutations.SET_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS}"`, () => {
      test('successfully adds the list of recently active repositories with analyzers to the state', () => {
        const { repositoryList } = mockRepositoryListState()

        mutations[RepoListMutations.SET_ACTIVE_REPOSITORY_LIST_WITH_ANALYZERS](
          repositoryListState,
          repositoryList
        )
        expect(repositoryListState.repoWithActiveAnalysisWithAnalyzers).toEqual(
          resolveNodes(repositoryList)
        )
      })
    })

    describe(`Mutation "${RepoListMutations.SET_ADHOC_RUN_REPOS}"`, () => {
      test('successfully adds the list of repositories with pending ad-hoc runs to the state', () => {
        const { repositoryList } = mockRepositoryListState()

        mutations[RepoListMutations.SET_ADHOC_RUN_REPOS](repositoryListState, repositoryList)
        expect(repositoryListState.repoWithPendingAdhocRuns).toEqual(resolveNodes(repositoryList))
      })
    })
  })
})
