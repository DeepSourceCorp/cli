import { IssuePriorityListModuleState } from '~/store/issuePriority/list'
import {
  PageInfo,
  IssueConnection,
  UpdateIssuePriorityPayload,
  IssuePriorityLevel
} from '~/types/types'
import { GraphqlQueryResponse } from '~/types/apollo-graphql-types'

export const issueWithPriorityList: IssueConnection = {
  totalCount: 4,
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false
  },
  edges: [
    {
      node: {
        id: 'SXNzdWU6Ym93d3di',
        issueType: 'typecheck',
        title: 'Invalid `Literal[...]` type hint',
        shortcode: 'TYP-041',
        description:
          'Arbitrary arguments are given to `Literal[...]`, which makes it an invalid type. It is recommended to remove the arbitrary arguments.',
        // @ts-ignore
        analyzer: {
          id: 'QW5hbHl6ZXI6bGtiZXZ6',
          name: 'Python',
          logo: 'analyzer_logos/python.svg',
          analyzerLogo: null,
          shortcode: 'python'
        },
        issuePriority: {
          // @ts-ignore
          repositoryIssuePriority: {
            id: 'SXNzdWVQcmlvcml0eVR5cGU6bm9vcA==',
            slug: 'noop',
            weight: 0,
            verboseName: 'No priority'
          },
          // @ts-ignore
          ownerIssuePriority: {
            id: 'SXNzdWVQcmlvcml0eVR5cGU6aGlnaA==',
            slug: 'high',
            weight: 75,
            verboseName: 'High'
          }
        }
      }
    },
    {
      node: {
        id: 'SXNzdWU6b2x6cW5i',
        issueType: 'security',
        title: 'Generic exception caught and silently ignored in a loop',
        shortcode: 'BAN-B112',
        description:
          'Catching generic exceptions and silently ignoring them in a loop is considered bad practice in general, but also presents a potential security issue. A larger than normal volume of errors from a service can indicate an attempt is being made to disrupt or interfere with it. Thus errors should, at the very least, be logged.',
        // @ts-ignore
        analyzer: {
          id: 'QW5hbHl6ZXI6bGtiZXZ6',
          name: 'Python',
          logo: 'analyzer_logos/python.svg',
          analyzerLogo: null,
          shortcode: 'python'
        },
        issuePriority: {
          // @ts-ignore
          repositoryIssuePriority: {
            id: 'SXNzdWVQcmlvcml0eVR5cGU6bWVkaXVt',
            slug: 'medium',
            weight: 50,
            verboseName: 'Medium'
          },
          // @ts-ignore
          ownerIssuePriority: {
            id: 'SXNzdWVQcmlvcml0eVR5cGU6aGlnaA==',
            slug: 'high',
            weight: 75,
            verboseName: 'High'
          }
        }
      }
    },
    {
      node: {
        id: 'SXNzdWU6YnJnbWt6',
        issueType: 'bug-risk',
        title: 'Format string truncated',
        shortcode: 'PYL-E1301',
        description:
          'The format string was terminated before the end of a conversion specifier. It is recommended to look again and verify if the conversion specifier is given.',
        // @ts-ignore
        analyzer: {
          id: 'QW5hbHl6ZXI6bGtiZXZ6',
          name: 'Python',
          logo: 'analyzer_logos/python.svg',
          analyzerLogo: null,
          shortcode: 'python'
        },
        issuePriority: {
          // @ts-ignore
          repositoryIssuePriority: {
            id: 'SXNzdWVQcmlvcml0eVR5cGU6bG93',
            slug: 'low',
            weight: 25,
            verboseName: 'Low'
          },
          // @ts-ignore
          ownerIssuePriority: {
            id: 'SXNzdWVQcmlvcml0eVR5cGU6bWVkaXVt',
            slug: 'medium',
            weight: 50,
            verboseName: 'Medium'
          }
        }
      }
    },
    {
      node: {
        id: 'SXNzdWU6eGJha2di',
        issueType: 'bug-risk',
        title: 'Dangerous default argument',
        shortcode: 'PYL-W0102',
        description:
          'Do not use a mutable like `list` or `dictionary` as a default value to an argument. Python’s default arguments are evaluated once when the function is defined. Using a mutable default argument and mutating it will mutate that object for all future calls to the function as well.',
        // @ts-ignore
        analyzer: {
          id: 'QW5hbHl6ZXI6bGtiZXZ6',
          name: 'Python',
          logo: 'analyzer_logos/python.svg',
          analyzerLogo: null,
          shortcode: 'python'
        },
        issuePriority: {
          // @ts-ignore
          repositoryIssuePriority: {
            id: 'SXNzdWVQcmlvcml0eVR5cGU6aGlnaA==',
            slug: 'high',
            weight: 75,
            verboseName: 'High'
          },
          ownerIssuePriority: null
        }
      }
    }
  ]
}

export const issuePriorityListResponse: GraphqlQueryResponse = {
  data: { issuesWithPriority: issueWithPriorityList }
}

export const updateIssuePriorityResponse: UpdateIssuePriorityPayload = {
  issue: {
    id: 'SXNzdWU6Ym93d3di',
    issueType: 'typecheck',
    title: 'Invalid `Literal[...]` type hint',
    shortcode: 'TYP-041',
    description:
      'Arbitrary arguments are given to `Literal[...]`, which makes it an invalid type. It is recommended to remove the arbitrary arguments.',
    // @ts-ignore
    analyzer: {
      name: 'Python',
      logo: 'analyzer_logos/python.svg'
    },
    issuePriority: {
      // @ts-ignore
      cascadingIssuePriority: {
        slug: 'low',
        verboseName: 'Low',
        weight: 25
      },
      source: IssuePriorityLevel.Owner
    }
  }
}

export const mockStateEmpty = (): IssuePriorityListModuleState => ({
  issuesWithPriority: { pageInfo: {} as PageInfo, edges: [] }
})

export const mockStateFilled = (): IssuePriorityListModuleState => ({
  issuesWithPriority: issueWithPriorityList
})
