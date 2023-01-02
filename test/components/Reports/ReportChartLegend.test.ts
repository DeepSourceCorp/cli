import { render } from '@testing-library/vue'
import { ZMenu } from '@deepsource/zeal'

import { ReportChartLegend } from '~/components/Reports'
import { shallowMount } from '@vue/test-utils'

interface ReportChartLegendT extends Vue {
  datasetNameFormatter: (name: string) => string
}

const stubs = {
  ZIcon: true,
  ZMenu
}

test('renders ReportChartLegend with others dataset', () => {
  const props = {
    datasets: [
      {
        name: 'doc',
        chartType: 'bar',
        values: [9, 18, 17, 0, 0, 0, 0, 0],
        bgColor: 'bg-juniper-600'
      },
      {
        name: 'security',
        chartType: 'bar',
        values: [18, 19, 5, 0, 0, 0, 0, 0],
        bgColor: 'bg-juniper-500'
      },
      {
        name: 'bug-risk',
        chartType: 'bar',
        values: [11, 19, 10, 0, 0, 0, 0, 0],
        bgColor: 'bg-juniper-300'
      },
      {
        name: 'others',
        chartType: 'bar',
        values: [62, 51, 45, 0, 0, 0, 0, 0],
        bgColor: 'bg-juniper-100'
      }
    ],
    othersDatasetNames: ['antipattern', 'coverage', 'performance', 'style', 'typecheck']
  }

  const { html } = render(ReportChartLegend, {
    props,
    stubs
  })

  expect(html()).toMatchSnapshot(JSON.stringify(props))
})

test('renders ReportChartLegend without others dataset', () => {
  const props = {
    datasets: [
      {
        name: 'doc',
        chartType: 'bar',
        values: [9, 18, 17, 0, 0, 0, 0, 0],
        bgColor: 'bg-juniper-600'
      },
      {
        name: 'security',
        chartType: 'bar',
        values: [18, 19, 5, 0, 0, 0, 0, 0],
        bgColor: 'bg-juniper-500'
      },
      {
        name: 'bug-risk',
        chartType: 'bar',
        values: [11, 19, 10, 0, 0, 0, 0, 0],
        bgColor: 'bg-juniper-300'
      }
    ]
  }

  const { html } = render(ReportChartLegend, {
    props
  })

  expect(html()).toMatchSnapshot(JSON.stringify(props))
})

test('ReportChartLegend methods', () => {
  const props = {
    datasets: [
      {
        name: 'doc',
        chartType: 'bar',
        values: [9, 18, 17, 0, 0, 0, 0, 0],
        bgColor: 'bg-juniper-600'
      },
      {
        name: 'security',
        chartType: 'bar',
        values: [18, 19, 5, 0, 0, 0, 0, 0],
        bgColor: 'bg-juniper-500'
      },
      {
        name: 'bug-risk',
        chartType: 'bar',
        values: [11, 19, 10, 0, 0, 0, 0, 0],
        bgColor: 'bg-juniper-300'
      },
      {
        name: 'others',
        chartType: 'bar',
        values: [62, 51, 45, 0, 0, 0, 0, 0],
        bgColor: 'bg-juniper-100'
      }
    ],
    othersDatasetNames: ['antipattern', 'coverage', 'performance', 'style', 'typecheck']
  }

  const wrapper = shallowMount(ReportChartLegend, {
    propsData: props,
    stubs
  })

  const vm = wrapper.vm as ReportChartLegendT

  expect(vm.datasetNameFormatter('antipattern')).toBe('Anti-pattern')
  expect(vm.datasetNameFormatter('typecheck')).toBe('Type check')
  expect(vm.datasetNameFormatter('python')).toBe('Python')
})
