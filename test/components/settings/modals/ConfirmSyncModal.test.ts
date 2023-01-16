import { render } from '@testing-library/vue'
import { shallowMount } from '@vue/test-utils'

import { ConfirmSyncModal } from '~/components/Settings'

import { cartesian, generateGenericProps } from '~/test/utils'

interface ConfirmSyncModalInterface extends Vue {
  // Data properties
  overrideChanges: boolean

  // Methods exposed by the component
  emitSyncAccessSettings: (close: () => void) => void
}

describe('[[ ConfirmSyncModal ]]', () => {
  // Mocks
  const mocks = {
    $emit: jest.fn()
  }

  const stubs = {
    ZIcon: true,
    ZCheckbox: true,
    ZAlert: true,
    ZButton: true,
    ZModal: true
  }

  const defaultProps = {
    providerName: 'GitHub'
  }

  test('renders ConfirmSyncModal modal with all props', () => {
    const teamMemberRoleUpdatedCountOptions = generateGenericProps(
      'teamMemberRoleUpdatedCount',
      [12, 1, 0]
    )
    const repoCollaboratorUpdatedCountOptions = generateGenericProps(
      'repoCollaboratorUpdatedCount',
      [12, 1, 0]
    )

    cartesian(teamMemberRoleUpdatedCountOptions, repoCollaboratorUpdatedCountOptions).forEach(
      (props) => {
        const { html } = render(ConfirmSyncModal, {
          propsData: { ...defaultProps, ...props },
          stubs,
          mocks
        })

        expect(html()).toMatchSnapshot(JSON.stringify(props))
      }
    )
  })

  test('`sync-access-settings event is emitted successfully', () => {
    const props = {
      ...defaultProps,
      teamMemberRoleUpdatedCount: 10,
      repoCollaboratorUpdatedCount: 12
    }

    const wrapper = shallowMount(ConfirmSyncModal, {
      propsData: { ...defaultProps, ...props },
      stubs,
      mocks
    })

    const vm = wrapper.vm as ConfirmSyncModalInterface

    const close = jest.fn()

    vm.emitSyncAccessSettings(close)

    expect(mocks.$emit).toBeCalledWith('sync-access-settings', true)
    expect(close).toHaveBeenCalled()
  })
})
