import Vuex from 'vuex'
import UserProfile from '~/components/Settings/UserProfile.vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'

describe('[[ UserProfile ]]', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)

  test('renders UserProfile from viewer', () => {
    const store = new Vuex.Store({
      modules: {
        'user/active': {
          namespaced: true,
          state: {
            viewer: {
              id: 'VXNlcjp4emR3bmI=',
              fullName: 'Rohan Chaturvedi',
              firstName: 'Rohan',
              lastName: 'Chaturvedi',
              email: 'rohan@deepsource.io',
              avatar: '/static/dashboard/images/empty-avatar.svg'
            }
          }
        }
      }
    })

    const mocks = {
      viewer: {},
      $config: { restClientUri: '' }
    }

    const stubs = {
      ZAvatar: true,
      ZButton: true,
      ZIcon: true,
      ZInput: true
    }

    const wrapper = shallowMount(UserProfile, {
      store,
      stubs,
      mocks,
      localVue,
      data() {
        return {
          newAvatar: {
            url: ''
          }
        }
      }
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
