import { render } from '@testing-library/vue'
import AccountCard from '~/components/Settings/AccountCard.vue'

describe('[[ AccountCard ]]', () => {
  const baseProps = {
    avatar: '/static/dashboard/images/empty-avatar.svg',
    login: 'deepsourcelabs',
    numMembersTotal: 5,
    activeRepositoryCount: 10,
    vcsProvider: 'gh'
  }

  const stubs = {
    ZAvatar: true,
    ZIcon: true,
    ZTag: true
  }

  const mocks = {
    $providerMetaMap: {
      gh: {
        text: 'Github',
        shortcode: 'gh',
        value: 'GITHUB'
      }
    }
  }

  test('renders AccountCard for Admins', () => {
    const { html } = render(AccountCard, {
      props: {
        ...baseProps,
        ...{
          roleInGroup: 'ADMIN',
          isViewerPrimaryUser: false
        }
      },
      stubs,
      mocks
    })

    expect(html()).toMatchSnapshot()
  })

  test('renders AccountCard for Owners', () => {
    const { html } = render(AccountCard, {
      props: {
        ...baseProps,
        ...{
          roleInGroup: 'ADMIN',
          isViewerPrimaryUser: true
        }
      },
      stubs,
      mocks
    })

    expect(html()).toMatchSnapshot()
  })

  test('renders AccountCard for Contributors', () => {
    const { html } = render(AccountCard, {
      props: {
        ...baseProps,
        ...{
          roleInGroup: 'CONTRIBUTOR',
          isViewerPrimaryUser: false
        }
      },
      stubs,
      mocks
    })

    expect(html()).toMatchSnapshot()
  })
})
