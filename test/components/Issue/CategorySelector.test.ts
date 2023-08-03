import { render } from '@testing-library/vue'
import VTooltip from 'floating-vue'

import { IssueCategorySelector } from '~/components/Issue'

describe('[[ CategorySelector ]]', () => {
  const stubs = {
    ZIcon: true,
    ZTag: true
  }

  const props = {
    issueCategories: [
      { name: 'All issues', shortcode: 'all', icon: 'all' },
      { name: 'Recommended', shortcode: 'recommended', icon: 'star' },
      { name: 'Bug Risk', shortcode: 'bug-risk', icon: 'bug-risk' },
      { name: 'Anti-pattern', shortcode: 'antipattern', icon: 'antipattern' },
      { name: 'Security', shortcode: 'security', icon: 'security' },
      { name: 'Performance', shortcode: 'performance', icon: 'performance' },
      { name: 'Typecheck', shortcode: 'typecheck', icon: 'typecheck' },
      { name: 'Coverage', shortcode: 'coverage', icon: 'coverage' },
      { name: 'Style', shortcode: 'style', icon: 'style' },
      { name: 'Documentation', shortcode: 'doc', icon: 'doc' }
    ],
    occurrenceCounts: {
      all: 155,
      recommended: 5,
      'bug-risk': 4,
      antipattern: 2,
      style: 66,
      security: 7,
      performance: 0,
      doc: 76,
      typecheck: 0,
      coverage: 0
    }
  }

  test('renders the list of issue category items', () => {
    const { html } = render(IssueCategorySelector, { stubs, props }, (vue) => {
      vue.use(VTooltip)
    })

    expect(html()).toMatchSnapshot()
  })
})
