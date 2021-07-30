import { Component, Vue, namespace } from 'nuxt-property-decorator'

import { SubscriptionActionTypes } from '@/store/owner/subscription'

const subscriptionStore = namespace('owner/subscription')

const PLAN_UPGRADES: Record<string, string[]> = {
  'plan-pro-monthly': ['plan-premium-monthly'],
  'plan-pro-annual': ['plan-premium-annual'],
  'plan-starter-monthly': ['plan-premium-monthly'],
  'plan-starter-annual': ['plan-premium-annual'],
  'plan-github-education-annual': [],
  'plan-premium-monthly': [],
  'plan-premium-annual': []
}

const PLAN_DOWNGRADES: Record<string, string[]> = {
  'plan-pro-monthly': [],
  'plan-pro-annual': [],
  'plan-starter-monthly': [],
  'plan-starter-annual': [],
  'plan-github-education-annual': [],
  'plan-premium-monthly': ['plan-pro-monthly', 'plan-starter-monthly'],
  'plan-premium-annual': ['plan-pro-annual', 'plan-starter-annual']
}

const PLANS: Record<string, Plan> = {
  pro: {
    planName: 'Pro',
    planSlugMonthly: 'plan-pro-monthly',
    planSlugAnnual: 'plan-pro-annual',
    description: 'For open-source maintainers and small teams',
    buttonLabel: 'Upgrade to Pro',
    monthlyAmount: 15,
    annualAmount: 12,
    features: [
      'All features in Free',
      'Unlimited team members',
      'Unlimited public and private repositories'
    ]
  },
  starter: {
    planName: 'Starter',
    planSlugMonthly: 'plan-starter-monthly',
    planSlugAnnual: 'plan-starter-annual',
    description: 'For open-source maintainers and small teams',
    buttonLabel: 'Upgrade to Starter',
    monthlyAmount: 10,
    annualAmount: 8,
    features: [
      'All features in Free',
      'Unlimited team members',
      'Unlimited public and private repositories'
    ]
  },
  premium: {
    planName: 'Premium',
    planSlugMonthly: 'plan-premium-monthly',
    planSlugAnnual: 'plan-premium-annual',
    description: 'For open-source maintainers and small teams',
    buttonLabel: 'Upgrade to Premium',
    monthlyAmount: 30,
    annualAmount: 24,
    isPrimary: true,
    features: [
      'All features in Starter',
      'Access to Core, Community, and Custom analyzers',
      'Transformers, Autofix, Autopilot unlimited',
      'RBAC',
      'Audit Logs',
      'Org-level defaults configuration',
      '3 years retention of reporting data',
      'Priority support',
      'API and webhooks'
    ]
  },
  business: {
    planName: 'Business',
    planSlugMonthly: 'plan-business-monthly',
    planSlugAnnual: 'plan-business-annual',
    description: 'For open-source maintainers and small teams',
    buttonLabel: 'Upgrade to Business',
    monthlyAmount: 30,
    annualAmount: 24,
    isPrimary: true,
    features: [
      'All features in Starter',
      'Access to Core, Community, and Custom analyzers',
      'Transformers, Autofix, Autopilot unlimited',
      'RBAC',
      'Audit Logs',
      'Org-level defaults configuration',
      '3 years retention of reporting data',
      'Priority support',
      'API and webhooks'
    ]
  },
  enterprise: {
    planName: 'Enterprise',
    planSlugMonthly: '',
    planSlugAnnual: '',
    description: 'For large teams with on-premise deployments.',
    buttonLabel: 'Request a Demo',
    routeTo: '/schedule-demo',
    features: [
      'All features in Business',
      'Pre-defined number of team members',
      'Unlimited public and private repos'
    ]
  }
}

export interface Plan {
  planName: string
  annualAmount?: number
  monthlyAmount?: number
  planSlugMonthly: string
  planSlugAnnual: string
  isPrimary?: boolean
  description?: string
  buttonLabel?: string
  routeTo?: string
  features?: string[]
}
@Component
export default class SubscriptionMixin extends Vue {
  @subscriptionStore.State
  readonly selectedPlan: string

  @subscriptionStore.State
  readonly billingCycle: 'yearly' | 'monthly'

  @subscriptionStore.State
  readonly seats: number

  @subscriptionStore.Action(SubscriptionActionTypes.SET_PLAN)
  setPlan: (args: {
    selectedPlan?: string
    billingCycle?: 'yearly' | 'monthly'
    seats?: number
  }) => void

  @subscriptionStore.Action(SubscriptionActionTypes.RESET_PLAN)
  resetPlan: () => void

  public planDetails = PLANS
  public planUpgradeOptions = PLAN_UPGRADES
  public planDowngradeOptions = PLAN_DOWNGRADES
}
