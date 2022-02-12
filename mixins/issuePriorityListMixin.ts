import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { IssuePriorityListActions } from '~/store/issuePriority/list'
import {
  IssueConnection,
  UnsetIssuePriorityInput,
  UnsetIssuePriorityPayload,
  UpdateIssuePriorityInput
} from '~/types/types'

const issuePriorityListStore = namespace('issuePriority/list')

/**
 * Mixin that has methods for working with issue priorities.
 */
@Component
export default class IssuePriorityListMixin extends Vue {
  @issuePriorityListStore.State
  issuesWithPriority!: IssueConnection

  @issuePriorityListStore.Action(IssuePriorityListActions.FETCH_ISSUES_WITH_PRIORITY)
  fetchIssuesWithPriority: (args: {
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
  }) => Promise<void>

  @issuePriorityListStore.Action(IssuePriorityListActions.UPDATE_ISSUE_PRIORITY)
  updateIssuePriority: (args: {
    input: UpdateIssuePriorityInput
    repositoryId: string
  }) => Promise<void>

  @issuePriorityListStore.Action(IssuePriorityListActions.UNSET_ISSUE_PRIORITY)
  unsetIssuePriority: (args: {
    input: UnsetIssuePriorityInput
  }) => Promise<UnsetIssuePriorityPayload>
}
