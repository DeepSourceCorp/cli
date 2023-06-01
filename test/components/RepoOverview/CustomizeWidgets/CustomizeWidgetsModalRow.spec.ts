import { render } from '@testing-library/vue'

import CustomizeWidgetsModalRow from '~/components/RepoOverview/CustomizeWidgets/CustomizeWidgetsModalRow.vue'
import { cartesian, generateBooleanProps } from '~/test/utils'

describe('[[ CustomizeWidgetsModalRow ]]', () => {
  const mocks = {
    $emit: () => ''
  }

  const baseProps = {
    widgetName: 'dcv-widget',
    title: 'Documentation coverage',
    icon: 'documentation-coverage'
  }

  const stubs = {
    Draggable: true,
    ZCheckbox: true,
    ZIcon: true
  }

  test('renders the row corresponding to the dcv-widget in the modal to customize widgets', () => {
    const draggableOptions = generateBooleanProps('draggable', false)
    const isSelectedOptions = generateBooleanProps('draggable', false)

    cartesian(draggableOptions, isSelectedOptions).forEach((propCombination) => {
      const propsData = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(CustomizeWidgetsModalRow, {
        mocks,
        propsData,
        stubs
      })

      expect(html()).toMatchSnapshot()
    })
  })
})
