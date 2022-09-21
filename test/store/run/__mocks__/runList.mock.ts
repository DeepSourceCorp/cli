import { PrConnection, PrStatus, Repository, RunConnection, RunStatus } from '~/types/types'
import { RepoStatsT, RunListModuleState } from '~/store/run/list'

/*
  +++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ RUN LIST MOCK +++++++++++++++++++
  +++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for Run.
 */
export const RUN_LIST: RunConnection = <RunConnection>{
  totalCount: 815,
  edges: [
    {
      node: {
        createdAt: '2020-10-06T18:04:49.130974+00:00',
        runId: 'e9571778-2429-4c70-ae50-10aef6d9dc1b',
        status: 'TIMO',
        branchName: 'autofix-backend',
        commitOid: '2ee7bb5b5b4225f19f69ace7892fe484231981f4',
        finishedIn: 66,
        vcsCommitUrl:
          'https://github.com/deepsourcelabs/asgard/commit/2ee7bb5b5b4225f19f69ace7892fe484231981f4',
        gitCompareDisplay: 'a8935a7..2ee7bb5',
        pullRequestNumberDisplay: '#1708',
        issuesRaisedCount: 15,
        issuesResolvedNum: 4
      }
    },
    {
      node: {
        createdAt: '2020-10-06T18:04:49.130974+00:00',
        runId: '1985bb72-ba8c-4620-be85-030e89319067',
        status: 'FAIL',
        branchName: 'autofix-pr-frontend',
        commitOid: '44900d0366d0fb57a56c54fc0f6075bda7873d9b',
        finishedIn: 223,
        vcsCommitUrl:
          'https://github.com/deepsourcelabs/asgard/commit/44900d0366d0fb57a56c54fc0f6075bda7873d9b',
        gitCompareDisplay: '0028570..44900d0',
        pullRequestNumberDisplay: '#1904',
        issuesRaisedCount: 182,
        issuesResolvedNum: 0
      }
    },
    {
      node: {
        createdAt: '2020-10-06T18:04:49.130974+00:00',
        runId: '200cd792-bd43-49eb-8ad4-0ce9280b966d',
        status: 'FAIL',
        branchName: 'autofix-pr-frontend',
        commitOid: '8e24cc562a8f1cfec6d12e6ef2fac7a8088a3dd8',
        finishedIn: 219,
        vcsCommitUrl:
          'https://github.com/deepsourcelabs/asgard/commit/8e24cc562a8f1cfec6d12e6ef2fac7a8088a3dd8',
        gitCompareDisplay: '0028570..8e24cc5',
        pullRequestNumberDisplay: '#1904',
        issuesRaisedCount: 182,
        issuesResolvedNum: 0
      }
    },
    {
      node: {
        createdAt: '2020-10-06T18:04:49.130974+00:00',
        runId: '9822ac4e-6584-4e25-a685-1f704208178d',
        status: 'TIMO',
        branchName: '654-rbac',
        commitOid: 'eaa4bc6bd07e52e64810a7e63d3443617c29b171',
        finishedIn: 161,
        vcsCommitUrl:
          'https://github.com/deepsourcelabs/asgard/commit/eaa4bc6bd07e52e64810a7e63d3443617c29b171',
        gitCompareDisplay: 'a8935a7..eaa4bc6',
        pullRequestNumberDisplay: '#1888',
        issuesRaisedCount: 9,
        issuesResolvedNum: 2
      }
    },
    {
      node: {
        createdAt: '2020-10-06T18:04:49.130974+00:00',
        runId: '25f3c276-5675-41df-946e-0104fb951a3c',
        status: 'TIMO',
        branchName: '654-rbac',
        commitOid: '35d7e86026fcae77f5d98dddbb7624aef94da44f',
        finishedIn: 130,
        vcsCommitUrl:
          'https://github.com/deepsourcelabs/asgard/commit/35d7e86026fcae77f5d98dddbb7624aef94da44f',
        gitCompareDisplay: 'a8935a7..35d7e86',
        pullRequestNumberDisplay: '#1888',
        issuesRaisedCount: 7,
        issuesResolvedNum: 2
      }
    }
  ]
}

/**
 * Mock -- Pr model
 */

export const PR_LIST = {
  totalCount: 213,
  edges: [
    {
      node: {
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
      },
      cursor: ''
    },
    {
      node: {
        id: '123234',
        createdAt: 'today32',
        modifiedAt: 'never32',
        status: PrStatus.Merged,
        alive: true,
        baseBranch: 'master',
        branch: 'feat--yesterdayyyy',
        number: 13337,
        raisedCount: 4200,
        resolvedCount: 1001,
        runCount: 708,
        latestAnalysisRun: {
          id: 'lolruhn',
          runId: '1235687',
          commitOid: 'o0o0o0o0o0o0o0o0o',
          status: RunStatus.Fail,
          createdAt: 'day before yesterdayy',
          modifiedAt: 'day after tomorroww',
          checks: { pageInfo: { hasNextPage: false, hasPreviousPage: true }, edges: [] },
          extraData: {}
        }
      },
      cursor: ''
    }
  ],
  pageInfo: { hasNextPage: false, hasPreviousPage: false }
}

/**
 * Mock -- Run list factory
 * @see RUN_LIST
 */
export const mockRunList = (): RunConnection => RUN_LIST

/**
 * Mock -- Pr list factory
 * @see RUN_LIST
 */
export const mockPrList = (): PrConnection => PR_LIST

/** Mock -- branch name */
export const mockBranchName = 'hello-world'

/**
 * Mock factory
 */
export const mockRunListState = (): RunListModuleState => ({
  loading: false as boolean,
  error: {},
  runList: mockRunList(),
  groupedRunList: mockRunList(),
  branchRunList: {
    [mockBranchName]: mockRunList()
  },
  prList: mockPrList(),
  repoPrStats: { id: '1234', openPrCount: 10, closedPrCount: 20 } as RepoStatsT
})
