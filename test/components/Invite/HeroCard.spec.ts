import { render } from '@testing-library/vue'

import { HeroCard } from '~/components/Invite'
import { cartesian, generateBooleanProps } from '~/test/utils'

describe('[[ HeroCard ]]', () => {
  test('renders `HeroCard` with all prop combinations', () => {
    const showBackgroundOptions = generateBooleanProps('showBackground', false)
    const showBorderOptions = generateBooleanProps('showBorder', false)
    const showGlowOptions = generateBooleanProps('showGlow', false)

    cartesian(showBackgroundOptions, showBorderOptions, showGlowOptions).forEach(
      (propCombination) => {
        const { html } = render(HeroCard, {
          propsData: propCombination
        })

        expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
      }
    )
  })
})
