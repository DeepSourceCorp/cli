import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import UserMenu from '~/components/Layout/Sidebar/UserMenu.vue'
import { cartesian, generateBooleanProps } from '~/test/utils'

describe('[[ UserMenu ]]', () => {
  beforeEach(() => {
    const localVue = createLocalVue()
    localVue.use(Vuex)
  })

  test('renders UserMenu with all props', () => {
    const mocks = {
      $route: {
        query: ''
      },
      viewer: {},
      $config: { onPrem: false },
      async $fetchGraphqlData() {}
    }

    const store = new Vuex.Store({
      modules: {
        'user/active': {
          namespaced: true,
          state: {
            viewer: {
              id: 'VXNlcjp4emR3bmI=',
              fullName: 'Test Mishra',
              firstName: 'Test',
              lastName: 'Mishra',
              email: 'test@deepsource.io',
              avatar: '/static/dashboard/images/empty-avatar.svg'
            }
          }
        }
      }
    })

    const stubs = {
      ZMenu: true,
      ZMenuItem: true,
      ZMenuSection: true,
      ZAvatar: true
    }

    const collapsedOptions = generateBooleanProps('isCollapsed')

    cartesian(collapsedOptions).forEach((props) => {
      const { html } = render(UserMenu, { props, mocks, store, stubs })
      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })
})
