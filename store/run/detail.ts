import RunConcreteIssueListGQLQuery from '~/apollo/queries/repository/runs/run/check/concreteIssueList.gql'
import RunAutofixableIssuesGQLQuery from '~/apollo/queries/repository/runs/run/check/autofixableIssues.gql'
import RepositoryRunGQLQuery from '~/apollo/queries/repository/runs/run/single.gql'
import RepositoryRunCheckGQLQuery from '~/apollo/queries/repository/runs/run/check/detail.gql'
import RepositoryRunCheckIssuesGQLQuery from '~/apollo/queries/repository/runs/run/check/checkIssue.gql'
import CreateAutofixRunForPullRequestMutation from '~/apollo/mutations/autofix/createAutofixRunForPullRequest.gql'
import CommitFixToPullRequest from '~/apollo/mutations/autofix/commitFixToPullRequest.gql'
import CreatePullRequest from '~/apollo/mutations/autofix/createPullRequest.gql'
import IgnoreCheckMetricMutation from '~/apollo/mutations/repository/ignoreCheckMetric.gql'

import {
  PageInfo,
  Maybe,
  IssueEdge,
  Check,
  IssueConnection,
  Run,
  CheckIssueConnection,
  CreateAutofixRunForPullRequestInput,
  CreatePullRequestInput
} from '~/types/types'
import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import {
  GraphqlError,
  GraphqlMutationResponse,
  GraphqlQueryResponse
} from '~/types/apollo-graphql-types'
import { RootState } from '~/store'

export enum RunDetailActions {
  FETCH_RUN = 'fetchRun',
  FETCH_CHECK = 'fetchCheck',
  FETCH_CHECK_ISSUES = 'fetchCheckIssues',
  FETCH_CONCRETE_ISSUE_LIST = 'fetchConcreteIssueList',
  SET_CONCRETE_ISSUE = 'setConcreteIssue',
  FETCH_AUTOFIXABLE_ISSUES = 'fetchAutofixableIssues',
  CREATE_AUTOFIX_PR = 'createAutofixPR',
  COMMIT_TO_PR = 'commitFixToPR',
  CREATE_PR = 'createPullRequest',
  IGNORE_CHECK_METRIC = 'ignoreCheckMetric'
}

export enum RunDetailMutations {
  SET_ERROR = 'setRunDetailError',
  SET_LOADING = 'setRunDetailLoading',
  SET_RUN = 'setRun',
  SET_CHECK = 'setCheck',
  SET_CHECK_ISSUES = 'setCheckIssues',
  SET_CONCRETE_ISSUE_LIST = 'setConcreteIssueList'
}

export const state = () => ({
  loading: false as boolean,
  error: {},
  run: {} as Run,
  check: {} as Check,
  checkIssues: {} as CheckIssueConnection,
  concreteIssueList: {
    pageInfo: {} as PageInfo,
    edges: [] as Array<Maybe<IssueEdge>>
  } as IssueConnection
})

export type RunDetailModuleState = ReturnType<typeof state>
export type RunDetailActionContext = ActionContext<RunDetailModuleState, RootState>

export const getters: GetterTree<RunDetailModuleState, RootState> = {}

interface RunDetailModuleMutations extends MutationTree<RunDetailModuleState> {
  [RunDetailMutations.SET_LOADING]: (state: RunDetailModuleState, value: boolean) => void
  [RunDetailMutations.SET_ERROR]: (state: RunDetailModuleState, error: GraphqlError) => void
  [RunDetailMutations.SET_RUN]: (state: RunDetailModuleState, run: Run) => void
  [RunDetailMutations.SET_CHECK]: (state: RunDetailModuleState, check: Check) => void
  [RunDetailMutations.SET_CHECK_ISSUES]: (
    state: RunDetailModuleState,
    checkIssues: CheckIssueConnection
  ) => void
  [RunDetailMutations.SET_CONCRETE_ISSUE_LIST]: (
    state: RunDetailModuleState,
    concreteIssueList: IssueConnection
  ) => void
}

export const mutations: RunDetailModuleMutations = {
  [RunDetailMutations.SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [RunDetailMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [RunDetailMutations.SET_RUN]: (state, run) => {
    state.run = run
  },
  [RunDetailMutations.SET_CHECK]: (state, check) => {
    state.check = check
  },
  [RunDetailMutations.SET_CHECK_ISSUES]: (state, checkIssues) => {
    state.checkIssues = checkIssues
  },
  [RunDetailMutations.SET_CONCRETE_ISSUE_LIST]: (state, concreteIssueList) => {
    state.concreteIssueList = concreteIssueList
  }
}

interface RunDetailModuleActions extends ActionTree<RunDetailModuleState, RootState> {
  [RunDetailActions.FETCH_RUN]: (
    this: Store<RootState>,
    injectee: RunDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      runId: string
      refetch?: boolean
    }
  ) => Promise<void>
  [RunDetailActions.FETCH_CHECK]: (
    this: Store<RootState>,
    injectee: RunDetailActionContext,
    args: {
      checkId: string
      refetch?: boolean
    }
  ) => Promise<void>
  [RunDetailActions.FETCH_CHECK_ISSUES]: (
    this: Store<RootState>,
    injectee: RunDetailActionContext,
    args: {
      checkId: string
      shortcode: string
      currentPageNumber: number
      limit: number
      q?: Maybe<string>
      sort?: Maybe<string>
    }
  ) => Promise<void>
  [RunDetailActions.FETCH_AUTOFIXABLE_ISSUES]: (
    this: Store<RootState>,
    injectee: RunDetailActionContext,
    args: {
      checkId: string
    }
  ) => Promise<void>
  [RunDetailActions.FETCH_CONCRETE_ISSUE_LIST]: (
    this: Store<RootState>,
    injectee: RunDetailActionContext,
    args: {
      checkId: string
      limit: number
      currentPageNumber: number
      sort?: string
      issueType?: string
      q?: string
      refetch?: boolean
    }
  ) => Promise<void>
  [RunDetailActions.CREATE_AUTOFIX_PR]: (
    this: Store<RootState>,
    injectee: RunDetailActionContext,
    args: {
      input: CreateAutofixRunForPullRequestInput
    }
  ) => Promise<void>
  [RunDetailActions.COMMIT_TO_PR]: (
    this: Store<RootState>,
    injectee: RunDetailActionContext,
    args: {
      input: CreatePullRequestInput
    }
  ) => Promise<void>
  [RunDetailActions.CREATE_PR]: (
    this: Store<RootState>,
    injectee: RunDetailActionContext,
    args: {
      input: CreatePullRequestInput
    }
  ) => Promise<void>
  [RunDetailActions.IGNORE_CHECK_METRIC]: (
    this: Store<RootState>,
    injectee: RunDetailActionContext,
    args: {
      checkId: string
      metricShortcode: string
      key: string
    }
  ) => Promise<boolean>
}

export const actions: RunDetailModuleActions = {
  async [RunDetailActions.FETCH_RUN]({ commit }, args) {
    commit(RunDetailMutations.SET_LOADING, true)
    try {
      const response = await this.$fetchGraphqlData(
        RepositoryRunGQLQuery,
        {
          provider: this.$providerMetaMap[args.provider].value,
          owner: args.owner,
          name: args.name,
          runId: args.runId
        },
        args.refetch
      )
      commit(RunDetailMutations.SET_RUN, response.data.repository?.run)
      commit(RunDetailMutations.SET_LOADING, false)
      return response.data.repository?.run
    } catch (e) {
      commit(RunDetailMutations.SET_ERROR, e)
      commit(RunDetailMutations.SET_LOADING, false)
    }
  },
  async [RunDetailActions.FETCH_CHECK]({ commit }, { checkId, refetch }) {
    commit(RunDetailMutations.SET_LOADING, true)
    try {
      const response = await this.$fetchGraphqlData(
        RepositoryRunCheckGQLQuery,
        {
          checkId: checkId
        },
        refetch
      )
      const check = response.data.check as Check
      commit(RunDetailMutations.SET_CHECK, check)
    } catch (e) {
      commit(RunDetailMutations.SET_ERROR, e)
    } finally {
      commit(RunDetailMutations.SET_LOADING, false)
    }
  },
  async [RunDetailActions.FETCH_CHECK_ISSUES]({ commit }, args) {
    commit(RunDetailMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryRunCheckIssuesGQLQuery, {
      checkId: args.checkId,
      shortcode: args.shortcode,
      limit: args.limit,
      after: this.$getGQLAfter(args.currentPageNumber, args.limit),
      q: args.q,
      sort: args.sort
    })
      .then((response: GraphqlQueryResponse) => {
        commit(RunDetailMutations.SET_CHECK_ISSUES, response.data.checkIssues)
        commit(RunDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RunDetailMutations.SET_ERROR, e)
        commit(RunDetailMutations.SET_LOADING, false)
      })
  },
  async [RunDetailActions.FETCH_AUTOFIXABLE_ISSUES]({ commit }, args) {
    commit(RunDetailMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(RunAutofixableIssuesGQLQuery, {
      checkId: args.checkId
    })
      .then((response: GraphqlQueryResponse) => {
        commit(RunDetailMutations.SET_RUN, response.data.check)
        commit(RunDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(RunDetailMutations.SET_ERROR, e)
        commit(RunDetailMutations.SET_LOADING, false)
      })
  },
  async [RunDetailActions.FETCH_CONCRETE_ISSUE_LIST]({ commit }, args) {
    commit(RunDetailMutations.SET_LOADING, true)
    try {
      const response = await this.$fetchGraphqlData(
        RunConcreteIssueListGQLQuery,
        args,
        args.refetch
      )
      commit(RunDetailMutations.SET_CONCRETE_ISSUE_LIST, response.data.check?.concreteIssues)
    } catch (e) {
      commit(RunDetailMutations.SET_ERROR, e)
    } finally {
      commit(RunDetailMutations.SET_LOADING, false)
    }
  },
  async [RunDetailActions.CREATE_AUTOFIX_PR]({ commit }, args) {
    try {
      commit(RunDetailMutations.SET_LOADING, true)
      const response = await this.$applyGraphqlMutation(CreateAutofixRunForPullRequestMutation, {
        input: args.input
      })
      return response.data.createAutofixRunForPullRequest
    } catch (e) {
      const error = e as GraphqlError
      commit(RunDetailMutations.SET_ERROR, error)
    } finally {
      commit(RunDetailMutations.SET_LOADING, false)
    }
  },
  async [RunDetailActions.COMMIT_TO_PR]({ commit }, args) {
    commit(RunDetailMutations.SET_LOADING, true)
    const response = await this.$applyGraphqlMutation(CommitFixToPullRequest, {
      input: args.input
    })
    commit(RunDetailMutations.SET_LOADING, false)
    return response
  },
  async [RunDetailActions.CREATE_PR]({ commit }, args) {
    commit(RunDetailMutations.SET_LOADING, true)
    const response = await this.$applyGraphqlMutation(CreatePullRequest, {
      input: args.input
    })
    commit(RunDetailMutations.SET_LOADING, false)
    return response
  },
  async [RunDetailActions.IGNORE_CHECK_METRIC](_context, { checkId, key, metricShortcode }) {
    try {
      const response = (await this.$applyGraphqlMutation(IgnoreCheckMetricMutation, {
        checkId,
        key,
        metricShortcode
      })) as GraphqlMutationResponse

      return Boolean(response.data.ignoreCheckMetric?.ok)
    } catch (e) {
      this.$logErrorAndToast(e as Error, 'An error ocurred while ignoring metric.')
    }
    return false
  }
}
