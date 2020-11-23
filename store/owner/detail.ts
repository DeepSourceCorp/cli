import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { RootState } from '~/store'
import IssueTypeSettingsGQLQuery from '~/apollo/queries/owner/settings/IssueTypeSettings.gql'
import UpdateOwnerSettingsGQLMutation from '~/apollo/mutations/owner/settings/updateOwnerSettings.gql'

import { IssueTypeSetting, Owner, OwnerSetting, Maybe } from '~/types/types'

export const ACT_FETCH_ISSUE_TYPE_SETTINGS = 'fetchIssueTypeSettings'
export const ACT_SET_OWNER = 'setOwner'
export const ACT_SET_ISSUE_TYPE_SETTING = 'setIssueTypeSetting'
export const ACT_SUBMIT_ISSUE_TYPE_SETTINGS = 'submitIssueTypeSettings'

export const MUT_SET_OWNER = 'setOwner'
export const MUT_SET_ISSUE_TYPE_SETTING = 'setIssueTypeSetting'

export const GET_REFINED_ISSUE_TYPE_SETTINGS = 'refinedIssueTypeSettings'

export type RefinedIssueTypeSetting = {
  slug?: string;
  isIgnoredInCheckStatus?: boolean;
  isIgnoredToDisplay?: boolean;
};

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  owner: {
    ownerSetting: {
      issueTypeSettings: [] as Maybe<Array<Maybe<IssueTypeSetting>>>
    } as OwnerSetting
  } as Owner
})

export type OwnerModuleState = ReturnType<typeof state>
export type OwnerModuleActionContext = ActionContext<OwnerModuleState, RootState>

interface OwnerModuleGetters extends GetterTree<OwnerModuleState, RootState> {
  [GET_REFINED_ISSUE_TYPE_SETTINGS]: (state: OwnerModuleState) => RefinedIssueTypeSetting[];
}

export const getters: OwnerModuleGetters = {
  /**
   * Define a getter here.
   * For eg,
   * statePropGetter: string => state.stateProp.toUpperCase()
   */
  [GET_REFINED_ISSUE_TYPE_SETTINGS]: state => {
    /**
     * Returns array of object of issue types without __typename field in it,
     * as it causes problems while sending in the mutation.
     */
    let arr: Maybe<Array<RefinedIssueTypeSetting>> = []
    state.owner.ownerSetting?.issueTypeSettings?.forEach((obj: Maybe<IssueTypeSetting>) => {
      let newObj = <RefinedIssueTypeSetting>{
        slug: obj?.slug,
        isIgnoredInCheckStatus: obj?.isIgnoredInCheckStatus,
        isIgnoredToDisplay: obj?.isIgnoredInCheckStatus
      }
      arr?.push(newObj)
    })
    return arr
  }
}

interface OwnerModuleMutations extends MutationTree<OwnerModuleState> {
  [MUT_SET_OWNER]: (state: OwnerModuleState, owner: Owner) => void;
  [MUT_SET_ISSUE_TYPE_SETTING]: (state: OwnerModuleState, args: { issueTypeSetting: IssueTypeSetting, issueTypeSettingIndex: number }) => void;
}

export const mutations: OwnerModuleMutations = {
  /**
   * Define mutation here.
   * For eg,
   * CHANGE_STATE_PROP: (state, newStateProp: string) => (state.stateProp = newStateProp)
   */
  [MUT_SET_OWNER]: (state, owner) => {
    state.owner = Object.assign({}, state.owner, owner)
  },
  [MUT_SET_ISSUE_TYPE_SETTING]: (state, args) => {
    if (state.owner.ownerSetting?.issueTypeSettings?.[args.issueTypeSettingIndex]) {
      state.owner.ownerSetting.issueTypeSettings[args.issueTypeSettingIndex] = Object.assign({},
        state.owner.ownerSetting?.issueTypeSettings?.[args.issueTypeSettingIndex], {
        ...args.issueTypeSetting
      }
      )
    }
  }
}

interface OwnerModuleActions extends ActionTree<OwnerModuleState, RootState> {
  [ACT_FETCH_ISSUE_TYPE_SETTINGS]: (this: Store<RootState>, injectee: OwnerModuleActionContext, args: { login: string, provider: string }) => void;
  [ACT_SUBMIT_ISSUE_TYPE_SETTINGS]: (this: Store<RootState>, injectee: OwnerModuleActionContext, args?: any) => void;
  [ACT_SET_OWNER]: (injectee: OwnerModuleActionContext, owner: Owner) => void;
  [ACT_SET_ISSUE_TYPE_SETTING]: (injectee: OwnerModuleActionContext, args: { issueTypeSetting: IssueTypeSetting, issueTypeSettingIndex: number }) => void;
}

export const actions: OwnerModuleActions = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_ISSUE_TYPE_SETTINGS]({ commit }, args) {
    let response = await this.$fetchGraphqlData(IssueTypeSettingsGQLQuery, {
      login: args.login,
      provider: this.$providerMetaMap[args.provider].value
    })
    commit(MUT_SET_OWNER, response?.data.owner)
  },
  async [ACT_SUBMIT_ISSUE_TYPE_SETTINGS]({ state, getters }) {
    await this.$applyGraphqlMutation(UpdateOwnerSettingsGQLMutation, {
      input: {
        ownerId: state.owner.id,
        issueTypeSettings: getters[GET_REFINED_ISSUE_TYPE_SETTINGS]
      }
    })
      .then(() => {
        console.log("Successfully submitted issue preferences")
      })
      .catch((e: Error) => {
        console.log("Failure", e)
      })
  },
  [ACT_SET_OWNER]({ commit }, owner) {
    commit(MUT_SET_OWNER, owner)
  },
  [ACT_SET_ISSUE_TYPE_SETTING]({ commit }, args) {
    commit(MUT_SET_ISSUE_TYPE_SETTING, args)
  }
}