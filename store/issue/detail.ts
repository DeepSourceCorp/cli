import RepositoryIssueDetailGQLQuery from '~/apollo/queries/repository/issue/detail.gql'
import RepositoryNodeIssueDetailGQLQuery from '~/apollo/queries/repository/issue/issueChildren.gql'
import SingleIssueDetailGQLQuery from '~/apollo/queries/repository/issue/single.gql'

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
  IgnoreIssueForFilePatternInRepositoryPayload
} from '~/types/types'
import { RootState } from '~/store'

export enum IssueDetailActions {
  FETCH_SINGLE_ISSUE = 'fetchSingleIssue',
  FETCH_ISSUE = 'fetchIssue',
  FETCH_ISSUE_CHILDREN = 'fetchIssueChildren',
  IGNORE_ISSUE_FILE_PATTERN = 'ignoreIssueFilePattern',
  IGNORE_ISSUE_TEST_PATTERN = 'ignoreIssueTestPattern',
  IGNORE_ISSUE_REPOSITORY = 'ignoreIssueRepository',
  IGNORE_ISSUE_FOR_FILE = 'ignoreIssueForFile',
  IGNORE_ISSUE_CHECK_ISSUE = 'updateIgnoreCheckIssue',
  IGNORE_ISSUE_FALSE_POSITIVE = 'ignoreIssueFalsePositive',
  CREATE_AUTOFIX_RUN = 'createAutofixRun'
}

export enum IssueDetailMutations {
  SET_LOADING = 'setIssueDetailLoading',
  SET_ERROR = 'setIssueDetailError',
  SET_SINGLE_ISSUE = 'setSingleIssue',
  SET_ISSUE = 'setIssue',
  SET_ISSUE_CHILDREN = 'setIssueChildren'
}

export interface IssueDetailModuleState {
  loading: boolean
  error: Record<string, any>
  issue: RepositoryIssue
  singleIssue: Issue
  checkIssues: CheckIssueConnection
}

export const state = (): IssueDetailModuleState => ({
  ...(<IssueDetailModuleState>{
    loading: false,
    error: {},
    issue: {},
    singleIssue: {},
    checkIssues: {}
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
    state.singleIssue = Object.assign({}, state.issue, issue)
  }
}

interface IssueDetailModuleActions extends ActionTree<IssueDetailModuleState, RootState> {
  [IssueDetailActions.FETCH_ISSUE]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      repositoryId: string
      shortcode: string
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
  ) => Promise<void>
  [IssueDetailActions.IGNORE_ISSUE_FALSE_POSITIVE]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: {
      checkIssueId: string
      comment: string
    }
  ) => Promise<void>
  [IssueDetailActions.CREATE_AUTOFIX_RUN]: (
    this: Store<RootState>,
    injectee: IssueDetailActionContext,
    args: CreateAutofixRunInput
  ) => Promise<void>
}

export const actions: IssueDetailModuleActions = {
  async [IssueDetailActions.FETCH_ISSUE]({ commit }, args) {
    commit(IssueDetailMutations.SET_LOADING, true)
    await this.$fetchGraphqlData(RepositoryIssueDetailGQLQuery, {
      repositoryId: args.repositoryId,
      shortcode: args.shortcode
    })
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
  async [IssueDetailActions.IGNORE_ISSUE_FILE_PATTERN]({}, args) {
    const response = await this.$applyGraphqlMutation(IgnoreIssueFilePatternMutation, args)
    return response.data.ignoreIssueForFilePatternInRepository
  },
  async [IssueDetailActions.IGNORE_ISSUE_TEST_PATTERN]({}, args) {
    const response = await this.$applyGraphqlMutation(IgnoreIssueTestPatternMutation, args)
    return response.data.ignoreIssueForTestPatternsInRepository
  },
  async [IssueDetailActions.IGNORE_ISSUE_REPOSITORY]({}, args) {
    const response = await this.$applyGraphqlMutation(IgnoreIssueRepository, args)
    return response.data.ignoreIssueForRepository
  },
  async [IssueDetailActions.IGNORE_ISSUE_FOR_FILE]({}, args) {
    const response = await this.$applyGraphqlMutation(IgnoreIssueForFile, args)
    return response.data.ignoreIssueForRepository
  },
  async [IssueDetailActions.IGNORE_ISSUE_CHECK_ISSUE]({ commit }, args) {
    try {
      commit(IssueDetailMutations.SET_LOADING, true)
      await this.$applyGraphqlMutation(IgnoreCheckIssue, {
        checkIssueId: args.checkIssueId,
        action: args.action ?? IgnoreCheckIssueActionChoice.Delete
      })
      commit(IssueDetailMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(IssueDetailMutations.SET_ERROR, error)
      commit(IssueDetailMutations.SET_LOADING, false)
    }
  },
  async [IssueDetailActions.IGNORE_ISSUE_FALSE_POSITIVE]({ commit }, args) {
    try {
      commit(IssueDetailMutations.SET_LOADING, true)
      await this.$applyGraphqlMutation(IgnoreIssueFalsePositive, {
        checkIssueId: args.checkIssueId,
        comment: args.comment
      })
      commit(IssueDetailMutations.SET_LOADING, false)
    } catch (e) {
      const error = e as GraphqlError
      commit(IssueDetailMutations.SET_ERROR, error)
      commit(IssueDetailMutations.SET_LOADING, false)
    }
  },
  async [IssueDetailActions.CREATE_AUTOFIX_RUN]({ commit }, args) {
    const response = await this.$applyGraphqlMutation(CreateAutofixRun, {
      input: args
    })
    commit(IssueDetailMutations.SET_LOADING, false)
    return response.data.createAutofixRun
  }
}
