import { state, mutations, actions, MUT_SET_ERROR, MUT_SET_LOADING, RunDetailActionContext, RunDetailModuleState, ACT_FETCH_RUN, MUT_SET_RUN, ACT_FETCH_AUTOFIXABLE_ISSUES, ACT_FETCH_CONCRETE_ISSUE_LIST, MUT_SET_CONCRETE_ISSUE_LIST } from '~/store/run/detail';
import { mockRepositoryDetailStateForAutofixableIssues, mockRunDetailState, mockRunDetailStateForConcreteIssueList } from './__mocks__/detail.mock';
import { Check, IssueConnection, IssueEdge, Maybe, PageInfo } from '~/types/types';
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types';

let actionCxt: RunDetailActionContext;
let commit: jest.Mock;
let localThis: any;
let spy: jest.SpyInstance;
let runDetailState: RunDetailModuleState;

describe('[Store] Run/Detail', () => {
  beforeEach(() => {
    commit = jest.fn();
    runDetailState = mockRunDetailState();

    actionCxt = {
      state: runDetailState,
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
      expect(initState.run).toEqual({});
      expect(initState.concreteIssueList).toEqual({
        edges: [],
        pageInfo: {}
      });
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    describe(`Action "${ACT_FETCH_RUN}"`, () => {
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
                resolve({ data: { check: mockRunDetailState().run } })
              );
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[ACT_FETCH_RUN].call(localThis, actionCxt, {
            checkId: 'string'
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

        test(`successfully commits mutation ${MUT_SET_RUN}`, async () => {
          const { mock: { calls: [, secondCall,] } } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `MUT_SET_RUN` is being commited or not.
          expect(secondCall[0]).toEqual(MUT_SET_RUN)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.check)
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
            async $fetchGraphqlData(): Promise<Error> {
              return new Promise<Error>((resolve, reject) =>
                reject(new Error('ERR1'))
              );
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[ACT_FETCH_RUN].call(localThis, actionCxt, {
            checkId: 'string'
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

    describe(`Action "${ACT_FETCH_AUTOFIXABLE_ISSUES}"`, () => {
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
                resolve({ data: { check: mockRepositoryDetailStateForAutofixableIssues().run } })
              );
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[ACT_FETCH_AUTOFIXABLE_ISSUES].call(localThis, actionCxt, {
            checkId: 'string'
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

        test(`successfully commits mutation ${MUT_SET_RUN}`, async () => {
          const { mock: { calls: [, secondCall,] } } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `MUT_SET_RUN` is being commited or not.
          expect(secondCall[0]).toEqual(MUT_SET_RUN)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.check)
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

          await actions[ACT_FETCH_AUTOFIXABLE_ISSUES].call(localThis, actionCxt, {
            checkId: 'string'
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

    describe(`Action "${ACT_FETCH_CONCRETE_ISSUE_LIST}"`, () => {
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
                resolve({ data: { check: mockRunDetailStateForConcreteIssueList().run } })
              );
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[ACT_FETCH_CONCRETE_ISSUE_LIST].call(localThis, actionCxt, {
            checkId: 'string',
            sort: 'string',
            issueType: 'string',
            limit: 10,
            currentPageNumber: 2
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

        test(`successfully commits mutation ${MUT_SET_CONCRETE_ISSUE_LIST}`, async () => {
          const { mock: { calls: [, secondCall,] } } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `MUT_SET_CONCRETE_ISSUE_LIST` is being commited or not.
          expect(secondCall[0]).toEqual(MUT_SET_CONCRETE_ISSUE_LIST)

          // Assert if the response from api is same as the one passed to the mutation.
          expect(secondCall[1]).toEqual(apiResponse.data.check.concreteIssues)
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

          await actions[ACT_FETCH_CONCRETE_ISSUE_LIST].call(localThis, actionCxt, {
            checkId: 'string',
            sort: 'string',
            issueType: 'string',
            limit: 10,
            currentPageNumber: 2
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
        mutations[MUT_SET_LOADING](runDetailState, true)
        expect(runDetailState.loading).toEqual(true)
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
        mutations[MUT_SET_ERROR](runDetailState, dummyError)
        expect(runDetailState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${MUT_SET_RUN}"`, () => {
      beforeEach(() => {
        runDetailState.run = {} as Check;
      })
      test('successfully adds new run detail to the state', () => {
        const newRun: Check = {
          id: 'string',
          status: 'FAIL'
        } as Check

        mutations[MUT_SET_RUN](runDetailState, newRun)
        expect(runDetailState.run).toEqual(newRun)
      })

      test('successfully appends data', () => {
        const newRun: Check = mockRunDetailState().run as Check;

        if (newRun.id) {
          newRun.id = 'new_id'
        }
        mutations[MUT_SET_RUN](runDetailState, newRun)
        expect(runDetailState.run.id).toEqual(newRun.id)
      })
    })

    describe(`Mutation "${MUT_SET_CONCRETE_ISSUE_LIST}"`, () => {
      beforeEach(() => {
        runDetailState.concreteIssueList = {} as IssueConnection;
      })
      test('successfully adds new run detail to the state', () => {
        const newConcreteIssueList: IssueConnection = {
          pageInfo: {} as PageInfo,
          edges: [
            {
              node: {
                id: "string",
                title: "Dummy concrete issue"
              }
            }
          ] as Array<Maybe<IssueEdge>>
        } as IssueConnection

        mutations[MUT_SET_CONCRETE_ISSUE_LIST](runDetailState, newConcreteIssueList)
        expect(runDetailState.concreteIssueList).toEqual(newConcreteIssueList)
      })

      test('successfully appends data', () => {
        const newConcreteIssueList: IssueConnection = mockRunDetailStateForConcreteIssueList().concreteIssueList as IssueConnection;

        if (newConcreteIssueList.edges[0]?.node?.issueType) {
          newConcreteIssueList.edges[0].node.issueType = 'antipattern'
        }
        mutations[MUT_SET_CONCRETE_ISSUE_LIST](runDetailState, newConcreteIssueList)
        expect(runDetailState.concreteIssueList.edges[0]?.node?.issueType).toEqual(newConcreteIssueList.edges[0]?.node?.issueType)
      })
    })
  })
});
