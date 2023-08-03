import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import VTooltip from 'floating-vue'

import { AnalyzerHeader } from '~/components/Run'
import { cartesian, generateStringProps } from '~/test/utils'

interface IAnalyzerHeader {
  alertingMetricsMessage: string
  statusText: string
  statusDescription: string
  isPending: boolean
  showStatusText: boolean
}

describe('[[ AnalyzerHeader ]]', () => {
  const getInstance = (props = {}) => {
    const localVue = createLocalVue()
    localVue.use(VTooltip)

    const { vm } = shallowMount(AnalyzerHeader, {
      propsData: {
        title: 'Python',
        icon: 'python',
        status: 'FAIL',
        ...props
      },
      stubs: {
        ZIcon: true
      },
      localVue
    })
    return vm as unknown as IAnalyzerHeader
  }

  test('renders `AnalyzerHeader` with all prop options', () => {
    const baseProps = {
      title: 'Python',
      icon: 'python',
      finishedInDisplay: '41 seconds'
    }

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
        AnalyzerHeader,
        {
          props,
          stubs: {
            ZIcon: true
          }
        },
        (vue) => {
          vue.use(VTooltip)
        }
      )

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })

  test('`alertingMetricsMessage` returns an empty string if `alertingMetricsCount` is `0`', () => {
    const vm = getInstance()
    expect(vm.alertingMetricsMessage).toBe('')
  })

  test('`alertingMetricsMessage` returns an appropriate message if `alertingMetricsCount` is `1`', () => {
    const vm = getInstance({ alertingMetricsCount: 1 })
    expect(vm.alertingMetricsMessage).toBe('1 metric is critically alerting')
  })

  test('`alertingMetricsMessage` returns an appropriate message if `alertingMetricsCount` is greater than `1`', () => {
    const vm = getInstance({ alertingMetricsCount: 2 })
    expect(vm.alertingMetricsMessage).toBe('2 metrics are critically alerting')
  })

  test('`statusText` returns a text based on the `status`', () => {
    const vm = getInstance()
    expect(vm.statusText).toBe('Failed after')
  })

  test('`statusText` falls back to the text for `PASS` if `status` is falsy', () => {
    const vm = getInstance({ status: '' })
    expect(vm.statusText).toBe('Passed in')
  })

  test('`statusDescription` returns a description based on the `status`', () => {
    const vm = getInstance()
    expect(vm.statusDescription).toBe('Failing')
  })

  test('`statusDescription` falls back to the description for `PASS` if `status` is falsy', () => {
    const vm = getInstance({ status: '' })
    expect(vm.statusDescription).toBe('Passed')
  })

  test('`isPending` returns `true` if `status` is in pending state', () => {
    const vm = getInstance({ status: 'PEND' })
    expect(vm.isPending).toBe(true)
  })

  test('`showStatusText` returns `true` if both `statusText` and `finishedInDisplay` is available', () => {
    const vm = getInstance({ finishedInDisplay: '41 seconds' })
    expect(vm.showStatusText).toBe(true)
  })
})
