import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import { VueConstructor } from 'vue'
import Vuex, { Store } from 'vuex'

import { AnalyzerRun } from '~/components/Run'
import { cartesian, generateStringProps } from '~/test/utils'
import { Issue } from '~/types/types'
import { resolveNodes } from '~/utils/array'

interface IAnalyzerRun {
  issueCount: number
  concreteIssues: Issue[]
}

describe('[[ AnalyzerRun ]]', () => {
  // Mocks
  const concreteIssueList = {
    totalCount: 23,
    edges: [
      {
        node: {
          id: 'SXNzdWU6bGJwZ2d6',
          createdAt: '2019-03-29T12:21:41.724528+00:00',
          modifiedAt: '2020-07-09T08:54:35.654391+00:00',
          shortcode: 'PYL-E0702',
          title: 'Object of unsupported type raised',
          description:
            'Raising objects other than a class, an instance or a string can cause a `TypeError`.\n\nThere can be cases where the value being raised is dynamically set. One common example is setting the value to `None` originally, and then assigning other objects to it based on a condition. Doing so can affect readability, and is generally not recommended. In such cases, either re-write the block, or ignore the issue for this file.',
          severity: 'CRITICAL',
          autofixAvailable: false,
          autofixTitle: null,
          occurrenceCount: 1,
          issueType: 'bug-risk',
          seenIn: 'code.py'
        }
      },
      {
        node: {
          id: 'SXNzdWU6eGJha2di',
          createdAt: '2019-06-14T06:57:08.832219+00:00',
          modifiedAt: '2020-07-09T08:54:35.624106+00:00',
          shortcode: 'PYL-W0102',
          title: 'Dangerous default argument',
          description:
            'Do not use a mutable like `list` or `dictionary` as a default value to an argument. Python’s default arguments are evaluated once when the function is defined. Using a mutable default argument and mutating it will mutate that object for all future calls to the function as well.',
          severity: 'CRITICAL',
          autofixAvailable: true,
          autofixTitle: 'Fix dangerous default argument',
          occurrenceCount: 3,
          issueType: 'bug-risk',
          seenIn: 'code.py'
        }
      }
    ]
  }

  const mocks = {
    $route: {
      params: {}
    },
    $generateRoute: () => {}
  }

  let localVue = {} as VueConstructor<Vue>
  let store = {} as Store<AnalyzerRun>

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    localVue.use(VTooltip)

    store = new Vuex.Store({
      modules: {
        'run/detail': {
          namespaced: true,
          state: {
            concreteIssueList
          }
        }
      }
    })
  })

  const getInstance = () => {
    const { vm } = shallowMount(AnalyzerRun, {
      propsData: {
        status: 'FAIL',
        filters: {
          q: 'python',
          sort: 'most-frequent',
          category: 'bug-risk'
        }
      },
      store,
      mocks,
      stubs: {
        EmptyState: true
      },
      localVue
    })
    return vm as unknown as IAnalyzerRun
  }

  test('renders `AnalyzerRun` with all prop options', () => {
    const statusOptions = generateStringProps(
      'status',
      ['PEND', 'PASS', 'FAIL', 'TIMO', 'CNCL', 'READ'],
      false
    )

    cartesian(statusOptions).forEach((propCombination) => {
      const props = propCombination

      const { html } = render(
        AnalyzerRun,
        {
          mocks,
          props,
          store,
          stubs: {
            LazyRunLoading: true,
            IssueListItem: true
          }
        },
        (vue) => {
          vue.use(VTooltip)
        }
      )

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })

  test('`issueCount` returns the concrete issue list count', () => {
    const vm = getInstance()
    expect(vm.issueCount).toBe(2)
  })

  test('`concreteIssues` returns the concrete issue edge nodes', () => {
    const vm = getInstance()
    expect(vm.concreteIssues).toEqual(resolveNodes(concreteIssueList))
  })

  test('empty state for all statuses when issue count is 0', () => {
    const statusOptions = generateStringProps(
      'status',
      ['PEND', 'PASS', 'FAIL', 'TIMO', 'CNCL', 'READ'],
      false
    )

    cartesian(statusOptions).forEach((propCombination) => {
      const props = propCombination

      const { html } = render(
        AnalyzerRun,
        {
          mocks,
          props,
          store: new Vuex.Store({
            modules: {
              'run/detail': {
                namespaced: true,
                state: {
                  totalCount: 0,
                  edges: []
                }
              }
            }
          }),
          stubs: {
            LazyRunLoading: true,
            IssueListItem: true,
            EmptyState: true
          }
        },
        (vue) => {
          vue.use(VTooltip)
        }
      )

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })
})
