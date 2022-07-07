import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { createLocalVue, RouterLinkStub, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import { VueConstructor } from 'vue'
import { RunHeader } from '~/components/Run'
import { cartesian, generateStringProps } from '~/test/utils'
import { Check, RunConnection, RunEdge, RunStatus } from '~/types/types'
import Vuex, { Store } from 'vuex'

interface IRunHeader {
  isPending: boolean
  getStatusIcon: (status: RunStatus) => string
  getStatusIconColor: (status: RunStatus) => string
  getStatusText: (status: RunStatus) => string
  transformersAllowed: boolean
  $generateRoute: () => string
  currentCheck: Check
  tagLabel: string
  getRoute: (shortcode: string) => string
  runCount: () => number
  countText: string
  fetchRuns: () => {}
}

describe('[[ RunHeader ]]', () => {
  const branchRunList = {
    totalCount: 3,
    edges: [
      {
        node: {
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
          createdAt: '2020-07-06T10:13:25.527944+00:00',
          runId: '4c1d5e1b-1747-4777-9618-acae5c51ca5d',
          status: 'FAIL',
          branchName: 'master',
          commitOid: '2316e689facc8b4ea67258230b5cbce5c7d6c8d4',
          finishedIn: 41,
          vcsCommitUrl:
            'https://github.com/deepsourcelabs/demo-python/commit/2316e689facc8b4ea67258230b5cbce5c7d6c8d4',
          gitCompareDisplay: 'cd69d63..2316e68',
          pullRequestNumberDisplay: null,
          issuesRaisedCount: 33,
          issuesResolvedNum: 0
        }
      },
      {
        node: {
          config: {
            version: 1,
            analyzers: [
              {
                meta: {
                  type_checker: 'mypy',
                  max_line_length: 88,
                  skip_doc_coverage: ['module', 'magic', 'init']
                },
                name: 'python',
                enabled: true,
                runtime_version: '3.x.x'
              }
            ],
            test_patterns: ['test_*.py']
          },
          createdAt: '2020-05-11T15:42:05.760966+00:00',
          runId: 'f199e31b-319e-43e0-a112-bc6f6b61d882',
          status: 'FAIL',
          branchName: 'master',
          commitOid: 'cd69d63641a26bd17a35f3e158fcc2c93c15bc82',
          finishedIn: 7,
          vcsCommitUrl:
            'https://github.com/deepsourcelabs/demo-python/commit/cd69d63641a26bd17a35f3e158fcc2c93c15bc82',
          gitCompareDisplay: '4aa06c5..cd69d63',
          pullRequestNumberDisplay: null,
          issuesRaisedCount: 15,
          issuesResolvedNum: 4
        }
      },
      {
        node: {
          config: {
            version: 1,
            analyzers: [
              {
                meta: {
                  type_checker: 'mypy',
                  max_line_length: 88,
                  skip_doc_coverage: ['module', 'magic', 'init']
                },
                name: 'python',
                enabled: true,
                runtime_version: '3.x.x'
              }
            ],
            test_patterns: ['test_*.py']
          },
          createdAt: '2020-04-24T02:30:20.557539+00:00',
          runId: 'f30abc8d-3c59-4b46-8b29-62eb40662232',
          status: 'PASS',
          branchName: 'master',
          commitOid: '4aa06c5196e2cb7e64ecc1f2b0127fbdb1cb19f1',
          finishedIn: 54270,
          vcsCommitUrl:
            'https://github.com/deepsourcelabs/demo-python/commit/4aa06c5196e2cb7e64ecc1f2b0127fbdb1cb19f1',
          gitCompareDisplay: '127cc72..4aa06c5',
          pullRequestNumberDisplay: null,
          issuesRaisedCount: 0,
          issuesResolvedNum: 0
        }
      }
    ]
  }

  const baseProps = {
    branchName: 'master',
    commitOid: '86215f5d0d27e08c86f752c61510130fb37901ef',
    createdAt: '2020-07-07T16:58:15.109526+00:00',
    status: 'FAIL',
    finishedIn: 88,
    gitCompareDisplay: 'b3907ba..86215f5',
    checks: [
      {
        id: 'Q2hlY2s6YnJnbnZq',
        issuesRaisedCount: 23,
        analyzer: {
          name: 'Python',
          shortcode: 'python',
          description: "DeepSource's Python analyzer.",
          analyzerLogo:
            'http://local-asgard-static.s3.us-east-1.amazonaws.com/analyzer_logos/python.svg'
        }
      }
    ],
    routeToPrevious: '/gh/deepsourcelabs/demo-python/history/runs',
    vcsCommitUrl:
      'https://github.com/deepsourcelabs/demo-python/commit/86215f5d0d27e08c86f752c61510130fb37901ef',
    vcsPrUrl: 'https://github.com/deepsourcelabs/demo-python/pull/77',
    pullRequestNumberDisplay: '#77',
    currentAnalyzer: 'python'
  }

  const mocks = {
    $generateRoute: jest
      .fn()
      .mockImplementation(
        () => '/gh/deepsourcelabs/run/6a94e757-a26a-425d-af59-6826a8d02c92/python'
      ),
    $socket: {
      $on: jest.fn(),
      $off: jest.fn()
    },
    $route: {
      params: {
        provider: 'gh',
        runId: '6a94e757-a26a-425d-af59-6826a8d02c92'
      }
    }
  }

  const stubs = {
    LinkToPrev: true,
    NuxtLink: RouterLinkStub,
    ZIcon: true,
    ZTag: true,
    ZMenu: true,
    ZMenuSection: true,
    ZMenuItem: true
  }

  let localVue = {} as VueConstructor<Vue>
  let store = {} as Store<Record<string, RunConnection>>

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    localVue.use(VTooltip)
  })

  const getStoreInstance = () => {
    const options = {
      modules: {
        'run/list': {
          namespaced: true,
          state: {
            branchRunList
          }
        }
      }
    }

    const store = new Vuex.Store(options)
    return store as Store<Record<string, RunConnection>>
  }

  const getInstance = (props = {}) => {
    store = getStoreInstance()

    const { vm } = shallowMount(RunHeader, {
      propsData: {
        ...baseProps,
        ...props
      },
      store,
      stubs,
      mocks,
      localVue
    })
    return vm as unknown as IRunHeader
  }

  test('renders `RunHeader` with all prop options', () => {
    const statusOptions = generateStringProps(
      'status',
      ['PEND', 'PASS', 'FAIL', 'TIMO', 'CNCL', 'READ'],
      false
    )

    cartesian(statusOptions).forEach((propCombination) => {
      const props = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(
        RunHeader,
        {
          store,
          mocks,
          props,
          stubs
        },
        (vue) => {
          vue.use(VTooltip)
          vue.use(Vuex)
        }
      )

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })

  test('`statusIcon` returns the icon corresponding to `status`', () => {
    const vm = getInstance()
    expect(vm.getStatusIcon(RunStatus.Fail)).toBe('x')
  })

  test('`statusIconColor` returns the icon color corresponding to `status`', () => {
    const vm = getInstance()
    expect(vm.getStatusIconColor(RunStatus.Fail)).toBe('cherry')
  })

  test('`statusText` returns the text corresponding to `status`', () => {
    const vm = getInstance()
    expect(vm.getStatusText(RunStatus.Fail)).toBe('Failed after')
  })

  test('`isPending` returns `true` if `status` is in pending state', () => {
    const vm = getInstance({ status: 'PEND' })
    expect(vm.isPending).toBe(true)
  })

  test('`transformersAllowed` returns `true` if `provider` as part of route params is not `gsr`', () => {
    const vm = getInstance()
    expect(vm.transformersAllowed).toBe(true)
  })

  test('`getRoute` method returns route for a given analyzer shortcode', () => {
    const vm = getInstance()

    // Assertions
    expect(vm.getRoute('6a94e757-a26a-425d-af59-6826a8d02c92')).toBe(
      '/gh/deepsourcelabs/run/6a94e757-a26a-425d-af59-6826a8d02c92/python'
    )
    expect(vm.$generateRoute).toBeCalledWith(['run', '6a94e757-a26a-425d-af59-6826a8d02c92'])
  })
})
