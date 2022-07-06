import '@testing-library/jest-dom'
import { fireEvent, render } from '@testing-library/vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'v-tooltip'

import { BaseCard } from '~/components/History'
import IssueListItem from '~/components/IssueListItem.vue'
import { cartesian, generateBooleanProps } from '~/test/utils'

interface IssueListItemInterface {
  pastValue: number
  showTrend: boolean
  isTrendPositive: boolean
  trendValue: number
  lastSeenDisplay: string
  firstSeenDisplay: string
}

describe('[[ IssueListItem ]]', () => {
  const getInstance = (props = {}) => {
    const localVue = createLocalVue()
    localVue.use(VTooltip)
    const { vm } = shallowMount(IssueListItem, {
      propsData: props,
      localVue
    })
    return vm as unknown as IssueListItemInterface
  }

  test('renders `IssueListItem` with all prop options', () => {
    const baseProps = {
      id: 'UmVwb3NpdG9yeUlzc3VlOnpweXJqYg==',
      issueType: 'bug-risk',
      title: 'Dangerous default argument',
      shortcode: 'PYL-W0102',
      description:
        'Do not use a mutable like `list` or `dictionary` as a default value to an argument. Python’s default arguments are evaluated once when the function is defined. Using a mutable default argument and mutating it will mutate that object for all future calls to the function as well.',
      occurrenceCount: 3,
      createdAt: '2020-03-09T17:21:41.965533+00:00',
      seenIn: 'code.py',
      firstSeen: '2020-03-09T17:21:41.965533+00:00',
      lastSeen: '2020-07-06T10:14:07.821843+00:00',
      modifiedAt: '2020-03-09T17:21:41.965540+00:00',
      pastValue: 3,
      raisedInFiles: ['code.py']
    }

    const autofixAvailableOptions = generateBooleanProps('autofixAvailable', false)
    const hideProgressOptions = generateBooleanProps('hideProgress', false)
    const showComparisonStatOptions = generateBooleanProps('showComparisonStat', false)
    const centerContentOptions = generateBooleanProps('centerContent', false)
    const showAutofixButtonOptions = generateBooleanProps('showAutofixButton', false)
    const disableAutofixButtonOptions = generateBooleanProps('disableAutofixButton', false)
    const showSeenInfoOptions = generateBooleanProps('showSeenInfo', false)

    cartesian(
      autofixAvailableOptions,
      hideProgressOptions,
      showComparisonStatOptions,
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
          stubs: {
            IssueType: true,
            ZIcon: true
          }
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
          id: 'UmVwb3NpdG9yeUlzc3VlOnpweXJqYg==',
          shortcode: 'PYL-W0102',
          autofixAvailable: true,
          raisedInFiles: ['code.py']
        },
        stubs: {
          ZIcon: true,
          BaseCard
        }
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

  test('`showTrend` is set to `false` if `pastValue` is `0`', () => {
    const vm = getInstance({ pastValue: 0 })
    expect(vm.showTrend).toBe(false)
  })

  test('`showTrend` is set to `false` if `trendValue` is `100`', () => {
    const vm = getInstance({
      trendValue: 100
    })
    expect(vm.showTrend).toBe(false)
  })

  test('`showTrend` is set to `true` if `occurrenceCount` and `pastValue` are different', () => {
    const vm = getInstance({
      occurrenceCount: 2,
      pastValue: 1
    })
    expect(vm.showTrend).toBe(true)
  })

  test('`showTrend` is set to `false` if no conditions are matched', () => {
    const vm = getInstance({
      occurrenceCount: 2,
      pastValue: 1,
      showComparisonStat: false
    })
    expect(vm.showTrend).toBe(false)
  })

  test('`isTrendPositive` is set to `true` if the `occurrenceCount` is less than `pastValue`', () => {
    const vm = getInstance({
      occurrenceCount: 1,
      pastValue: 2
    })
    expect(vm.isTrendPositive).toBe(true)
  })

  test('`trendValue` returns the change in trend percentage', () => {
    const vm = getInstance({
      occurrenceCount: 1,
      pastValue: 2
    })
    expect(vm.trendValue).toBe(50)
  })

  test('`trendValue` is set to `100` if `pastValue` is not a finite number', () => {
    const vm = getInstance({
      occurrenceCount: 1,
      pastValue: Infinity
    })
    expect(vm.trendValue).toBe(100)
  })

  test('`lastSeenDisplay` returns when the issue was seen the last time in a human-readable form', () => {
    const vm = getInstance({
      modifiedAt: '2020-03-09T17:21:41.965996+00:00'
    })
    expect(vm.lastSeenDisplay).toBe('2 years ago')
  })

  test('`firstSeenDisplay` returns when the issue was first seen in a human-readable form', () => {
    const vm = getInstance({
      createdAt: '2020-03-09T17:21:41.965990+00:00'
    })
    expect(vm.firstSeenDisplay).toBe('2 years old')
  })
})
