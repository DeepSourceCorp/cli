import { Run, Pr, RunStatus } from '~/types/types'

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
export const generalizeRun = (run: Run): GeneralizedRunT => {
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
    title: commitMessage,
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
