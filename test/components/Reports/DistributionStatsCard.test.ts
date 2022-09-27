import { render } from '@testing-library/vue'
import { VueConstructor } from 'vue'
import { createLocalVue, RouterLinkStub, shallowMount } from '@vue/test-utils'

import VTooltip from 'v-tooltip'
import { DistributionStatCard } from '~/components/Reports'

import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'
import { mocksGenerator } from '~/test/mocks'

import { IssueDistributionT } from '~/types/reportTypes'

interface DistributionStatsT extends Vue {
  statType: IssueDistributionT
  generateAnalyzerLink: (slug?: string) => string
  generateCategoryLink: (slug?: string) => string
  cardLink: string | undefined
}

describe('[[ DistributionStatCard ]]', () => {
  let localVue: VueConstructor<Vue>

  const props = {
    slug: 'security',
    name: 'Security',
    value: 7
  }

  const stubs = {
    ZIcon: true,
    NuxtLink: RouterLinkStub
  }

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(VTooltip)
  })

  test('renders DistributionStatCard with all prop options', () => {
    const linkCards = generateBooleanProps('linkCards')
    const statType = generateStringProps('statType', [
      IssueDistributionT.ANALYZER,
      IssueDistributionT.CATEGORY
    ])
    const logoUrl = generateStringProps('logoUrl', ['sample-url'])

    cartesian(linkCards, statType, logoUrl).forEach((propCombination) => {
      const { html } = render(DistributionStatCard, {
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

  describe('[[ DistributionStatCard methods ]]', () => {
    test('Test for category link', () => {
      // Testing with statType as category

      const categoryProps = {
        slug: 'security',
        name: 'Security',
        value: 7,
        statType: IssueDistributionT.CATEGORY,
        linkCards: true
      }

      const wrapper = shallowMount(DistributionStatCard, {
        stubs,
        propsData: categoryProps,
        mocks: mocksGenerator(),
        localVue
      })

      const vm = wrapper.vm as DistributionStatsT

      const { slug: categorySlug } = props
      const validLinkWithSlug = `/gh/deepsourcelabs/bifrost/issues?category=${categorySlug}`
      const validLinkWithoutSlug = `/gh/deepsourcelabs/bifrost/issues`

      // Test generateCategoryLink returns correct values
      expect(vm.generateCategoryLink(categorySlug)).toBe(validLinkWithSlug)
      expect(vm.generateCategoryLink()).toBe(validLinkWithoutSlug)

      // Test if cardLink getter returns right link
      expect(vm.cardLink).toBe(validLinkWithSlug)
    })

    test('Test for analyzer link', () => {
      // Testing with statType as analyzer

      const analyzerProps = {
        slug: 'docker',
        name: 'Dockerfile',
        value: 19,
        statType: IssueDistributionT.ANALYZER,
        linkCards: true
      }

      const wrapper = shallowMount(DistributionStatCard, {
        stubs,
        propsData: analyzerProps,
        mocks: mocksGenerator(),
        localVue
      })

      const vm = wrapper.vm as DistributionStatsT

      const { slug: analyzerSlug } = analyzerProps
      const validLinkWithSlug = `/gh/deepsourcelabs/bifrost/issues?category=all&analyzer=${analyzerSlug}`
      const validLinkWithoutSlug = `/gh/deepsourcelabs/bifrost/issues?category=all`

      // Test generateAnalyzerLink returns correct values
      expect(vm.generateAnalyzerLink(analyzerSlug)).toBe(validLinkWithSlug)
      expect(vm.generateAnalyzerLink()).toBe(validLinkWithoutSlug)

      // Test if cardLink getter returns right link
      expect(vm.cardLink).toBe(validLinkWithSlug)
    })
  })
})
