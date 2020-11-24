import { state, mutations, actions, MUT_SET_ERROR, MUT_SET_LOADING, IssueListModuleState, IssueListActionContext, ACT_FETCH_ISSUE_LIST, MUT_SET_ISSUE_LIST } from '~/store/issue/list';
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types';
import { mockIssueListState } from './__mocks__/list.mock';
import { Repository, RepositoryIssueConnection } from '~/types/types';

let issueListState: IssueListModuleState;
let actionCxt: IssueListActionContext;
let spy: jest.SpyInstance;
let commit: jest.Mock;
let localThis: any;

describe('[Store] Issue/List', () => {
  beforeEach(() => {
    issueListState = mockIssueListState();
    commit = jest.fn();

    actionCxt = {
      rootGetters: jest.fn(),
      state: issueListState,
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
      expect(initState.issueList).toEqual({
        pageInfo: {},
        edges: []
      });
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    describe(`Action "${ACT_FETCH_ISSUE_LIST}"`, () => {
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
            async $fetchGraphqlData(): Promise<GraphqlQueryResponse> {
              return new Promise<GraphqlQueryResponse>(resolve =>
                resolve({ data: { repository: <Repository>{ issue: {} } } })
              );
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[ACT_FETCH_ISSUE_LIST].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'asgard',
            currentPageNumber: 2,
            limit: 5,
            issueType: 'style',
            analyzer: 'python',
            sort: '',
            q: ''
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

        test(`successfully commits mutation ${MUT_SET_ISSUE_LIST}`, async () => {
          const { mock: { calls: [, secondCall,] } } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `MUT_SET_ISSUE_LIST` is being commited or not.
          expect(secondCall[0]).toEqual(MUT_SET_ISSUE_LIST)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.repository.issues)
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

          await actions[ACT_FETCH_ISSUE_LIST].call(localThis, actionCxt, {
            provider: 'gh',
            owner: 'deepsourcelabs',
            name: 'asgard',
            currentPageNumber: 2,
            limit: 5,
            issueType: 'style',
            analyzer: 'python',
            sort: '',
            q: ''
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
        mutations[MUT_SET_LOADING](issueListState, true)
        expect(issueListState.loading).toEqual(true)
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
        mutations[MUT_SET_ERROR](issueListState, dummyError)
        expect(issueListState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${MUT_SET_ISSUE_LIST}"`, () => {
      beforeEach(() => {
        issueListState.issueList = {} as RepositoryIssueConnection;
      })
      test('successfully adds new issue list to the state', () => {
        const newIssueList: RepositoryIssueConnection = {
          totalCount: 10,
          edges: [{
            "node": {
              "id": "UmVwb3NpdG9yeUlzc3VlOjIyMDE=",
              "issueType": "bug-risk",
              "title": "Protected member accessed from outside outside the class",
              "shortcode": "PYL-W0212",
              "description": "Accessing a protected member (a member prefixed with `_`) of a class from outside that class is not recommended, since the creator of that class did not intend this member to be exposed. If accesing this attribute outside of the class is absolutely needed, refactor it such that it becomes part of the public interface of the class.",
              "occurrenceCount": 8,
              "createdAt": "2020-02-29T07:06:11.659776+00:00",
              "analyzerName": "Python",
              "analyzerLogo": "https://s3.us-east-1.amazonaws.com/local-asgard-static/analyzer_logos/python.svg",
              "seenIn": "core/models/base.py, core/models/job.py and 2 other files",
              "firstSeen": "2020-02-29T07:06:11.659776+00:00",
              "lastSeen": "2020-07-09T08:55:25.934225+00:00",
              "pastValue": 8,
              "autofixAvailable": false
            }
          }]
        } as RepositoryIssueConnection

        mutations[MUT_SET_ISSUE_LIST](issueListState, newIssueList)
        expect(issueListState.issueList).toEqual(newIssueList)
      })

      test('successfully appends data', () => {
        const newIssueList: RepositoryIssueConnection = mockIssueListState().issueList as RepositoryIssueConnection;

        if (newIssueList.edges[0]?.node?.issueType) {
          newIssueList.edges[0].node.issueType = "antipattern"
        }
        mutations[MUT_SET_ISSUE_LIST](issueListState, newIssueList)
        expect(issueListState.issueList.edges[0]?.node?.issueType).toEqual(newIssueList.edges[0]?.node?.issueType)
      })
    })
  })
});
