import { render } from '@testing-library/vue'

import EnterpriseInstallationLogo from '~/components/Common/EnterpriseInstallationLogo.vue'
import { cartesian, generateStringProps } from '~/test/utils'

describe('[[ EnterpriseInstallationLogo ]]', () => {
  test('renders EnterpriseInstallationLogo with all props', () => {
    const installationLogoOptions = generateStringProps('installationLogo', [
      'https://local-asgard-static.s3.us-east-1.amazonaws.com/dashboard/images/empty-avatar.svg',
      ''
    ])

    cartesian(installationLogoOptions).forEach((propCombination) => {
      const props = {
        ...propCombination
      }

      const { html } = render(EnterpriseInstallationLogo, {
        props,
        stubs: {
          ZIcon: true
        }
      })
      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })
})
