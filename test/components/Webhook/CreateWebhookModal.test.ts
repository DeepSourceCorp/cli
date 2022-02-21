import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex, { Store } from 'vuex'
import CreateWebhookModal from '~/components/Webhooks/CreateWebhookModal.vue'
import VTooltip from 'v-tooltip'
import { VueConstructor } from 'vue'

const mocks = {
  $route: {
    query: ''
  },
  viewer: {},
  $config: { onPrem: false },
  $socket: {
    $on: () => {},
    $off: () => {}
  },
  async $fetchGraphqlData() {}
}

interface CreateWebhookModalT extends Vue {
  secret: string
  generateWebhookSecret: jest.MockedFunction<() => Promise<string>>
  generateSecret: () => Promise<void>
}

describe('[[ CreateWebhookModal ]]', () => {
  let localVue: VueConstructor<CreateWebhookModal>, store: Store<any>
  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    store = new Vuex.Store({
      modules: {
        'owner/webhook': {
          namespaced: true,
          state: {
            webhookEventTypes: [
              {
                name: 'Analysis Run Started',
                shortcode: 'analysis_run.started',
                shortDescription: 'This event is triggered when an analysis run is started.'
              },
              {
                name: 'Analysis Run Updated',
                shortcode: 'analysis_run.updated',
                shortDescription: 'This event is triggered when an analysis run is updated.'
              },
              {
                name: 'Repository Issue Introduced',
                shortcode: 'repository_issue.introduced',
                shortDescription:
                  'This event is trigerred when an issue is introduced on the default branch.'
              }
            ]
          }
        }
      }
    })
  })

  test('renders CreateWebhookModal with the store', () => {
    const { html } = render(
      CreateWebhookModal,
      {
        mocks,
        store,
        stubs: {
          ZModal: true,
          CopyButton: true,
          ZButton: true,
          ZInput: true
        }
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot()
  })

  test('Generate secret button', async () => {
    const wrapper = shallowMount(CreateWebhookModal, {
      store,
      localVue
    })
    const vm: CreateWebhookModalT = wrapper.vm as CreateWebhookModalT
    const payload = '5a79e73c99734f8c87c0ff501eafa53b'

    vm.generateWebhookSecret = jest.fn(() => {
      return new Promise((resolve) => resolve(payload))
    })

    await vm.generateSecret()

    expect(vm.generateWebhookSecret.mock.calls.length).toBe(1)
    expect(vm.secret).toBe(payload)
  })
})
