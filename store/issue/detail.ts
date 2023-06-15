import RepositoryIssueDetailGQLQuery from '~/apollo/queries/repository/issue/detail.gql'
import RepositoryNodeIssueDetailGQLQuery from '~/apollo/queries/repository/issue/issueChildren.gql'
import SingleIssueDetailGQLQuery from '~/apollo/queries/repository/issue/single.gql'
import SilenceRulesGQLQuery from '~/apollo/queries/repository/issue/silenceRules.gql'
import IssueDirectoryDetailGQLQuery from '~/apollo/queries/issue/getAnIssue.gql'
import SingleIssueWithPriorityGQLQuery from '~/apollo/queries/issue-priority/singleIssueWithPriority.gql'
import UpdateIssuePriorityGQLMutation from '~/apollo/mutations/issue-priority/updateIssuePriority.gql'

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
  IssuePriority,
  UpdateIssuePriorityInput,
  IssuePriorityLevel,
  RunnerApp
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
  FETCH_ISSUE_DETAILS = 'fetchIssueDetails',
  FETCH_ISSUE_PRIORITY = 'fetchIssuePriority',
  UPDATE_ISSUE_PRIORITY = 'updateIssuePriority'
}

export enum IssueDetailMutations {
  SET_LOADING = 'setIssueDetailLoading',
  SET_ERROR = 'setIssueDetailError',
  SET_SINGLE_ISSUE = 'setSingleIssue',
  SET_ISSUE = 'setIssue',
  SET_ISSUE_CHILDREN = 'setIssueChildren',
  SET_ISSUE_DIR_DETAILS = 'setIssueDirDetails',
  SET_RUNNER_INFO = 'setRunnerInfo'
}

export interface IssueDetailModuleState {
  loading: boolean
  error: Record<string, any>
  issue: RepositoryIssue
  silenceRules: SilenceRule[]
  singleIssue: Issue
  checkIssues: CheckIssueConnection
  issueDirDetails: Issue
  runnerInfo: RunnerApp
}

export const state = (): IssueDetailModuleState => ({
  ...(<IssueDetailModuleState>{
    loading: false,
    error: {},
    issue: {},
    singleIssue: {},
    checkIssues: {},
    issueDirDetails: {},
    runnerInfo: {}
  })
})

export type IssueDetailActionContext = ActionContext<IssueDetailModuleState, RootState>

export const getters: GetterTree<IssueDetailModuleState, RootState> = {}

interface IssueDetailModuleMutations extends MutationTree<IssueDetailModuleState> {
  [IssueDetailMutations.SET_LOADING]: (state: IssueDetailModuleState, value: boolean) => void
  [IssueDetailMutations.SET_ERROR]: (state: IssueDetailModuleState, error: GraphqlError) => void
  [IssueDetailMutations.SET_ISSUE]: (state: IssueDetailModuleState, issue: RepositoryIssue) => void
  [IssueDetailMutations.SET_SINGLE_ISSUE]: (state: IssueDetailModuleState, issue: Issue) => void
  [IssueDetailMutations.SET_ISSUE_CHILDREN]: (
    state: IssueDetailModuleState,
    checkIssues: CheckIssueConnection
  ) => void
  [IssueDetailMutations.SET_ISSUE_DIR_DETAILS]: (
    state: IssueDetailModuleState,
    issue: Issue
  ) => void
  [IssueDetailMutations.SET_ISSUE_DIR_DETAILS]: (
    state: IssueDetailModuleState,
    issue: Issue
  ) => void
  [IssueDetailMutations.SET_RUNNER_INFO]: (
    state: IssueDetailModuleState,
    runnerInfo: RunnerApp
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
  [IssueDetailMutations.SET_SINGLE_ISSUE]: (state, issue: Issue) => {
    if (state.singleIssue.id === issue.id) {
      state.singleIssue = Object.assign({}, state.singleIssue, issue)
    } else {
      state.singleIssue = issue
    }
  },
  [IssueDetailMutations.SET_ISSUE_DIR_DETAILS]: (state, issue: Issue) => {
    state.issueDirDetails = Object.assign({}, state.issueDirDetails, issue)
  },
  [IssueDetailMutations.SET_RUNNER_INFO]: (state, runnerInfo: RunnerApp) => {
    state.runnerInfo = runnerInfo
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
  ) => Promise<RepositoryIssue | undefined>
  [IssueDetailActions.FETCH_ISSUE_CHILDREN]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      nodeId: string
      q?: string
      sort?: string
      currentPageNumber: number
      limit: number
      isRunner: boolean
    }
  ) => Promise<void>
  [IssueDetailActions.FETCH_SINGLE_ISSUE]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      shortcode: string
    }
  ) => Promise<Issue | undefined>
  [IssueDetailActions.FETCH_SILENCE_RULES]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      provider: string
      owner: string
      name: string
      limit?: number
      currentPage?: number
      issueCode?: string
      refetch?: boolean
    }
  ) => Promise<Array<SilenceRule>>
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
  [IssueDetailActions.FETCH_ISSUE_PRIORITY]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      objectId: string
      level: IssuePriorityLevel
      shortcode: string
      refetch?: boolean
    }
  ) => Promise<IssuePriority | null>
  [IssueDetailActions.UPDATE_ISSUE_PRIORITY]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      input: UpdateIssuePriorityInput
      objectId: string
      level: IssuePriorityLevel
      refetch?: boolean
    }
  ) => Promise<IssuePriority | null>
}

export const actions: IssueDetailModuleActions = {
  async [IssueDetailActions.FETCH_ISSUE]({ commit }, args) {
    commit(IssueDetailMutations.SET_LOADING, true)
    try {
      const res: GraphqlQueryResponse = await this.$fetchGraphqlData(
        RepositoryIssueDetailGQLQuery,
        {
          repositoryId: args.repositoryId,
          shortcode: args.shortcode
        },
        args.refetch
      )

      commit(IssueDetailMutations.SET_ISSUE, res.data.repository?.issue)

      if (res.data.repository?.issue) {
        return res.data.repository.issue as RepositoryIssue
      }
    } catch (e) {
      commit(IssueDetailMutations.SET_ERROR, e as GraphqlError)
    } finally {
      commit(IssueDetailMutations.SET_LOADING, false)
    }
    return undefined
  },
  async [IssueDetailActions.FETCH_SINGLE_ISSUE]({ commit }, args) {
    commit(IssueDetailMutations.SET_LOADING, true)
    try {
      const res: GraphqlQueryResponse = await this.$fetchGraphqlData(SingleIssueDetailGQLQuery, {
        shortcode: args.shortcode
      })

      commit(IssueDetailMutations.SET_SINGLE_ISSUE, res.data?.issue)

      if (res.data?.issue) {
        return res.data.issue as Issue
      }
    } catch (e) {
      commit(IssueDetailMutations.SET_ERROR, e as GraphqlError)
    } finally {
      commit(IssueDetailMutations.SET_LOADING, false)
    }
    return undefined
  },
  async [IssueDetailActions.FETCH_SILENCE_RULES](_, args) {
    const response = await this.$fetchGraphqlData(
      SilenceRulesGQLQuery,
      {
        provider: this.$providerMetaMap[args.provider].value,
        owner: args.owner,
        name: args.name,
        limit: args.limit ?? 30,
        after: this.$getGQLAfter(args.currentPage ?? 1, args.limit ?? 30),
        issueCode: args.issueCode
      },
      args.refetch
    )
    return resolveNodes(response.data.repository?.silenceRules) as Array<SilenceRule>
  },
  async [IssueDetailActions.FETCH_ISSUE_CHILDREN]({ commit }, args) {
    const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
      RepositoryNodeIssueDetailGQLQuery,
      {
        nodeId: args.nodeId,
        q: args.q,
        sort: args.sort,
        after: this.$getGQLAfter(args.currentPageNumber, args.limit),
        limit: args.limit,
        isRunner: args.isRunner
      }
    )

    const topLevelNode = response.data.node as RepositoryIssue

    commit(IssueDetailMutations.SET_ISSUE_CHILDREN, topLevelNode.checkIssues)

    // The `runnerApp` field is conditionally queried based on `isRunner` arg
    // Hence, conditionally committing it to the store
    if (args.isRunner) {
      commit(
        IssueDetailMutations.SET_RUNNER_INFO,
        topLevelNode.repositoryInstance.owner.runnerApp ?? {}
      )
    }
  },
  async [IssueDetailActions.IGNORE_ISSUE_FILE_PATTERN](_, args) {
    const response = await this.$applyGraphqlMutation(IgnoreIssueFilePatternMutation, args)
    return response.data.ignoreIssueForFilePatternInRepository
  },
  async [IssueDetailActions.IGNORE_ISSUE_TEST_PATTERN](_, args) {
    const response = await this.$applyGraphqlMutation(IgnoreIssueTestPatternMutation, args)
    return response.data.ignoreIssueForTestPatternsInRepository
  },
  async [IssueDetailActions.IGNORE_ISSUE_REPOSITORY](_, args) {
    const response = await this.$applyGraphqlMutation(IgnoreIssueRepository, args)
    return response.data.ignoreIssueForRepository
  },
  async [IssueDetailActions.IGNORE_ISSUE_FOR_FILE](_, args) {
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
      if (issueResponse?.data?.issue) {
        return issueResponse.data.issue as Issue
      }
      return undefined
    } catch (e) {
      commit(IssueDetailMutations.SET_ERROR, e as GraphqlError)
    } finally {
      commit(IssueDetailMutations.SET_LOADING, false)
    }
  },
  async [IssueDetailActions.FETCH_ISSUE_PRIORITY]({ commit }, args) {
    commit(IssueDetailMutations.SET_LOADING, true)
    try {
      const issueResponse = await this.$fetchGraphqlData(
        SingleIssueWithPriorityGQLQuery,
        args,
        true
      )
      return issueResponse?.data?.issue?.issuePriority
    } catch (e) {
      commit(IssueDetailMutations.SET_ERROR, e as GraphqlError)
    } finally {
      commit(IssueDetailMutations.SET_LOADING, false)
    }
  },
  async [IssueDetailActions.UPDATE_ISSUE_PRIORITY]({ commit }, args) {
    try {
      const response = await this.$applyGraphqlMutation(
        UpdateIssuePriorityGQLMutation,
        args,
        args.refetch
      )
      return response?.data?.updateIssuePriority?.issue?.issuePriority
    } catch (e) {
      const error = e as GraphqlError
      commit(IssueDetailMutations.SET_ERROR, error)
    }
  }
}
