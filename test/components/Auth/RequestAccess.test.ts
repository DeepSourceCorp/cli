import { render } from '@testing-library/vue'

import RequestAccess from '~/components/Auth/RequestAccess.vue'

describe('[[ RequestAccess ]]', () => {
  const stubs = {
    EnterpriseInstallationLogo: true,
    ZAvatar: true,
    ZIcon: true
  }

  const props = {
    totalSuperuserCount: 2,
    superuserList: [
      {
        id: 'VXNlcjp5enlsdmI=',
        fullName: 'Sourya Vatsyayan',
        email: 'sourya@deepsource.io',
        avatar:
          'https://local-asgard-static.s3.us-east-1.amazonaws.com/dashboard/images/empty-avatar.svg'
      },
      {
        id: 'VXNlcjpkYm1sYXo=',
        fullName: 'Aseem Manna',
        email: 'aseem@deepsource.io',
        avatar:
          'https://local-asgard-static.s3.us-east-1.amazonaws.com/dashboard/images/empty-avatar.svg'
      }
    ]
  }

  it('renders request access component', () => {
    const { html } = render(RequestAccess, {
      stubs,
      props
    })

    expect(html()).toMatchSnapshot()
  })
})
