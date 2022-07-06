import { Repository } from '~/types/types'
import { RepositoryDetailModuleState } from '~/store/repository/detail'

/*
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ REPOSITORY DETAIL MOCK +++++++++++++++++++
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for repository.
 */
export const REPOSITORY_DETAIL: Repository = <Repository>{
  id: 'UmVwb3NpdG9yeToxNjM5',
  name: 'asgard',
  defaultBranchName: 'master',
  hasViewerEditAccess: true,
  vcsUrl: 'https://github.com/deepsourcelabs/asgard',
  vcsHost: 'github.com',
  supportedAnalyzers: ['python', 'docker', 'javascript'],
  isCommitPossible: false,
  isAutofixEnabled: false,
  autofixGithubAppInstallationUrl:
    'https://github.com/apps/None/installations/new/permissions?target_id=40287229&state=L29uYm9hcmQvZ2gvZGVlcHNvdXJjZWxhYnMvZ2VuZXJhdGUtY29uZmlnL1VtVndiM05wZEc5eWVUb3hOak01'
}

/**
 * Mock -- Repository detail factory
 * @see REPOSITORY_DETAIL
 */
export const mockRepositoryDetail = (): Repository => REPOSITORY_DETAIL

/**
 * Mock factory
 */
export const mockRepositoryDetailState = (): RepositoryDetailModuleState => ({
  loading: false as boolean,
  error: {},
  repository: mockRepositoryDetail()
})

/*
  ++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ WIDGETS MOCK +++++++++++++++++++
  ++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for repository.
 */
export const REPOSITORY_DETAIL_FOR_WIDGETS: Repository = <Repository>{
  id: 'UmVwb3NpdG9yeToxNjM5',
  widgets: [
    'antipattern-widget',
    'bug-risk-widget',
    'performance-widget',
    'security-widget',
    'coverage-widget',
    'typecheck-widget'
  ],
  widgetsDisplay: {
    'antipattern-widget': {
      title: 'Anti-patterns',
      value_display: 4,
      link: '/gh/deepsourcelabs/asgard/issues/?category=antipattern',
      description: 'Antipattern issues',
      hint: null,
      has_trend_value: true,
      trend_direction: 'down',
      trend_value: '125%',
      trend_display: 'since last commit',
      trend_positive: false
    },
    'bug-risk-widget': {
      title: 'Bug Risks',
      value_display: 531,
      link: '/gh/deepsourcelabs/asgard/issues/?category=bug-risk',
      description: 'Bug-Risk issues',
      hint: null,
      has_trend_value: true,
      trend_direction: 'up',
      trend_value: '2113%',
      trend_display: 'since last commit',
      trend_positive: false
    },
    'performance-widget': {
      title: 'Performance Issues',
      value_display: 2,
      link: '/gh/deepsourcelabs/asgard/issues/?category=performance',
      description: 'Performance issues',
      hint: null,
      has_trend_value: true,
      trend_direction: 'up',
      trend_value: '100%',
      trend_display: 'since last commit',
      trend_positive: false
    },
    'security-widget': {
      title: 'Security Issues',
      value_display: 6,
      link: '/gh/deepsourcelabs/asgard/issues/?category=security',
      description: 'Security issues',
      hint: null,
      has_trend_value: true,
      trend_direction: 'up',
      trend_value: '20%',
      trend_display: 'since last commit',
      trend_positive: false
    },
    'coverage-widget': {
      title: 'Coverage Issues',
      value_display: 0,
      link: '/gh/deepsourcelabs/asgard/issues/?category=coverage',
      description: 'Coverage issues',
      hint: null,
      has_trend_value: true,
      trend_display: 'no change since last commit',
      trend_direction: null,
      trend_value: null,
      trend_positive: null
    },
    'typecheck-widget': {
      title: 'Typecheck Issues',
      value_display: 0,
      link: '/gh/deepsourcelabs/asgard/issues/?category=typecheck',
      description: 'Typecheck issues',
      hint: null,
      has_trend_value: true,
      trend_display: 'no change since last commit',
      trend_direction: null,
      trend_value: null,
      trend_positive: null
    }
  }
}

/**
 * Mock -- Repository detail factory
 * @see REPOSITORY_DETAIL_FOR_WIDGETS
 */
export const mockRepositoryDetailForWidgets = (): Repository => REPOSITORY_DETAIL_FOR_WIDGETS

/**
 * Mock factory
 */
export const mockRepositoryDetailStateForWidgets = (): RepositoryDetailModuleState => ({
  loading: false as boolean,
  error: {},
  repository: mockRepositoryDetailForWidgets()
})

/*
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ REPOSITORY SETTINGS MOCK -- GENERAL +++++++++++++++++++
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for repository.
 */
export const REPOSITORY_DETAIL_FOR_SETTINGS_GENERAL: Repository = <Repository>{
  id: 'UmVwb3NpdG9yeToxNjM5',
  showInDiscover: true,
  analyzeChangesetOnly: true,
  defaultBranchName: 'master',
  isSubmoduleEnabled: false,
  config: {
    version: 1,
    analyzers: [
      {
        meta: {
          max_line_length: 100,
          skip_doc_coverage: ['module', 'magic', 'class']
        },
        name: 'python',
        enabled: true
      },
      {
        name: 'test-coverage',
        enabled: true
      },
      {
        name: 'docker',
        enabled: true
      }
    ],
    transformers: [
      {
        name: 'black',
        enabled: true
      }
    ],
    test_patterns: ['*/tests/**/test_*.py'],
    exclude_patterns: ['core/migrations/*', 'providers/tests/common/test_files/*']
  },
  isActivated: true,
  isPrivate: true,
  issueTypeSettings: [
    {
      name: 'Bug Risk',
      slug: 'bug-risk',
      description: null,
      isIgnoredInCheckStatus: false,
      isIgnoredToDisplay: false
    },
    {
      name: 'Anti-pattern',
      slug: 'antipattern',
      description: null,
      isIgnoredInCheckStatus: false,
      isIgnoredToDisplay: false
    },
    {
      name: 'Performance',
      slug: 'performance',
      description: null,
      isIgnoredInCheckStatus: false,
      isIgnoredToDisplay: false
    },
    {
      name: 'Security',
      slug: 'security',
      description: null,
      isIgnoredInCheckStatus: false,
      isIgnoredToDisplay: false
    },
    {
      name: 'Typecheck',
      slug: 'typecheck',
      description: null,
      isIgnoredInCheckStatus: false,
      isIgnoredToDisplay: false
    },
    {
      name: 'Coverage',
      slug: 'coverage',
      description: null,
      isIgnoredInCheckStatus: false,
      isIgnoredToDisplay: false
    },
    {
      name: 'Style',
      slug: 'style',
      description: null,
      isIgnoredInCheckStatus: true,
      isIgnoredToDisplay: false
    },
    {
      name: 'Documentation',
      slug: 'doc',
      description: null,
      isIgnoredInCheckStatus: true,
      isIgnoredToDisplay: false
    }
  ]
}

/**
 * Mock -- Repository detail factory
 * @see REPOSITORY_DETAIL_FOR_SETTINGS_GENERAL
 */
export const mockRepositoryDetailForSettingsGeneral = (): Repository =>
  REPOSITORY_DETAIL_FOR_SETTINGS_GENERAL

/**
 * Mock factory
 */
export const mockRepositoryDetailStateForSettingsGeneral = (): RepositoryDetailModuleState => ({
  loading: false as boolean,
  error: {},
  repository: mockRepositoryDetailForSettingsGeneral()
})

/*
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ REPOSITORY SETTINGS MOCK -- MANAGE ACCESS +++++++++++++++++++
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for repository.
 */
export const REPOSITORY_DETAIL_FOR_SETTINGS_MANAGE_ACCESS: Repository = <Repository>{
  id: 'UmVwb3NpdG9yeToxNjM5',
  collaborators: {
    totalCount: 2,
    edges: [
      {
        node: {
          id: 'UmVwb3NpdG9yeUNvbGxhYm9yYXRvcjox',
          permission: 'ADMIN',
          repository: {
            id: 'UmVwb3NpdG9yeToxNjM5'
          },
          user: {
            id: 'VXNlcjo3',
            firstName: 'Sanket',
            lastName: 'Saurav',
            email: 'sanketsaurav@gmail.com',
            avatar:
              'https://s3.us-east-1.amazonaws.com/local-asgard-static/avatars/9a07488f-7295-4546-9727-04362659e451.jpeg',
            dateJoined: '2019-01-15T09:38:15.676257+00:00'
          }
        }
      },
      {
        node: {
          id: 'UmVwb3NpdG9yeUNvbGxhYm9yYXRvcjoy',
          permission: 'READ',
          repository: {
            id: 'UmVwb3NpdG9yeToxNjM5'
          },
          user: {
            id: 'VXNlcjozNg==',
            firstName: 'Sourya',
            lastName: 'Vatsyayan',
            email: 'souryavatsyayan@gmail.com',
            avatar:
              'https://s3.us-east-1.amazonaws.com/local-asgard-static/avatars/bc950f22-1090-47b7-adb3-fd971b922a7b.jpeg',
            dateJoined: '2019-07-09T13:43:51.769867+00:00'
          }
        }
      }
    ]
  }
}

/**
 * Mock -- Repository detail factory
 * @see REPOSITORY_DETAIL_FOR_SETTINGS_MANAGE_ACCESS
 */
export const mockRepositoryDetailForSettingsManageAccess = (): Repository =>
  REPOSITORY_DETAIL_FOR_SETTINGS_MANAGE_ACCESS

/**
 * Mock factory
 */
export const mockRepositoryDetailStateForSettingsManageAccess =
  (): RepositoryDetailModuleState => ({
    loading: false as boolean,
    error: {},
    repository: mockRepositoryDetailForSettingsManageAccess()
  })

/*
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ REPOSITORY SETTINGS MOCK -- IGNORE RULES +++++++++++++++++++
  ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for repository.
 */
export const REPOSITORY_DETAIL_FOR_SETTINGS_IGNORE_RULES: Repository = <Repository>{
  hasViewerEditAccess: true,
  silenceRules: {
    totalCount: 2,
    edges: [
      {
        node: {
          silenceLevel: 'RL',
          id: 'U2lsZW5jZVJ1bGU6MTE=',
          filePath: null,
          createdAt: '2020-11-26T04:14:09.885947+00:00',
          metadata: {
            type: 'forever'
          },
          issue: {
            shortcode: 'PYL-C0412',
            title: 'Imports from same package are not grouped'
          },
          creator: {
            firstName: 'Aman',
            lastName: 'Sharma',
            email: 'aman@deepsource.io',
            avatar:
              'https://s3.us-east-1.amazonaws.com/local-asgard-static/avatars/9e7acac4-9d55-4609-b5c3-a489c5e61459.jpeg'
          }
        }
      },
      {
        node: {
          silenceLevel: 'RL',
          id: 'U2lsZW5jZVJ1bGU6MTA=',
          filePath: null,
          createdAt: '2020-11-26T04:14:09.728093+00:00',
          metadata: {
            type: 'forever'
          },
          issue: {
            shortcode: 'PYL-C0412',
            title: 'Imports from same package are not grouped'
          },
          creator: {
            firstName: 'Aman',
            lastName: 'Sharma',
            email: 'aman@deepsource.io',
            avatar:
              'https://s3.us-east-1.amazonaws.com/local-asgard-static/avatars/9e7acac4-9d55-4609-b5c3-a489c5e61459.jpeg'
          }
        }
      }
    ]
  }
}

/**
 * Mock -- Repository detail factory
 * @see REPOSITORY_DETAIL_FOR_SETTINGS_IGNORE_RULES
 */
export const mockRepositoryDetailForSettingsIgnoreRules = (): Repository =>
  REPOSITORY_DETAIL_FOR_SETTINGS_IGNORE_RULES

/**
 * Mock factory
 */
export const mockRepositoryDetailStateForSettingsIgnoreRules = (): RepositoryDetailModuleState => ({
  loading: false as boolean,
  error: {},
  repository: mockRepositoryDetailForSettingsIgnoreRules()
})

/*
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ REPOSITORY SETTINGS MOCK -- SSH +++++++++++++++++++
  +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

/**
 * Mock for repository.
 */
export const REPOSITORY_DETAIL_FOR_SETTINGS_SSH: Repository = <Repository>{
  id: 'UmVwb3NpdG9yeToxNjM5',
  encPublicKey: null
}

/**
 * Mock -- Repository detail factory
 * @see REPOSITORY_DETAIL_FOR_SETTINGS_SSH
 */
export const mockRepositoryDetailForSettingsSsh = (): Repository =>
  REPOSITORY_DETAIL_FOR_SETTINGS_SSH

/**
 * Mock factory
 */
export const mockRepositoryDetailStateForSettingsSsh = (): RepositoryDetailModuleState => ({
  loading: false as boolean,
  error: {},
  repository: mockRepositoryDetailForSettingsSsh()
})

/*
  ++++++++++++++++++++++++++++++++++++++++++++++++++++
  +++++++++++++++++++ METRICS MOCK +++++++++++++++++++
  ++++++++++++++++++++++++++++++++++++++++++++++++++++
*/

export const REPOSITORY_DETAIL_FOR_METRICS: Repository = <Repository>{
  id: 'UmVwb3NpdG9yeTp6ZXBqZWI=',
  metricsCaptured: [
    {
      id: 'TWV0cmljOmduenhxYg==',
      shortcode: 'TCV',
      name: 'Test Coverage',
      category: 'Coverage',
      description: 'Test Coverage',
      supportsAggregateThreshold: true,
      namespaces: [
        {
          key: 'aggregate',
          threshold: null,
          analyzerLogo: null,
          analyzerShortcode: null
        },
        {
          key: 'javascript',
          threshold: 54,
          analyzerLogo:
            'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/javascript.svg',
          analyzerShortcode: 'javascript'
        },
        {
          key: 'python',
          threshold: 80,
          analyzerLogo:
            'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg',
          analyzerShortcode: 'python'
        }
      ],
      namespacesTrends: [
        {
          key: 'javascript',
          valueTrend: {
            labels: [
              '2022-05-30',
              '2022-05-31',
              '2022-06-01',
              '2022-06-02',
              '2022-06-03',
              '2022-06-04',
              '2022-06-05',
              '2022-06-06',
              '2022-06-07'
            ],
            values: [84, 51, 68, 78, 55, 82, 90, 85, 68]
          },
          isPassing: true,
          valueDisplay: '68%',
          analyzerShortcode: 'javascript',
          analyzerLogo:
            'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/javascript.svg',
          threshold: 54
        },
        {
          key: 'python',
          valueTrend: {
            labels: [
              '2022-05-30',
              '2022-05-31',
              '2022-06-01',
              '2022-06-02',
              '2022-06-03',
              '2022-06-04',
              '2022-06-05',
              '2022-06-06',
              '2022-06-07',
              '2022-06-08',
              '2022-06-09',
              '2022-06-10',
              '2022-06-11',
              '2022-06-12',
              '2022-06-13',
              '2022-06-14',
              '2022-06-15'
            ],
            values: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
          },
          isPassing: false,
          valueDisplay: '50%',
          analyzerShortcode: 'python',
          analyzerLogo:
            'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg',
          threshold: 80
        }
      ]
    },
    {
      id: 'TWV0cmljOmtkemdveg==',
      shortcode: 'ADC',
      name: 'API Documenatation Coverage',
      category: 'Documentation',
      description: 'API Documenatation Coverage',
      supportsAggregateThreshold: false,
      namespaces: [
        {
          key: 'aggregate',
          threshold: null,
          analyzerLogo: null,
          analyzerShortcode: null
        },
        {
          key: 'python',
          threshold: null,
          analyzerLogo:
            'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg',
          analyzerShortcode: 'python'
        }
      ],
      namespacesTrends: []
    },
    {
      id: 'TWV0cmljOnhkem1heg==',
      shortcode: 'IDP',
      name: 'Indirect Dependencies',
      category: 'Dependencies',
      description: 'Indirect dependencies',
      supportsAggregateThreshold: false,
      namespaces: [
        {
          key: 'aggregate',
          threshold: null,
          analyzerLogo: null,
          analyzerShortcode: null
        },
        {
          key: 'python',
          threshold: null,
          analyzerLogo:
            'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg',
          analyzerShortcode: 'python'
        }
      ],
      namespacesTrends: [
        {
          key: 'python',
          valueTrend: {
            labels: [
              '2022-05-30',
              '2022-05-31',
              '2022-06-01',
              '2022-06-02',
              '2022-06-03',
              '2022-06-04',
              '2022-06-05',
              '2022-06-06',
              '2022-06-07',
              '2022-06-08',
              '2022-06-09',
              '2022-06-10',
              '2022-06-11',
              '2022-06-12',
              '2022-06-13',
              '2022-06-14',
              '2022-06-15'
            ],
            values: [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7]
          },
          isPassing: null,
          valueDisplay: '7',
          analyzerShortcode: 'python',
          analyzerLogo:
            'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg',
          threshold: null
        }
      ]
    },
    {
      id: 'TWV0cmljOnZsenJ2eg==',
      shortcode: 'TDC',
      name: 'Test Documentation Coverage',
      category: 'Documentation',
      description: 'Test Documenatation Coverage',
      supportsAggregateThreshold: false,
      namespaces: [
        {
          key: 'Python',
          threshold: null,
          analyzerLogo:
            'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg',
          analyzerShortcode: 'python'
        },
        {
          key: 'aggregate',
          threshold: null,
          analyzerLogo: null,
          analyzerShortcode: null
        },
        {
          key: 'python',
          threshold: null,
          analyzerLogo:
            'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg',
          analyzerShortcode: 'python'
        }
      ],
      namespacesTrends: []
    },
    {
      id: 'TWV0cmljOmxrYmV2eg==',
      shortcode: 'DCV',
      name: 'Application Documenatation Coverage',
      category: 'Documentation',
      description: 'Application Documenatation Coverage',
      supportsAggregateThreshold: false,
      namespaces: [
        {
          key: 'Python',
          threshold: null,
          analyzerLogo:
            'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg',
          analyzerShortcode: 'python'
        },
        {
          key: 'aggregate',
          threshold: null,
          analyzerLogo: null,
          analyzerShortcode: null
        },
        {
          key: 'python',
          threshold: null,
          analyzerLogo:
            'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg',
          analyzerShortcode: 'python'
        }
      ],
      namespacesTrends: []
    }
  ]
}

/**
 * Mock -- Repository detail factory
 * @see REPOSITORY_DETAIL_FOR_METRICS
 */
export const mockRepositoryDetailForMetrics = (): Repository => REPOSITORY_DETAIL_FOR_METRICS

/**
 * Mock factory
 */
export const mockRepositoryDetailStateForMetrics = (): RepositoryDetailModuleState => ({
  loading: false as boolean,
  error: {},
  repository: mockRepositoryDetailForMetrics()
})
