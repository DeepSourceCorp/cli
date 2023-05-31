import { render } from '@testing-library/vue'
import UpgradeToEnterprise from '~/components/Settings/Security/UpgradeToEnterprise.vue'

describe('[[ UpgradeToEnterprise ]]', () => {
  test('renders correctly with all props', () => {
    const { html } = render(UpgradeToEnterprise, {
      stubs: { ZButton: true }
    })

    expect(html()).toMatchSnapshot()
  })
})
