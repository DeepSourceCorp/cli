import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { AutofixRunDetailActions } from '~/store/autofixRun/detail'
import { AutofixRunListActions } from '~/store/autofixRun/list'
import {
  AutofixRun,
  AutofixRunStatus,
  AutofixRunCommittedToBranchStatus,
  AutofixRunPullRequestStatus
} from '~/types/types'

const autofixRunStore = namespace('autofixRun/detail')
const autofixRunListStore = namespace('autofixRun/list')

@Component
export default class AutofixRunMixin extends Vue {
  AUTOFIX_STATUS = {
    PENDING: AutofixRunStatus.Pend,
    SUCCESS: AutofixRunStatus.Pass,
    TIMEOUT: AutofixRunStatus.Timo,
    CANCEL: AutofixRunStatus.Cncl,
    FAIL: AutofixRunStatus.Fail,
    STALE: AutofixRunStatus.Stal
  }

  COMMIT_STATUS = {
    COMMITTED: AutofixRunCommittedToBranchStatus.Ctb,
    IN_PROGRESS: AutofixRunCommittedToBranchStatus.Cip,
    NOT_COMMITTED: AutofixRunCommittedToBranchStatus.Ncb,
    FAILED: AutofixRunCommittedToBranchStatus.Ctf
  }

  PULL_REQUEST_STATUS = {
    NOT_CREATED: AutofixRunPullRequestStatus.Pnc,
    IN_PROGRESS: AutofixRunPullRequestStatus.Prp,
    OPENED: AutofixRunPullRequestStatus.Pro,
    CREATED: AutofixRunPullRequestStatus.Prc,
    MERGED: AutofixRunPullRequestStatus.Prm,
    FAILED: AutofixRunPullRequestStatus.Prf
  }

  @autofixRunStore.State
  autofixRun!: AutofixRun

  @autofixRunStore.State
  loading!: boolean

  @autofixRunStore.Action(AutofixRunDetailActions.FETCH_AUTOFIX_RUN)
  fetchAutofixRunDetails: (args: { runId: string; refetch: boolean }) => Promise<void>

  @autofixRunListStore.Action(AutofixRunListActions.FETCH_AUTOFIX_RUN_LIST)
  fetchAutofixRunList: (args: {
    provider: string
    owner: string
    name: string
    limit?: number
    statusIn?: AutofixRunStatus[]
    refetch?: boolean
  }) => Promise<void>
}
