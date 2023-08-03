import { render } from '@testing-library/vue'
import { TrendStat } from '~/components/Metrics'
import { RouterLinkStub } from '@vue/test-utils'
import { VTooltip } from 'floating-vue'
import { VueConstructor } from 'vue'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'
import { StatType } from '~/types/metric'

const injectDirective = (vue: VueConstructor) => vue.directive('tooltip', VTooltip)

test('renders TrendStat with all prop options', () => {
  const baseMetricProps = {
    name: 'Around the world',
    value: 360,
    shortcode: 'DftPnk'
  }

  const typeProp = generateStringProps('type', [StatType.metric, StatType.threshold], false)
  const unitProp = generateStringProps('unit', ['%', ''], true)
  const canModifyThresholdProp = generateBooleanProps('canModifyThreshold', true)

  cartesian(typeProp, unitProp, canModifyThresholdProp).forEach((propCombination) => {
    const props = {
      metric: { ...baseMetricProps, unit: propCombination.unit },
      canModifyThresholdProp: propCombination.canModifyThresholdProp,
      type: propCombination.type
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
