import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { AnalyzerSelector } from '~/components/Run'

const stubs = {
  ZTag: true,
  ZIcon: true
}

const mocks = {
  $generateRoute: jest
    .fn()
    .mockImplementation(
      () => 'gh/deepsourcelabs/demo-python/run/4c1d5e1b-1747-4777-9618-acae5c51ca5d/python'
    ),
  $route: {
    query: '',
    params: {
      provider: 'gh',
      owner: 'deepsourcelabs',
      repo: 'demo-python',
      runId: '4c1d5e1b-1747-4777-9618-acae5c51ca5d'
    }
  }
}

const sampleCheck = {
  issuesRaisedCount: 1,
  analyzer: {
    name: 'Python',
    shortcode: 'python',
    description: "DeepSource's Python analyzer.",
    analyzerLogo:
      'https://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg?v=1585728948'
  }
}

describe('[[ AnalyzerSelector ]]', () => {
  test('renders `AnalyzerSelector` with all check statuses', () => {
    const statuses = ['PEND', 'PASS', 'FAIL', 'TIMO', 'CNCL', 'READ']
    const checks = statuses.map((status, index) => {
      return {
        ...sampleCheck,
        ...{
          status,
          id: index
        }
      }
    })

    const props = {
      checks
    }

    const { html } = render(AnalyzerSelector, {
      props,
      stubs,
      mocks
    })

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })
})
