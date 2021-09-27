import RepositoryIssueDetailGQLQuery from '~/apollo/queries/repository/issue/detail.gql'
import RepositoryNodeIssueDetailGQLQuery from '~/apollo/queries/repository/issue/issueChildren.gql'
import SingleIssueDetailGQLQuery from '~/apollo/queries/repository/issue/single.gql'
import SilenceRulesGQLQuery from '~/apollo/queries/repository/issue/silenceRules.gql'
import IssueDirectoryDetailGQLQuery from '~/apollo/queries/issue/getAnIssue.gql'

import IgnoreIssueFilePatternMutation from '~/apollo/mutations/issue/ignoreIssueFilePattern.gql'
import IgnoreIssueTestPatternMutation from '~/apollo/mutations/issue/ignoreIssueTestPattern.gql'
import IgnoreIssueRepository from '~/apollo/mutations/issue/ignoreIssueRepository.gql'
import IgnoreIssueForFile from '~/apollo/mutations/issue/ignoreIssueForFile.gql'
import IgnoreCheckIssue from '~/apollo/mutations/issue/ignoreCheckIssue.gql'
import IgnoreIssueFalsePositive from '~/apollo/mutations/issue/ignoreIssueFalsePositive.gql'
import CreateAutofixRun from '~/apollo/mutations/issue/createAutofixRun.gql'

import { GetterTree, ActionTree, MutationTree, ActionContext, Store } from 'vuex'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  RepositoryIssue,
  Issue,
  CheckIssueConnection,
  IgnoreCheckIssueActionChoice,
  CreateAutofixRunInput,
  IgnoreIssueForFilePatternInRepositoryPayload,
  ReportIssueFalsePositivePayload,
  IgnoreCheckIssuePayload,
  SilenceRule,
  SilenceRuleConnection
} from '~/types/types'
import { RootState } from '~/store'
import { resolveNodes } from '~/utils/array'

export enum IssueDetailActions {
  FETCH_SINGLE_ISSUE = 'fetchSingleIssue',
  FETCH_ISSUE = 'fetchIssue',
  FETCH_ISSUE_CHILDREN = 'fetchIssueChildren',
  FETCH_SILENCE_RULES = 'fetchSilenceRules',
  IGNORE_ISSUE_FILE_PATTERN = 'ignoreIssueFilePattern',
  IGNORE_ISSUE_TEST_PATTERN = 'ignoreIssueTestPattern',
  IGNORE_ISSUE_REPOSITORY = 'ignoreIssueRepository',
  IGNORE_ISSUE_FOR_FILE = 'ignoreIssueForFile',
  IGNORE_ISSUE_CHECK_ISSUE = 'updateIgnoreCheckIssue',
  IGNORE_ISSUE_FALSE_POSITIVE = 'ignoreIssueFalsePositive',
  CREATE_AUTOFIX_RUN = 'createAutofixRun',
  FETCH_ISSUE_DETAILS = 'fetchIssueDetails'
}

export enum IssueDetailMutations {
  SET_LOADING = 'setIssueDetailLoading',
  SET_ERROR = 'setIssueDetailError',
  SET_SINGLE_ISSUE = 'setSingleIssue',
  SET_ISSUE = 'setIssue',
  SET_ISSUE_CHILDREN = 'setIssueChildren',
  SET_SILENCE_RULE = 'setSilenceRule',
  SET_ISSUE_DIR_DETAILS = 'setIssueDirDetails'
}

export interface IssueDetailModuleState {
  loading: boolean
  error: Record<string, any>
  issue: RepositoryIssue
  silenceRules: SilenceRule[]
  singleIssue: Issue
  checkIssues: CheckIssueConnection,
  issueDirDetails: Issue
}

export const state = (): IssueDetailModuleState => ({
  ...(<IssueDetailModuleState>{
    loading: false,
    error: {},
    issue: {},
    singleIssue: {},
    checkIssues: {},
    issueDirDetails: {}
  })
})

export type IssueDetailActionContext = ActionContext<IssueDetailModuleState, RootState>

export const getters: GetterTree<IssueDetailModuleState, RootState> = {}

interface IssueDetailModuleMutations extends MutationTree<IssueDetailModuleState> {
  [IssueDetailMutations.SET_LOADING]: (state: IssueDetailModuleState, value: boolean) => void
  [IssueDetailMutations.SET_ERROR]: (state: IssueDetailModuleState, error: GraphqlError) => void
  [IssueDetailMutations.SET_ISSUE]: (state: IssueDetailModuleState, issue: RepositoryIssue) => void
  [IssueDetailMutations.SET_SINGLE_ISSUE]: (state: IssueDetailModuleState, issue: Issue) => void
  [IssueDetailMutations.SET_SILENCE_RULE]: (
    state: IssueDetailModuleState,
    rules: SilenceRuleConnection
  ) => void
  [IssueDetailMutations.SET_ISSUE_CHILDREN]: (
    state: IssueDetailModuleState,
    checkIssues: CheckIssueConnection
  ) => void
  [IssueDetailMutations.SET_ISSUE_DIR_DETAILS]: (
    state: IssueDetailModuleState, issue: Issue
  ) => void
}

export const mutations: IssueDetailModuleMutations = {
  [IssueDetailMutations.SET_LOADING]: (state, value) => {
    state.loading = value
  },
  [IssueDetailMutations.SET_ERROR]: (state, error) => {
    state.error = Object.assign({}, state.error, error)
  },
  [IssueDetailMutations.SET_ISSUE]: (state, issue: RepositoryIssue) => {
    state.issue = Object.assign({}, state.issue, issue)
  },
  [IssueDetailMutations.SET_ISSUE_CHILDREN]: (state, checkIssues: CheckIssueConnection) => {
    state.checkIssues = Object.assign({}, state.checkIssues, checkIssues)
  },
  [IssueDetailMutations.SET_SILENCE_RULE]: (state, rules: SilenceRuleConnection) => {
    state.silenceRules = resolveNodes(rules) as SilenceRule[]
  },
  [IssueDetailMutations.SET_SINGLE_ISSUE]: (state, issue: Issue) => {
    state.singleIssue = Object.assign({}, state.issue, issue)
  },
  [IssueDetailMutations.SET_ISSUE_DIR_DETAILS]: (state, issue: Issue) => {
    state.issueDirDetails = Object.assign({}, state.issueDirDetails, issue)
  }
}

interface IssueDetailModuleActions extends ActionTree<IssueDetailModuleState, RootState> {
  [IssueDetailActions.FETCH_ISSUE]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      repositoryId: string
      shortcode: string
      refetch?: boolean
    }
  ) => Promise<void>
  [IssueDetailActions.FETCH_ISSUE_CHILDREN]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      nodeId: string
      q: string
      sort: string
      currentPageNumber: number
      limit: number
    }
  ) => Promise<void>
  [IssueDetailActions.FETCH_SINGLE_ISSUE]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      shortcode: string
    }
  ) => Promise<void>
  [IssueDetailActions.FETCH_SILENCE_RULES]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      limit?: number
      currentPage?: number
      issueCode: string
    }
  ) => Promise<void>
  [IssueDetailActions.IGNORE_ISSUE_FILE_PATTERN]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      repoIssueId?: string
      checkId?: string
      issueShortcode?: string
      pattern: string
    }
  ) => Promise<IgnoreIssueForFilePatternInRepositoryPayload>
  [IssueDetailActions.IGNORE_ISSUE_TEST_PATTERN]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      repoIssueId?: string
      checkId?: string
      issueShortcode?: string
    }
  ) => Promise<void>
  [IssueDetailActions.IGNORE_ISSUE_REPOSITORY]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      repoIssueId?: string
      checkId?: string
      issueShortcode?: string
    }
  ) => Promise<void>
  [IssueDetailActions.IGNORE_ISSUE_FOR_FILE]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      repoIssueId?: string
      checkId?: string
      filePath: string
      issueShortcode?: string
    }
  ) => Promise<void>
  [IssueDetailActions.IGNORE_ISSUE_CHECK_ISSUE]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      checkIssueId: string
      action?: IgnoreCheckIssueActionChoice
    }
  ) => Promise<IgnoreCheckIssuePayload>
  [IssueDetailActions.IGNORE_ISSUE_FALSE_POSITIVE]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      checkIssueId: string
      comment: string
    }
  ) => Promise<ReportIssueFalsePositivePayload>
  [IssueDetailActions.CREATE_AUTOFIX_RUN]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: CreateAutofixRunInput
  ) => Promise<void>
  [IssueDetailActions.FETCH_ISSUE_DETAILS]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: { shortcode: string }
  ) => Promise<Issue | undefined>
}

export const actions: IssueDetailModuleActions = {
  async [IssueDetailActions.FETCH_ISSUE]({ commit }, args) {
    commit(IssueDetailMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(
      RepositoryIssueDetailGQLQuery,
      {
        repositoryId: args.repositoryId,
        shortcode: args.shortcode
      },
      args.refetch
    )
      .then((response: GraphqlQueryResponse) => {
        commit(IssueDetailMutations.SET_ISSUE, response.data.repository?.issue)
        commit(IssueDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(IssueDetailMutations.SET_ERROR, e)
        commit(IssueDetailMutations.SET_LOADING, false)
      })
  },
  async [IssueDetailActions.FETCH_SINGLE_ISSUE]({ commit }, args) {
    commit(IssueDetailMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(SingleIssueDetailGQLQuery, {
      shortcode: args.shortcode
    })
      .then((response: GraphqlQueryResponse) => {
        commit(IssueDetailMutations.SET_SINGLE_ISSUE, response.data.issue)
        commit(IssueDetailMutations.SET_LOADING, false)
      })
      .catch((e: GraphqlError) => {
        commit(IssueDetailMutations.SET_ERROR, e)
        commit(IssueDetailMutations.SET_LOADING, false)
      })
  },
  async [IssueDetailActions.FETCH_SILENCE_RULES]({ commit }, args) {
    const response = await this.$fetchGraphqlData(SilenceRulesGQLQuery, {
      provider: this.$providerMetaMap[args.provider].value,
      owner: args.owner,
      name: args.name,
      limit: args.limit ?? 30,
      after: this.$getGQLAfter(args.currentPage ?? 1, args.limit ?? 30),
      issueCode: args.issueCode
    })
    commit(IssueDetailMutations.SET_SILENCE_RULE, response.data.repository?.silenceRules)
  },
  async [IssueDetailActions.FETCH_ISSUE_CHILDREN]({ commit }, args) {
    commit(IssueDetailMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryNodeIssueDetailGQLQuery, {
      nodeId: args.nodeId,
      q: args.q,
      sort: args.sort,
      after: this.$getGQLAfter(args.currentPageNumber, args.limit),
      limit: args.limit
    })
      .then((response: GraphqlQueryResponse) => {
        commit(IssueDetailMutations.SET_LOADING, false)
        commit(
          IssueDetailMutations.SET_ISSUE_CHILDREN,
          (response.data.node as RepositoryIssue).checkIssues
        )
      })
      .catch((e: GraphqlError) => {
        commit(IssueDetailMutations.SET_ERROR, e)
        commit(IssueDetailMutations.SET_LOADING, false)
      })
  },
  async [IssueDetailActions.IGNORE_ISSUE_FILE_PATTERN]({ }, args) {
    const response = await this.$applyGraphqlMutation(IgnoreIssueFilePatternMutation, args)
    return response.data.ignoreIssueForFilePatternInRepository
  },
  async [IssueDetailActions.IGNORE_ISSUE_TEST_PATTERN]({ }, args) {
    const response = await this.$applyGraphqlMutation(IgnoreIssueTestPatternMutation, args)
    return response.data.ignoreIssueForTestPatternsInRepository
  },
  async [IssueDetailActions.IGNORE_ISSUE_REPOSITORY]({ }, args) {
    const response = await this.$applyGraphqlMutation(IgnoreIssueRepository, args)
    return response.data.ignoreIssueForRepository
  },
  async [IssueDetailActions.IGNORE_ISSUE_FOR_FILE]({ }, args) {
    const response = await this.$applyGraphqlMutation(IgnoreIssueForFile, args)
    return response.data.ignoreIssueForRepository
  },
  async [IssueDetailActions.IGNORE_ISSUE_CHECK_ISSUE](_, args) {
    const response = await this.$applyGraphqlMutation(IgnoreCheckIssue, {
      checkIssueId: args.checkIssueId,
      action: args.action ?? IgnoreCheckIssueActionChoice.Delete
    })
    return response.data.ignoreCheckIssue
  },
  async [IssueDetailActions.IGNORE_ISSUE_FALSE_POSITIVE](_, { checkIssueId, comment }) {
    const response = await this.$applyGraphqlMutation(IgnoreIssueFalsePositive, {
      checkIssueId,
      comment
    })
    return response.data.reportIssueFalsePositive
  },
  async [IssueDetailActions.CREATE_AUTOFIX_RUN]({ commit }, args) {
    const response = await this.$applyGraphqlMutation(CreateAutofixRun, {
      input: args
    })
    commit(IssueDetailMutations.SET_LOADING, false)
    return response.data.createAutofixRun
  },
  async [IssueDetailActions.FETCH_ISSUE_DETAILS]({ commit }, args) {
    commit(IssueDetailMutations.SET_LOADING, true)
    try {
      const issueResponse = await this.$fetchGraphqlData(IssueDirectoryDetailGQLQuery, {
        shortcode: args.shortcode
      })
      if (issueResponse && issueResponse.data && issueResponse.data.issue) {
        return issueResponse.data.issue as Issue
      }
      return undefined
    }
    catch (e) {
      commit(IssueDetailMutations.SET_ERROR, e as GraphqlError)
    }
    finally {
      commit(IssueDetailMutations.SET_LOADING, false)
    }
  },
}
