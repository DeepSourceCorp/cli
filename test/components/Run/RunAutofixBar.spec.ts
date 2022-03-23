import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import VTooltip from 'v-tooltip'

import { cartesian, generateBooleanProps } from '~/test/utils'
import RunAutofixBar from '../../../components/Run/RunAutofixBar.vue'

describe('[[ RunAutofixBar ]]', () => {
  test('renders `RunAutofixBar` with all prop options', () => {
    const baseProps = {
      id: 'Q2hlY2s6enFkbmpv',
      autofixableIssues: [
        {
          shortcode: 'BAN-B101',
          title: 'Assert statement used outside of tests',
          category: 'security',
          occurrenceCount: 1
        }
      ],
      filesAffectedByAutofix: 1
    }

    const canCreateAutofixOptions = generateBooleanProps('canCreateAutofix', false)

    cartesian(canCreateAutofixOptions).forEach((propCombination) => {
      const props = {
        ...baseProps,
        ...propCombination
      }

      const { html } = render(
        RunAutofixBar,
        {
          props,
          stubs: {
            AutofixIssuesChooser: true,
            ZButton: true
          }
        },
        (vue) => {
          vue.use(VTooltip)
        }
      )

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })
})
