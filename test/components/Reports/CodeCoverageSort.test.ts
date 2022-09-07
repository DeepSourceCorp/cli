import { render } from '@testing-library/vue'
import { shallowMount } from '@vue/test-utils'
import { ZButton } from '@deepsourcelabs/zeal'

import { CodeCoverageSort } from '~/components/Reports'
import { FilterGeneric } from '~/components/Common'

import { cartesian, generateStringProps } from '~/test/utils'
import { CodeCoverageT, CoverageSortT } from '~/types/reportTypes'

interface CodeCoverageSortT extends Vue {
  newSortValue: (coverageType: string, coverageSortFilter: string) => string
  coverageSortFilter: string
  nextSort: string
}

describe('[[ CodeCoverageSort ]]', () => {
  test('renders CodeCoverageSort with all prop options', () => {
    const baseProps = {
      coverageFilters: {
        'lcv-asc': { label: 'LINE COVERAGE', icon: 'arrow-up', name: 'lcv-asc' },
        'lcv-desc': { label: 'LINE COVERAGE', icon: 'arrow-down', name: 'lcv-desc' }
      },
      coverageType: 'lcv',
      defaultLabel: 'Line Coverage',
      selectedCoverageSortFilter: ''
    }
    const sortOptions = generateStringProps(
      'selectedCoverageSortFilter',
      ['', CoverageSortT.LCV_DESCENDING, CoverageSortT.LCV_ASCENDING],
      false
    )

    cartesian(sortOptions).forEach((propCombination) => {
      const props = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(CodeCoverageSort, {
        props,
        stubs: {
          ZIcon: true,
          ZButton: true,
          FilterGeneric
        }
      })

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })

  test('CodeCoverageSort methods', () => {
    // Mounting with default selectedCoverageSortFilter (i.e. '')
    const wrapper = shallowMount(CodeCoverageSort, {
      stubs: {
        ZIcon: true,
        ZButton,
        FilterGeneric
      },
      propsData: {
        coverageFilters: {
          'lcv-asc': { label: 'LINE COVERAGE', icon: 'arrow-up', name: 'lcv-asc' },
          'lcv-desc': { label: 'LINE COVERAGE', icon: 'arrow-down', name: 'lcv-desc' }
        },
        coverageType: 'lcv',
        defaultLabel: 'Line Coverage'
      }
    })

    const vm = wrapper.vm as CodeCoverageSortT

    // Test LCV
    expect(vm.newSortValue(CodeCoverageT.LCV, CoverageSortT.LCV_ASCENDING)).toBe(
      CoverageSortT.LCV_DESCENDING
    )
    expect(vm.newSortValue(CodeCoverageT.LCV, CoverageSortT.LCV_DESCENDING)).toBe('')
    expect(vm.newSortValue(CodeCoverageT.LCV, '')).toBe(CoverageSortT.LCV_ASCENDING)

    // Test BCV
    expect(vm.newSortValue(CodeCoverageT.BCV, CoverageSortT.BCV_ASCENDING)).toBe(
      CoverageSortT.BCV_DESCENDING
    )
    expect(vm.newSortValue(CodeCoverageT.BCV, CoverageSortT.BCV_DESCENDING)).toBe('')
    expect(vm.newSortValue(CodeCoverageT.BCV, '')).toBe(CoverageSortT.BCV_ASCENDING)

    // Test invalid coverageType
    expect(vm.newSortValue('random-stuff', CoverageSortT.BCV_ASCENDING)).toBe('')
  })

  test('CodeCoverageSort getters', () => {
    // Mounting with default selectedCoverageSortFilter (i.e. '')
    const wrapper = shallowMount(CodeCoverageSort, {
      stubs: {
        ZIcon: true,
        ZButton,
        FilterGeneric
      },
      propsData: {
        coverageFilters: {
          'lcv-asc': { label: 'LINE COVERAGE', icon: 'arrow-up', name: 'lcv-asc' },
          'lcv-desc': { label: 'LINE COVERAGE', icon: 'arrow-down', name: 'lcv-desc' }
        },
        coverageType: 'lcv',
        defaultLabel: 'Line Coverage'
      }
    })

    const vm = wrapper.vm as CodeCoverageSortT

    expect(vm.nextSort).toBe(CoverageSortT.LCV_ASCENDING)
  })
})
