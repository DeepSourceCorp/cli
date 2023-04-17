import { render } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'

import UpgradeFeature from '~/components/Common/UpgradeFeature.vue'
import { FeatureType } from '~/types/features'

describe('[[ UpgradeFeature ]]', () => {
  const mocks = {
    $generateRoute: () => '/gh/deepsourcelabs/settings/billing'
  }

  const propsData = {
    featureShortcode: FeatureType.AUDIT_LOG
  }

  const stubs = {
    NuxtLink: RouterLinkStub,
    ZButton: true
  }

  it('renders a section asking to upgrade to the required plan with a CTA pointing to the billing page', () => {
    const { html } = render(UpgradeFeature, { mocks, propsData, stubs })

    expect(html()).toMatchSnapshot()
  })
})
