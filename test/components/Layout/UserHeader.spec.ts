import { render } from '@testing-library/vue'
import { createLocalVue, RouterLinkStub } from '@vue/test-utils'
import { mocksGenerator, storeModulesGenerator } from '~/test/mocks'

import VTooltip from 'floating-vue'
import { VueConstructor } from 'vue'
import Vuex from 'vuex'

import UserHeader from '~/components/Layout/UserHeader.vue'

describe('[[ UserHeader ]]', () => {
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
  test('renders UserHeader', () => {
    const { html } = render(UserHeader, {
      mocks: mocksGenerator(),
      stubs: {
        NuxtLink: RouterLinkStub
      },
      store: new Vuex.Store(storeMock)
    })

    expect(html()).toMatchSnapshot()
  })
})
