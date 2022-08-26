import { render, RenderResult } from '@testing-library/vue'
import { createLocalVue } from '@vue/test-utils'
import { mocksGenerator, storeModulesGenerator } from '~/test/mocks'

import VTooltip from 'v-tooltip'
import { VueConstructor } from 'vue'
import Vuex from 'vuex'

import AccountSetupCard from '~/components/TeamHome/AccountSetupCard.vue'

describe('[[ AccountSetupCard ]]', () => {
  let localVue: VueConstructor<Vue>
  let storeMock: Record<string, unknown>

  let html: () => string
  let findByText: RenderResult['findByText']

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    localVue.use(VTooltip)

    storeMock = {
      modules: storeModulesGenerator()
    }

    const rendered = render(AccountSetupCard, {
      props: {
        completion: 45
      },
      mocks: mocksGenerator(),
      store: new Vuex.Store(storeMock)
    })

    html = rendered.html
    findByText = rendered.findByText
  })

  test('renders AccountSetupCard', () => {
    expect(html()).toMatchSnapshot()
  })

  test('[[ AccountSetupCard Activate Repo ]]', async () => {
    const triggerBtn = await findByText('Activate repo')
    await triggerBtn.click()

    expect(html()).toMatchSnapshot('Snapshot: Activate Repo')
  })

  test('[[ AccountSetupCard Start Transformers ]]', async () => {
    const triggerBtn = await findByText('Start using Transformers')
    await triggerBtn.click()

    expect(html()).toMatchSnapshot('Snapshot: Start Transformers')
  })

  test('[[ AccountSetupCard Install Autofix ]]', async () => {
    const triggerBtn = await findByText('Install Autofix')
    await triggerBtn.click()

    expect(html()).toMatchSnapshot('Snapshot: Install Autofix')
  })

  test('[[ AccountSetupCard Invite Member ]]', async () => {
    const triggerBtn = await findByText('Invite team')
    await triggerBtn.click()

    expect(html()).toMatchSnapshot('Snapshot: Invite Member')
  })
})
