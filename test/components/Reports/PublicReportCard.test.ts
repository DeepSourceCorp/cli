import { render } from '@testing-library/vue'
import VTooltip from 'v-tooltip'
import { PublicReportCard } from '~/components/Reports'
import { BaseCard } from '~/components/History'
import { cartesian, generateBooleanProps, generateGenericProps } from '~/test/utils'

test('renders PublicReportCard with all prop options', () => {
  const baseProps = {
    createdAt: '2022-08-08T14:36:24.462191+00:00',
    label: 'Sample report',
    reportId: 'eaa4db3d-1334-4573-971a-1ac4235d494d',
    views: 61
  }

  const isRestricted = generateBooleanProps('isRestricted', false)
  const views = generateGenericProps('views', [0, 1, 45], false)

  cartesian(isRestricted, views).forEach((propCombination) => {
    const { html } = render(
      PublicReportCard,
      {
        props: {
          ...baseProps,
          ...propCombination
        },
        stubs: {
          ZIcon: true,
          ZButton: true,
          MetaDataItem: true,
          BaseCard: BaseCard
        }
      },
      (vue) => {
        vue.use(VTooltip)
      }
    )

    expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
  })
})
