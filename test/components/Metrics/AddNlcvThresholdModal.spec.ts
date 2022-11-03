import { render } from '@testing-library/vue'
import { ZInput, ZButton, ZModal, ZSelect, ZOption } from '@deepsourcelabs/zeal'
import { AddNlcvThresholdModal } from '~/components/Metrics'
import { shallowMount } from '@vue/test-utils'

describe('[[AddNlcvThresholdModal]]', () => {
  const baseProps = {
    analyzers: [
      {
        id: 'QW5hbHl6ZXI6amJrb3di',
        name: 'C#',
        shortcode: 'csharp',
        category: 'Programming language',
        __typename: 'Analyzer'
      },
      {
        id: 'QW5hbHl6ZXI6b2x6cW5i',
        name: 'Dockerfile',
        shortcode: 'docker',
        category: 'Programming language',
        __typename: 'Analyzer'
      },
      {
        id: 'QW5hbHl6ZXI6b3p3dm5i',
        name: 'PHP',
        shortcode: 'php',
        category: 'Programming language',
        __typename: 'Analyzer'
      },
      {
        id: 'QW5hbHl6ZXI6bGtiZXZ6',
        name: 'Python',
        shortcode: 'python',
        category: 'Programming language',
        __typename: 'Analyzer'
      },
      {
        id: 'QW5hbHl6ZXI6YXFibHhi',
        name: 'Ruby',
        shortcode: 'ruby',
        category: 'Programming language',
        __typename: 'Analyzer'
      },
      {
        id: 'QW5hbHl6ZXI6bHpwZGF6',
        name: 'Rust',
        shortcode: 'rust',
        category: 'Programming language',
        __typename: 'Analyzer'
      },
      {
        id: 'QW5hbHl6ZXI6ZXJ6amFi',
        name: 'SQL',
        shortcode: 'sql',
        category: 'Programming language',
        __typename: 'Analyzer'
      },
      {
        id: 'QW5hbHl6ZXI6cnpqeGF6',
        name: 'Scala',
        shortcode: 'scala',
        category: 'Programming language',
        __typename: 'Analyzer'
      },
      {
        id: 'QW5hbHl6ZXI6cXh6ZGFi',
        name: 'Terraform',
        shortcode: 'terraform',
        category: 'Programming language',
        __typename: 'Analyzer'
      },
      {
        id: 'QW5hbHl6ZXI6bGp6a3d6',
        name: 'Test Coverage',
        shortcode: 'test-coverage',
        category: 'Programming language',
        __typename: 'Analyzer'
      }
    ]
  }

  test('renders EditThresholdModal with all prop options', async () => {
    //? `await` is needed since we wait for the `<transition>` to render, despite what the types say.
    //! Do not remove `await`
    const { html } = await render(AddNlcvThresholdModal, {
      props: { ...baseProps },
      stubs: {
        AnalyzerLogo: true
      },
      components: { ZInput, ZButton, ZModal, ZSelect, ZOption }
    })

    expect(html()).toMatchSnapshot(JSON.stringify(baseProps))
  })

  describe('validateThreshold', () => {
    test('Correct value', () => {
      const { vm } = shallowMount(AddNlcvThresholdModal, {
        propsData: { ...baseProps },
        stubs: {
          AnalyzerLogo: true
        },
        components: { ZInput, ZButton, ZModal, ZSelect, ZOption }
      })

      //@ts-ignore
      vm.thresholdInputError = true
      //@ts-ignore
      vm.validateThreshold(20)

      //@ts-ignore
      expect(vm.thresholdInputError).toBe(false)
    })

    test('Value over 100', () => {
      const { vm } = shallowMount(AddNlcvThresholdModal, {
        propsData: { ...baseProps },
        stubs: {
          AnalyzerLogo: true
        },
        components: { ZInput, ZButton, ZModal, ZSelect, ZOption }
      })

      //@ts-ignore
      vm.validateThreshold(220)

      //@ts-ignore
      expect(vm.thresholdInputError).toBe(true)
    })

    test('Value below 0', () => {
      const { vm } = shallowMount(AddNlcvThresholdModal, {
        propsData: { ...baseProps },
        stubs: {
          AnalyzerLogo: true
        },
        components: { ZInput, ZButton, ZModal, ZSelect, ZOption }
      })

      //@ts-ignore
      vm.validateThreshold(-20)

      //@ts-ignore
      expect(vm.thresholdInputError).toBe(true)
    })
  })

  test('setThresholdValue', () => {
    const { vm } = shallowMount(AddNlcvThresholdModal, {
      propsData: { ...baseProps },
      stubs: {
        AnalyzerLogo: true
      },
      components: { ZInput, ZButton, ZModal, ZSelect, ZOption }
    })

    //@ts-ignore
    vm.thresholdInputError = true
    //@ts-ignore
    vm.setThresholdValue('50')

    //@ts-ignore
    expect(vm.thresholdInputError).toBe(false)
    //@ts-ignore
    expect(vm.newThresholdValue).toBe(50)
  })

  describe('createThreshold', () => {
    test('emits data correctly on no error', async () => {
      const wrapper = shallowMount(AddNlcvThresholdModal, {
        propsData: { ...baseProps },
        components: { ZInput, ZButton, ZModal, ZSelect, ZOption }
      })

      //@ts-ignore
      wrapper.vm.newThresholdValue = 30
      //@ts-ignore
      wrapper.vm.thresholdInputError = false
      //@ts-ignore
      wrapper.vm.analyzerToAdd = 'Metrik'
      //@ts-ignore
      wrapper.vm.createThreshold()

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted().addThreshold?.length).toBeTruthy()
      expect(wrapper.emitted().addThreshold?.[0]).toEqual(['Metrik', 30, undefined])
    })

    test('invokes toast when it has error', () => {
      const localThis = {
        $toast: {
          danger: jest.fn()
        }
      }

      const wrapper = shallowMount(AddNlcvThresholdModal, {
        propsData: { ...baseProps },
        components: { ZInput, ZButton, ZModal, ZSelect, ZOption },
        mocks: { ...localThis }
      })

      //@ts-ignore
      wrapper.vm.thresholdInputError = true
      //@ts-ignore
      wrapper.vm.createThreshold()

      expect(localThis.$toast.danger).toBeCalledTimes(1)
    })
  })

  test('closeModal', async () => {
    const wrapper = shallowMount(AddNlcvThresholdModal, {
      propsData: { ...baseProps },
      stubs: {
        AnalyzerLogo: true
      },
      components: { ZInput, ZButton, ZModal, ZSelect, ZOption }
    })

    //@ts-ignore
    wrapper.vm.newThresholdValue = 30
    //@ts-ignore
    wrapper.vm.analyzerToAdd = 'Metrik'
    //@ts-ignore
    wrapper.vm.closeModal()

    await wrapper.vm.$nextTick()

    //@ts-ignore
    expect(wrapper.vm.analyzerToAdd).toBe('')
    //@ts-ignore
    expect(wrapper.vm.newThresholdValue).toBe(null)

    expect(wrapper.emitted().close?.length).toBeTruthy()
  })
})
