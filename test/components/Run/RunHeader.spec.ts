import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { createLocalVue, RouterLinkStub, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'

import { RunHeader } from '~/components/Run'
import { cartesian, generateStringProps } from '~/test/utils'

interface IRunHeader {
  isPending: boolean
  statusIcon: string
  statusIconColor: string
  statusText: string
  transformersAllowed: boolean
  getRoute: (shortcode: string) => string
  $generateRoute: () => string
}

describe('[[ RunHeader ]]', () => {
  // Mocks
  const baseProps = {
    branchName: 'deepsource-fix-a6311593',
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

    $route: {
      params: {
        provider: 'gh',
        runId: '6a94e757-a26a-425d-af59-6826a8d02c92'
      }
    }
  }

  const stubs = {
    LinkToPrev: true,
    GistCardDescription: true,
    GistCardTitle: true,
    NuxtLink: RouterLinkStub,
    SubNav: true,
    ZTab: true,
    ZTag: true
  }

  const getInstance = (props = {}) => {
    const localVue = createLocalVue()
    localVue.use(VTooltip)

    const { vm } = shallowMount(RunHeader, {
      mocks,
      propsData: {
        ...baseProps,
        ...props
      },
      stubs,
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
          mocks,
          props,
          stubs
        },
        (vue) => {
          vue.use(VTooltip)
        }
      )

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })

  test('`statusIcon` returns the icon corresponding to `status`', () => {
    const vm = getInstance()
    expect(vm.statusIcon).toBe('x')
  })

  test('`statusIcon` returns the icon corresponding to `PASS` if `status` is falsy', () => {
    const vm = getInstance({ status: '' })
    expect(vm.statusIcon).toBe('check')
  })

  test('`statusIconColor` returns the icon color corresponding to `status`', () => {
    const vm = getInstance()
    expect(vm.statusIconColor).toBe('cherry')
  })

  test('`statusIconColor` returns the icon color corresponding to `PASS` if `status` is falsy', () => {
    const vm = getInstance({ status: '' })
    expect(vm.statusIconColor).toBe('juniper')
  })

  test('`statusText` returns the text corresponding to `status`', () => {
    const vm = getInstance()
    expect(vm.statusText).toBe('Failed after')
  })

  test('`statusText` returns the text corresponding to `status` without the linking word if `finishedIn` is `0`', () => {
    const vm = getInstance({ finishedIn: 0 })
    expect(vm.statusText).toBe('Failed')
  })

  test('`statusText` returns the text corresponding to `PASS` if `status` is falsy', () => {
    const vm = getInstance({ status: '' })
    expect(vm.statusText).toBe('Passed in')
  })

  test('`statusText` returns the text corresponding to `PASS` without the linking word if `finishedIn` is `0` and `status` is falsy', () => {
    const vm = getInstance({ finishedIn: 0, status: '' })
    expect(vm.statusText).toBe('Passed')
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
    expect(vm.getRoute('python')).toBe(
      '/gh/deepsourcelabs/run/6a94e757-a26a-425d-af59-6826a8d02c92/python'
    )
    expect(vm.$generateRoute).toBeCalledWith([
      'run',
      '6a94e757-a26a-425d-af59-6826a8d02c92',
      'python'
    ])
  })
})
