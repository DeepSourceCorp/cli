import { render } from '@testing-library/vue'
import { ContextSwitcher } from '~/components/Layout/Sidebar'
import { createLocalVue, RouterLinkStub, shallowMount } from '@vue/test-utils'
import Vuex, { Store } from 'vuex'
import { VueConstructor } from 'vue'
import { cartesian, generateBooleanProps } from '~/test/utils'

const stubs = {
  NuxtLink: RouterLinkStub,
  ZAvatar: true,
  ZIcon: true,
  ZMenu: true,
  ZMenuItem: true,
  ZMenuSection: true
}

const mocks = {
  $route: {
    query: '',
    params: {
      provider: 'gh',
      owner: 'deepsourcelabs'
    }
  },
  viewer: {},
  $config: { onPrem: false },
  $socket: {
    $on: () => {},
    $off: () => {}
  },
  async $fetchGraphqlData() {},
  async $applyGraphqlMutation() {},
  async fetchContext() {}
}

const sampleContext = {
  id: 63,
  login: 'deepsourcelabs',
  avatar_url: '/static/dashboard/images/empty-avatar.svg',
  vcs_provider: 'gh',
  vcs_url: 'https://github.com/deepsourcelabs',
  vcs_provider_display: 'GitHub',
  type: 'team',
  is_default: true,
  team_name: 'deepsourcelabs',
  subscribed_plan_info: { name: 'Business', slug: 'premium' }
}

describe('[[ ContextSwitcher ]]', () => {
  let localVue: VueConstructor<Vue>, store: Store<any>
  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    store = new Vuex.Store({
      modules: {
        'user/active': {
          namespaced: true,
          state: {
            viewer: {
              dashboardContext: [sampleContext]
            }
          }
        },
        'account/context': {
          namespaced: true,
          state: {
            context: {
              installationProvidersUrl: '/installation/providers/'
            }
          }
        }
      }
    })
  })

  test('renders ContextSwitcher with all prop options', () => {
    const isCollapsedOption = generateBooleanProps('isCollapsed', false)

    cartesian(isCollapsedOption).forEach((propCombination) => {
      const { html } = render(ContextSwitcher, {
        props: propCombination,
        stubs,
        mocks,
        store
      })

      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })

  test('updateDefaultContext triggers updation and refetch', async () => {
    const wrapper = shallowMount(ContextSwitcher, {
      stubs,
      mocks,
      store,
      localVue,
      propsData: {
        isCollapsed: false
      }
    })

    // @ts-ignore
    wrapper.vm.refetchUser = jest.fn(() => {
      return new Promise<void>((resolve) => resolve())
    })

    // @ts-ignore
    wrapper.vm.updateDefaultContextAPI = jest.fn(({ contextOwnerId: string }) => {
      return new Promise((resolve) => resolve(null))
    })

    sampleContext.is_default = false

    // @ts-ignore
    await wrapper.vm.updateDefaultContext(sampleContext)

    // @ts-ignore
    expect(wrapper.vm.refetchUser.mock.calls.length).toBe(1)

    // @ts-ignore
    expect(wrapper.vm.updateDefaultContextAPI.mock.calls.length).toBe(1)
  })
})
