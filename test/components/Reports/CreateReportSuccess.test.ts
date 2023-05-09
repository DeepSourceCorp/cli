import { render } from '@testing-library/vue'
import { VueConstructor } from 'vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'

import VTooltip from 'v-tooltip'
import { CreateReportSuccess } from '~/components/Reports'

import { cartesian, generateBooleanProps, generateStringProps } from '~/test/utils'
import { mocksGenerator } from '~/test/mocks'

interface CreateReportSuccessT extends Vue {
  formattedUrl: string
  reportDetails: string
}

describe('[[ CreateReportSuccess ]]', () => {
  let localVue: VueConstructor<Vue>

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(VTooltip)
  })

  const baseProps = {
    reportId: '123456'
  }

  const stubs = {
    ZAlert: true,
    ZButton: true,
    ZIcon: true,
    ZInput: true,
    ZDialogGeneric: true,
    CopyButton: true
  }

  const mockData = mocksGenerator()

  test('renders CreateReportSuccess with all prop options', () => {
    const editModeValues = generateBooleanProps('editMode')
    const passwordValues = generateStringProps('password', ['deepsource'])

    cartesian(editModeValues, passwordValues).forEach((propCombination) => {
      const { html } = render(CreateReportSuccess, {
        props: {
          ...baseProps,
          ...propCombination
        },
        stubs,
        mocks: mockData,
        localVue
      })

      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })

  describe('[[ CreateReportSuccess getters ]]', () => {
    describe('[[ formattedUrl ]]', () => {
      test('Test for formattedUrl getter when password not available', () => {
        const wrapper = shallowMount(CreateReportSuccess, {
          stubs,
          propsData: baseProps,
          mocks: mockData,
          localVue
        })

        const vm = wrapper.vm as CreateReportSuccessT

        const { reportId } = baseProps

        const url = `${window.location.origin}/report/${reportId}`

        // Test formattedUrl returns correct value
        expect(vm.formattedUrl).toBe(url)
      })
    })

    describe('[[ reportDetails ]]', () => {
      test('Test for reportDetails getter when password not available', () => {
        const wrapper = shallowMount(CreateReportSuccess, {
          stubs,
          propsData: baseProps,
          mocks: mockData,
          localVue
        })

        const vm = wrapper.vm as CreateReportSuccessT

        const { formattedUrl } = vm

        const details = `View report -\nLink - ${formattedUrl}`

        // Test reportDetails returns correct value
        expect(vm.reportDetails).toBe(details)
      })

      test('Test for reportDetails getter when password is available', () => {
        const props = {
          ...baseProps,
          password: 'deepsource'
        }
        const wrapper = shallowMount(CreateReportSuccess, {
          stubs,
          propsData: props,
          mocks: mockData,
          localVue
        })

        const vm = wrapper.vm as CreateReportSuccessT

        const { formattedUrl } = vm
        const { password } = props

        const details = `View report -\nLink - ${formattedUrl}\nPassword - ${password}`

        // Test reportDetails returns correct value
        expect(vm.reportDetails).toBe(details)
      })
    })
  })
})
