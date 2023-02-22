import { render } from '@testing-library/vue'

import { InferredArtifact } from '~/components/Run'

test('renders InferredArtifact with all prop options', () => {
  const props = {
    vcsUrl: 'https://github.com/deepsourcelabs/bifrost/pull/32',
    number: 32
  }

  const { html } = render(InferredArtifact, {
    props,
    stubs: {
      ZIcon: true
    }
  })

  expect(html()).toMatchSnapshot(JSON.stringify(props))
})
