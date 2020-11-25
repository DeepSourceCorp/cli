import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { GraphQLFormattedError } from 'graphql'
import { RootState } from '~/store'
import IssueTypeSettingsGQLQuery from '~/apollo/queries/owner/settings/IssueTypeSettings.gql'
import UpdateOwnerSettingsGQLMutation from '~/apollo/mutations/owner/settings/updateOwnerSettings.gql'

import { IssueTypeSetting, Owner, OwnerSetting, Maybe } from '~/types/types'

export const ACT_FETCH_ISSUE_TYPE_SETTINGS = 'fetchIssueTypeSettings'
export const ACT_SET_OWNER = 'setOwner'
export const ACT_SET_ISSUE_TYPE_SETTING = 'setIssueTypeSetting'
export const ACT_SUBMIT_ISSUE_TYPE_SETTINGS = 'submitIssueTypeSettings'

export const MUT_SET_ERROR = 'setOwnerDetailError'
export const MUT_SET_LOADING = 'setOwnerDetailLoading'
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
  loading: false as boolean,
  error: {} as Record<string, any>,
  owner: {
    ownerSetting: {
      issueTypeSettings: [] as Maybe<Array<Maybe<IssueTypeSetting>>>
    } as OwnerSetting
  } as Owner
})

export type OwnerDetailModuleState = ReturnType<typeof state>
export type OwnerDetailModuleActionContext = ActionContext<OwnerDetailModuleState, RootState>

interface OwnerDetailModuleGetters extends GetterTree<OwnerDetailModuleState, RootState> {
  [GET_REFINED_ISSUE_TYPE_SETTINGS]: (state: OwnerDetailModuleState) => RefinedIssueTypeSetting[];
}

export const getters: OwnerDetailModuleGetters = {
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

interface OwnerDetailModuleMutations extends MutationTree<OwnerDetailModuleState> {
  [MUT_SET_LOADING]: (state: OwnerDetailModuleState, value: boolean) => void;
  [MUT_SET_ERROR]: (state: OwnerDetailModuleState, error: { graphQLErrors: GraphQLFormattedError }) => void;
  [MUT_SET_OWNER]: (state: OwnerDetailModuleState, owner: Owner) => void;
  [MUT_SET_ISSUE_TYPE_SETTING]: (state: OwnerDetailModuleState, args: { issueTypeSetting: IssueTypeSetting, issueTypeSettingIndex: number }) => void;
}

export const mutations: OwnerDetailModuleMutations = {
  /**
   * Define mutation here.
   * For eg,
   * CHANGE_STATE_PROP: (state, newStateProp: string) => (state.stateProp = newStateProp)
   */
  [MUT_SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [MUT_SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
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

interface OwnerDetailModuleActions extends ActionTree<OwnerDetailModuleState, RootState> {
  [ACT_FETCH_ISSUE_TYPE_SETTINGS]: (this: Store<RootState>, injectee: OwnerDetailModuleActionContext, args: { login: string, provider: string }) => Promise<void>;
  [ACT_SUBMIT_ISSUE_TYPE_SETTINGS]: (this: Store<RootState>, injectee: OwnerDetailModuleActionContext, args?: any) => Promise<void>;
  [ACT_SET_OWNER]: (injectee: OwnerDetailModuleActionContext, owner: Owner) => void;
  [ACT_SET_ISSUE_TYPE_SETTING]: (injectee: OwnerDetailModuleActionContext, args: { issueTypeSetting: IssueTypeSetting, issueTypeSettingIndex: number }) => void;
}

export const actions: OwnerDetailModuleActions = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_ISSUE_TYPE_SETTINGS]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(IssueTypeSettingsGQLQuery, {
      login: args.login,
      provider: this.$providerMetaMap[args.provider].value
    }).then((response: { data: { owner: Owner } }) => {
      console.log("Successfully fetched issue preferences")
      commit(MUT_SET_OWNER, response.data.owner)
      commit(MUT_SET_LOADING, false)
    }).catch((e: { graphQLErrors: GraphQLFormattedError }) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
      console.log("Failure in fetching issue preferences", e)
    })
  },
  async [ACT_SUBMIT_ISSUE_TYPE_SETTINGS]({ commit, state, getters }) {
    commit(MUT_SET_LOADING, true)
    await this.$applyGraphqlMutation(UpdateOwnerSettingsGQLMutation, {
      input: {
        ownerId: state.owner.id,
        issueTypeSettings: getters[GET_REFINED_ISSUE_TYPE_SETTINGS]
      }
    }).then(() => {
      console.log("Successfully submitted issue preferences")
      commit(MUT_SET_LOADING, false)
    }).catch((e: { graphQLErrors: GraphQLFormattedError }) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
      console.log("Failure in submitting issue preferences", e)
    })
  },
  [ACT_SET_OWNER]({ commit }, owner) {
    commit(MUT_SET_OWNER, owner)
  },
  [ACT_SET_ISSUE_TYPE_SETTING]({ commit }, args) {
    commit(MUT_SET_ISSUE_TYPE_SETTING, args)
  }
}