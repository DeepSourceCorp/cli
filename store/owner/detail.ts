import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { RootState } from '~/store'
import IssueTypeSetttingsGQLQuery from '~/apollo/queries/owner/settings/IssueTypeSettings.gql'

import { Owner } from '~/types/types'

export const ACT_FETCH_ISSUE_TYPE_SETTINGS = 'fetchIssueTypeSettings'

const MUT_SET_OWNER = 'setOwner';
const MUT_EDIT_ISSUE_TYPE_SETTINGS = 'editIssueTypeSettings'

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  owner: {} as Owner
})

export type OwnerModuleState = ReturnType<typeof state>

export const getters: GetterTree<OwnerModuleState, RootState> = {
  /**
   * Define a getter here.
   * For eg,
   * statePropGetter: string => state.stateProp.toUpperCase()
   */
}

export const mutations: MutationTree<OwnerModuleState> = {
  /**
   * Define mutation here.
   * For eg,
   * CHANGE_STATE_PROP: (state, newStateProp: string) => (state.stateProp = newStateProp)
   */
  [MUT_SET_OWNER]: (state: any, owner: Owner) => {
    state.owner = Object.assign({}, state.owner, owner)
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
    let response = await this.$fetchGraphqlData(IssueTypeSetttingsGQLQuery, {
      login: args.login,
      provider: args.provider
    })
    commit(MUT_SET_OWNER, response?.data.owner)
  }
}