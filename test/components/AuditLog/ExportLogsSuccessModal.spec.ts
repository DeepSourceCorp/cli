import { render } from '@testing-library/vue'

import ExportLogsSuccessModal from '~/components/AuditLog/ExportLogsSuccessModal.vue'
import { cartesian, generateBooleanProps } from '~/test/utils'

describe('[[ ExportLogsSuccessModal ]]', () => {
  const baseProps = {
    startDate: 'January 4, 2023',
    endDate: 'April 4, 2023',
    viewerEmail: 'johndoe@test.com'
  }

  const stubs = {
    portal: true,
    ZButton: true,
    ZIcon: true,
    ZModal: true
  }

  it('renders different states of the export logs success modal', () => {
    const loadingOptions = generateBooleanProps('loading', false)
    const showExportLogsSuccessModalOptions = generateBooleanProps(
      'showExportLogsSuccessModal',
      false
    )

    cartesian(loadingOptions, showExportLogsSuccessModalOptions).forEach((propCombination) => {
      const propsData = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(ExportLogsSuccessModal, { propsData, stubs })
      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })
})
