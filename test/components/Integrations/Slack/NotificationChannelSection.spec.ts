import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { VueConstructor } from 'vue'
import Vuex, { Store } from 'vuex'

import NotificationChannelSection from '~/components/Integrations/Slack/NotificationChannelSection.vue'
import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'
import {
  IntegrationSettingsLevel,
  UpdateIntegrationSettingsInput,
  UpdateIntegrationSettingsPayload
} from '~/types/types'

interface INotificationChannelSection {
  hasChannelList: boolean | undefined
  placeholder: string
  channelList: Array<string>
  updateChannelPreference: (newChannel: string, oldChannel: string) => Promise<void>
  updateIntegrationSettings: (
    args: UpdateIntegrationSettingsInput
  ) => Promise<UpdateIntegrationSettingsPayload>
}

describe('[[ NotificationChannelSection ]]', () => {
  // Mocks
  const mocks = {
    $route: {
      params: {
        provider: 'gh',
        owner: 'deepsourcelabs'
      }
    },
    $toast: {
      success: jest.fn()
    }
  }

  const stubs = {
    ZOption: true,
    ZSelect: true
  }

  const mockedChannelList = ['dev-testing', 'general', 'random']
  const ownerId = 'T3duZXI6cXpscnh6'
  const repositoryId = 'UmVwb3NpdG9yeTp6ZXBqZWI='

  let localVue = {} as VueConstructor<Vue>
  let store = {} as Store<NotificationChannelSection>

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
  })

  // Helper to return the store instance
  const getStoreInstance = (isActive = true) => {
    // Return the following state for the intermediary installation page where the channel list is received as part of
    // `installIntegration` GQL mutation payload
    const options = {
      modules: {
        'integrations/detail': {
          namespaced: true,
          state: {
            integration: {}
          }
        },
        'owner/detail': {},
        'repository/detail': {}
      }
    }

    // Return the following state by default, `isActive` is `true`
    if (isActive) {
      options.modules['integrations/detail'].state.integration = {
        options: {
          channel: mockedChannelList
        }
      }

      options.modules['owner/detail'] = {
        namespaced: true,
        state: {
          owner: {
            id: ownerId
          }
        }
      }

      options.modules['repository/detail'] = {
        namespaced: true,
        state: {
          repository: {
            id: repositoryId
          }
        }
      }
    }

    const storeInstance = new Vuex.Store(options) as Store<NotificationChannelSection>
    return storeInstance
  }

  // Returns a Wrapper that contains the rendered Vue component
  const getInstance = (props = {}) => {
    store = getStoreInstance()
    const { vm } = shallowMount(NotificationChannelSection, {
      propsData: {
        channel: 'general',
        pending: false,
        ...props
      },
      store,
      mocks,
      stubs,
      localVue
    })
    return vm as unknown as INotificationChannelSection
  }

  test('renders the notification channel section', () => {
    store = getStoreInstance()

    const baseProps = {
      channel: 'general'
    }

    const pendingOptions = generateBooleanProps('pending')

    cartesian(pendingOptions).forEach((propCombination) => {
      const props = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(NotificationChannelSection, {
        props,
        store,
        stubs
      })

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })

  test('Falls back to the channel list passed via `availableChannels` prop', () => {
    store = getStoreInstance(false)

    const { html } = render(NotificationChannelSection, {
      props: {
        availableChannels: mockedChannelList,
        channel: 'general',
        pending: false
      },
      store,
      stubs
    })

    expect(html()).toMatchSnapshot()
  })

  test('`hasChannelList` returns the list of available channels', () => {
    const { hasChannelList } = getInstance({})
    expect(hasChannelList).toBeTruthy()
  })

  test('`placeholder` returns the model value if available and the channel list exists', () => {
    const { placeholder } = getInstance({})
    expect(placeholder).toBe('general')
  })

  test('`placeholder` returns the text asking the user to select a channel from the list for the first time', () => {
    const { placeholder } = getInstance({ channel: '' })
    expect(placeholder).toBe('Select a channel')
  })

  test('`channelList` returns the available list of channels to choose from', () => {
    const { channelList } = getInstance({})
    expect(channelList).toEqual(mockedChannelList)
  })
})
