import { render } from '@testing-library/vue'

import AnalyzerList from '~/components/Repository/AnalyzerList.vue'

describe('[[ AnalyzerList ]]', () => {
  const propsData = {
    availableAnalyzers: {
      edges: [
        {
          node: {
            id: 'QW5hbHl6ZXI6cnlieXZ6',
            shortcode: 'go',
            name: 'Go',
            logo: 'analyzer_logos/go.svg',
            analyzerLogo:
              'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/go.svg?v=1592555094'
          }
        },
        {
          node: {
            id: 'QW5hbHl6ZXI6b2x6cW5i',
            shortcode: 'docker',
            name: 'Dockerfile',
            logo: 'analyzer_logos/docker.svg',
            analyzerLogo:
              'http://local-asgard-static-csv.s3.us-east-1.amazonaws.com/analyzer_logos/docker.svg?v=1590404051'
          }
        }
      ]
    }
  }

  const stubs = {
    AnalyzerLogo: true,
    ZIcon: true,
    ZMenu: true,
    ZTag: true
  }

  test('renders the list of Analyzers in the metadata view', () => {
    const { html } = render(AnalyzerList, { propsData, stubs })
    expect(html()).toMatchSnapshot()
  })
})
