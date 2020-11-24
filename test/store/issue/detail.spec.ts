import { state, mutations, actions, MUT_SET_ERROR, MUT_SET_LOADING, IssueDetailModuleState, IssueDetailActionContext, ACT_FETCH_ISSUE, MUT_SET_ISSUE } from '~/store/issue/detail';
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types';
import { mockIssueDetailState } from './__mocks__/detail.mock';
import { Repository, RepositoryIssue } from '~/types/types';

let issueDetailState: IssueDetailModuleState;
let actionCxt: IssueDetailActionContext;
let spy: jest.SpyInstance;
let commit: jest.Mock;
let localThis: any;

describe('[Store] Issue/Detail', () => {
  beforeEach(() => {
    issueDetailState = mockIssueDetailState();
    commit = jest.fn();

    actionCxt = {
      rootGetters: jest.fn(),
      state: issueDetailState,
      dispatch: jest.fn(),
      getters: jest.fn(),
      rootState: {},
      commit
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
      expect(initState.issue).toEqual({});
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    describe(`Action "${ACT_FETCH_ISSUE}"`, () => {
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
              return new Promise<GraphqlQueryResponse>(resolve =>
                resolve({ data: { repository: <Repository>{ issue: {} } } })
              );
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[ACT_FETCH_ISSUE].call(localThis, actionCxt, {
            repositoryId: 'string',
            shortcode: 'string'
          })
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1);
        })

        test('successfully commits mutations', async () => {
          expect(commit).toHaveBeenCalledTimes(3);
        })

        test(`successfully commits mutation ${MUT_SET_LOADING}`, async () => {
          const { mock: { calls: [firstCall, , thirdCall] } } = commit

          // Assert if `MUT_SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(MUT_SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `MUT_SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(MUT_SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${MUT_SET_ISSUE}`, async () => {
          const { mock: { calls: [, secondCall,] } } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `MUT_SET_ISSUE` is being commited or not.
          expect(secondCall[0]).toEqual(MUT_SET_ISSUE)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.repository.issue)
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

          await actions[ACT_FETCH_ISSUE].call(localThis, actionCxt, {
            repositoryId: 'string',
            shortcode: 'string'
          })
        })

        test('successfully commits mutations', async () => {
          expect(commit).toHaveBeenCalledTimes(3);
        })

        test(`successfully commits mutation ${MUT_SET_LOADING}`, async () => {
          const { mock: { calls: [firstCall, , thirdCall] } } = commit

          // Assert if `MUT_SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(MUT_SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `MUT_SET_LOADING` is being commited or not.
          expect(thirdCall[0]).toEqual(MUT_SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(thirdCall[1]).toEqual(false)
        })

        test(`successfully commits mutation ${MUT_SET_ERROR}`, async () => {
          const { mock: { calls: [, secondCall,] } } = commit

          // Assert if `MUT_SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(MUT_SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error("ERR1"))
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
        mutations[MUT_SET_LOADING](issueDetailState, true)
        expect(issueDetailState.loading).toEqual(true)
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
        mutations[MUT_SET_ERROR](issueDetailState, dummyError)
        expect(issueDetailState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${MUT_SET_ISSUE}"`, () => {
      beforeEach(() => {
        issueDetailState.issue = {} as RepositoryIssue;
      })
      test('successfully adds new issue to the state', () => {
        const newIssueDetail: RepositoryIssue = {
          issueType: "style",
          shortcode: "PYL-C0412"
        } as RepositoryIssue

        mutations[MUT_SET_ISSUE](issueDetailState, newIssueDetail)
        expect(issueDetailState.issue).toEqual(newIssueDetail)
      })

      test('successfully appends data', () => {
        const newIssueDetail: RepositoryIssue = mockIssueDetailState().issue as RepositoryIssue;

        if (newIssueDetail.description) {
          newIssueDetail.description = "New dummy description"
        }
        mutations[MUT_SET_ISSUE](issueDetailState, newIssueDetail)
        expect(issueDetailState.issue.description).toEqual(newIssueDetail.description)
      })
    })
  })
});
