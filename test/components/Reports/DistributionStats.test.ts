import { render } from '@testing-library/vue'
import { DistributionStats } from '~/components/Reports'
import VTooltip from 'v-tooltip'
import { IssueDistributionT } from '~/types/reportTypes'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'
import generate from '@babel/generator'
import { mocksGenerator } from '~/test/mocks'

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

test('renders DistributionStats with all prop options', () => {
  const { html } = render(
    DistributionStats,
    {
      props,
      stubs: {
        ZIcon: true,
        StatCard: true
      }
    },
    (vue) => {
      vue.use(VTooltip)
    }
  )

  expect(html()).toMatchSnapshot(JSON.stringify(props))
})

test('renders DistributionStats with all links options', () => {
  const linkCards = generateBooleanProps('linkCards')
  const statType = generateStringProps('statType', [
    IssueDistributionT.ANALYZER,
    IssueDistributionT.CATEGORY
  ])

  cartesian(linkCards, statType).forEach((propCombination) => {
    const { html } = render(
      DistributionStats,
      {
        props: {
          ...props,
          ...propCombination
        },
        stubs: {
          ZIcon: true,
          StatCard: true
        },
        mocks: mocksGenerator()
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
  })
})
