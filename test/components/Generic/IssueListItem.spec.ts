import '@testing-library/jest-dom'
import { fireEvent, render } from '@testing-library/vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'floating-vue'

import IssueListItem from '~/components/IssueListItem.vue'
import { cartesian, generateBooleanProps } from '~/test/utils'
import { TrendDirection } from '~/types/types'

interface IssueListItemInterface {
  showTrend: boolean
  lastSeenDisplay: string
  firstSeenDisplay: string
  link: string
}

describe('[[ IssueListItem ]]', () => {
  const stubs = {
    IssueType: true,
    ZIcon: true,
    Ticker: true,
    MetaDataItem: true
  }

  const today = new Date()
  const twoYearsAgo = today.setFullYear(today.getFullYear() - 2)

  const baseProps = {
    id: 'UmVwb3NpdG9yeUlzc3VlOnpweXJqYg==',
    issueType: 'bug-risk',
    title: 'Dangerous default argument',
    shortcode: 'PYL-W0102',
    description:
      'Do not use a mutable like `list` or `dictionary` as a default value to an argument. Python’s default arguments are evaluated once when the function is defined. Using a mutable default argument and mutating it will mutate that object for all future calls to the function as well.',
    occurrenceCount: 3,
    firstSeen: twoYearsAgo,
    seenIn: 'code.py',
    lastSeen: twoYearsAgo,
    trend: {
      trendHint: 'Since last week',
      trendValue: 12,
      trendDirection: TrendDirection.Down,
      trendPositive: true
    },
    raisedInFiles: ['code.py']
  }

  // Returns a Wrapper that contains the rendered Vue component
  const getInstance = (props = {}) => {
    const localVue = createLocalVue()
    localVue.use(VTooltip)

    const propsData = {
      ...baseProps,
      ...props
    }
    const { vm } = shallowMount(IssueListItem, {
      propsData,
      localVue,
      stubs
    })
    return vm as unknown as IssueListItemInterface
  }

  test('renders `IssueListItem` with all prop options', () => {
    const autofixAvailableOptions = generateBooleanProps('autofixAvailable', false)
    const centerContentOptions = generateBooleanProps('centerContent', false)
    const showAutofixButtonOptions = generateBooleanProps('showAutofixButton', false)
    const disableAutofixButtonOptions = generateBooleanProps('disableAutofixButton', false)
    const showSeenInfoOptions = generateBooleanProps('showSeenInfo', false)

    cartesian(
      autofixAvailableOptions,
      centerContentOptions,
      showAutofixButtonOptions,
      disableAutofixButtonOptions,
      showSeenInfoOptions
    ).forEach((propCombination) => {
      const props = {
        ...baseProps,
        ...propCombination
      }
      const { html } = render(
        IssueListItem,
        {
          props,
          stubs
        },
        (vue) => {
          vue.use(VTooltip)
        }
      )

      expect(html()).toMatchSnapshot()
    })
  })

  test('Clicking the Autofix button emits an event by the name `autofix`', async () => {
    const { getByTestId, emitted } = render(
      IssueListItem,
      {
        props: {
          ...baseProps,
          id: 'UmVwb3NpdG9yeUlzc3VlOnpweXJqYg==',
          shortcode: 'PYL-W0102',
          autofixAvailable: true,
          raisedInFiles: ['code.py']
        },
        stubs
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    // Grab button by test id.
    const button = getByTestId('autofix-issue')

    // Fire click event.
    await fireEvent(button, new Event('click'))

    // Assertions
    expect(emitted()).toHaveProperty('autofix')
    expect(emitted()['autofix'][0][0]).toEqual({
      issueId: 'UmVwb3NpdG9yeUlzc3VlOnpweXJqYg==',
      shortcode: 'PYL-W0102',
      raisedInFiles: ['code.py']
    })
  })

  test('`showTrend` is set to `true` if `trend` is present', () => {
    const vm = getInstance({
      trend: {
        trendHint: 'Since last week',
        trendValue: 12,
        trendDirection: TrendDirection.Down,
        trendPositive: true
      }
    })
    expect(vm.showTrend).toBe(true)
  })

  test('`showTrend` is set to `false` if `trend` is empty', () => {
    const vm = getInstance({
      trend: {}
    })
    expect(vm.showTrend).toBe(false)
  })

  test('`lastSeenDisplay` returns when the issue was seen the last time in a human-readable form', () => {
    const vm = getInstance()
    expect(vm.lastSeenDisplay).toBe('2 years ago')
  })

  test('`firstSeenDisplay` returns when the issue was first seen in a human-readable form', () => {
    const vm = getInstance()
    expect(vm.firstSeenDisplay).toBe('2 years old')
  })

  test('`link` is correctly computed from the `issueListFilters`', () => {
    const vm = getInstance({
      issueListFilters: {
        sort: 'least-frequent',
        category: 'bug-risk',
        q: 'dan'
      }
    })
    expect(vm.link.split('?')[1]).toBe(
      'listsort=least-frequent&listcategory=bug-risk&listq=dan&listindex=0'
    )
  })
})
