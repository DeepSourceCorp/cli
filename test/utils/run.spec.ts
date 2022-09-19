import { Pr, PrStatus, Run, RunStatus } from '~/types/types'
import { generalizePR, generalizeRun } from '~/utils/runs'

describe('[[run utils]]', () => {
  const pr: Pr = {
    id: '1234',
    createdAt: 'today',
    modifiedAt: 'never',
    status: PrStatus.Open,
    alive: true,
    baseBranch: 'master',
    branch: 'feat--yesterday',
    number: 1337,
    raisedCount: 420,
    resolvedCount: 101,
    runCount: 78,
    latestAnalysisRun: {
      id: 'lolrun',
      runId: '12356',
      commitOid: 'o0o0o0o0o',
      status: RunStatus.Pass,
      createdAt: 'day before yesterday',
      modifiedAt: 'day after tomorrow',
      checks: { pageInfo: { hasNextPage: false, hasPreviousPage: true }, edges: [] },
      extraData: {}
    }
  }

  const run: Run = {
    id: '1234',
    branchName: 'feat--yesterday',
    runId: '12356',
    branchRunCount: 78,
    pullRequestNumberDisplay: '#1337',
    commitOid: 'o0o0o0o0o',
    createdAt: 'day before yesterday',
    modifiedAt: 'day after tomorrow',
    issuesRaisedCount: 420,
    issuesResolvedCount: 101,
    status: RunStatus.Pass,
    commitMessage: 'feat: add yesterday',
    checks: { pageInfo: { hasNextPage: false, hasPreviousPage: true }, edges: [] },
    extraData: {}
  }

  test('generalizeRun', () => {
    const generalizedRun = generalizeRun(run)
    expect(generalizedRun).toMatchSnapshot('generalizeRun')
  })

  test('generalizePR', () => {
    const generalizedRun = generalizePR(pr)
    expect(generalizedRun).toMatchSnapshot('generalizePR')
  })
})
