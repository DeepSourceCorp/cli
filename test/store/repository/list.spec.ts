import { mockRepositoryListState } from './__mocks__/list.mock'
import {
  state,
  mutations,
  actions,
  RepositoryListActionContext,
  RepositoryListModuleState,
  RepoListActions,
  RepoListMutations
} from '~/store/repository/list'
import { Owner, PageInfo, RepositoryConnection } from '~/types/types'

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
      test('successfully adds new list of repositories to the state', () => {
        const newRepositoryList: RepositoryConnection = {
          __typename: 'RepositoryConnection',
          pageInfo: {} as PageInfo,
          totalCount: 2,
          edges: []
        } as RepositoryConnection

        mutations[RepoListMutations.SET_REPOSITORY_LIST](repositoryListState, newRepositoryList)
        expect(repositoryListState.repositoryList).toEqual(newRepositoryList)
      })

      test('successfully appends data', () => {
        const newRepositoryList: RepositoryConnection = mockRepositoryListState()
          .repositoryList as RepositoryConnection

        // Change owner setting id
        if (newRepositoryList.totalCount) {
          newRepositoryList.totalCount = 1
        }
        mutations[RepoListMutations.SET_REPOSITORY_LIST](repositoryListState, newRepositoryList)
        expect(repositoryListState.repositoryList.totalCount).toEqual(newRepositoryList.totalCount)
      })
    })
  })
})
