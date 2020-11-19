import { mockOwner } from './__mocks__/detail.mock';
import { state, mutations, actions } from '~/store/owner/detail';
import { OwnerModuleState, OwnerModuleActionContext } from '~/store/owner/detail';
import { ACT_FETCH_ISSUE_TYPE_SETTINGS, MUT_SET_OWNER, MUT_SET_ISSUE_TYPE_SETTING } from '~/store/owner/detail';
import { IssueTypeSetting, Owner } from '~/types/types';

let actionCxt: OwnerModuleActionContext;
let commit: jest.Mock;
let ownerState: OwnerModuleState;

describe('[Store] Owner -- details module', () => {
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

  describe('Actions', () => {
    describe(ACT_FETCH_ISSUE_TYPE_SETTINGS, () => {
      beforeEach(async () => {

      })

      test('example', () => {
        expect(true).toBe(true)
      })
    })
  })

  describe('Mutations', () => {
    describe(MUT_SET_OWNER, () => {
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

    describe(MUT_SET_ISSUE_TYPE_SETTING, () => {
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
