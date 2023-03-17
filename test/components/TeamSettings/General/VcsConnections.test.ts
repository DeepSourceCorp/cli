import { render } from '@testing-library/vue'

import { VcsConnections } from '~/components/TeamSettings/General'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'

test('renders VcsConnections with all prop options', () => {
  const baseProps = {
    vcsInstallationUrl:
      'https://github.com/organizations/deepsourcelabs/settings/installations/7054915',
    vcsProviderDisplay: 'GitHub',
    vcsProviderIcon: 'github',
    teamName: 'deepsourcelabs'
  }

  const autofixAvailableOptions = generateBooleanProps('autofixAvailable')
  const autofixEnabledOptions = generateBooleanProps('autofixEnabled')
  const autofixInstallationUrlOptions = generateStringProps('autofixInstallationUrl', [
    'https://github.com/apps/None/installations/new/permissions?target_id=40287229&state=Ymlmcm9zdA=='
  ])

  cartesian(autofixAvailableOptions, autofixEnabledOptions, autofixInstallationUrlOptions).forEach(
    (propCombination) => {
      const propsData = { ...baseProps, ...propCombination }
      const { html } = render(VcsConnections, {
        propsData,
        stubs: {
          ZIcon: true
        }
      })

      expect(html()).toMatchSnapshot(JSON.stringify(propsData))
    }
  )
})
