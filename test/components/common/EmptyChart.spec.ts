import { render } from '@testing-library/vue'
import { shallowMount } from '@vue/test-utils'

import EmptyChart from '~/components/Common/EmptyChart.vue'

import Vue from 'vue'
import { Dataset } from '~/types/reportTypes'

interface EmptyChartT extends Vue {
  mockLabels: string[]
  colors: string[]
  chartData: Dataset[]
}

const stubs = { ZChart: true }

test('renders EmptyChart without any props', () => {
  const { html } = render(EmptyChart, { stubs })

  expect(html()).toMatchSnapshot('default render')
})

test('renders EmptyChart with stacked bars', () => {
  const { html } = render(EmptyChart, {
    stubs,
    props: { chartType: 'bar', stacked: true }
  })

  expect(html()).toMatchSnapshot('default render')
})

test('EmptyChart computed properties', () => {
  const propsData = { chartType: 'bar', stacked: true, length: 12, count: 5 }
  const wrapper = shallowMount(EmptyChart, {
    stubs,
    propsData
  })

  const vm = wrapper.vm as EmptyChartT
  const hexCodePattern = new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')

  expect(vm.mockLabels.length).toEqual(propsData.length)

  expect(vm.colors.length).toEqual(propsData.count)

  vm.colors.forEach((hex) => {
    expect(hexCodePattern.test(hex)).toBeTruthy()
  })

  expect(vm.chartData.length).toEqual(propsData.count)

  vm.chartData.forEach((data) => {
    expect(data.values.length).toEqual(propsData.length)
    expect(data.chartType).toEqual(propsData.chartType)
  })
})
