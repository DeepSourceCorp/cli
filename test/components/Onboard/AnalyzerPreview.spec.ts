import { render } from '@testing-library/vue'
import { createLocalVue } from '@vue/test-utils'
import { mocksGenerator, storeModulesGenerator } from '~/test/mocks'

import VTooltip from 'floating-vue'
import { VueConstructor } from 'vue'
import Vuex from 'vuex'

import AnalyzerPreview from '~/components/Onboard/AnalyzerPreview.vue'

describe('[[ AnalyzerPreview ]]', () => {
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
  test('renders AnalyzerPreview', () => {
    const { html } = render(AnalyzerPreview, {
      mocks: mocksGenerator(),
      store: new Vuex.Store(storeMock)
    })

    expect(html()).toMatchSnapshot()
  })
})
