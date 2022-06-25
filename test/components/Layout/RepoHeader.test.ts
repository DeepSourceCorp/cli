import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import RepoHeader from '~/components/Layout/RepoHeader.vue'

import { createLocalVue, RouterLinkStub, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'
import { VueConstructor } from 'vue'
import { VcsProviderChoices } from '~/types/types'
import { mocksGenerator, storeModulesGenerator, dashboardContextGenerator } from '~/test/mocks'

import VTooltip from 'v-tooltip'

const mocks = mocksGenerator({
  fetchRepoPerms: jest.fn(),
  fetchBasicRepoDetails: jest.fn(),
  fetchRepoRunCount: jest.fn()
})

interface RepoHeaderInterface extends Vue {
  fetchBasicRepoDetails: ReturnType<typeof jest.fn>
  updateRepositoryInStore: ReturnType<typeof jest.fn>
  updateStarredRepo: ReturnType<typeof jest.fn>
  refetchOnSocketEvent: () => void
  toggleStar: () => Promise<void>
  canChangeBranch: boolean
}

const stubs = {
  NuxtLink: RouterLinkStub,
  RepoHeaderInfo: true,
  ZLabel: true,
  ZButton: true,
  ZTab: true,
  ZTag: true,
  ZIcon: true
}

describe('[[ RepoHeader ]]', () => {
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

  test('renders RepoHeader with all permission', () => {
    const { html } = render(
      RepoHeader,
      {
        stubs,
        mocks,
        store: new Vuex.Store(storeMock)
      },
      (vue) => vue.use(VTooltip)
    )
    expect(html()).toMatchSnapshot('Default Repo Header Snap')
  })

  test('renders RepoHeader logged out', () => {
    const { html } = render(
      RepoHeader,
      {
        stubs: {
          NuxtLink: RouterLinkStub,
          RepoHeaderInfo: true,
          ZLabel: true,
          ZButton: true,
          ZTab: true,
          ZTag: true,
          ZIcon: true
        },
        mocks,
        store: new Vuex.Store({
          modules: storeModulesGenerator({
            'account/auth': {
              namespaced: true,
              state: {
                loggedIn: false
              }
            }
          })
        })
      },
      (vue) => vue.use(VTooltip)
    )
    expect(html()).toMatchSnapshot('Default Repo Header Snap Logged Out')
  })

  test('renders RepoHeader without perms', () => {
    const { html } = render(
      RepoHeader,
      {
        stubs,
        mocks,
        store: new Vuex.Store({
          modules: storeModulesGenerator({
            'user/active': {
              namespaced: true,
              state: {
                viewer: {
                  dashboardContext: [
                    dashboardContextGenerator({
                      role: undefined
                    })
                  ]
                }
              }
            }
          })
        })
      },
      (vue) => vue.use(VTooltip)
    )
    expect(html()).toMatchSnapshot('Repo Header withut perms')
  })

  test('renders RepoHeader for GSR', () => {
    const { html } = render(
      RepoHeader,
      {
        stubs,
        mocks,
        store: new Vuex.Store({
          modules: storeModulesGenerator({
            'repository/detail': {
              namespaced: true,
              state: {
                repository: {
                  id: 'UmVwb3NpdG9yeTp6dmp2eXo=',
                  vcsProvider: VcsProviderChoices.Gsr
                }
              }
            }
          })
        })
      },
      (vue) => vue.use(VTooltip)
    )
    expect(html()).toMatchSnapshot('RepoHeader for GSR')
  })

  test('renders RepoHeader without a matching activeLink', () => {
    const { html } = render(
      RepoHeader,
      {
        stubs,
        mocks: mocksGenerator({
          $route: {
            name: undefined,
            params: {
              provider: 'gh',
              owner: 'deepsourcelabs',
              repo: 'bifrost'
            }
          }
        }),
        store: new Vuex.Store({
          modules: storeModulesGenerator({
            'repository/detail': {
              namespaced: true,
              state: {
                repository: {
                  id: 'UmVwb3NpdG9yeTp6dmp2eXo=',
                  vcsProvider: VcsProviderChoices.Gsr
                }
              }
            }
          })
        })
      },
      (vue) => vue.use(VTooltip)
    )
    expect(html()).toMatchSnapshot('RepoHeader without a matching activeLink Snap')
  })

  test('[[ RepoHeader.refetchOnSocketEvent ]]', async () => {
    const wrapper = shallowMount(RepoHeader, {
      stubs,
      mocks,
      store: new Vuex.Store({
        modules: storeModulesGenerator()
      }),
      localVue
    })

    const vm = wrapper.vm as unknown as RepoHeaderInterface

    vm.refetchOnSocketEvent()
  })

  describe('[[ RepoHeader.canChangeBranch ]]', () => {
    test('[[ logged in ]]', async () => {
      const wrapper = shallowMount(RepoHeader, {
        stubs,
        mocks,
        store: new Vuex.Store({
          modules: storeModulesGenerator()
        }),
        localVue
      })

      const vm = wrapper.vm as unknown as RepoHeaderInterface

      expect(vm.canChangeBranch).toBe(true)
    })

    test('[[ logged out ]]', async () => {
      const wrapper = shallowMount(RepoHeader, {
        stubs,
        mocks,
        store: new Vuex.Store({
          modules: storeModulesGenerator({
            'account/auth': {
              namespaced: true,
              state: {
                loggedIn: false
              }
            }
          })
        }),
        localVue
      })

      const vm = wrapper.vm as unknown as RepoHeaderInterface

      expect(vm.canChangeBranch).toBe(false)
    })
  })

  describe('[[ RepoHeader.toggleStar ]]', () => {
    test('[[ success ]]', async () => {
      const wrapper = shallowMount(RepoHeader, {
        stubs,
        mocks,
        store: new Vuex.Store({
          modules: storeModulesGenerator()
        }),
        localVue
      })

      const vm = wrapper.vm as unknown as RepoHeaderInterface

      vm.updateRepositoryInStore = jest.fn()
      vm.fetchBasicRepoDetails = jest.fn()
      vm.updateStarredRepo = jest.fn(() => {
        return { ok: true }
      })
      await vm.toggleStar()

      expect(vm.updateStarredRepo).toBeCalledTimes(1)
      expect(vm.updateRepositoryInStore).toBeCalledTimes(1)
      expect(vm.fetchBasicRepoDetails).toBeCalledTimes(1)
      expect(vm.fetchBasicRepoDetails).toBeCalledWith({
        provider: 'gh',
        owner: 'deepsourcelabs',
        name: 'bifrost',
        refetch: true
      })
    })

    test('[[ failure ]]', async () => {
      const wrapper = shallowMount(RepoHeader, {
        stubs,
        mocks,
        store: new Vuex.Store({
          modules: storeModulesGenerator()
        }),
        localVue
      })

      const vm = wrapper.vm as unknown as RepoHeaderInterface

      vm.updateRepositoryInStore = jest.fn()
      vm.fetchBasicRepoDetails = jest.fn()
      vm.updateStarredRepo = jest.fn(() => {
        return { ok: false }
      })
      await vm.toggleStar()

      expect(vm.updateStarredRepo).toBeCalledTimes(1)
      expect(vm.updateRepositoryInStore).toBeCalledTimes(2)

      // @ts-ignore
      expect(mocks.$toast.danger).toBeCalledTimes(1)
      expect(vm.fetchBasicRepoDetails).toBeCalledWith({
        provider: 'gh',
        owner: 'deepsourcelabs',
        name: 'bifrost',
        refetch: true
      })
    })
  })
})
