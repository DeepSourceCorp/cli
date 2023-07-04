import { Component, Vue, namespace } from 'nuxt-property-decorator'
import {
  Check,
  CheckIssueConnection,
  CreateAutofixRunForPullRequestInput,
  CreateAutofixRunForPullRequestPayload,
  CreatePullRequestInput,
  IssueConnection,
  Maybe,
  Run,
  RunnerApp
} from '~/types/types'
import { PageRefetchStatusT, RunDetailActions } from '@/store/run/detail'
import { resolveNodes } from '~/utils/array'

const runDetailStore = namespace('run/detail')

/**
 * Mixin for adding store actions and states related to a run to a component.
 */
@Component
export default class RunDetailMixin extends Vue {
  @runDetailStore.State
  run: Run

  @runDetailStore.State
  check: Check

  @runDetailStore.State
  checkIssues: CheckIssueConnection

  @runDetailStore.State
  concreteIssueList: IssueConnection

  @runDetailStore.State('loading')
  runDetailLoading: boolean

  @runDetailStore.State('error')
  runDetailError: Error

  @runDetailStore.State
  pageRefetchStatus: PageRefetchStatusT

  @runDetailStore.State
  runnerInfo: RunnerApp

  @runDetailStore.Action(RunDetailActions.FETCH_RUN)
  fetchRun: (args: {
    provider: string
    owner: string
    name: string
    runId: string
    isRunner: boolean
    refetch?: boolean
  }) => Promise<Run | undefined>

  @runDetailStore.Action(RunDetailActions.FETCH_CHECK)
  fetchCheck: (args: { checkId: string; refetch?: boolean }) => Promise<void>

  @runDetailStore.Action(RunDetailActions.FETCH_CHECK_ISSUES)
  fetchCheckIssues: (args: {
    checkId: string
    shortcode: string
    currentPageNumber: number
    limit: number
    isRunner: boolean
    q?: Maybe<string>
    sort?: Maybe<string>
    refetch?: boolean
  }) => Promise<void>

  @runDetailStore.Action(RunDetailActions.FETCH_AUTOFIXABLE_ISSUES)
  fetchAutofixableIssues: (args: { checkId: string }) => Promise<void>

  @runDetailStore.Action(RunDetailActions.FETCH_CONCRETE_ISSUE_LIST)
  fetchConcreteIssueList: (args: {
    checkId: string
    offset?: number
    first?: number
    q?: string
    sort?: string
    issueType?: string
    refetch?: boolean
  }) => Promise<void>

  @runDetailStore.Action(RunDetailActions.CREATE_AUTOFIX_PR)
  createAutofixPullRequest: (args: {
    input: CreateAutofixRunForPullRequestInput
  }) => Promise<CreateAutofixRunForPullRequestPayload>

  @runDetailStore.Action(RunDetailActions.COMMIT_TO_PR)
  commitToPullRequest: (args: { input: CreatePullRequestInput }) => Promise<void>

  @runDetailStore.Action(RunDetailActions.CREATE_PR)
  createPullRequest: (args: { input: CreatePullRequestInput }) => Promise<void>

  get checks(): Check[] {
    return resolveNodes(this.run.checks)
  }

  getCurrentCheck(analyzerShortcode: string): Check | undefined {
    const filteredCheck = this.checks.find((edge) => {
      return edge.analyzer?.shortcode === analyzerShortcode
    })

    return filteredCheck
  }
}
