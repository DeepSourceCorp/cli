import { mockRepositoryListState } from './__mocks__/list.mock';
import {
  state,
  mutations,
  actions,
  RepositoryListActionContext,
  RepositoryListModuleState,
  MUT_SET_LOADING, MUT_SET_ERROR, ACT_FETCH_REPOSITORY_LIST, MUT_SET_REPOSITORY_LIST
} from '~/store/repository/list';
import {
  Owner,
  PageInfo,
  RepositoryConnection
} from '~/types/types';

let actionCxt: RepositoryListActionContext;
let commit: jest.Mock;
let localThis: any;
let spy: jest.SpyInstance;
let repositoryListState: RepositoryListModuleState;

describe('[Store] Repository/List', () => {
  beforeEach(() => {
    commit = jest.fn();
    repositoryListState = mockRepositoryListState();

    actionCxt = {
      state: repositoryListState,
      commit,
      dispatch: jest.fn(),
      getters: jest.fn(),
      rootGetters: jest.fn(),
      rootState: {}
    };
  });

  /*
    +++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ STATE +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[State]]', () => {
    test('has the right initial data', () => {
      const initState = state()
      expect(initState.loading).toEqual(false);
      expect(initState.error).toEqual({});
      expect(initState.repositoryList.edges).toEqual([]);
      expect(initState.repositoryList.totalCount).toEqual(0);
      expect(initState.repositoryList.pageInfo).toEqual({});
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    describe(`Action "${ACT_FETCH_REPOSITORY_LIST}"`, () => {
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
            async $fetchGraphqlData(): Promise<{ data: { owner: Owner } }> {
              return new Promise<{ data: { owner: Owner } }>(resolve =>
                setTimeout(() => resolve(
                  {
                    data:
                    {
                      owner: <Owner>{
                        repositories: mockRepositoryListState().repositoryList
                      }
                    }
                  }), 10)
              );
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[ACT_FETCH_REPOSITORY_LIST].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh',
            isActivated: false,
            limit: 10,
            query: '',
            currentPageNumber: 1
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1);
        })

        test('successfully commits mutations', async () => {
          expect(commit).toHaveBeenCalledTimes(3);
        })

        test(`successfully commits mutation ${MUT_SET_LOADING}`, async () => {
          // Storing the first commit call made
          let commitCall = commit.mock.calls[0];

          // Assert if `MUT_SET_LOADING` is being commited or not.
          expect(commitCall[0]).toEqual(MUT_SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(commitCall[1]).toEqual(true)

          // Storing the third commit call made
          commitCall = commit.mock.calls[2];

          // Assert if `MUT_SET_LOADING` is being commited or not.
          expect(commitCall[0]).toEqual(MUT_SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(commitCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${MUT_SET_REPOSITORY_LIST}`, async () => {
          // Storing the second commit call made
          const commitCall = commit.mock.calls[1];
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `MUT_SET_ISSUE_TYPE_SETTING` is being commited or not.
          expect(commitCall[0]).toEqual(MUT_SET_REPOSITORY_LIST)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(commitCall[1]).toEqual(apiResponse.data.owner.repositories)
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
              return new Promise<Error>((resolve, reject) =>
                reject(new Error('ERR1'))
              );
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[ACT_FETCH_REPOSITORY_LIST].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh',
            isActivated: false,
            limit: 10,
            query: '',
            currentPageNumber: 1
          })
        })

        test('successfully commits mutations', async () => {
          expect(commit).toHaveBeenCalledTimes(3);
        })

        test(`successfully commits mutation ${MUT_SET_LOADING}`, async () => {
          // Storing the first commit call made
          let commitCall = commit.mock.calls[0];

          // Assert if `MUT_SET_LOADING` is being commited or not.
          expect(commitCall[0]).toEqual(MUT_SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(commitCall[1]).toEqual(true)

          // Storing the third commit call made
          commitCall = commit.mock.calls[2];

          // Assert if `MUT_SET_LOADING` is being commited or not.
          expect(commitCall[0]).toEqual(MUT_SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(commitCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${MUT_SET_ERROR}`, async () => {
          // Storing the second commit call made
          const commitCall = commit.mock.calls[1];

          // Assert if `MUT_SET_ERROR` is being commited or not.
          expect(commitCall[0]).toEqual(MUT_SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(commitCall[1]).toEqual(Error("ERR1"))
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
    describe(`Mutation "${MUT_SET_LOADING}"`, () => {
      test('successfully updates loading field in state', () => {
        mutations[MUT_SET_LOADING](repositoryListState, true)
        expect(repositoryListState.loading).toEqual(true)
      })
    })

    describe(`Mutation "${MUT_SET_ERROR}"`, () => {
      test('successfully updates loading field in state', () => {
        const dummyError = {
          graphQLErrors: {
            message: 'Dummy error',
            locations: [],
            path: []
          }
        }
        mutations[MUT_SET_ERROR](repositoryListState, dummyError)
        expect(repositoryListState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${MUT_SET_REPOSITORY_LIST}"`, () => {
      test('successfully adds new list of repositories to the state', () => {
        const newRepositoryList: RepositoryConnection = {
          __typename: "RepositoryConnection",
          pageInfo: {} as PageInfo,
          totalCount: 2,
          edges: []
        } as RepositoryConnection

        mutations[MUT_SET_REPOSITORY_LIST](repositoryListState, newRepositoryList)
        expect(repositoryListState.repositoryList).toEqual(newRepositoryList)
      })

      test('successfully appends data', () => {
        const newRepositoryList: RepositoryConnection = mockRepositoryListState().repositoryList as RepositoryConnection;

        // Change owner setting id
        if (newRepositoryList.totalCount) {
          newRepositoryList.totalCount = 1
        }
        mutations[MUT_SET_REPOSITORY_LIST](repositoryListState, newRepositoryList)
        expect(repositoryListState.repositoryList.totalCount).toEqual(newRepositoryList.totalCount)
      })
    })
  })
});
