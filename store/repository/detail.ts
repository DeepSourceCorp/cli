import { GetterTree, ActionTree, MutationTree } from 'vuex'
import { DocumentNode } from 'graphql'
import { RootState } from '~/store'
import RepositoryDetailGQLQuery from '~/apollo/queries/repository/detail.gql'
import RepositoryWidgetsGQLQuery from '~/apollo/queries/repository/widgets.gql'
import RepositorySettingsGeneralGQLQuery from '~/apollo/queries/repository/settings/general.gql'
import RepositorySettingsSshGQLQuery from '~/apollo/queries/repository/settings/ssh.gql'
import RepositorySettingsIgnoreRulesGQLQuery from '~/apollo/queries/repository/settings/ignoreRules.gql'
import RepositorySettingsManageAccessGQLQuery from '~/apollo/queries/repository/settings/manageAccess.gql'
import CommitConfigToVcsGQLMutation from '~/apollo/mutations/repository/commitConfigToVcs.gql'
import {
  Repository
} from '~/types/types'

export const ACT_FETCH_REPOSITORY_DETAIL = 'fetchRepositoryDetail'
export const ACT_FETCH_WIDGETS = 'fetchWidgets'
export const ACT_FETCH_REPOSITORY_SETTINGS_GENERAL = 'fetchRepositorySettingsGeneral'
export const ACT_FETCH_REPOSITORY_SETTINGS_SSH = 'fetchRepositorySettingsSsh'
export const ACT_FETCH_REPOSITORY_SETTINGS_IGNORE_RULES = 'fetchRepositorySettingsIgnoreRules'
export const ACT_FETCH_REPOSITORY_SETTINGS_MANAGE_ACCESS = 'fetchRepositorySettingsManageAccess'
export const ACT_COMMIT_CONFIG_TO_VCS = 'commitConfigToVcs'

const MUT_SET_REPOSITORY = 'setRepository';

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  repository: {} as Repository
})

export type RepositoryModuleState = ReturnType<typeof state>

export const getters: GetterTree<RepositoryModuleState, RootState> = {
  /**
   * Define a getter here.
   * For eg,
   * statePropGetter: string => state.stateProp.toUpperCase()
   */
}

export const mutations: MutationTree<RootState> = {
  /**
   * Define mutation here.
   * For eg,
   * CHANGE_STATE_PROP: (state, newStateProp: string) => (state.stateProp = newStateProp)
   */
  [MUT_SET_REPOSITORY]: (state: any, repository: Repository) => {
    state.repository = Object.assign({}, state.repository, repository)
  }
}

export const actions: ActionTree<RepositoryModuleState, RootState> = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_WIDGETS]({ commit }, args) {
    let response = await fetchGraphqlData(this, RepositoryWidgetsGQLQuery, {
      provider: args.provider,
      owner: args.owner,
      name: args.name
    })
    commit(MUT_SET_REPOSITORY, response?.data.repository)
  },
  async [ACT_FETCH_REPOSITORY_DETAIL]({ commit }, args) {
    let response = await fetchGraphqlData(this, RepositoryDetailGQLQuery, {
      repositoryId: args.id
    })
    commit(MUT_SET_REPOSITORY, response?.data.repository)
  },
  async [ACT_FETCH_REPOSITORY_SETTINGS_GENERAL]({ commit }, args) {
    let response = await fetchGraphqlData(this, RepositorySettingsGeneralGQLQuery, {
      id: args.id
    })
    commit(MUT_SET_REPOSITORY, response?.data.repository)
  },
  async [ACT_FETCH_REPOSITORY_SETTINGS_MANAGE_ACCESS]({ commit }, args) {
    let response = await fetchGraphqlData(this, RepositorySettingsManageAccessGQLQuery, {
      id: args.id
    })
    commit(MUT_SET_REPOSITORY, response?.data.repository)
  },
  async [ACT_FETCH_REPOSITORY_SETTINGS_IGNORE_RULES]({ commit }, args) {
    let response = await fetchGraphqlData(this, RepositorySettingsIgnoreRulesGQLQuery, {
      id: args.id
    })
    commit(MUT_SET_REPOSITORY, response?.data.repository)
  },
  async [ACT_FETCH_REPOSITORY_SETTINGS_SSH]({ commit }, args) {
    let response = await fetchGraphqlData(this, RepositorySettingsSshGQLQuery, {
      id: args.id
    })
    commit(MUT_SET_REPOSITORY, response?.data.repository)
  },
  async [ACT_COMMIT_CONFIG_TO_VCS]({}, args) {
    let response = await this.$applyGraphqlMutation(CommitConfigToVcsGQLMutation, {
      input: {
        repositoryId: args.repositoryId,
        config: args.config
      }
    })
  }
}

const fetchGraphqlData = async function (self: any, query: DocumentNode, variables: any) {
  /**
   * Abstracts graphql client code from actions.
   */
  let client = self.app.apolloProvider?.defaultClient
  return client?.query({
    query,
    variables
  });
}