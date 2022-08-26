import { render } from '@testing-library/vue'
import { VueConstructor } from 'vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import VTooltip from 'v-tooltip'
import { DistributionStats } from '~/components/Reports'

import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'
import { mocksGenerator } from '~/test/mocks'

import { IssueDistributionT } from '~/types/reportTypes'
import { IssueDistribution } from '~/types/types'

interface DistributionStatsT extends Vue {
  statType: IssueDistributionT
  generateAnalyzerLink: (stat: IssueDistribution) => string
  generateCategoryLink: (stat: IssueDistribution) => string
  generateLink: (stat: IssueDistribution) => string
}

describe('[[ DistributionStats ]]', () => {
  let localVue: VueConstructor<Vue>

  const props = {
    currentVal: 1,
    stats: [
      { slug: 'security', name: 'Security', value: 7 },
      { slug: 'antipattern', name: 'Anti-pattern', value: 2 },
      { slug: 'style', name: 'Style', value: 67 },
      { slug: 'doc', name: 'Documentation', value: 76 },
      { slug: 'bug-risk', name: 'Bug Risk', value: 4 }
    ]
  }

  const stubs = {
    ZIcon: true,
    StatCard: true
  }

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(VTooltip)
  })

  test('renders DistributionStats with all prop options', () => {
    const { html } = render(DistributionStats, {
      props,
      stubs,
      localVue
    })

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })

  test('renders DistributionStats with all links options', () => {
    const linkCards = generateBooleanProps('linkCards')
    const statType = generateStringProps('statType', [
      IssueDistributionT.ANALYZER,
      IssueDistributionT.CATEGORY
    ])

    cartesian(linkCards, statType).forEach((propCombination) => {
      const { html } = render(DistributionStats, {
        props: {
          ...props,
          ...propCombination
        },
        stubs,
        mocks: mocksGenerator(),
        localVue
      })

      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })

  describe('[[ DistributionStats methods ]]', () => {
    test('Test generateCategoryLink', () => {
      // Testing with statType as category
      const wrapper = shallowMount(DistributionStats, {
        stubs,
        propsData: { ...props, linkCards: true, statType: IssueDistributionT.CATEGORY },
        mocks: mocksGenerator(),
        localVue
      })

      const vm = wrapper.vm as DistributionStatsT

      const categorySlug = 'security'
      const categoryStat: IssueDistribution = { slug: categorySlug, name: 'Security', value: 7 }

      const categoryStatlink = vm.generateLink(categoryStat)
      expect(categoryStatlink).toBe(`/gh/deepsourcelabs/bifrost/issues?category=${categorySlug}`)
    })

    test('Test generateAnalyzerLink', () => {
      // Testing with statType as category
      const wrapper = shallowMount(DistributionStats, {
        stubs,
        propsData: { ...props, linkCards: true, statType: IssueDistributionT.ANALYZER },
        mocks: mocksGenerator(),
        localVue
      })

      const vm = wrapper.vm as DistributionStatsT

      const analyzerSlug = 'python'
      const analyzerStat: IssueDistribution = { slug: analyzerSlug, name: 'Python', value: 156 }

      const analyzerStatLink = vm.generateLink(analyzerStat)
      expect(analyzerStatLink).toBe(
        `/gh/deepsourcelabs/bifrost/issues?category=all&analyzer=${analyzerSlug}`
      )
    })
  })
})
