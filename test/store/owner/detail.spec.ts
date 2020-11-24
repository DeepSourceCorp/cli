import { mockOwnerDetail } from './__mocks__/detail.mock';
import {
  state,
  mutations,
  getters,
  actions,
  OwnerDetailModuleState,
  OwnerDetailModuleActionContext,
  GET_REFINED_ISSUE_TYPE_SETTINGS,
  ACT_SUBMIT_ISSUE_TYPE_SETTINGS,
  ACT_SET_OWNER,
  ACT_SET_ISSUE_TYPE_SETTING,
  ACT_FETCH_ISSUE_TYPE_SETTINGS,
  MUT_SET_OWNER,
  MUT_SET_ISSUE_TYPE_SETTING, MUT_SET_LOADING, MUT_SET_ERROR
} from '~/store/owner/detail';
import {
  IssueTypeSetting,
  Owner
} from '~/types/types';
import { GraphqlMutationResponse, GraphqlQueryResponse } from '~/types/apollo-graphql-types';

let actionCxt: OwnerDetailModuleActionContext;
let commit: jest.Mock;
let localThis: any;
let spy: jest.SpyInstance;
let ownerState: OwnerDetailModuleState;

describe('[Store] Owner/Details', () => {
  beforeEach(() => {
    commit = jest.fn();
    ownerState = mockOwnerDetail();

    actionCxt = {
      state: ownerState,
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
      expect(initState.owner.ownerSetting?.issueTypeSettings).toEqual([]);
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ GETTERS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Getters]]', () => {
    describe(`Getter "${GET_REFINED_ISSUE_TYPE_SETTINGS}"`, () => {
      test('returns data with equal length as issueTypeSettings', () => {
        const refinedSettings = getters[GET_REFINED_ISSUE_TYPE_SETTINGS](ownerState)
        expect(ownerState.owner.ownerSetting?.issueTypeSettings?.length).toEqual(refinedSettings.length);
      })

      test('returns data as intended', () => {
        const refinedSettings = getters[GET_REFINED_ISSUE_TYPE_SETTINGS](ownerState)

        // Should return `slug` field at same index
        expect(ownerState.owner.ownerSetting?.issueTypeSettings?.[0]?.slug).toEqual(refinedSettings[0].slug);

        // Should return `isIgnoredInCheckStatus` field at same index
        expect(ownerState.owner.ownerSetting?.issueTypeSettings?.[0]?.isIgnoredInCheckStatus).toEqual(refinedSettings[0].isIgnoredInCheckStatus);

        // Should return `isIgnoredToDisplay` field at same index
        expect(ownerState.owner.ownerSetting?.issueTypeSettings?.[0]?.isIgnoredToDisplay).toEqual(refinedSettings[0].isIgnoredToDisplay);
      })
    })
  })

  /*
    +++++++++++++++++++++++++++++++++++++++++++++++
    +++++++++++++++++++ ACTIONS +++++++++++++++++++
    +++++++++++++++++++++++++++++++++++++++++++++++
  */
  describe('[[Actions]]', () => {
    describe(`Action "${ACT_FETCH_ISSUE_TYPE_SETTINGS}"`, () => {
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
                setTimeout(() => resolve({ data: { owner: mockOwnerDetail().owner } }), 10)
              );
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[ACT_FETCH_ISSUE_TYPE_SETTINGS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
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

        test(`successfully commits mutation ${MUT_SET_OWNER}`, async () => {
          // Storing the second commit call made
          const { mock: { calls: [, secondCall,] } } = commit
          const apiResponse = await localThis.$fetchGraphqlData()

          // Assert if `MUT_SET_ISSUE_TYPE_SETTING` is being commited or not.
          expect(secondCall[0]).toEqual(MUT_SET_OWNER)

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
            async $fetchGraphqlData(): Promise<Error> {
              return new Promise<Error>((resolve, reject) =>
                reject(new Error('ERR1'))
              );
            }
          }

          // Setting the global spy on `localThis.$fetchGraphqlData`
          spy = jest.spyOn(localThis, '$fetchGraphqlData')

          await actions[ACT_FETCH_ISSUE_TYPE_SETTINGS].call(localThis, actionCxt, {
            login: 'deepsourcelabs',
            provider: 'gh'
          })
        })

        test('successfully commits mutations', async () => {
          expect(commit).toHaveBeenCalledTimes(3);
        })

        test(`successfully commits mutation ${MUT_SET_LOADING}`, async () => {
          // Storing the first commit call made
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
          // Storing the second commit call made
          const { mock: { calls: [, secondCall,] } } = commit

          // Assert if `MUT_SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(MUT_SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error("ERR1"))
        })
      })
    })

    describe(`Action "${ACT_SUBMIT_ISSUE_TYPE_SETTINGS}"`, () => {
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
            async $applyGraphqlMutation(): Promise<GraphqlMutationResponse> {
              return new Promise<GraphqlMutationResponse>(resolve =>
                setTimeout(() => resolve({ data: { updateOwnerSettings: { ok: true } } }), 10)
              );
            }
          }

          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')

          await actions[ACT_SUBMIT_ISSUE_TYPE_SETTINGS].call(localThis, actionCxt)
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1);
        })

        test('successfully commits mutations', async () => {
          expect(commit).toHaveBeenCalledTimes(2);
        })

        test(`successfully commits mutation ${MUT_SET_LOADING}`, async () => {
          // Storing the first commit call made
          const { mock: { calls: [firstCall, secondCall,] } } = commit

          // Assert if `MUT_SET_LOADING` is being commited or not.
          expect(firstCall[0]).toEqual(MUT_SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(firstCall[1]).toEqual(true)

          // Assert if `MUT_SET_LOADING` is being commited or not.
          expect(secondCall[0]).toEqual(MUT_SET_LOADING)

          // Assert if right data is passed to the mutation.
          expect(secondCall[1]).toEqual(false)
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
            async $applyGraphqlMutation(): Promise<Error> {
              return new Promise<Error>((resolve, reject) =>
                reject(new Error('GQL_MUT_ERR1'))
              );
            }
          }

          // Setting the global spy on `localThis.$applyGraphqlMutation`
          spy = jest.spyOn(localThis, '$applyGraphqlMutation')

          await actions[ACT_SUBMIT_ISSUE_TYPE_SETTINGS].call(localThis, actionCxt)
        })

        test('successfully calls the api', () => {
          expect(spy).toHaveBeenCalledTimes(1);
        })

        test('successfully commits mutations', async () => {
          expect(commit).toHaveBeenCalledTimes(3);
        })

        test(`successfully commits mutation ${MUT_SET_LOADING}`, async () => {
          // Storing the first commit call made
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
          // Storing the second commit call made
          const { mock: { calls: [, secondCall,] } } = commit

          // Assert if `MUT_SET_ERROR` is being commited or not.
          expect(secondCall[0]).toEqual(MUT_SET_ERROR)

          // Assert if the payload passed to the mutation was empty.
          expect(secondCall[1]).toEqual(Error("GQL_MUT_ERR1"))
        })
      })
    })

    describe(`Action "${ACT_SET_OWNER}"`, () => {
      beforeEach(async () => {
        actions[ACT_SET_OWNER](actionCxt, mockOwnerDetail().owner)
      })

      test('successfully commits mutation', async () => {
        expect(commit).toHaveBeenCalledTimes(1);

        // Storing the first commit call made
        const { mock: { calls: [firstCall, ,] } } = commit

        // Assert if `MUT_SET_OWNER` is being commited or not.
        expect(firstCall[0]).toEqual(MUT_SET_OWNER)

        // Assert if the data passed to the mutation is correct.
        expect(firstCall[1]).toEqual(mockOwnerDetail().owner)
      })
    })

    describe(`Action "${ACT_SET_ISSUE_TYPE_SETTING}"`, () => {
      beforeEach(() => {
        actions[ACT_SET_ISSUE_TYPE_SETTING](actionCxt, {
          issueTypeSetting: mockOwnerDetail().owner.ownerSetting?.issueTypeSettings?.[2] as IssueTypeSetting,
          issueTypeSettingIndex: 2
        })
      })

      test('successfully commits mutation', async () => {
        expect(commit).toHaveBeenCalledTimes(1);

        // Storing the first commit call made
        const { mock: { calls: [firstCall, ,] } } = commit

        // Assert if `MUT_SET_ISSUE_TYPE_SETTING` is being commited or not.
        expect(firstCall[0]).toEqual(MUT_SET_ISSUE_TYPE_SETTING)

        // Assert if the data passed to the mutation is correct.
        expect(firstCall[1]).toEqual({
          issueTypeSetting: mockOwnerDetail().owner.ownerSetting?.issueTypeSettings?.[2],
          issueTypeSettingIndex: 2
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
        mutations[MUT_SET_LOADING](ownerState, true)
        expect(ownerState.loading).toEqual(true)
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
        mutations[MUT_SET_ERROR](ownerState, dummyError)
        expect(ownerState.error).toEqual(dummyError)
      })
    })

    describe(`Mutation "${MUT_SET_OWNER}"`, () => {
      beforeEach(() => {
        ownerState.owner = {} as Owner;
      })
      test('successfully adds new owner to the state', () => {
        const newOwner: Owner = {
          id: 'DUMMY_OWNER_ID',
          ownerSetting: { id: 'DUMMY_OWNER_SETTING_ID' }
        } as Owner

        mutations[MUT_SET_OWNER](ownerState, newOwner)
        expect(ownerState.owner).toEqual(newOwner)
      })

      test('successfully appends data', () => {
        const newOwner: Owner = mockOwnerDetail().owner as Owner;

        // Change owner setting id
        if (newOwner.ownerSetting) {
          newOwner.ownerSetting.id = "DUMMY_ID"
        }
        mutations[MUT_SET_OWNER](ownerState, newOwner)
        expect(ownerState.owner.ownerSetting?.id).toEqual(newOwner.ownerSetting?.id)
      })
    })

    describe(`Mutation "${MUT_SET_ISSUE_TYPE_SETTING}"`, () => {
      test('successfully appends issue type setting', () => {
        const newIssueTypeSetting: IssueTypeSetting = {
          "slug": "bug-risk",
          "name": "Bug Risk",
          "isIgnoredInCheckStatus": false,
          "isIgnoredToDisplay": true,
          "description": null
        }

        mutations[MUT_SET_ISSUE_TYPE_SETTING](ownerState, {
          issueTypeSettingIndex: 2,
          issueTypeSetting: newIssueTypeSetting
        })
        expect(ownerState.owner.ownerSetting?.issueTypeSettings?.[2]).toEqual(newIssueTypeSetting)
      })
    })
  })
});
