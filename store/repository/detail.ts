import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { RootState } from '~/store'
import RepositoryDetailGQLQuery from '~/apollo/queries/repository/detail.gql'
import RepositoryWidgetsGQLQuery from '~/apollo/queries/repository/widgets.gql'
import RepositorySettingsGeneralGQLQuery from '~/apollo/queries/repository/settings/general.gql'
import RepositorySettingsSshGQLQuery from '~/apollo/queries/repository/settings/ssh.gql'
import RepositorySettingsIgnoreRulesGQLQuery from '~/apollo/queries/repository/settings/ignoreRules.gql'
import RepositorySettingsManageAccessGQLQuery from '~/apollo/queries/repository/settings/manageAccess.gql'
import CommitConfigToVcsGQLMutation from '~/apollo/mutations/repository/commitConfigToVcs.gql'
import {
  CommitConfigToVcsInput,
  Repository
} from '~/types/types'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'

export const ACT_FETCH_REPOSITORY_DETAIL = 'fetchRepositoryDetail'
export const ACT_FETCH_WIDGETS = 'fetchWidgets'
export const ACT_FETCH_REPOSITORY_SETTINGS_GENERAL = 'fetchRepositorySettingsGeneral'
export const ACT_FETCH_REPOSITORY_SETTINGS_SSH = 'fetchRepositorySettingsSsh'
export const ACT_FETCH_REPOSITORY_SETTINGS_IGNORE_RULES = 'fetchRepositorySettingsIgnoreRules'
export const ACT_FETCH_REPOSITORY_SETTINGS_MANAGE_ACCESS = 'fetchRepositorySettingsManageAccess'
export const ACT_COMMIT_CONFIG_TO_VCS = 'commitConfigToVcs'

export const MUT_SET_ERROR = 'setRepositoryDetailError'
export const MUT_SET_LOADING = 'setRepositoryDetailLoading'
export const MUT_SET_REPOSITORY = 'setRepositoryDetail';

export const state = () => ({
  /**
   * Define state here.
   * For eg,
   * stateProp: 'this is a state property' as string
   */
  loading: false as boolean,
  error: {},
  repository: {} as Repository
})

export type RepositoryDetailModuleState = ReturnType<typeof state>
export type RepositoryDetailActionContext = ActionContext<RepositoryDetailModuleState, RootState>

export const getters: GetterTree<RepositoryDetailModuleState, RootState> = {
  /**
   * Define a getter here.
   * For eg,
   * statePropGetter: string => state.stateProp.toUpperCase()
   */
}

interface RepositoryDetailModuleMutations extends MutationTree<RepositoryDetailModuleState> {
  [MUT_SET_LOADING]: (state: RepositoryDetailModuleState, value: boolean) => void;
  [MUT_SET_ERROR]: (state: RepositoryDetailModuleState, error: GraphqlError) => void;
  [MUT_SET_REPOSITORY]: (state: RepositoryDetailModuleState, repository: Repository) => void;
}

export const mutations: RepositoryDetailModuleMutations = {
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
  [MUT_SET_REPOSITORY]: (state, repository) => {
    state.repository = Object.assign({}, state.repository, repository)
  }
}

interface RepositoryDetailModuleActions extends ActionTree<RepositoryDetailModuleState, RootState> {
  [ACT_FETCH_WIDGETS]: (this: Store<RootState>, injectee: RepositoryDetailActionContext, args: {
    provider: string,
    owner: string,
    name: string
  }) => Promise<void>;
  [ACT_FETCH_REPOSITORY_DETAIL]: (this: Store<RootState>, injectee: RepositoryDetailActionContext, args: { id: string }) => Promise<void>;
  [ACT_FETCH_REPOSITORY_SETTINGS_GENERAL]: (this: Store<RootState>, injectee: RepositoryDetailActionContext, args: {
    provider: string,
    owner: string,
    name: string,
    q: string,
    limit: number,
    currentPageNumber: number
  }) => Promise<void>;
  [ACT_FETCH_REPOSITORY_SETTINGS_MANAGE_ACCESS]: (this: Store<RootState>, injectee: RepositoryDetailActionContext, args: {
    provider: string,
    owner: string,
    name: string,
    q: string,
    limit: number,
    currentPageNumber: number
  }) => Promise<void>;
  [ACT_FETCH_REPOSITORY_SETTINGS_IGNORE_RULES]: (this: Store<RootState>, injectee: RepositoryDetailActionContext, args: {
    provider: string,
    owner: string,
    name: string,
    limit: number,
    currentPageNumber: number
  }) => Promise<void>;
  [ACT_FETCH_REPOSITORY_SETTINGS_SSH]: (this: Store<RootState>, injectee: RepositoryDetailActionContext, args: { id: string }) => Promise<void>;
  [ACT_COMMIT_CONFIG_TO_VCS]: (this: Store<RootState>, injectee: RepositoryDetailActionContext, args: CommitConfigToVcsInput) => Promise<void>;
}

export const actions: RepositoryDetailModuleActions = {
  /**
   * Define actions here,
   * For eg,
   * async fetchThings({ commit }) {
   *  commit('CHANGE_STATE_PROP', 'New state property')
   * }
   */
  async [ACT_FETCH_WIDGETS]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryWidgetsGQLQuery, {
      provider: args.provider,
      owner: args.owner,
      name: args.name
    }).then((response: GraphqlQueryResponse) => {
      // TODO: Toast("Successfully fetched widgets")
      commit(MUT_SET_REPOSITORY, response.data.repository)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
      // TODO: Toast("Failure in fetching widgets", e)
    })
  },
  async [ACT_FETCH_REPOSITORY_DETAIL]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryDetailGQLQuery, {
      repositoryId: args.id
    }).then((response: GraphqlQueryResponse) => {
      // TODO: Toast("Successfully fetched repository detail")
      commit(MUT_SET_REPOSITORY, response.data.repository)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
      // TODO: Toast("Failure in fetching repository detail", e)
    })
  },
  async [ACT_FETCH_REPOSITORY_SETTINGS_GENERAL]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RepositorySettingsGeneralGQLQuery, {
      provider: args.provider,
      owner: args.owner,
      name: args.name,
      q: args.q,
      limit: args.limit,
      after: this.$getGQLAfter(args.currentPageNumber, args.limit)
    }).then((response: GraphqlQueryResponse) => {
      // TODO: Toast("Successfully fetched repository settings detail -- General")
      commit(MUT_SET_REPOSITORY, response.data.repository)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
      // TODO: Toast("Failure in fetching repository settings detail -- General", e)
    })
  },
  async [ACT_FETCH_REPOSITORY_SETTINGS_MANAGE_ACCESS]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RepositorySettingsManageAccessGQLQuery, {
      provider: args.provider,
      owner: args.owner,
      name: args.name,
      q: args.q,
      limit: args.limit,
      after: this.$getGQLAfter(args.currentPageNumber, args.limit)
    }).then((response: GraphqlQueryResponse) => {
      // TODO: Toast("Successfully fetched repository settings detail -- Manage Access")
      commit(MUT_SET_REPOSITORY, response.data.repository)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
      // TODO: Toast("Failure in fetching repository settings detail -- Manage Access", e)
    })
  },
  async [ACT_FETCH_REPOSITORY_SETTINGS_IGNORE_RULES]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RepositorySettingsIgnoreRulesGQLQuery, {
      provider: args.provider,
      owner: args.owner,
      name: args.name,
      limit: args.limit,
      after: this.$getGQLAfter(args.currentPageNumber, args.limit)
    }).then((response: GraphqlQueryResponse) => {
      // TODO: Toast("Successfully fetched repository settings detail -- Ignore rules")
      commit(MUT_SET_REPOSITORY, response.data.repository)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
      // TODO: Toast("Failure in fetching repository settings detail -- Ignore rules", e)
    })
  },
  async [ACT_FETCH_REPOSITORY_SETTINGS_SSH]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RepositorySettingsSshGQLQuery, {
      id: args.id
    }).then((response: GraphqlQueryResponse) => {
      // TODO: Toast("Successfully fetched repository settings detail -- SSH")
      commit(MUT_SET_REPOSITORY, response.data.repository)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
      // TODO: Toast("Failure in fetching repository settings detail -- SSH", e)
    })
  },
  async [ACT_COMMIT_CONFIG_TO_VCS]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$applyGraphqlMutation(CommitConfigToVcsGQLMutation, {
      input: {
        repositoryId: args.repositoryId,
        config: args.config
      }
    }).then(() => {
      // TODO: Toast("Successfully committed config to VCS")
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
      // TODO: Toast("Failure in committing config to VCS", e)
    })
  }
}