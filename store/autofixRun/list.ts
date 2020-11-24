import RepositoryAutofixRunListGQLQuery from '~/apollo/queries/repository/runs/autofixRun/list.gql'
import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {Maybe,PageInfo,AutofixRunConnection,AutofixRunEdge} from '~/types/types'
import { RootState } from '~/store'

export const ACT_FETCH_AUTOFIX_RUN_LIST = 'fetchAutofixRunList'

export const MUT_SET_AUTOFIX_RUN_LIST = 'setAutofixRunList';
export const MUT_SET_LOADING = 'setAutofixRunListLoading'
export const MUT_SET_ERROR = 'setAutofixRunListError'

export interface AutofixRunListModuleState {
  loading: boolean,
  error: Record<string, any>,
  autofixRunList: AutofixRunConnection
}

export const state = (): AutofixRunListModuleState => ({
  ...<AutofixRunListModuleState>({
    loading: false,
    error: {},
    autofixRunList: {
      pageInfo: {} as PageInfo,
      edges: [] as Array<Maybe<AutofixRunEdge>>
    }
  })
})

export type AutofixRunListActionContext = ActionContext<AutofixRunListModuleState, RootState>

export const getters: GetterTree<AutofixRunListModuleState, RootState> = {}

interface AutofixRunListMutations extends MutationTree<AutofixRunListModuleState> {
  [MUT_SET_LOADING]: (state: AutofixRunListModuleState, value: boolean) => void;
  [MUT_SET_ERROR]: (state: AutofixRunListModuleState, error: GraphqlError) => void;
  [MUT_SET_AUTOFIX_RUN_LIST]: (state: AutofixRunListModuleState, autofixRun: AutofixRunConnection) => void;
}

export const mutations: AutofixRunListMutations = {
  [MUT_SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [MUT_SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [MUT_SET_AUTOFIX_RUN_LIST]: (state, autofixRunList) => {
    state.autofixRunList = Object.assign({}, state.autofixRunList, autofixRunList)
  }
}

interface AutofixRunListModuleActions extends ActionTree<AutofixRunListModuleState, RootState> {
  [ACT_FETCH_AUTOFIX_RUN_LIST]: (this: Store<RootState>, injectee: AutofixRunListActionContext, args: {
    provider: string,
    owner: string,
    name: string,
    currentPageNumber: number,
    limit: number
  }) => Promise<void>;
}

export const actions: AutofixRunListModuleActions = {
  async [ACT_FETCH_AUTOFIX_RUN_LIST]({ commit }, args) {
    commit(MUT_SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryAutofixRunListGQLQuery, {
      provider: args.provider,
      owner: args.owner,
      name: args.name,
      after: this.$getGQLAfter(args.currentPageNumber, args.limit),
      limit: args.limit
    }).then((response: GraphqlQueryResponse) => {
      commit(MUT_SET_AUTOFIX_RUN_LIST, response.data.repository?.autofixRuns)
      commit(MUT_SET_LOADING, false)
    }).catch((e: GraphqlError) => {
      commit(MUT_SET_ERROR, e)
      commit(MUT_SET_LOADING, false)
    })
  }
}