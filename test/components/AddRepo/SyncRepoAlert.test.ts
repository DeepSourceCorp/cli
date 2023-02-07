import { render } from '@testing-library/vue'
import { SyncRepoAlert } from '~/components/AddRepo'

import { cartesian, generateStringProps, generateBooleanProps } from '~/test/utils'

test('renders SyncRepoAlert with all props', () => {
  const initialRepoNameOpts = generateStringProps('initialRepoName', ['sample-repo'], false)
  const errorMessageOpts = generateStringProps('errorMessage', ['Sample error message.'], false)
  const loadingOpts = generateBooleanProps('loading', false)

  cartesian(initialRepoNameOpts, loadingOpts, errorMessageOpts).forEach((propCombination) => {
    const { html } = render(SyncRepoAlert, {
      props: propCombination,
      stubs: {
        ZAlert: true,
        ZInput: true,
        ZIcon: true
      }
    })

    expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
  })
})
