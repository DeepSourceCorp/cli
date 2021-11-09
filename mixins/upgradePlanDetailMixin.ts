import { Component, mixins } from 'nuxt-property-decorator'

import ContextMixin from './contextMixin'
import OwnerBillingMixin from './ownerBillingMixin'
import SubscriptionMixin from './subscriptionMixin'

@Component
export default class UpgradePlanDetailMixin extends mixins(
  ContextMixin,
  OwnerBillingMixin,
  SubscriptionMixin
) {
  async fetch() {
    if (!this.context.plans) {
      await this.fetchContext()
    }
  }

  get availableUpgradePlans(): Record<string, string> {
    const { planSlug } = this.ownerBillingInfo
    const upgradeOptions = planSlug ? this.planUpgradeOptions[planSlug] : []

    const plans = upgradeOptions
      .map((planSlug) => {
        if (planSlug in this.context.plans) {
          return {
            planSlug,
            ...this.context.plans[planSlug]
          }
        }
        return null
      })
      .filter((plan) => plan !== null)

    if (plans.length > 0) {
      return plans[0]
    }
    return {}
  }

  get plansInContext(): Record<string, string>[] {
    const PLAN_ORDER = ['starter', 'pro', 'business', 'premium', 'enterprise']
    if (this.context.plans) {
      return [
        ...new Set(
          Object.keys(this.context.plans)
            .filter((planName) => planName !== 'plan-github-education-annual')
            .map((planName) => {
              return this.context.plans[planName].slug
            })
        ),
        'enterprise'
      ].sort((curr, next) => {
        return PLAN_ORDER.indexOf(curr) - PLAN_ORDER.indexOf(next)
      })
    }
    return []
  }

  subscribe(plan: string): void {
    this.setPlan({
      selectedPlan: plan
    })
    this.$router.push(this.$generateRoute(['settings', 'billing', 'subscribe', plan]))
  }

  updateBillingCycle(newValue: 'yearly' | 'monthly'): void {
    this.setPlan({
      billingCycle: newValue
    })
  }
}
