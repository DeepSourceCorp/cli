import RepositoryRunListGQLQuery from '~/apollo/queries/repository/runs/run/list.gql'
import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { Maybe, PageInfo, RunConnection, RunEdge } from '~/types/types'
import { RootState } from '~/store'

export const ACT_FETCH_RUN_LIST = 'fetchRunList'

export const MUT_SET_ERROR = 'setRunListError'
export const MUT_SET_LOADING = 'setRunListLoading'
export const MUT_SET_RUN_LIST = 'setRunList'

export interface RunListModuleState {
  loading: boolean,
  error: Record<string, any>,
  runList: RunConnection
}

export const state = (): RunListModuleState => ({
  ...<RunListModuleState>{
    loading: false,
    error: {},
    runList: {
      pageInfo: {} as PageInfo,
      edges: [] as Array<Maybe<RunEdge>>
    } as RunConnection
  }
})

export type RunListActionContext = ActionContext<RunListModuleState, RootState>

export const getters: GetterTree<RunListModuleState, RootState> = {}

interface RunListModuleMutations extends MutationTree<RunListModuleState> {
  [MUT_SET_LOADING]: (state: RunListModuleState, value: boolean) => void;
  [MUT_SET_ERROR]: (state: RunListModuleState, error: GraphqlError) => void;
  [MUT_SET_RUN_LIST]: (state: RunListModuleState, runList: RunConnection) => void;
}

export const mutations: RunListModuleMutations = {
  [MUT_SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [MUT_SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [MUT_SET_RUN_LIST]: (state, runList) => {
    state.runList = Object.assign({}, state.runList, runList)
  }
}

interface RunListModuleActions extends ActionTree<RunListModuleState, RootState> {
  [ACT_FETCH_RUN_LIST]: (this: Store<RootState>, injectee: RunListActionContext, args: {
    provider: string,
    owner: string,
    name: string,
    currentPageNumber: number,
    limit: number
  }) => Promise<void>;
}

export const actions: RunListModuleActions = {
  async [ACT_FETCH_RUN_LIST]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryRunListGQLQuery, {
      provider: args.provider,
      owner: args.owner,
      name: args.name,
      after: this.$getGQLAfter(args.currentPageNumber, args.limit),
      limit: args.limit
    }).then((response: GraphqlQueryResponse) => {
      commit(MUT_SET_RUN_LIST, response.data.repository?.runs)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
    })
  }
}