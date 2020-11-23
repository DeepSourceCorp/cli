import { mockOwner } from './__mocks__/detail.mock';
import {
  state,
  mutations,
  getters,
  actions,
  OwnerModuleState,
  OwnerModuleActionContext,
  GET_REFINED_ISSUE_TYPE_SETTINGS,
  ACT_SUBMIT_ISSUE_TYPE_SETTINGS,
  ACT_SET_OWNER,
  ACT_SET_ISSUE_TYPE_SETTING,
  ACT_FETCH_ISSUE_TYPE_SETTINGS,
  MUT_SET_OWNER,
  MUT_SET_ISSUE_TYPE_SETTING
} from '~/store/owner/detail';
import {
  IssueTypeSetting,
  Owner,
  UpdateOwnerSettingsPayload
} from '~/types/types';

let actionCxt: OwnerModuleActionContext;
let commit: jest.Mock;
let localThis: any;
let spy: jest.SpyInstance;
let ownerState: OwnerModuleState;

describe('[Store] Owner/Details', () => {
  beforeEach(() => {
    commit = jest.fn();
    ownerState = mockOwner();

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
        const refinedSettings = (getters[GET_REFINED_ISSUE_TYPE_SETTINGS] as Function)(ownerState)

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
      beforeEach(async () => {
        localThis = {
          $providerMetaMap: {
            gh: {
              text: 'Github',
              shortcode: 'gh',
              value: 'GITHUB'
            }
          },
          async $fetchGraphqlData(): Promise<{ data: { owner: Owner } }> {
            return new Promise<{ data: { owner: Owner } }>(resolve =>
              setTimeout(() => resolve({ data: { owner: mockOwner().owner } }), 10)
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

      test('successfully commits mutation', async () => {
        expect(commit).toHaveBeenCalledTimes(1);

        // Storing the first commit call made
        const commitCall = commit.mock.calls[0];
        const apiResponse = await localThis.$fetchGraphqlData()

        // Assert if `MUT_SET_ISSUE_TYPE_SETTING` is being commited or not.
        expect(commitCall[0]).toEqual(MUT_SET_OWNER)

        // Assert if the response from api is same as the one passed to the mutation.
        expect(commitCall[1]).toEqual(apiResponse.data.owner)
      })
    })

    describe(`Action "${ACT_SUBMIT_ISSUE_TYPE_SETTINGS}"`, () => {
      beforeEach(async () => {
        type GqlMutationUpdateOwnerSettingsResponse = {
          data: {
            updateOwnerSettings: UpdateOwnerSettingsPayload
          }
        }

        localThis = {
          $providerMetaMap: {
            gh: {
              text: 'Github',
              shortcode: 'gh',
              value: 'GITHUB'
            }
          },
          async $applyGraphqlMutation(): Promise<GqlMutationUpdateOwnerSettingsResponse> {
            return new Promise<GqlMutationUpdateOwnerSettingsResponse>(resolve =>
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
    })

    describe(`Action "${ACT_SET_OWNER}"`, () => {
      beforeEach(async () => {
        await actions[ACT_SET_OWNER](actionCxt, mockOwner().owner)
      })

      test('successfully commits mutation', async () => {
        expect(commit).toHaveBeenCalledTimes(1);

        // Storing the first commit call made
        const commitCall = commit.mock.calls[0];

        // Assert if `MUT_SET_OWNER` is being commited or not.
        expect(commitCall[0]).toEqual(MUT_SET_OWNER)

        // Assert if the data passed to the mutation is correct.
        expect(commitCall[1]).toEqual(mockOwner().owner)
      })
    })

    describe(`Action "${ACT_SET_ISSUE_TYPE_SETTING}"`, () => {
      beforeEach(() => {
        actions[ACT_SET_ISSUE_TYPE_SETTING](actionCxt, {
          issueTypeSetting: mockOwner().owner.ownerSetting?.issueTypeSettings?.[2] as IssueTypeSetting,
          issueTypeSettingIndex: 2
        })
      })

      test('successfully commits mutation', async () => {
        expect(commit).toHaveBeenCalledTimes(1);

        // Storing the first commit call made
        const commitCall = commit.mock.calls[0];

        // Assert if `MUT_SET_ISSUE_TYPE_SETTING` is being commited or not.
        expect(commitCall[0]).toEqual(MUT_SET_ISSUE_TYPE_SETTING)

        // Assert if the data passed to the mutation is correct.
        expect(commitCall[1]).toEqual({
          issueTypeSetting: mockOwner().owner.ownerSetting?.issueTypeSettings?.[2],
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
    describe(`Mutation "${MUT_SET_OWNER}"`, () => {
      test('successfully adds new owner to the state', () => {
        const newOwner: Owner = {
          id: 'DUMMY_OWNER_ID',
          ownerSetting: { id: 'DUMMY_OWNER_SETTING_ID' }
        } as Owner

        mutations[MUT_SET_OWNER](ownerState, newOwner)
        expect(ownerState.owner).toEqual(newOwner)
      })

      test('successfully appends data', () => {
        const newOwner: Owner = mockOwner().owner as Owner;

        // Change owner setting id
        if(newOwner.ownerSetting) {
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
