import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { createLocalVue, RouterLinkStub, shallowMount } from '@vue/test-utils'
import { VueConstructor } from 'vue'
import Vuex from 'vuex'

import RepoHeader from '~/components/Layout/RepoHeader.vue'
import { dashboardContextGenerator, mocksGenerator, storeModulesGenerator } from '~/test/mocks'
import { Repository, RepositoryKindChoices, VcsProviderChoices } from '~/types/types'

import VTooltip from 'floating-vue'

const mocks = mocksGenerator({
  fetchRepoPerms: jest.fn(),
  fetchBasicRepoDetails: jest.fn(),
  fetchRepoRunCount: jest.fn(),
  $config: { onPrem: true }
})

interface RepoHeaderInterface extends Vue {
  fetchBasicRepoDetails: ReturnType<typeof jest.fn>
  updateRepositoryInStore: ReturnType<typeof jest.fn>
  updateStarredRepo: ReturnType<typeof jest.fn>
  toggleStar: () => Promise<void>
}

const stubs = {
  NuxtLink: RouterLinkStub,
  ZButton: true,
  ZIcon: true,
  ZLabel: true,
  ZTab: true,
  ZTag: true,
  ZTagV2: true
}

describe('[[ RepoHeader ]]', () => {
  let localVue: VueConstructor<Vue>

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    localVue.use(VTooltip)
  })

  const getRepositoryDetailMock = (overrides: Partial<Repository> = {}) => ({
    'repository/detail': {
      namespaced: true,
      state: {
        repository: {
          id: 'UmVwb3NpdG9yeTp6dmp2eXo=',
          displayName: 'bifrost',
          vcsProvider: VcsProviderChoices.Github,
          isActivated: true,
          kind: RepositoryKindChoices.Repo,
          ...overrides
        }
      }
    }
  })

  test('renders RepoHeader with all repository kind options', () => {
    Object.values(RepositoryKindChoices).forEach((repoKind) => {
      const repositoryDetailMock = getRepositoryDetailMock({ kind: repoKind })

      const { html } = render(
        RepoHeader,
        {
          stubs,
          mocks,
          store: new Vuex.Store({
            modules: storeModulesGenerator(repositoryDetailMock)
          })
        },
        (vue) => vue.use(VTooltip)
      )
      expect(html()).toMatchSnapshot(repoKind)
    })
  })

  test('renders RepoHeader with all permission', () => {
    const repositoryDetailMock = getRepositoryDetailMock()

    const { html } = render(
      RepoHeader,
      {
        stubs,
        mocks,
        store: new Vuex.Store({
          modules: storeModulesGenerator(repositoryDetailMock)
        })
      },
      (vue) => vue.use(VTooltip)
    )
    expect(html()).toMatchSnapshot('Default Repo Header Snap')
  })

  test('renders RepoHeader logged out', () => {
    const repositoryDetailMock = getRepositoryDetailMock()

    const { html } = render(
      RepoHeader,
      {
        stubs,
        mocks,
        store: new Vuex.Store({
          modules: storeModulesGenerator({
            'account/auth': {
              namespaced: true,
              state: {
                loggedIn: false
              }
            },
            ...repositoryDetailMock
          })
        })
      },
      (vue) => vue.use(VTooltip)
    )
    expect(html()).toMatchSnapshot('Default Repo Header Snap Logged Out')
  })

  test('renders RepoHeader without perms', () => {
    const repositoryDetailMock = getRepositoryDetailMock()

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
            },
            ...repositoryDetailMock
          })
        })
      },
      (vue) => vue.use(VTooltip)
    )
    expect(html()).toMatchSnapshot('Repo Header withut perms')
  })

  test('renders RepoHeader for GSR', () => {
    const repositoryDetailMock = getRepositoryDetailMock({ isActivated: false })

    const { html } = render(
      RepoHeader,
      {
        stubs,
        mocks,
        store: new Vuex.Store({
          modules: storeModulesGenerator(repositoryDetailMock)
        })
      },
      (vue) => vue.use(VTooltip)
    )
    expect(html()).toMatchSnapshot('RepoHeader for GSR')
  })

  test('renders RepoHeader without a matching activeLink', () => {
    const repositoryDetailMock = getRepositoryDetailMock({ isActivated: false })

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
          },
          $config: { onPrem: false }
        }),
        store: new Vuex.Store({
          modules: storeModulesGenerator(repositoryDetailMock)
        })
      },
      (vue) => vue.use(VTooltip)
    )
    expect(html()).toMatchSnapshot('RepoHeader without a matching activeLink Snap')
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

      // @ts-expect-error - return value from `mocksGenerator` is typed `Record<string, unknown>`
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
