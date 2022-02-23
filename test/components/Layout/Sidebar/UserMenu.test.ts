import '@testing-library/jest-dom'
import { createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import UserMenu from '~/components/Layout/Sidebar/UserMenu.vue'
import VTooltip from 'v-tooltip'
import { cartesian, generateBooleanProps } from '~/test/utils'

describe('[[ UserMenu ]]', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(VTooltip)

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
      ZMenuItem: true,
      ZMenuSection: true,
      ZAvatar: true
    }

    const collapsedOptions = generateBooleanProps('isCollapsed')

    cartesian(collapsedOptions).forEach((props) => {
      const wrapper = mount(UserMenu, {
        store,
        mocks,
        propsData: props,
        stubs,
        localVue
      })
      expect(wrapper.html()).toMatchSnapshot(JSON.stringify(props))
    })
  })
})
