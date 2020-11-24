import { RootState } from '~/store'
import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'

import IssueTypeSettingsGQLQuery from '~/apollo/queries/owner/settings/IssueTypeSettings.gql'
import UpdateOwnerSettingsGQLMutation from '~/apollo/mutations/owner/settings/updateOwnerSettings.gql'

import { IssueTypeSetting, Owner, OwnerSetting, Maybe } from '~/types/types'
import { GraphqlError } from '~/types/apollo-graphql-types'

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

export interface OwnerDetailModuleState {
  loading :boolean,
  error :Record<string, any>,
  owner :Owner
}

export const state = () :OwnerDetailModuleState => ({
  ...<OwnerDetailModuleState>{
    loading: false,
    error: {},
    owner: {
      ownerSetting: <OwnerSetting> {
        issueTypeSettings: <Maybe<Array<Maybe<IssueTypeSetting>>>>[]
      }
    }
  },
})

export type OwnerDetailModuleActionContext = ActionContext<OwnerDetailModuleState, RootState>

interface OwnerDetailModuleGetters extends GetterTree<OwnerDetailModuleState, RootState> {
  [GET_REFINED_ISSUE_TYPE_SETTINGS]: (state: OwnerDetailModuleState) => RefinedIssueTypeSetting[];
}

export const getters: OwnerDetailModuleGetters = {
  [GET_REFINED_ISSUE_TYPE_SETTINGS]: state => {
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
  [MUT_SET_ERROR]: (state: OwnerDetailModuleState, error: GraphqlError) => void;
  [MUT_SET_OWNER]: (state: OwnerDetailModuleState, owner: Owner) => void;
  [MUT_SET_ISSUE_TYPE_SETTING]: (state: OwnerDetailModuleState, args: { issueTypeSetting: IssueTypeSetting, issueTypeSettingIndex: number }) => void;
}

export const mutations: OwnerDetailModuleMutations = {
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
  async [ACT_FETCH_ISSUE_TYPE_SETTINGS]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(IssueTypeSettingsGQLQuery, {
      login: args.login,
      provider: this.$providerMetaMap[args.provider].value
    }).then((response: { data: { owner: Owner } }) => {
      // TODO: Toast("Successfully fetched issue preferences")
      commit(MUT_SET_OWNER, response.data.owner)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
      // TODO: Toast("Failure in fetching issue preferences", e)
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
      // TODO: Toast("Successfully submitted issue preferences")
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
      // TODO: Toast("Failure in submitting issue preferences", e)
    })
  },
  [ACT_SET_OWNER]({ commit }, owner) {
    commit(MUT_SET_OWNER, owner)
  },
  [ACT_SET_ISSUE_TYPE_SETTING]({ commit }, args) {
    commit(MUT_SET_ISSUE_TYPE_SETTING, args)
  }
}
