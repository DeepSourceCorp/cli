import { AnalyzerConnection } from '~/types/types'
import { AnalyzerListModuleState } from '~/store/analyzer/list'

/**
 * Mock for Analyzer list.
 */
export const ANALYZER_LIST: AnalyzerConnection = <AnalyzerConnection>{
  edges: [
    {
      node: {
        id: 'QW5hbHl6ZXI6MTA=',
        name: 'Dockerfile',
        shortcode: 'docker'
      }
    },
    {
      node: {
        id: 'QW5hbHl6ZXI6Mg==',
        name: 'Test Coverage',
        shortcode: 'test-coverage'
      }
    },
    {
      node: {
        id: 'QW5hbHl6ZXI6MTE=',
        name: 'Terraform',
        shortcode: 'terraform'
      }
    },
    {
      node: {
        id: 'QW5hbHl6ZXI6MTU=',
        name: 'SQL',
        shortcode: 'sql'
      }
    },
    {
      node: {
        id: 'QW5hbHl6ZXI6MTI=',
        name: 'Ruby',
        shortcode: 'ruby'
      }
    },
    {
      node: {
        id: 'QW5hbHl6ZXI6MQ==',
        name: 'Python',
        shortcode: 'python'
      }
    },
    {
      node: {
        id: 'QW5hbHl6ZXI6OQ==',
        name: 'Go',
        shortcode: 'go'
      }
    },
    {
      node: {
        id: 'QW5hbHl6ZXI6MTM=',
        name: 'JavaScript',
        shortcode: 'javascript'
      }
    }
  ]
}

/**
 * Mock -- Analyzer list factory
 * @see ANALYZER_LIST
 */
export const mockAnalyzerList = (): AnalyzerConnection => ANALYZER_LIST

/**
 * Mock factory
 */
export const mockAnalyzerListState = (): AnalyzerListModuleState => ({
  loading: false as boolean,
  error: {},
  analyzerList: mockAnalyzerList()
})
