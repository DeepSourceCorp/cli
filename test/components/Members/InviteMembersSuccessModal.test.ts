import { render } from '@testing-library/vue'
import { createLocalVue } from '@vue/test-utils'
import { mocksGenerator, storeModulesGenerator } from '~/test/mocks'

import VTooltip from 'floating-vue'
import { VueConstructor } from 'vue'
import Vuex from 'vuex'

import InviteMembersSuccessModal from '~/components/Members/InviteMembersSuccessModal.vue'

describe('[[ InviteMembersSuccessModal ]]', () => {
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
  test('renders InviteMembersSuccessModal', () => {
    const { html } = render(InviteMembersSuccessModal, {
      mocks: mocksGenerator(),
      stubs: {
        ZModal: true,
        ZButton: true
      },
      store: new Vuex.Store(storeMock)
    })

    expect(html()).toMatchSnapshot()
  })
})
