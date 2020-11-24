import RepositoryTransformerRunListGQLQuery from '~/apollo/queries/repository/runs/transformerRun/list.gql'
import { Maybe, PageInfo, TransformerRunConnection, TransformerRunEdge } from '~/types/types'
import { GetterTree, ActionTree, MutationTree, Store, ActionContext } from 'vuex'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import { RootState } from '~/store'

export const ACT_FETCH_TRANSFORMER_RUN_LIST = 'fetchTransformerRunList'

export const MUT_SET_TRANSFORMER_RUN_LIST = 'setTransformerRunList'
export const MUT_SET_LOADING = 'setTransformerRunListLoading'
export const MUT_SET_ERROR = 'setTransformerRunListError'

export interface TransformerRunListModuleState {
  loading: boolean,
  error: Record<string, any>,
  transformerRunList: TransformerRunConnection
}

export const state = (): TransformerRunListModuleState => ({
  ...<TransformerRunListModuleState>({
    loading: false,
    error: {},
    transformerRunList: {
      pageInfo: {} as PageInfo,
      edges: [] as Array<Maybe<TransformerRunEdge>>
    }
  })
})

export type TransformerRunListActionContext = ActionContext<TransformerRunListModuleState, RootState>

export const getters: GetterTree<TransformerRunListModuleState, RootState> = {}

interface TransformerRunListMutations extends MutationTree<TransformerRunListModuleState> {
  [MUT_SET_LOADING]: (state: TransformerRunListModuleState, value: boolean) => void;
  [MUT_SET_ERROR]: (state: TransformerRunListModuleState, error: GraphqlError) => void;
  [MUT_SET_TRANSFORMER_RUN_LIST]: (state: TransformerRunListModuleState, transformerRun: TransformerRunConnection) => void;
}

export const mutations: TransformerRunListMutations = {
  [MUT_SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [MUT_SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [MUT_SET_TRANSFORMER_RUN_LIST]: (state, transformerRunList) => {
    state.transformerRunList = Object.assign({}, state.transformerRunList, transformerRunList)
  }
}

interface TransformerRunListModuleActions extends ActionTree<TransformerRunListModuleState, RootState> {
  [ACT_FETCH_TRANSFORMER_RUN_LIST]: (this: Store<RootState>, injectee: TransformerRunListActionContext, args: {
    provider: string,
    owner: string,
    name: string,
    currentPageNumber: number,
    limit: number
  }) => Promise<void>;
}

export const actions: TransformerRunListModuleActions = {
  async [ACT_FETCH_TRANSFORMER_RUN_LIST]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryTransformerRunListGQLQuery, {
      provider: args.provider,
      owner: args.owner,
      name: args.name,
      after: this.$getGQLAfter(args.currentPageNumber, args.limit),
      limit: args.limit
    }).then((response: GraphqlQueryResponse) => {
      commit(MUT_SET_TRANSFORMER_RUN_LIST, response.data.repository?.transformerRuns)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
    })
  }
}
