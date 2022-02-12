import { ActionContext, ActionTree, GetterTree, MutationTree, Store } from 'vuex'

import UpdateIssuePriorityGQLMutation from '~/apollo/mutations/issue-priority/updateIssuePriority.gql'
import UnsetIssuePriorityGQLMutation from '~/apollo/mutations/issue-priority/unsetIssuePriority.gql'
import IssuesWithPriorityGQLQuery from '~/apollo/queries/issue-priority/issuesWithPriority.gql'

import { RootState } from '~/store'
import { GraphqlError, GraphqlQueryResponse } from '~/types/apollo-graphql-types'
import {
  IssueConnection,
  UnsetIssuePriorityInput,
  UnsetIssuePriorityPayload,
  UpdateIssuePriorityInput
} from '~/types/types'

export enum IssuePriorityListActions {
  FETCH_ISSUES_WITH_PRIORITY = 'fetchIssuesWithPrioritySettings',
  UPDATE_ISSUE_PRIORITY = 'updateIssuePriority',
  UNSET_ISSUE_PRIORITY = 'unsetIssuePriority'
}

export enum IssuePriorityListMutations {
  SET_ISSUES_WITH_PRIORITY = 'setIssuesWithPriority'
}

export interface IssuePriorityListModuleState {
  error: GraphqlError
  issuesWithPriority: IssueConnection
}

/**
 * Issue Priority List state
 *
 * @return {IssuePriorityListModuleState}
 */
export const state = (): IssuePriorityListModuleState => ({
  ...(<IssuePriorityListModuleState>{
    error: {},
    issuesWithPriority: {}
  })
})

export type IssuePriorityListActionContext = ActionContext<IssuePriorityListModuleState, RootState>

export const getters: GetterTree<IssuePriorityListModuleState, RootState> = {}

interface RunListModuleMutations extends MutationTree<IssuePriorityListModuleState> {
  [IssuePriorityListMutations.SET_ISSUES_WITH_PRIORITY]: (
    state: IssuePriorityListModuleState,
    issuesWithPriority: IssueConnection
  ) => void
}

export const mutations: RunListModuleMutations = {
  [IssuePriorityListMutations.SET_ISSUES_WITH_PRIORITY]: (state, issuesWithPriority) => {
    state.issuesWithPriority = Object.assign({}, state.issuesWithPriority, issuesWithPriority)
  }
}

interface IssuePriorityListModuleActions
  extends ActionTree<IssuePriorityListModuleState, RootState> {
  [IssuePriorityListActions.FETCH_ISSUES_WITH_PRIORITY]: (
    this: Store<RootState>,
    injectee: IssuePriorityListActionContext,
    args: {
      isRepositoryIssuePrioritySet: boolean
      repositoryId?: string
      offset?: number
      before?: string
      after?: string
      first?: number
      last?: number
      q?: string
      sort?: string
      issueType?: string
      analyzerShortcode?: string
      refetch?: boolean
    }
  ) => Promise<void>

  [IssuePriorityListActions.UPDATE_ISSUE_PRIORITY]: (
    this: Store<RootState>,
    injectee: IssuePriorityListActionContext,
    args: {
      input: UpdateIssuePriorityInput
      repositoryId: string
      refetch?: boolean
    }
  ) => Promise<void>

  [IssuePriorityListActions.UNSET_ISSUE_PRIORITY]: (
    this: Store<RootState>,
    injectee: IssuePriorityListActionContext,
    args: {
      input: UnsetIssuePriorityInput
    }
  ) => Promise<UnsetIssuePriorityPayload>
}

export const actions: IssuePriorityListModuleActions = {
  async [IssuePriorityListActions.FETCH_ISSUES_WITH_PRIORITY]({ commit }, args) {
    try {
      const response: GraphqlQueryResponse = await this.$fetchGraphqlData(
        IssuesWithPriorityGQLQuery,
        args,
        args.refetch
      )
      commit(
        IssuePriorityListMutations.SET_ISSUES_WITH_PRIORITY,
        response?.data?.issuesWithPriority
      )
    } catch (e) {
      this.$toast.danger('There was an error fetching issues.')
    }
  },
  async [IssuePriorityListActions.UPDATE_ISSUE_PRIORITY](_, args) {
    try {
      const response = await this.$applyGraphqlMutation(
        UpdateIssuePriorityGQLMutation,
        args,
        args.refetch
      )
      return response?.data?.updateIssuePriority
    } catch (e) {
      this.$toast.danger('There was an error in priority assignment.')
    }
  },
  async [IssuePriorityListActions.UNSET_ISSUE_PRIORITY](_, args) {
    try {
      const response = await this.$applyGraphqlMutation(UnsetIssuePriorityGQLMutation, args)
      return response?.data?.unsetIssuePriority
    } catch (e) {
      this.$toast.danger('There was an error in removing priority assignment.')
    }
  }
}
