import { render } from '@testing-library/vue'

import PilotEvaluationAgreement from '~/components/Content/PilotEvaluationAgreement.vue'

describe('[[ PilotEvaluationAgreement ]]', () => {
  const stubs = {
    NuxtContent: true
  }
  it('renders the content supplied', () => {
    const content =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'

    const { html } = render(PilotEvaluationAgreement, {
      propsData: { content },
      stubs
    })
    expect(html()).toMatchSnapshot()
  })
})
