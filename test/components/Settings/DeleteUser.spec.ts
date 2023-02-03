import DeleteUser from '~/components/Settings/DeleteUser.vue'
import Vuex from 'vuex'
import { createLocalVue, shallowMount } from '@vue/test-utils'

describe('[[ DeleteUser ]]', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)

  const stubs = {
    portal: true,
    ZIcon: true,
    ZTag: true,
    ZAccordion: true,
    ZAccordionItem: true,
    ZButton: true,
    ZModal: true,
    ZAlert: true,
    ZInput: true
  }

  test('renders DeleteUser for no team ownerships', () => {
    const store = new Vuex.Store({
      modules: {
        'user/active': {
          namespaced: true,
          state: {
            viewer: {
              email: 'rohan@deepsource.io',
              teamAccounts: {}
            }
          }
        }
      }
    })

    const wrapper = shallowMount(DeleteUser, {
      store,
      stubs,
      localVue
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  test('renders DeleteUser for single team ownership', () => {
    const store = new Vuex.Store({
      modules: {
        'user/active': {
          namespaced: true,
          state: {
            viewer: {
              email: 'rohan@deepsource.io',
              teamAccounts: {
                edges: [
                  {
                    node: {
                      login: 'deepsourcelabs',
                      vcsProvider: 'GH',
                      isTeam: true
                    }
                  }
                ]
              }
            }
          }
        }
      }
    })

    const wrapper = shallowMount(DeleteUser, {
      store,
      stubs,
      localVue
    })
    expect(wrapper.html()).toMatchSnapshot()
  })

  test('renders DeleteUser for multiple team ownerships', () => {
    const store = new Vuex.Store({
      modules: {
        'user/active': {
          namespaced: true,
          state: {
            viewer: {
              email: 'rohan@deepsource.io',
              teamAccounts: {
                edges: [
                  {
                    node: {
                      login: 'deepsourcelabs',
                      vcsProvider: 'GH',
                      isTeam: true
                    }
                  },
                  {
                    node: {
                      login: 'deepsourcelabs2',
                      vcsProvider: 'GH',
                      isTeam: true
                    }
                  }
                ]
              }
            }
          }
        }
      }
    })

    const wrapper = shallowMount(DeleteUser, {
      store,
      stubs,
      localVue
    })
    expect(wrapper.html()).toMatchSnapshot()
  })
})
