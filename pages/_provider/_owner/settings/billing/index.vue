<template>
  <div class="grid grid-cols-1 gap-6 p-4">
    <template v-if="owner.hasPremiumPlan && !loading">
      <h2 class="text-lg font-medium">Billing</h2>
      <div class="max-w-2xl">
        <alert-box
          v-if="billing.synced === false"
          text-color="text-light-honey"
          bg-color="bg-honey"
          class="mb-1"
        >
          <p>
            We are having trouble fetching the latest billing information from
            {{ billingBackendHandler }}. Please check your GitHub billing page for recent updates.
          </p>
        </alert-box>
        <alert-box
          v-else-if="billing.pendingUpdate"
          bg-color="bg-robin"
          text-color="text-light-robin"
          class="mb-1"
        >
          <p>
            The billing information displayed might be outdated. Please check your GitHub billing
            page for recent updates.
          </p>
        </alert-box>
        <alert-box
          v-if="billing.cancelAtPeriodEnd"
          text-color="text-light-honey"
          bg-color="bg-honey"
          class="mb-1"
        >
          <p>
            Your subscription to <span class="font-semibold"> {{ currentPlan.name }}</span> plan is
            scheduled to be canceled at the end of the current billing cycle. You will have access
            to all features in this plan until
            <span class="font-semibold">{{
              formatDate(parseISODate(owner.billingInfo.upcomingCancellationDate))
            }}</span
            >.
          </p>
        </alert-box>
        <plan-info :billing="billing" :id="owner.id" :current-plan="currentPlan"></plan-info>
      </div>
      <billing-info :billing="billing" :billed-by="billingBackendHandler" />
      <invoice-list v-if="isBilledByDeepSource" />
      <form-group
        v-if="billing.cancelAtPeriodEnd && isBilledByDeepSource"
        label="Subscription Settings"
      >
        <resume-plan />
      </form-group>
      <form-group v-else-if="isBilledByDeepSource" label="Subscription Settings">
        <upgrade-plan :billing="billing" @refetch="refetch" />
        <downgrade-plan :billing="billing" @refetch="refetch" />
        <cancel-plan />
      </form-group>
    </template>
    <template v-else-if="!loading">
      <h2 class="text-lg font-medium">Upgrade to get more for your team</h2>
      <z-radio-group
        :modelValue="billingCycle"
        @change="updateBillingCycle"
        class="flex font-medium"
      >
        <z-radio-button value="yearly">
          Pay yearly <span class="inline text-juniper">(Save 20%)</span>
        </z-radio-button>
        <z-radio-button value="monthly"> Pay monthly </z-radio-button>
      </z-radio-group>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl rounded">
        <plan-card
          v-for="name in plansInContext"
          :key="name"
          :name="name"
          :billingCycle="billingCycle"
          v-bind="planDetails[name]"
          @next="subscribe"
        ></plan-card>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { mixins, Component } from 'nuxt-property-decorator'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import SubscriptionMixin from '~/mixins/subscriptionMixin'
import ContextMixin from '~/mixins/contextMixin'
import { parseISODate, formatDate } from '~/utils/date'
import { ZRadioGroup, ZRadioButton } from '@deepsourcelabs/zeal'

import { BillingInfo } from '~/types/types'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import { TeamPerms } from '~/types/permTypes'
import BillingBackend from '~/types/billingBackend'
import { getHumanizedTimeFromNow } from '~/utils/date'

const PLAN_ORDER = ['starter', 'pro', 'business', 'premium', 'enterprise']

@Component({
  components: {
    ZRadioGroup,
    ZRadioButton
  },
  middleware: ['teamOnly', 'perm', 'validateProvider'],
  meta: {
    auth: {
      strict: true,
      teamPerms: [
        TeamPerms.CHANGE_PLAN,
        TeamPerms.UPDATE_SEATS,
        TeamPerms.DELETE_TEAM_ACCOUNT,
        TeamPerms.UPDATE_BILLING_DETAILS
      ]
    }
  },
  layout: 'dashboard'
})
export default class BillingSettings extends mixins(
  OwnerDetailMixin,
  SubscriptionMixin,
  ActiveUserMixin,
  ContextMixin
) {
  async fetch(): Promise<void> {
    this.loading = true
    const { owner, provider } = this.$route.params
    const params = {
      login: owner,
      provider
    }
    await this.fetchOwnerDetails(params)
    this.loading = false
    await this.fetchBillingDetails(params)
  }

  async refetch(): Promise<void> {
    await this.refetchUser()
  }

  get plansInContext(): Record<string, string>[] {
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

  get billing(): BillingInfo | {} {
    return this.owner.billingInfo ? this.owner.billingInfo : {}
  }

  get billingBackendHandler(): string {
    if (Object.keys(this.billing).length)
      return ((this.billing as BillingInfo).billingBackend as BillingBackend) === 'st'
        ? 'Stripe'
        : 'GitHub'
    return ''
  }

  get isBilledByDeepSource(): boolean {
    return this.billingBackendHandler === 'Stripe'
  }

  get cancellationDate(): string | undefined {
    if (this.owner.billingInfo)
      return getHumanizedTimeFromNow(this.owner.billingInfo.upcomingCancellationDate)
    return undefined
  }

  get currentPlan(): Record<string, string | number> {
    if (Object.keys(this.billing).length) {
      const { planSlug } = this.billing as BillingInfo
      if (planSlug) return this.context.plans[planSlug]
    }
    return {}
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

  private parseISODate = parseISODate
  private formatDate = formatDate
  private loading = true
}
</script>
