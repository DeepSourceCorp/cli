import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import { shallowMount } from '@vue/test-utils'

import WebhookLogList from '~/components/Webhooks/WebhookLogList.vue'

interface IWebhookLogList extends Vue {
  // Data properties
  currentPage: number

  // Methods
  updateCurrentPage: (pageNumber: number) => void
}

const mocks = {
  $emit: jest.fn()
}

const stubs = {
  WebhookLogListItem: true,
  ZPagination: true
}

describe('[[ WebhookLogList ]]', () => {
  const baseProps = {
    endpointDeliveries: [
      {
        id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6YnFkbG9v',
        eventId: '428382911570379267',
        createdAt: '2022-10-04T06:41:52.793663+00:00',
        retryCount: 0,
        finishedIn: 0.489,
        deliveryId: '428382911687819787',
        httpStatusCode: 200,
        eventType: {
          id: 'V2ViaG9va0V2ZW50VHlwZXM6cXh6ZGFi',
          name: 'Repository Analysis Deactivated',
          shortcode: 'repository.analysis.deactivated'
        }
      },
      {
        id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6emxsdm5l',
        eventId: '428382915496247811',
        createdAt: '2022-10-04T06:41:55.127159+00:00',
        retryCount: 0,
        finishedIn: 0.389,
        deliveryId: '428382915596911115',
        httpStatusCode: 200,
        eventType: {
          id: 'V2ViaG9va0V2ZW50VHlwZXM6b2x6cW5i',
          name: 'Repository Analysis Activated',
          shortcode: 'repository.analysis.activated'
        }
      },
      {
        id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6enhqa3ls',
        eventId: '428382953999958531',
        createdAt: '2022-10-04T06:42:18.058261+00:00',
        retryCount: 0,
        finishedIn: 0.358,
        deliveryId: '428382954067067403',
        httpStatusCode: 200,
        eventType: {
          id: 'V2ViaG9va0V2ZW50VHlwZXM6b2x6cW5i',
          name: 'Repository Analysis Activated',
          shortcode: 'repository.analysis.activated'
        }
      },
      {
        id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6YmV2cm13',
        eventId: '428382951365935619',
        createdAt: '2022-10-04T06:42:16.503934+00:00',
        retryCount: 0,
        finishedIn: 0.526,
        deliveryId: '428382951466598923',
        httpStatusCode: 200,
        eventType: {
          id: 'V2ViaG9va0V2ZW50VHlwZXM6cXh6ZGFi',
          name: 'Repository Analysis Deactivated',
          shortcode: 'repository.analysis.deactivated'
        }
      },
      {
        id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6em1sbXls',
        eventId: '428382957271515651',
        createdAt: '2022-10-04T06:42:22.142793+00:00',
        retryCount: 0,
        finishedIn: 0.371,
        deliveryId: '428382960928948747',
        httpStatusCode: 200,
        eventType: {
          id: 'V2ViaG9va0V2ZW50VHlwZXM6cXh6ZGFi',
          name: 'Repository Analysis Deactivated',
          shortcode: 'repository.analysis.deactivated'
        }
      },
      {
        id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6YnlseG14',
        eventId: '428382961063166467',
        createdAt: '2022-10-04T06:42:23.066198+00:00',
        retryCount: 0,
        finishedIn: 0.351,
        deliveryId: '428382962472452619',
        httpStatusCode: 200,
        eventType: {
          id: 'V2ViaG9va0V2ZW50VHlwZXM6b2x6cW5i',
          name: 'Repository Analysis Activated',
          shortcode: 'repository.analysis.activated'
        }
      },
      {
        id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6Ymxsdnlu',
        eventId: '428382964468941315',
        createdAt: '2022-10-04T06:42:24.614464+00:00',
        retryCount: 0,
        finishedIn: 0.369,
        deliveryId: '428382965072921099',
        httpStatusCode: 200,
        eventType: {
          id: 'V2ViaG9va0V2ZW50VHlwZXM6cXh6ZGFi',
          name: 'Repository Analysis Deactivated',
          shortcode: 'repository.analysis.deactivated'
        }
      },
      {
        id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6emptdnJk',
        eventId: '428382969619546627',
        createdAt: '2022-10-04T06:42:28.941289+00:00',
        retryCount: 0,
        finishedIn: 0.541,
        deliveryId: '428382972337455627',
        httpStatusCode: 200,
        eventType: {
          id: 'V2ViaG9va0V2ZW50VHlwZXM6b2x6cW5i',
          name: 'Repository Analysis Activated',
          shortcode: 'repository.analysis.activated'
        }
      },
      {
        id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6emV2cmt3',
        eventId: '428382971968356867',
        createdAt: '2022-10-04T06:42:30.885723+00:00',
        retryCount: 0,
        finishedIn: 0.381,
        deliveryId: '428382975592235531',
        httpStatusCode: 200,
        eventType: {
          id: 'V2ViaG9va0V2ZW50VHlwZXM6cXh6ZGFi',
          name: 'Repository Analysis Deactivated',
          shortcode: 'repository.analysis.deactivated'
        }
      },
      {
        id: 'V2ViaG9va0V2ZW50RGVsaXZlcnk6Ynhqa3Zs',
        eventId: '428382978259812867',
        createdAt: '2022-10-04T06:42:34.234821+00:00',
        retryCount: 0,
        finishedIn: 0.346,
        deliveryId: '428382981212602891',
        httpStatusCode: 200,
        eventType: {
          id: 'V2ViaG9va0V2ZW50VHlwZXM6b2x6cW5i',
          name: 'Repository Analysis Activated',
          shortcode: 'repository.analysis.activated'
        }
      }
    ],
    endpointDeliveriesCount: 10
  }

  // Returns a Wrapper that contains the rendered Vue component
  const getInstance = (props = {}) => {
    const { vm } = shallowMount(WebhookLogList, {
      mocks,
      propsData: {
        ...baseProps,
        ...props
      },
      stubs
    })

    return vm as IWebhookLogList
  }

  test('renders the list of webhook logs', () => {
    const { html } = render(WebhookLogList, {
      mocks,
      propsData: { ...baseProps },
      stubs
    })

    expect(html()).toMatchSnapshot()
  })

  test('`updateCurrentPage` method updates the `currentPage` data property and emits an event by the name `update-page-number` supplying the value', () => {
    const instance = getInstance()

    // Invoke the `updateCurrentPage` method
    instance.updateCurrentPage(2)

    // Assertions
    expect(instance.currentPage).toBe(2)
    expect(mocks.$emit).toBeCalledWith('update-page-number', 2)
  })
})
