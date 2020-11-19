import { mockOwner } from './__mocks__/detail.mock';
import { state, mutations, actions } from '~/store/owner/detail';
import { OwnerModuleState, OwnerModuleActionContext } from '~/store/owner/detail';
import { ACT_FETCH_ISSUE_TYPE_SETTINGS, MUT_SET_OWNER, MUT_SET_ISSUE_TYPE_SETTING } from '~/store/owner/detail';
import { IssueTypeSetting, Owner } from '~/types/types';

let actionCxt: OwnerModuleActionContext;
let commit: jest.Mock;
let localThis: any;
let spy: any;
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
        
        await (actions[ACT_FETCH_ISSUE_TYPE_SETTINGS] as Function).call(localThis, actionCxt, {
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
  })

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
        newOwner.ownerSetting!.id = "DUMMY_ID"
        mutations[MUT_SET_OWNER](ownerState, newOwner)
        expect(ownerState.owner.ownerSetting!.id).toEqual(newOwner.ownerSetting!.id)
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
          index: 2,
          issueTypeSetting: newIssueTypeSetting
        })
        expect(ownerState.owner.ownerSetting!.issueTypeSettings![2]).toEqual(newIssueTypeSetting)
      })
    })
  })
});
