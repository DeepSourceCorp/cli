import { Run, Pr, RunStatus, RunStatusChoice } from '~/types/types'

export interface GeneralizedRunT {
  title: Run['branchName'] | Pr['title']
  runId: Run['runId'] | NonNullable<Pr['latestAnalysisRun']>['runId']
  runCount: Run['branchRunCount'] | Pr['runCount']
  status: Run['status'] | NonNullable<Pr['latestAnalysisRun']>['status']
  branchName: Run['branchName'] | Pr['branch']
  prNumber: Run['pullRequestNumberDisplay'] | Pr['number']
  commitOid: Run['commitOid'] | NonNullable<Pr['latestAnalysisRun']>['commitOid']
  createdAt: Run['createdAt'] | NonNullable<Pr['latestAnalysisRun']>['createdAt']
  issuesRaisedCount: Run['issuesRaisedCount'] | Pr['raisedCount']
  issuesResolvedCount: Run['issuesResolvedCount'] | Pr['resolvedCount']
}

/**
 * Generalizes a {@link Run} object to a standard format for cross compatibility with {@link Pr} objects.
 *
 * @param run A {@link Run} object
 * @returns Object of type {@link GeneralizedRunT}
 */
export const generalizeRun = (run: Run, isDefaultBranch = false): GeneralizedRunT => {
  const {
    branchName,
    runId,
    branchRunCount,
    pullRequestNumberDisplay,
    commitOid,
    createdAt,
    issuesRaisedCount,
    issuesResolvedCount,
    status,
    commitMessage
  } = run

  return {
    title: isDefaultBranch ? branchName : commitMessage,
    branchName,
    runId,
    runCount: branchRunCount,
    prNumber: pullRequestNumberDisplay,
    commitOid,
    createdAt,
    issuesRaisedCount,
    issuesResolvedCount,
    status
  }
}

/**
 * Generalizes a {@link Pr} object to a standard format for cross compatibility with {@link Run} objects.
 *
 * @param PR A {@link Pr} object
 * @returns Object of type {@link GeneralizedRunT}
 */
export const generalizePR = (PR: Pr): GeneralizedRunT => {
  const {
    branch,
    number: prNumber,
    latestAnalysisRun,
    runCount,
    raisedCount,
    resolvedCount,
    title
  } = PR
  return {
    title,
    branchName: branch,
    runId: latestAnalysisRun?.runId ?? '',
    runCount,
    prNumber: `#${prNumber ?? ''}`,
    commitOid: latestAnalysisRun?.commitOid ?? '',
    createdAt: latestAnalysisRun?.createdAt ?? '',
    issuesRaisedCount: raisedCount,
    issuesResolvedCount: resolvedCount,
    status: latestAnalysisRun?.status ?? RunStatus.Pass
  }
}

/**
 * Generalize values of type {@link RunStatus} or {@link RunStatusChoice} and return its mapped values
 *
 * @param status A value of type {@link RunStatus} or {@link RunStatusChoice}
 * @returns an object containing `status` of type {@link RunStatus} and `statusChoice` of type {@link RunStatusChoice}
 */
export const generalizeRunStatuses = (status: RunStatus | RunStatusChoice) => {
  const generalizedRunStatusesMap: Record<
    RunStatus | RunStatusChoice,
    { status: RunStatus; statusChoice: RunStatusChoice }
  > = {
    [RunStatus.Cncl]: { status: RunStatus.Cncl, statusChoice: RunStatusChoice.StatusCancel },
    [RunStatus.Timo]: { status: RunStatus.Timo, statusChoice: RunStatusChoice.StatusTimeout },
    [RunStatus.Fail]: { status: RunStatus.Fail, statusChoice: RunStatusChoice.StatusFailure },
    [RunStatus.Pass]: { status: RunStatus.Pass, statusChoice: RunStatusChoice.StatusSuccess },
    [RunStatus.Pend]: { status: RunStatus.Pend, statusChoice: RunStatusChoice.StatusPending },
    [RunStatus.Read]: { status: RunStatus.Read, statusChoice: RunStatusChoice.StatusReady },
    [RunStatus.Skip]: { status: RunStatus.Skip, statusChoice: RunStatusChoice.StatusSkipped },
    [RunStatusChoice.StatusCancel]: {
      status: RunStatus.Cncl,
      statusChoice: RunStatusChoice.StatusCancel
    },
    [RunStatusChoice.StatusTimeout]: {
      status: RunStatus.Timo,
      statusChoice: RunStatusChoice.StatusTimeout
    },
    [RunStatusChoice.StatusFailure]: {
      status: RunStatus.Fail,
      statusChoice: RunStatusChoice.StatusFailure
    },
    [RunStatusChoice.StatusSuccess]: {
      status: RunStatus.Pass,
      statusChoice: RunStatusChoice.StatusSuccess
    },
    [RunStatusChoice.StatusPending]: {
      status: RunStatus.Pend,
      statusChoice: RunStatusChoice.StatusPending
    },
    [RunStatusChoice.StatusReady]: {
      status: RunStatus.Read,
      statusChoice: RunStatusChoice.StatusReady
    },
    [RunStatusChoice.StatusSkipped]: {
      status: RunStatus.Skip,
      statusChoice: RunStatusChoice.StatusSkipped
    }
  }
  return generalizedRunStatusesMap[status]
}
