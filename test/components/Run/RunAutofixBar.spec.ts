import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import VTooltip from 'floating-vue'

import { cartesian, generateBooleanProps } from '~/test/utils'
import RunAutofixBar from '../../../components/Run/RunAutofixBar.vue'

const mocks = {
  $generateRoute: jest
    .fn()
    .mockImplementation(
      () => 'gh/deepsourcelabs/demo-python/run/4c1d5e1b-1747-4777-9618-acae5c51ca5d/python/BAN-B101'
    ),
  $route: {
    query: '',
    params: {
      provider: 'gh',
      owner: 'deepsourcelabs',
      repo: 'demo-python',
      runId: '4c1d5e1b-1747-4777-9618-acae5c51ca5d',
      analyzer: 'python',
      shortcode: 'BAN-B101'
    }
  }
}

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
            ZButton: true,
            ZAccordion: true,
            ZAccordionItem: true,
            ZCheckbox: true,
            ZIcon: true
          },
          mocks
        },
        (vue) => {
          vue.use(VTooltip)
        }
      )

      expect(html()).toMatchSnapshot(JSON.stringify(props))
    })
  })
})
