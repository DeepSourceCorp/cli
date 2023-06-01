import { render } from '@testing-library/vue'

import CustomizeWidgetsModal from '~/components/RepoOverview/CustomizeWidgets/CustomizeWidgetsModal.vue'

import { storeModulesGenerator } from '~/test/mocks'
import { VcsProviderChoices } from '~/types/types'

describe('[[ CustomizeWidgetsModal ]]', () => {
  const mocks = {
    $emit: () => '',
    $toast: {
      danger: () => ''
    }
  }

  const storeMock = {
    modules: storeModulesGenerator({
      'repository/detail': {
        namespaced: true,
        state: {
          repository: {
            id: 'UmVwb3NpdG9yeTp6dmp2eXo=',
            vcsProvider: VcsProviderChoices.Github,
            isActivated: true,
            widgets: [
              'antipattern-widget',
              'bug-risk-widget',
              'performance-widget',
              'security-widget',
              'lcv-widget',
              'bcv-widget',
              'ccv-widget',
              'cpcv-widget'
            ],
            allWidgets: {
              'ddp-widget': { title: 'External Dependencies' },
              'dcv-widget': { title: 'Documentation Coverage' },
              'lcv-widget': { title: 'Line Coverage' },
              'bcv-widget': { title: 'Branch Coverage' },
              'ccv-widget': { title: 'Condition Coverage' },
              'cpcv-widget': { title: 'Composite Coverage' },
              'antipattern-widget': { title: 'Anti-patterns' },
              'bug-risk-widget': { title: 'Bug risks' },
              'coverage-widget': { title: 'Coverage Issues' },
              'doc-widget': { title: 'Documentation Issues' },
              'performance-widget': { title: 'Performance Issues' },
              'security-widget': { title: 'Security Issues' },
              'style-widget': { title: 'Style Issues' },
              'typecheck-widget': { title: 'Type check Issues' }
            }
          }
        }
      }
    })
  }

  const stubs = {
    CustomizeWidgetsModalRow: true,
    Draggable: true,
    ZButton: true,
    ZIcon: true,
    ZInput: true,
    ZModal: true
  }

  test('renders the modal to customize the issue widgets', () => {
    const { html } = render(CustomizeWidgetsModal, {
      mocks,
      store: storeMock,
      stubs
    })

    expect(html()).toMatchSnapshot()
  })
})
