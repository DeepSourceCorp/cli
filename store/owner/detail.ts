import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { RootState } from '~/store'
import IssueTypeSettingsGQLQuery from '~/apollo/queries/owner/settings/IssueTypeSettings.gql'
import UpdateOwnerSettingsGQLMutation from '~/apollo/mutations/owner/settings/updateOwnerSettings.gql'

import { IssueTypeSetting, Owner, OwnerSetting, Maybe } from '~/types/types'

export const ACT_FETCH_ISSUE_TYPE_SETTINGS = 'fetchIssueTypeSettings'
export const ACT_SET_OWNER = 'setOwner'
export const ACT_SET_ISSUE_TYPE_SETTING = 'setIssueTypeSetting'
export const ACT_SUBMIT_ISSUE_TYPE_SETTINGS = 'submitIssueTypeSettings'

const MUT_SET_OWNER = 'setOwner'
const MUT_SET_ISSUE_TYPE_SETTING = 'setIssueTypeSetting'

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

export const getters: GetterTree<OwnerModuleState, RootState> = {
  /**
   * Define a getter here.
   * For eg,
   * statePropGetter: string => state.stateProp.toUpperCase()
   */
  refinedIssueTypeSettings: state => {
    /**
     * Returns array of object of issue types without __typename field in it,
     * as it causes problems while sending in the mutation.
     */
    type RefinedIssueTypeSetting = {
      slug?: string;
      isIgnoredInCheckStatus?: boolean;
      isIgnoredToDisplay?: boolean;
    };

    let arr: Maybe<Array<RefinedIssueTypeSetting>> = []
    state.owner.ownerSetting?.issueTypeSettings?.forEach((obj: Maybe<IssueTypeSetting>) => {
      let newObj = {
        slug: '',
        isIgnoredToDisplay: true,
        isIgnoredInCheckStatus: true
      }
      newObj.slug = <string>obj?.slug
      newObj.isIgnoredToDisplay = <boolean>obj?.isIgnoredToDisplay
      newObj.isIgnoredInCheckStatus = <boolean>obj?.isIgnoredInCheckStatus
      arr?.push(newObj)
    })
    return arr
  }
}

export const mutations: MutationTree<OwnerModuleState> = {
  /**
   * Define mutation here.
   * For eg,
   * CHANGE_STATE_PROP: (state, newStateProp: string) => (state.stateProp = newStateProp)
   */
  [MUT_SET_OWNER]: (state: any, owner: Owner) => {
    state.owner = Object.assign({}, state.owner, owner)
  },
  [MUT_SET_ISSUE_TYPE_SETTING]: (state: any, args: any) => {
    state.owner.ownerSetting.issueTypeSettings[args.index] = Object.assign({},
      state.owner.ownerSetting.issueTypeSettings[args.index], {
      ...args.issueTypeSetting
    }
    )
  }
}

export const actions: ActionTree<OwnerModuleState, RootState> = {
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
    let response = await this.$applyGraphqlMutation(UpdateOwnerSettingsGQLMutation, {
      input: {
        ownerId: state.owner.id,
        issueTypeSettings: getters.refinedIssueTypeSettings
      }
    })
      .then(() => {
        console.log("Successfully submitted issue preferences")
      })
      .catch((e: Error) => {
        console.log("Failure", e)
      })
  },
  async [ACT_SET_OWNER]({ commit }, owner) {
    commit(MUT_SET_OWNER, owner)
  },
  [ACT_SET_ISSUE_TYPE_SETTING]({ commit }, args) {
    commit(MUT_SET_ISSUE_TYPE_SETTING, args)
  }
}