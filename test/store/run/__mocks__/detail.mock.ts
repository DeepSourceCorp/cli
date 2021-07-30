import {
  Check,
  IssueConnection,
  AutofixableIssueDetail,
  Run,
  CheckIssueConnection,
  CheckStatus,
  Analyzer,
  RunStatus
} from '~/types/types'
import { RunDetailModuleState } from '~/store/run/detail'

/*
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ RUN DETAIL MOCK +++++++++++++++++++
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for Run.
 */
export const RUN_DETAIL: Run = {
  createdAt: '2020-07-06T10:14:37.419400+00:00',
  modifiedAt: '2020-07-06T12:09:30.685771+00:00',
  alive: true,
  id: 'UnVuOnpucnJveQ==',
  runId: 'b2729b23-1126-4d84-a738-01d46da17978',
  branchName: 'deepsource-transform-d833cc25',
  baseOid: '2316e689facc8b4ea67258230b5cbce5c7d6c8d4',
  commitOid: '38ca5bd8fe006eb246eb23f453d72b816ece20ba',
  finishedAt: '2020-07-06T12:09:30.685586+00:00',
  errorMeta: null,
  config: {
    version: 1,
    analyzers: [
      {
        meta: {
          runtime_version: '3.x.x'
        },
        name: 'python',
        enabled: true
      }
    ],
    transformers: [
      {
        name: 'black',
        enabled: true
      }
    ]
  },
  extraData:
    '{"base_branch": "master", "trigger_source": "pull_request", "is_config_updated": false, "pull_request_number": 75}',
  checks: {
    totalCount: 0,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    },
    edges: []
  },
  status: RunStatus.Pass,
  finishedIn: 28,
  vcsCommitUrl:
    'https://github.com/deepsourcelabs/demo-python/commit/38ca5bd8fe006eb246eb23f453d72b816ece20ba',
  gitCompareDisplay: '2316e68..38ca5bd',
  vcsPrUrl: 'https://github.com/deepsourcelabs/demo-python/pull/75',
  pullRequestNumberDisplay: '#75'
}

export const CHECK: Check = {
  createdAt: '2020-07-06T12:09:01.137320+00:00',
  modifiedAt: '2020-07-06T12:09:30.681629+00:00',
  alive: true,
  id: 'Q2hlY2s6Ym5qZGFn',
  checkSeq: 2,
  status: CheckStatus.Pass,
  run: {
    id: 'UnVuOnpucnJveQ==',
    isForDefaultBranch: false,
    isForCrossRepoPr: false
  } as Run,
  analyzer: {
    name: 'Python',
    shortcode: 'python',
    analyzerLogo:
      'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg',
    description:
      "This is the official analyzer for the Python programming language. It detects issues covered by open-source tools like pylint, flake8, bandit, pycodestyle, pydocstyle, and DeepSource's custom checkers."
  } as Analyzer,
  triggeredAt: '2020-07-06T12:09:01.771791+00:00',
  finishedAt: '2020-07-06T12:09:30.319308+00:00',
  resolvedIssues: {
    totalCount: 0,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    },
    edges: []
  },
  extraData: '{"retries": 1, "gh_status": "COMPLETED", "gh_conclusion": "SUCCESS"}',
  errors: [],
  metrics: '[{"namespaces": [{"key": "Python", "value": 20}], "metric_code": "DCV"}]',
  metricsCaptured: [],
  checkIssues: {
    totalCount: 0,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    },
    edges: []
  },
  concreteIssues: {
    totalCount: 0,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    },
    edges: []
  },
  finishedIn: 29,
  finishedInDisplay: '29 seconds',
  issuesRaisedCount: 0,
  issuesResolvedCount: 4,
  autofixableIssues: [],
  filesAffectedByAutofix: 0
}

/**
 * Mock -- Run detail factory
 * @see RUN_DETAIL
 */
export const mockRunDetail = (): Run => RUN_DETAIL
export const mockCheckDetail = (): Check => CHECK

/**
 * Mock factory
 */
export const mockRunDetailState = (): RunDetailModuleState => ({
  loading: false as boolean,
  error: {},
  run: mockRunDetail(),
  check: mockCheckDetail(),
  checkIssues: {} as CheckIssueConnection,
  concreteIssueList: {} as IssueConnection
})

/*
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ AUTOFIXABLE ISSUES MOCK +++++++++++++++++++
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for run.
 */
export const RUN_DETAIL_FOR_AUTOFIXABLE_ISSUES: Check = <Check>{
  id: 'Q2hlY2s6ODEwNQ==',
  autofixableIssues: <AutofixableIssueDetail>[],
  filesAffectedByAutofix: 0
}

/**
 * Mock -- Run detail factory
 * @see RUN_DETAIL_FOR_AUTOFIXABLE_ISSUES
 */
export const mockRepositoryDetailForAutofixableIssues = (): Check =>
  RUN_DETAIL_FOR_AUTOFIXABLE_ISSUES

/**
 * Mock factory
 */
export const mockRepositoryDetailStateForAutofixableIssues = (): RunDetailModuleState => ({
  loading: false as boolean,
  error: {},
  run: mockRunDetail(),
  check: mockCheckDetail(),
  checkIssues: {} as CheckIssueConnection,
  concreteIssueList: {} as IssueConnection
})

/*
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ CONCRETE ISSUE LIST MOCK +++++++++++++++++++
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for run.
 */
export const RUN_DETAIL_FOR_CONCRETE_ISSUE_LIST: IssueConnection = <IssueConnection>{
  totalCount: 1,
  edges: [
    {
      node: {
        id: 'SXNzdWU6Mjcx',
        issueType: 'bug-risk',
        title: 'Lines not covered in tests',
        seenIn: 'api/types/check.py, api/types/run.py and 2 other files',
        shortcode: 'TCV-001',
        occurrenceCount: 15
      }
    }
  ]
}

/**
 * Mock -- Run detail factory
 * @see RUN_DETAIL_FOR_CONCRETE_ISSUE_LIST
 */
export const mockRunDetailForConcreteIssueList = (): IssueConnection =>
  RUN_DETAIL_FOR_CONCRETE_ISSUE_LIST

/**
 * Mock factory
 */
export const mockRunDetailStateForConcreteIssueList = (): RunDetailModuleState => ({
  loading: false as boolean,
  error: {},
  run: mockRunDetail(),
  check: mockCheckDetail(),
  checkIssues: {} as CheckIssueConnection,
  concreteIssueList: mockRunDetailForConcreteIssueList() as IssueConnection
})
