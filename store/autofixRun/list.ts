import RepositoryAutofixRunListGQLQuery from '~/apollo/queries/repository/runs/autofixRun/list.gql'
import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { GraphqlError } from '~/types/apollo-graphql-types'
import { Maybe, PageInfo, AutofixRunConnection, AutofixRunEdge, Repository } from '~/types/types'
import { RootState } from '~/store'

export enum AutofixRunListActions {
  FETCH_AUTOFIX_RUN_LIST = 'fetchAutofixRunList'
}

export enum AutofixRunListMutations {
  SET_ERROR = 'setAutofixRunListError',
  SET_LOADING = 'setAutofixRunListLoading',
  SET_AUTOFIX_RUN_LIST = 'setAutofixRunList'
}

export interface AutofixRunListModuleState {
  loading: boolean
  error: Record<string, any>
  autofixRunList: AutofixRunConnection
}

export const state = (): AutofixRunListModuleState => ({
  ...(<AutofixRunListModuleState>{
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

interface AutofixRunListModuleMutations extends MutationTree<AutofixRunListModuleState> {
  [AutofixRunListMutations.SET_LOADING]: (state: AutofixRunListModuleState, value: boolean) => void
  [AutofixRunListMutations.SET_ERROR]: (
    state: AutofixRunListModuleState,
    error: GraphqlError
  ) => void
  [AutofixRunListMutations.SET_AUTOFIX_RUN_LIST]: (
    state: AutofixRunListModuleState,
    autofixRun: AutofixRunConnection
  ) => void
}

export const mutations: AutofixRunListModuleMutations = {
  [AutofixRunListMutations.SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [AutofixRunListMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [AutofixRunListMutations.SET_AUTOFIX_RUN_LIST]: (state, autofixRunList) => {
    state.autofixRunList = Object.assign({}, state.autofixRunList, autofixRunList)
  }
}

interface AutofixRunListModuleActions extends ActionTree<AutofixRunListModuleState, RootState> {
  [AutofixRunListActions.FETCH_AUTOFIX_RUN_LIST]: (
    this: Store<RootState>,
    injectee: AutofixRunListActionContext,
    args: {
      provider: string
      owner: string
      name: string
      currentPageNumber: number
      limit: number
      refetch?: boolean
    }
  ) => Promise<void>
}

export const actions: AutofixRunListModuleActions = {
  async [AutofixRunListActions.FETCH_AUTOFIX_RUN_LIST]({ commit }, args) {
    commit(AutofixRunListMutations.SET_LOADING, true)
    try {
      const response: { data: { repository: Repository } } = await this.$fetchGraphqlData(
        RepositoryAutofixRunListGQLQuery,
        {
          provider: this.$providerMetaMap[args.provider].value,
          owner: args.owner,
          name: args.name,
          after: this.$getGQLAfter(args.currentPageNumber, args.limit),
          limit: args.limit
        },
        args.refetch
      )
      commit(AutofixRunListMutations.SET_AUTOFIX_RUN_LIST, response.data.repository?.autofixRuns)
      commit(AutofixRunListMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(AutofixRunListMutations.SET_ERROR, error)
      commit(AutofixRunListMutations.SET_LOADING, false)
    }
  }
}
