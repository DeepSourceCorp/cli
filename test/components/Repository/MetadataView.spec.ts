import { render } from '@testing-library/vue'

import MetadataView from '~/components/Repository/MetadataView.vue'

import { cartesian, generateBooleanProps } from '~/test/utils'

describe('[[ MetadataView ]]', () => {
  const baseProps = {
    issuesPrevented: 0,
    defaultBranchName: 'master',
    latestAnalysisRun: {
      id: 'UnVuOnpqeXh3dw==',
      runId: '232259e6-9b71-4e29-bf9f-ba0caf176445',
      config: {
        version: 1,
        analyzers: [
          {
            meta: {
              import_paths: ['github.com/deepsourcelabs/demo-go']
            },
            name: 'go',
            enabled: true
          },
          {
            meta: {
              dockerfile_paths: ['./env/Dockerfile_dev', './env/Dockerfile_prod']
            },
            name: 'docker',
            enabled: true
          }
        ]
      },
      commitOid: 'cf64c729235234a4f59336a4005928ab2216846f',
      branchRunCount: null,
      status: 'FAIL',
      finishedAt: '2022-10-03T10:49:47.035312+00:00'
    },
    runs: {
      totalCount: 0
    },
    availableAnalyzers: {
      edges: [
        {
          node: {
            id: 'QW5hbHl6ZXI6cnlieXZ6',
            shortcode: 'go',
            name: 'Go',
            logo: 'analyzer_logos/go.svg',
            analyzerLogo:
              'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/go.svg?v=1592555094'
          }
        },
        {
          node: {
            id: 'QW5hbHl6ZXI6b2x6cW5i',
            shortcode: 'docker',
            name: 'Dockerfile',
            logo: 'analyzer_logos/docker.svg',
            analyzerLogo:
              'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/docker.svg?v=1590404051'
          }
        }
      ]
    },
    issueOccurrenceDistributionByIssueType: [
      {
        key: 'all',
        count: 22
      },
      {
        key: 'recommended',
        count: 3
      },
      {
        key: 'bug-risk',
        count: 7
      },
      {
        key: 'antipattern',
        count: 13
      },
      {
        key: 'style',
        count: 2
      },
      {
        key: 'security',
        count: 0
      },
      {
        key: 'performance',
        count: 0
      },
      {
        key: 'doc',
        count: 0
      },
      {
        key: 'typecheck',
        count: 0
      },
      {
        key: 'coverage',
        count: 0
      }
    ]
  }

  const stubs = {
    AnalyzerList: true,
    LastRunInfo: true,
    ZIcon: true
  }

  test('renders the metadata information to be shown next to issue overview cards on larger screens', () => {
    const loadingOptions = generateBooleanProps('loading', false)

    cartesian(loadingOptions).forEach((propCombination) => {
      const propsData = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(MetadataView, { propsData, stubs })
      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })
})
