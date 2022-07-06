import { render } from '@testing-library/vue'
import { TrendStat } from '~/components/Metrics'
import { RouterLinkStub } from '@vue/test-utils'
import { VTooltip } from 'v-tooltip'
import { VueConstructor } from 'vue'
import { cartesian, generateStringProps } from '~/test/utils'
import { StatType } from '~/types/metric'

const injectDirective = (vue: VueConstructor) => vue.directive('tooltip', VTooltip)

test('renders TrendStat with all prop options', () => {
  const baseProps = {
    metric: {
      name: 'Around the world',
      value: 360
    }
  }

  const typeProp = generateStringProps('type', [StatType.metric, StatType.threshold], false)

  cartesian(typeProp).forEach((propCombination) => {
    const props = {
      ...baseProps,
      ...propCombination
    }

    const { html } = render(
      TrendStat,
      {
        props,
        stubs: {
          NuxtLink: RouterLinkStub
        }
      },
      injectDirective
    )

    expect(html()).toMatchSnapshot(JSON.stringify(props))
  })
})
