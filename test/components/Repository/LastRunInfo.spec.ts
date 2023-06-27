import { render } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'
import dayjs from 'dayjs'

import LastRunInfo from '~/components/Repository/LastRunInfo.vue'

import { CheckStatus } from '~/types/types'
import { DurationTypeT, getDateFromXAgo } from '~/utils/date'

describe('[[ LastRunInfo ]]', () => {
  const today = dayjs().format('YYYY-MM-DD')
  const eightMonthsAgo = getDateFromXAgo(today, DurationTypeT.months, 8)

  const baseProps = {
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
      status: CheckStatus.Fail,
      finishedAt: eightMonthsAgo
    },
    runs: {
      totalCount: 0
    }
  }

  const mocks = {
    $generateRoute: () =>
      `/gh/deepsourcelabs/${baseProps.latestAnalysisRun.runId}/${baseProps.latestAnalysisRun.config.analyzers[0].name}`
  }

  const stubs = {
    NuxtLink: RouterLinkStub,
    ZIcon: true
  }

  test('renders the currently analyzing runs count in the metadata view footer', () => {
    const propsData = {
      ...baseProps,
      runs: {
        totalCount: 2
      }
    }

    const { html } = render(LastRunInfo, { mocks, propsData, stubs })
    expect(html()).toMatchSnapshot()
  })

  describe('renders the last run information shown in the metadata view footer', () => {
    test('failed run', () => {
      const { html } = render(LastRunInfo, { mocks, propsData: baseProps, stubs })
      expect(html()).toMatchSnapshot()
    })

    test('timed out run', () => {
      const propsData = {
        latestAnalysisRun: {
          id: 'UnVuOmJseWVhaw==',
          runId: '975682ed-bb63-4a87-a835-6680b4b71f0c',
          config: {
            version: 1,
            analyzers: [
              {
                meta: {
                  import_root: 'github.com/CyberdyneHQ/<repository-name>'
                },
                name: 'go',
                enabled: true
              },
              {
                name: 'javascript',
                enabled: true
              },
              {
                name: 'secrets',
                enabled: true
              },
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
                name: 'prettier',
                enabled: true
              },
              {
                name: 'black',
                enabled: true
              }
            ]
          },
          commitOid: '12acb8dbac38949075479498a2411520077cb6a5',
          branchRunCount: null,
          status: CheckStatus.Timo,
          finishedAt: null
        }
      }

      const { html } = render(LastRunInfo, { mocks, propsData, stubs })
      expect(html()).toMatchSnapshot()
    })
  })
})
