import { render } from '@testing-library/vue'
import { shallowMount } from '@vue/test-utils'

import AddSubRepositoryModal from '~/components/Monorepo/AddSubRepositoryModal.vue'
import { cartesian, generateBooleanProps } from '~/test/utils'

interface IAddSubRepositoryModal extends Vue {
  primaryActionHandler: () => void
}

describe('[[ AddSubRepositoryModal ]]', () => {
  const baseProps = {
    monorepoName: 'test-monorepo',
    monorepoDefaultBranch: 'main'
  }

  const mocks = {
    $emit: jest.fn()
  }

  const stubs = {
    ZButton: true,
    ZIcon: true,
    ZInput: true,
    ZInputGroup: true,
    ZModal: true
  }

  test('renders various states of the add sub repository modal', () => {
    const primaryActionLoadingOptions = generateBooleanProps('primaryActionLoading', false)
    const showErrorOptions = generateBooleanProps('showError', false)

    cartesian(showErrorOptions, primaryActionLoadingOptions).forEach((propCombination) => {
      const propsData = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(AddSubRepositoryModal, {
        propsData,
        stubs
      })
      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })

  test('`branch` data property is set to the `monorepoDefaultBranch` prop value in the `created` hook', () => {
    const { vm } = shallowMount(AddSubRepositoryModal, {
      propsData: baseProps,
      stubs
    })

    expect(vm.$data.branch).toBe(baseProps.monorepoDefaultBranch)
  })

  test('emits a `primary` event supplying the `branch` and `projectPath` data property values', () => {
    const { vm } = shallowMount(AddSubRepositoryModal, {
      propsData: baseProps,
      mocks,
      stubs
    })

    ;(vm as IAddSubRepositoryModal).primaryActionHandler()
    expect(mocks.$emit).toBeCalledWith('primary', {
      branch: baseProps.monorepoDefaultBranch,
      subRepositoryPath: ''
    })
  })
})
