import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import Vuex from 'vuex'

import SupportMenu from '~/components/Layout/Sidebar/SupportMenu.vue'
import SidebarItem from '~/components/Layout/Sidebar/SidebarItem.vue'
import { cartesian, generateBooleanProps } from '~/test/utils'
import { dashboardContextGenerator, storeModulesGenerator } from '~/test/mocks'
import { VueConstructor } from 'vue'
import { createLocalVue } from '@vue/test-utils'

describe('[[SupportMenu]]', () => {
  let localVue: VueConstructor<Vue>

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
  })

  test('renders SupportMenu with all props', () => {
    const showBorderOptions = generateBooleanProps('isCollapsed')

    cartesian(showBorderOptions).forEach((propCombination) => {
      const { html } = render(SupportMenu, {
        props: propCombination,
        stubs: {
          SidebarItem: true,
          ZMenu: true,
          ZMenuItem: true,
          ZMenuSection: true
        },
        mocks: {
          $route: {
            params: {
              provider: 'gh',
              owner: 'deepsourcelabs'
            }
          }
        },
        store: new Vuex.Store({
          modules: storeModulesGenerator({
            'user/active': {
              namespaced: true,
              state: {
                viewer: {
                  dashboardContext: [dashboardContextGenerator()]
                }
              }
            }
          })
        })
      })
      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })

  test('Support Menu title toggles on collapsible', async () => {
    const title = 'Help and support'
    const { getByText, updateProps } = render(SupportMenu, {
      slots: {
        default: title
      },
      stubs: {
        SidebarItem
      },
      props: { isCollapsed: false },
      mocks: {
        $route: {
          params: {
            provider: 'gh',
            owner: 'deepsourcelabs'
          }
        },
        $config: {
          onPrem: true
        }
      },
      store: new Vuex.Store({
        modules: storeModulesGenerator({
          'user/active': {
            namespaced: true,
            state: {
              viewer: {
                dashboardContext: [dashboardContextGenerator()]
              }
            }
          }
        })
      })
    })

    expect(getByText(title)).toBeVisible()

    await updateProps({ isCollapsed: true })
    expect(getByText(title)).not.toBeVisible()
  })
})
