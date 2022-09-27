import { render } from '@testing-library/vue'
import { VueConstructor } from 'vue'
import { createLocalVue, RouterLinkStub, shallowMount } from '@vue/test-utils'

import VTooltip from 'v-tooltip'
import { DistributionStats } from '~/components/Reports'

import { cartesian, generateBooleanProps } from '~/test/utils'
import { mocksGenerator } from '~/test/mocks'

const props = {
  stats: [
    { slug: 'security', name: 'Security', value: 7 },
    { slug: 'antipattern', name: 'Anti-pattern', value: 2 },
    { slug: 'style', name: 'Style', value: 67 },
    { slug: 'doc', name: 'Documentation', value: 76 },
    { slug: 'bug-risk', name: 'Bug Risk', value: 4 }
  ]
}

const stubs = {
  DistributionStatCard: true
}

test('renders DistributionStats with and without loading state', () => {
  const loadingOptions = generateBooleanProps('loading')

  cartesian(loadingOptions).forEach((propCombination) => {
    const { html } = render(
      DistributionStats,
      {
        props: {
          ...props,
          ...propCombination
        },
        stubs,
        mocks: mocksGenerator()
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
  })
})
