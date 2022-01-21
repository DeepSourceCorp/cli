import { render } from '@testing-library/vue'
import { StatCard } from '~/components/Metrics'
import { RouterLinkStub } from '@vue/test-utils'
import { VTooltip } from 'v-tooltip'
import { VueConstructor } from 'vue'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'

const injectDirective = (vue: VueConstructor) => vue.directive('tooltip', VTooltip)

test('renders StatCard with all prop options', () => {
  const baseProps = {
    icon: 'python',
    value: '2000',
    title: 'Application documentation coverage',
    trendValue: 300,
    trendIcon: 'threshold',
    subtitle: 'hello-world'
  }

  const trendDirectionOptions = generateStringProps('trendDirection', ['up', 'down'], false)
  const trendPositiveOptions = generateBooleanProps('trendPositive', false)
  const removeStylesOptions = generateBooleanProps('removeStyles', false)
  const hintAsTooltipOptions = generateBooleanProps('hintAsTooltip', false)
  const withTransitionOptions = generateBooleanProps('withTransition')
  const toOptions = generateStringProps('to', ['/something/to/route/to'], false)

  cartesian(
    trendDirectionOptions,
    trendPositiveOptions,
    removeStylesOptions,
    hintAsTooltipOptions,
    withTransitionOptions,
    toOptions
  ).forEach((propCombination) => {
    const props = {
      ...baseProps,
      ...propCombination
    }

    const { html } = render(
      StatCard,
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
