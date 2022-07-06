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
})
