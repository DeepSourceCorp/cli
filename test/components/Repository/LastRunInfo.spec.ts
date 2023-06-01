import { render } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'

import LastRunInfo from '~/components/Repository/LastRunInfo.vue'

describe('[[ LastRunInfo ]]', () => {
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
      status: 'FAIL',
      finishedAt: '2022-10-03T10:49:47.035312+00:00'
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

  test('renders the last run information shown in the metadata view footer', () => {
    const { html } = render(LastRunInfo, { mocks, propsData: baseProps, stubs })
    expect(html()).toMatchSnapshot()
  })
})
