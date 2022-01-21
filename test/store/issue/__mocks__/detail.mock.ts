import {
  AnalyzerAnalyzerType,
  AnalyzerStatus,
  AnalyzerTrigger,
  CheckIssueConnection,
  Issue,
  IssueSeverity,
  RepositoryIssue
} from '~/types/types'
import { IssueDetailModuleState } from '~/store/issue/detail'

/**
 * Mock for issue.
 */
export const ISSUE_DETAIL: RepositoryIssue = <RepositoryIssue>{
  id: 'UmVwb3NpdG9yeUlzc3VlOjIxOTQ=',
  descriptionRendered: '<p>It is recommended to group imports together by packages.</p>\n',
  issueType: 'style',
  title: 'Imports from same package are not grouped',
  shortcode: 'PYL-C0412',
  firstSeen: '2020-02-29T07:06:11.659321+00:00',
  lastSeen: '2020-07-09T08:55:25.934225+00:00',
  occurrenceCount: 0,
  analyzerName: 'Python',
  analyzerShortcode: 'python',
  analyzerLogo: 'https://s3.us-east-1.amazonaws.com/local-asgard-static/analyzer_logos/python.svg',
  autofixAvailable: false,
  newVcsIssueUrl: '/services/proxy/new-vcs-issue?id=UmVwb3NpdG9yeUlzc3VlOjIxOTQ%3D',
  silenceRules: [
    {
      silenceLevel: 'RL',
      id: 'U2lsZW5jZVJ1bGU6MTA=',
      filePath: null,
      createdAt: '2020-11-26T04:14:09.728093+00:00',
      metadata: {
        type: 'forever'
      },
      creator: {
        firstName: 'Aman',
        lastName: 'Sharma',
        email: 'aman@deepsource.io',
        avatar:
          'https://s3.us-east-1.amazonaws.com/local-asgard-static/avatars/9e7acac4-9d55-4609-b5c3-a489c5e61459.jpeg'
      }
    },
    {
      silenceLevel: 'RL',
      id: 'U2lsZW5jZVJ1bGU6MTE=',
      filePath: null,
      createdAt: '2020-11-26T04:14:09.885947+00:00',
      metadata: {
        type: 'forever'
      },
      creator: {
        firstName: 'Aman',
        lastName: 'Sharma',
        email: 'aman@deepsource.io',
        avatar:
          'https://s3.us-east-1.amazonaws.com/local-asgard-static/avatars/9e7acac4-9d55-4609-b5c3-a489c5e61459.jpeg'
      }
    }
  ]
}

export const SINGLE_ISSUE: Issue = {
  createdAt: '2020-07-07T16:13:07.133670+00:00',
  modifiedAt: '2021-03-30T10:27:26.625554+00:00',
  id: 'SXNzdWU6YnZqZ3Zi',
  description: 'Suggest correct usage of shebang',
  shortcode: 'JS-0271',
  title: 'Suggest correct usage of shebang',
  severity: IssueSeverity.Major,
  analyzer: {
    id: 'QW5hbHl6ZXI6bHhiYW1i',
    createdAt: '2020-04-17T09:21:30.643859+00:00',
    modifiedAt: '2021-06-16T08:48:36.485972+00:00',
    version: 'dev',
    shortcode: 'javascript',
    name: 'JavaScript',
    accessKey: 'bef38997-7dbe-4942-8ced-8decf48f3fc8',
    description:
      "This is the official analyzer for the JavaScript programming language. It detects issues covered by open-source tools like eslint and it's supported plugins, alongwith DeepSource's custom checkers.",
    analyzerType: AnalyzerAnalyzerType.Core,
    status: AnalyzerStatus.Active,
    minCpuLimit: 800,
    minMemoryLimit: 4501,
    maxCpuLimit: 1500,
    maxMemoryLimit: 6501,
    runtimeVersions: [],
    metaSchema: '',
    trigger: AnalyzerTrigger.Code,
    isPrimary: true,
    starIssues: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    defaultTestPatterns: [],
    issues: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    reviews: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    checks: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    repositories: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    userSet: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    autofixRuns: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    transformertoolSet: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    transformerRuns: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  },
  autofixAvailable: false,
  isRecommended: true,
  weight: 70,
  starIssueInAnalyzers: {
    edges: [],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    }
  },
  checkIssues: {
    edges: [],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    }
  },
  autofixRuns: {
    edges: [],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    }
  }
}

/**
 * Mock -- Issue detail factory
 * @see ISSUE_DETAIL
 */
export const mockIssueDetail = (): RepositoryIssue => ISSUE_DETAIL
export const mockIssueSingleIssueDetail = (): Issue => SINGLE_ISSUE
export const mockIssueCheckIssueDetail = (): CheckIssueConnection => {
  return {
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false
    },
    edges: []
  }
}

/**
 * Mock factory
 */
export const mockIssueDetailState = (): IssueDetailModuleState => ({
  loading: false,
  error: {},
  issue: mockIssueDetail(),
  silenceRules: [],
  singleIssue: mockIssueSingleIssueDetail(),
  checkIssues: mockIssueCheckIssueDetail(),
  issueDirDetails: mockIssueSingleIssueDetail()
})
