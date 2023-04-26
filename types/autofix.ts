import {
  AutofixRunCommittedToBranchStatus,
  AutofixRunPullRequestStatus,
  AutofixRunStatus
} from './types'

export const AUTOFIX_STATUS = {
  PENDING: AutofixRunStatus.Pend,
  SUCCESS: AutofixRunStatus.Pass,
  TIMEOUT: AutofixRunStatus.Timo,
  CANCEL: AutofixRunStatus.Cncl,
  FAIL: AutofixRunStatus.Fail,
  STALE: AutofixRunStatus.Stal
}

export const COMMIT_STATUS = {
  COMMITTED: AutofixRunCommittedToBranchStatus.Ctb,
  IN_PROGRESS: AutofixRunCommittedToBranchStatus.Cip,
  NOT_COMMITTED: AutofixRunCommittedToBranchStatus.Ncb,
  FAILED: AutofixRunCommittedToBranchStatus.Ctf
}

export const PULL_REQUEST_STATUS = {
  NOT_CREATED: AutofixRunPullRequestStatus.Pnc,
  IN_PROGRESS: AutofixRunPullRequestStatus.Prp,
  OPENED: AutofixRunPullRequestStatus.Pro,
  CREATED: AutofixRunPullRequestStatus.Prc,
  MERGED: AutofixRunPullRequestStatus.Prm,
  FAILED: AutofixRunPullRequestStatus.Prf
}
