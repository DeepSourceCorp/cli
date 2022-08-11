import { render } from '@testing-library/vue'
import { createLocalVue } from '@vue/test-utils'
import { mocksGenerator, storeModulesGenerator } from '~/test/mocks'

import VTooltip from 'v-tooltip'
import { VueConstructor } from 'vue'
import Vuex from 'vuex'

import UpdateSubscriptionModal from '~/components/Billing/Modals/UpdateSubscriptionModal.vue'

describe('[[ UpdateSubscriptionModal ]]', () => {
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
  test('renders UpdateSubscriptionModal', () => {
    const { html } = render(UpdateSubscriptionModal, {
      props: {
        newPlanName: 'plan-premium-monthly'
      },
      data() {
        return {
          planInfo: {
            endingBalance: 4850,
            upcomingBillAmount: 0,
            upcomingBillDate: '2022-08-10T11:31:36+00:00',
            prorationAmount: 4850,
            proratedForDays: 282,
            billedImmediately: true,
            quantity: 9
          }
        }
      },
      mocks: mocksGenerator(),
      store: new Vuex.Store(storeMock)
    })

    expect(html()).toMatchSnapshot()
  })
})
