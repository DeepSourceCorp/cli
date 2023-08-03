import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { createLocalVue } from '@vue/test-utils'
import Vuex, { Store } from 'vuex'
import CreateWebhookModal from '~/components/Webhooks/CreateWebhookModal.vue'
import VTooltip from 'floating-vue'
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

describe('[[ CreateWebhookModal ]]', () => {
  let localVue: VueConstructor<Vue>, store: Store<any>
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
          CopyButton: true,
          ToggleInput: true,
          ZModal: true,
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
})
