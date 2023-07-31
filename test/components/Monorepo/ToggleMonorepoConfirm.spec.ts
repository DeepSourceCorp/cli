import { render } from '@testing-library/vue'

import ToggleMonorepoConfirm from '~/components/Monorepo/ToggleMonorepoConfirm.vue'
import { cartesian, generateBooleanProps } from '~/test/utils'

describe('[[ ToggleMonorepoConfirm ]]', () => {
  const baseProps = {
    teamName: 'test-org',
    repoName: 'test-repo'
  }

  const stubs = {
    ZButton: true,
    ZIcon: true,
    ZInput: true,
    ZModal: true
  }

  test('renders various states of the toggle monorepo confirm modal', () => {
    const isMonorepoOptions = generateBooleanProps('isMonorepo', false)
    const togglingMonorepoModeOptions = generateBooleanProps('togglingMonorepoMode', false)

    cartesian(isMonorepoOptions, togglingMonorepoModeOptions).forEach((propCombination) => {
      const propsData = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(ToggleMonorepoConfirm, {
        propsData,
        stubs
      })
      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })
})
