import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { IssueDetailActions } from '~/store/issue/detail'

import {
  Issue,
  RepositoryIssue,
  CheckIssueConnection,
  IgnoreCheckIssueActionChoice,
  CreateAutofixRunInput,
  CreateAutofixRunPayload,
  IgnoreIssueForRepositoryPayload,
  IgnoreIssueForFilePatternInRepositoryPayload,
  IgnoreIssueForTestPatternsInRepositoryPayload,
  ReportIssueFalsePositivePayload,
  IgnoreCheckIssuePayload,
  SilenceRule,
  IssuePriority,
  UpdateIssuePriorityInput
} from '~/types/types'

const issueStore = namespace('issue/detail')

@Component
export default class IssueDetailMixin extends Vue {
  @issueStore.State
  issue!: RepositoryIssue

  @issueStore.State
  singleIssue!: Issue

  @issueStore.State
  silenceRules!: SilenceRule[]

  @issueStore.State
  checkIssues!: CheckIssueConnection

  // Queries
  @issueStore.Action(IssueDetailActions.FETCH_ISSUE)
  fetchIssueDetails: (args: {
    repositoryId: string
    shortcode: string
    refetch?: boolean
  }) => Promise<void>

  @issueStore.Action(IssueDetailActions.FETCH_SILENCE_RULES)
  fetchSilenceRules: (args: {
    provider: string
    owner: string
    name: string
    limit?: number
    currentPage?: number
    issueCode: string
  }) => Promise<void>

  @issueStore.Action(IssueDetailActions.FETCH_SINGLE_ISSUE)
  fetchSingleIssue: (args: { shortcode: string }) => Promise<void>

  @issueStore.Action(IssueDetailActions.FETCH_ISSUE_CHILDREN)
  fetchIssueChildren: (args: {
    nodeId: string
    sort?: string
    q?: string
    currentPageNumber: number
    limit: number | null
  }) => Promise<void>

  @issueStore.Action(IssueDetailActions.FETCH_ISSUE_PRIORITY)
  fetchIssuePriority: (args: {
    repositoryId: string
    shortcode: string
  }) => Promise<IssuePriority | null>

  @issueStore.Action(IssueDetailActions.UPDATE_ISSUE_PRIORITY)
  updateIssuePriority: (args: {
    input: UpdateIssuePriorityInput
    repositoryId: string
  }) => Promise<IssuePriority | null>

  // Mutations
  @issueStore.Action(IssueDetailActions.IGNORE_ISSUE_FILE_PATTERN)
  ignoreIssueFilePattern: (arg: {
    repoIssueId?: string
    checkId?: string
    issueShortcode?: string
    pattern: string
  }) => Promise<IgnoreIssueForFilePatternInRepositoryPayload>

  @issueStore.Action(IssueDetailActions.IGNORE_ISSUE_TEST_PATTERN)
  ignoreIssueTestPattern: (arg: {
    repoIssueId?: string
    checkId?: string
    issueShortcode?: string
  }) => Promise<IgnoreIssueForTestPatternsInRepositoryPayload>

  @issueStore.Action(IssueDetailActions.IGNORE_ISSUE_REPOSITORY)
  ignoreIssueRepository: (arg: {
    repoIssueId?: string
    checkId?: string
    issueShortcode?: string
  }) => Promise<IgnoreIssueForRepositoryPayload>

  @issueStore.Action(IssueDetailActions.IGNORE_ISSUE_FOR_FILE)
  ignoreIssueForFile: (arg: {
    repoIssueId?: string
    checkId?: string
    issueShortcode?: string
    filePath: string
  }) => Promise<IgnoreIssueForRepositoryPayload>

  @issueStore.Action(IssueDetailActions.IGNORE_ISSUE_CHECK_ISSUE)
  updateIgnoreCheckIssue: (arg: {
    checkIssueId: string
    action?: IgnoreCheckIssueActionChoice
  }) => Promise<IgnoreCheckIssuePayload>

  @issueStore.Action(IssueDetailActions.IGNORE_ISSUE_FALSE_POSITIVE)
  ignoreIssueFalsePositive: (arg: {
    checkIssueId: string
    comment: string
  }) => Promise<ReportIssueFalsePositivePayload>

  @issueStore.Action(IssueDetailActions.CREATE_AUTOFIX_RUN)
  createAutofixRun: (arg: CreateAutofixRunInput) => Promise<CreateAutofixRunPayload>
}
