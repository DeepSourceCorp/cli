import { render } from '@testing-library/vue'
import { createLocalVue } from '@vue/test-utils'
import { dashboardContextGenerator, mocksGenerator, storeModulesGenerator } from '~/test/mocks'
import { RouterLinkStub } from '@vue/test-utils'

import VTooltip from 'v-tooltip'
import { VueConstructor } from 'vue'
import Vuex from 'vuex'

import DashboardHeader from '~/components/Layout/DashboardHeader.vue'

describe('[[ DashboardHeader ]]', () => {
  let localVue: VueConstructor<Vue>
  let storeMock: Record<string, unknown>

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    localVue.use(VTooltip)

    storeMock = {
      modules: storeModulesGenerator()
    }
  })

  const stubs = {
    ZAvatar: true,
    ZAvatarGroup: true,
    ZIcon: true,
    ZTag: true,
    NuxtLink: RouterLinkStub,
    InviteMembersModal: true
  }

  test('renders DashboardHeader', () => {
    const { html } = render(
      DashboardHeader,
      {
        mocks: mocksGenerator(),
        stubs,
        store: new Vuex.Store(storeMock)
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot()
  })

  test('renders DashboardHeader on Prem', () => {
    const { html } = render(
      DashboardHeader,
      {
        mocks: mocksGenerator({
          $config: { onPrem: true }
        }),
        stubs,
        store: new Vuex.Store(storeMock)
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot()
  })

  test('renders DashboardHeader with paid plan', () => {
    const { html } = render(
      DashboardHeader,
      {
        mocks: mocksGenerator(),
        stubs,
        store: new Vuex.Store({
          modules: storeModulesGenerator({
            'user/active': {
              namespaced: true,
              state: {
                viewer: {
                  dashboardContext: [
                    dashboardContextGenerator({
                      subscribed_plan_info: {
                        name: 'Business',
                        slug: 'business'
                      }
                    })
                  ]
                }
              }
            }
          })
        })
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot()
  })

  test('renders DashboardHeader with paid plan but no perms', () => {
    const { html } = render(
      DashboardHeader,
      {
        mocks: mocksGenerator({
          $route: {
            name: 'provider-owner-repo',
            params: {
              provider: 'gh',
              owner: 'not-deepsourcelabs',
              repo: 'bifrost'
            }
          }
        }),
        stubs,
        store: new Vuex.Store({
          modules: storeModulesGenerator({
            'user/active': {
              namespaced: true,
              state: {
                viewer: {
                  dashboardContext: [
                    dashboardContextGenerator({
                      subscribed_plan_info: {
                        name: 'Business',
                        slug: 'business'
                      }
                    })
                  ]
                }
              }
            }
          })
        })
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot()
  })

  test('renders DashboardHeader with different vcs', () => {
    const { html } = render(
      DashboardHeader,
      {
        mocks: mocksGenerator(),
        stubs,
        store: new Vuex.Store({
          modules: storeModulesGenerator({
            'user/active': {
              namespaced: true,
              state: {
                viewer: {
                  dashboardContext: [
                    dashboardContextGenerator({
                      vcs_provider_display: 'github-enterprise'
                    })
                  ]
                }
              }
            }
          })
        })
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot()
  })
})
