import TeamLabel from '~/components/Settings/TeamLabel.vue'
import { render } from '@testing-library/vue'

describe('[[ TeamLabel ]]', () => {
  test('renders TeamLabel with all props', () => {
    const { html } = render(TeamLabel, {
      props: {
        login: 'deepsourcelabs',
        vcsProvider: 'GH'
      }
    })

    expect(html()).toMatchSnapshot()
  })
})
