import { Owner } from '~/types/types'
import { OwnerDetailModuleState } from '~/store/owner/detail'

/**
 * Mock for owner details.
 */
export const OWNER_DETAILS: Owner = <Owner>{
  id: 'T3duZXJTZXR0aW5nOjM0',
  isTeam: true,
  avatar:
    'http://dev-asgard-static.s3.us-east-1.amazonaws.com/avatars/43888ad2-955f-4bee-a394-e5587fbbc7c7.jpeg',
  vcsInstallationId: '7054915',
  hasSubscribedToPlan: true,
  isGsrSshRegistered: false,
  gsrSetupPending: false,
  autofixInstallationUrl:
    'https://github.com/apps/None/installations/new/permissions?target_id=40287229&state=Ymlmcm9zdA==',
  isAutofixEnabled: true,
  isAutoonboardAllowed: true,
  hasPremiumPlan: true,
  canOnboard: false,
  team: {
    id: 'VGVhbTpxemxyeHo='
  },
  primaryUser: {
    id: 'VXNlcjpkemdkeWI=',
    email: 'johndoe@xyz.com',
    fullName: 'John Doe'
  }
}

/**
 * Mock for issue type settings.
 */
export const OWNER_DETAIL_ISSUE_TYPE_SETTINGS: Owner = <Owner>{
  id: 'T3duZXI6NjM=',
  ownerSetting: {
    id: 'T3duZXJTZXR0aW5nOjM0',
    issueTypeSettings: [
      {
        slug: 'bug-risk',
        name: 'Bug Risk',
        isIgnoredInCheckStatus: false,
        isIgnoredToDisplay: false,
        description: null
      },
      {
        slug: 'antipattern',
        name: 'Anti-pattern',
        isIgnoredInCheckStatus: false,
        isIgnoredToDisplay: false,
        description: null
      },
      {
        slug: 'performance',
        name: 'Performance',
        isIgnoredInCheckStatus: true,
        isIgnoredToDisplay: true,
        description: null
      },
      {
        slug: 'security',
        name: 'Security',
        isIgnoredInCheckStatus: true,
        isIgnoredToDisplay: true,
        description: null
      },
      {
        slug: 'typecheck',
        name: 'Typecheck',
        isIgnoredInCheckStatus: true,
        isIgnoredToDisplay: true,
        description: null
      },
      {
        slug: 'coverage',
        name: 'Coverage',
        isIgnoredInCheckStatus: true,
        isIgnoredToDisplay: true,
        description: null
      },
      {
        slug: 'style',
        name: 'Style',
        isIgnoredInCheckStatus: true,
        isIgnoredToDisplay: true,
        description: null
      },
      {
        slug: 'doc',
        name: 'Documentation',
        isIgnoredInCheckStatus: true,
        isIgnoredToDisplay: true,
        description: null
      }
    ],
    shouldTimeoutDataTrigger: false
  }
}

/**
 * Mock -- Issue type settings factory
 * @see OWNER_DETAIL_ISSUE_TYPE_SETTINGS
 */
export const mockOwnerDetailIssueTypeSettings = (): Owner => OWNER_DETAIL_ISSUE_TYPE_SETTINGS

const emptyTrend = { labels: [], values: [] }

/**
 * Mock factory
 */
export const mockOwnerDetail = (): OwnerDetailModuleState => ({
  loading: false,
  error: {},
  owner: mockOwnerDetailIssueTypeSettings(),
  autofixTrend: emptyTrend,
  issueTrend: emptyTrend,
  resolvedIssueTrend: emptyTrend,
  billingInfo: undefined
})
