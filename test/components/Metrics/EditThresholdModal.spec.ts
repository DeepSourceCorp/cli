import { render } from '@testing-library/vue'
import { EditThresholdModal } from '~/components/Metrics'
import { VTooltip } from 'v-tooltip'
import { VueConstructor } from 'vue'
import { ZInput, ZButton, ZModal } from '@deepsourcelabs/zeal'
import { shallowMount } from '@vue/test-utils'
import { cartesian, generateStringProps } from '~/test/utils'

const injectDirective = (vue: VueConstructor) => vue.directive('tooltip', VTooltip)

describe('[[EditThresholdModal]]', () => {
  test('renders EditThresholdModal with all prop options', async () => {
    const baseProps = {
      thresholdValue: 20,
      metricName: 'Zane Alexander',
      analyzerKey: 'Your Convictions Are Your Own',
      metricShortcode: 'ZALX',
      repositoryId: '0987',
      unit: '%'
    }

    //? `await` is needed since we wait for the `<transition>` to render, despite what the types say.
    //! Do not remove `await`
    const { html } = await render(
      EditThresholdModal,
      {
        props: { ...baseProps },
        stubs: {
          AnalyzerLogo: true
        },
        components: { ZInput, ZButton, ZModal }
      },
      injectDirective
    )

    expect(html()).toMatchSnapshot(JSON.stringify(baseProps))
  })

  describe('validateThreshold', () => {
    test('valid % value', async () => {
      const baseProps = {
        thresholdValue: 20,
        metricName: 'Zane Alexander',
        analyzerKey: 'Your Convictions Are Your Own',
        metricShortcode: 'ZALX',
        repositoryId: '0987',
        unit: '%'
      }

      const { vm } = await shallowMount(EditThresholdModal, {
        propsData: { ...baseProps },
        stubs: {
          AnalyzerLogo: true
        },
        components: { ZInput, ZButton, ZModal }
      })

      const valueToTest = '35'

      //@ts-ignore
      vm.validateThreshold(valueToTest)
      //@ts-ignore
      expect(vm.thresholdInputError).toBe(false)
    })

    test('valid numerical value', async () => {
      const baseProps = {
        thresholdValue: 20,
        metricName: 'Zane Alexander',
        analyzerKey: 'Your Convictions Are Your Own',
        metricShortcode: 'ZALX',
        repositoryId: '0987',
        unit: ''
      }

      const { vm } = await shallowMount(EditThresholdModal, {
        propsData: { ...baseProps },
        stubs: {
          AnalyzerLogo: true
        },
        components: { ZInput, ZButton, ZModal }
      })

      const valueToTest = '135'

      //@ts-ignore
      vm.validateThreshold(valueToTest)
      //@ts-ignore
      expect(vm.thresholdInputError).toBe(false)
    })

    test('invalid % value', async () => {
      const baseProps = {
        thresholdValue: 20,
        metricName: 'Zane Alexander',
        analyzerKey: 'Your Convictions Are Your Own',
        metricShortcode: 'ZALX',
        repositoryId: '0987',
        unit: '%'
      }

      const { vm } = await shallowMount(EditThresholdModal, {
        propsData: { ...baseProps },
        stubs: {
          AnalyzerLogo: true
        },
        components: { ZInput, ZButton, ZModal }
      })

      const valueToTest = '115'

      //@ts-ignore
      vm.validateThreshold(valueToTest)
      //@ts-ignore
      expect(vm.thresholdInputError).toBe(true)
    })

    test('invalid % or numerical value', async () => {
      const baseProps = {
        thresholdValue: 20,
        metricName: 'Zane Alexander',
        analyzerKey: 'Your Convictions Are Your Own',
        metricShortcode: 'ZALX',
        repositoryId: '0987'
      }

      const unitProps = generateStringProps('unit', ['', '%'], false)

      cartesian(unitProps).forEach(async (generatedProps) => {
        const { vm } = await shallowMount(EditThresholdModal, {
          propsData: { ...baseProps, ...generatedProps },
          stubs: {
            AnalyzerLogo: true
          },
          components: { ZInput, ZButton, ZModal }
        })

        const valueToTest = '-35'

        //@ts-ignore
        vm.validateThreshold(valueToTest)
        //@ts-ignore
        expect(vm.thresholdInputError).toBe(true)
      })
    })
  })

  test('setThreshold', async () => {
    const baseProps = {
      thresholdValue: 20,
      metricName: 'Zane Alexander',
      analyzerKey: 'Your Convictions Are Your Own',
      metricShortcode: 'ZALX',
      repositoryId: '0987',
      unit: '%'
    }

    const { vm } = await shallowMount(EditThresholdModal, {
      propsData: { ...baseProps },
      stubs: {
        AnalyzerLogo: true
      },
      components: { ZInput, ZButton, ZModal }
    })

    const valueToTest = '35'

    //@ts-ignore
    vm.setThresholdValue(valueToTest)
    //@ts-ignore
    expect(vm.newThresholdValue).toBe(Number(valueToTest))
  })

  test('resetErrorState', async () => {
    const baseProps = {
      thresholdValue: 20,
      metricName: 'Zane Alexander',
      analyzerKey: 'Your Convictions Are Your Own',
      metricShortcode: 'ZALX',
      repositoryId: '0987',
      unit: '%'
    }

    const { vm } = await shallowMount(EditThresholdModal, {
      propsData: { ...baseProps },
      stubs: {
        AnalyzerLogo: true
      },
      components: { ZInput, ZButton, ZModal }
    })

    //@ts-ignore
    vm.thresholdInputError = true

    //@ts-ignore
    vm.resetErrorState()

    //@ts-ignore
    expect(vm.thresholdInputError).toBe(false)
  })

  test('fullReset', async () => {
    const baseProps = {
      thresholdValue: 20,
      metricName: 'Zane Alexander',
      analyzerKey: 'Your Convictions Are Your Own',
      metricShortcode: 'ZALX',
      repositoryId: '0987',
      unit: '%'
    }

    const { vm } = await shallowMount(EditThresholdModal, {
      propsData: { ...baseProps },
      stubs: {
        AnalyzerLogo: true
      },
      components: { ZInput, ZButton, ZModal }
    })

    //@ts-ignore
    vm.newThresholdValue = 30
    //@ts-ignore
    vm.thresholdInputError = true

    //@ts-ignore
    vm.fullReset()

    //@ts-ignore
    expect(vm.newThresholdValue).toBe(undefined)
    //@ts-ignore
    expect(vm.thresholdInputError).toBe(false)
  })

  describe('updateThreshold', () => {
    test('emits data correctly on no error', async () => {
      const baseProps = {
        thresholdValue: 20,
        metricName: 'Zane Alexander',
        analyzerKey: 'Your Convictions Are Your Own',
        metricShortcode: 'ZALX',
        repositoryId: '0987',
        unit: '%'
      }

      const wrapper = await shallowMount(EditThresholdModal, {
        propsData: { ...baseProps },
        stubs: {
          AnalyzerLogo: true
        },
        components: { ZInput, ZButton, ZModal }
      })

      //@ts-ignore
      wrapper.vm.newThresholdValue = 30
      //@ts-ignore
      wrapper.vm.thresholdInputError = false
      //@ts-ignore
      wrapper.vm.updateThreshold()

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted().editThreshold?.length).toBeTruthy()
      expect(wrapper.emitted().editThreshold?.[0]).toEqual([
        30,
        'Your Convictions Are Your Own',
        undefined
      ])
    })

    test('invokes toast when it has error', async () => {
      const baseProps = {
        thresholdValue: 20,
        metricName: 'Zane Alexander',
        analyzerKey: 'Your Convictions Are Your Own',
        metricShortcode: 'ZALX',
        repositoryId: '0987',
        unit: '%'
      }

      const localThis = {
        $toast: {
          danger: jest.fn()
        }
      }

      const wrapper = await shallowMount(EditThresholdModal, {
        propsData: { ...baseProps },
        stubs: {
          AnalyzerLogo: true
        },
        components: { ZInput, ZButton, ZModal },
        mocks: { ...localThis }
      })

      //@ts-ignore
      wrapper.vm.newThresholdValue = 30
      //@ts-ignore
      wrapper.vm.thresholdInputError = true
      //@ts-ignore
      wrapper.vm.updateThreshold()

      expect(localThis.$toast.danger).toBeCalledTimes(1)
    })
  })
})
