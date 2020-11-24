import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'
import ActiveUserDetailGQLQuery from '~/apollo/queries/user/active/detail.gql'
import { User } from '~/types/types'
import { RootState } from '~/store'

export const ACT_FETCH_VIEWER_INFO = 'fetchViewerInfo'

export const MUT_SET_LOADING = 'setActiveUserLoading'
export const MUT_SET_ERROR = 'setActiveUserError'
export const MUT_SET_VIEWER = 'setViewer'

export interface ActiveUserModuleState {
  loading: boolean,
  error: Record<string, any>,
  viewer: User
}

export const state = (): ActiveUserModuleState => ({
  ...<ActiveUserModuleState>({
    loading: false,
    error: {},
    viewer: {}
  })
})

export type ActiveUserActionContext = ActionContext<ActiveUserModuleState, RootState>

export const getters: GetterTree<ActiveUserModuleState, RootState> = {}

interface ActiveUserModuleMutations extends MutationTree<ActiveUserModuleState> {
  [MUT_SET_LOADING]: (state: ActiveUserModuleState, value: boolean) => void;
  [MUT_SET_ERROR]: (state: ActiveUserModuleState, error: GraphqlError) => void;
  [MUT_SET_VIEWER]: (state: ActiveUserModuleState, viewer: User) => void;
}

export const mutations: ActiveUserModuleMutations = {
  [MUT_SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [MUT_SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [MUT_SET_VIEWER]: (state, viewer) => {
    state.viewer = Object.assign({}, state.viewer, viewer)
  }
}

interface ActiveUserModuleActions extends ActionTree<ActiveUserModuleState, RootState> {
  [ACT_FETCH_VIEWER_INFO]: (this: Store<RootState>, injectee: ActiveUserActionContext) => Promise<void>;
}

export const actions: ActiveUserModuleActions = {
  async [ACT_FETCH_VIEWER_INFO]({ commit }) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(ActiveUserDetailGQLQuery, {})
    .then((response: GraphqlQueryResponse) => {
      commit(MUT_SET_VIEWER, response.data.viewer)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
    })
  }
}