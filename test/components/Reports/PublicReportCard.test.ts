import { render } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'
import VTooltip from 'floating-vue'

import { BaseCard } from '~/components/History'
import { PublicReportCard } from '~/components/Reports'

import { cartesian, generateBooleanProps, generateGenericProps } from '~/test/utils'

describe('[[ PublicReportCard ]]', () => {
  test('renders PublicReportCard with all prop options', () => {
    const baseProps = {
      createdAt: '2022-08-08T14:36:24.462191+00:00',
      label: 'Sample report',
      reportId: 'eaa4db3d-1334-4573-971a-1ac4235d494d',
      views: 61
    }

    const isRestricted = generateBooleanProps('isRestricted', false)
    const hasEditAccessOptions = generateBooleanProps('hasEditAccess', false)
    const views = generateGenericProps('views', [0, 1, 45], false)

    cartesian(isRestricted, hasEditAccessOptions, views).forEach((propCombination) => {
      const { html } = render(
        PublicReportCard,
        {
          components: {
            BaseCard
          },
          props: {
            ...baseProps,
            ...propCombination
          },
          stubs: {
            MetaDataItem: true,
            NuxtLink: RouterLinkStub,
            ZIcon: true,
            ZButton: true
          }
        },
        (vue) => {
          vue.use(VTooltip)
        }
      )

      expect(html()).toMatchSnapshot(JSON.stringify(propCombination))
    })
  })
})
