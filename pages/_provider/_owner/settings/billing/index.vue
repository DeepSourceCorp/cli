<template>
  <div class="grid grid-cols-1 gap-5 p-4">
    <template v-if="owner.hasPremiumPlan && !$fetchState.pending">
      <h2 class="text-lg font-medium">Billing</h2>
      <div class="max-w-2xl">
        <lazy-alert-box
          v-if="ownerBillingInfo.synced === false"
          text-color="text-honey-300"
          bg-color="bg-honey"
          class="mb-2"
        >
          <p>
            We are having trouble fetching the latest billing information from
            {{ billingBackendHandler }}. Please check your GitHub billing page for recent updates.
          </p>
        </lazy-alert-box>
        <lazy-alert-box
          v-else-if="ownerBillingInfo.pendingUpdate"
          bg-color="bg-robin"
          text-color="text-robin-150"
          class="mb-2"
        >
          <p>
            There are upcoming changes to your billing at the end of the current billing cycle.
            Please check your GitHub billing page for more updates.
          </p>
        </lazy-alert-box>
        <lazy-alert-box
          v-if="ownerBillingInfo.cancelAtPeriodEnd"
          text-color="text-honey-300"
          bg-color="bg-honey"
          class="mb-2"
        >
          <p>
            Your subscription to <span class="font-semibold"> {{ currentPlan.name }}</span> plan is
            scheduled to be canceled at the end of the current billing cycle. You will have access
            to all features in this plan until
            <span class="font-semibold">{{
              formatDate(parseISODate(ownerBillingInfo.upcomingCancellationDate))
            }}</span
            >.
          </p>
        </lazy-alert-box>
        <lazy-stripe-sca-pending-alert
          v-if="isBillingScaPending"
          :is-billing-sca-pending="isBillingScaPending"
          :current-plan-name="currentPlan.name"
          :owner-billing-info="ownerBillingInfo"
          class="mb-2"
        />
        <lazy-alert-box
          v-if="isBillingPastDue"
          text-color="text-cherry-200"
          bg-color="bg-cherry"
          class="mb-2"
        >
          <p>
            Your subscription to the <span class="font-semibold"> {{ currentPlan.name }}</span> plan
            is past its due date of
            <span class="font-semibold">{{
              formatDate(parseISODate(ownerBillingInfo.upcomingPaymentDate))
            }}</span
            >. Please check your email in order to resolve the payment.
          </p>
          <p class="mt-2">
            If no payment is made within 15 days of
            <span class="font-semibold">{{
              formatDate(parseISODate(ownerBillingInfo.upcomingPaymentDate))
            }}</span
            >, your organisation will be downgraded to the
            <span class="font-semibold">Free</span> plan.
          </p>
        </lazy-alert-box>
        <plan-info :id="owner.id"></plan-info>
      </div>
      <billing-info />
      <payment-info />
      <invoice-list v-if="isBilledByStripe" />
      <form-group
        v-if="ownerBillingInfo.cancelAtPeriodEnd && isBilledByStripe"
        label="Subscription Settings"
      >
        <resume-plan />
      </form-group>
      <form-group v-else-if="isBilledByStripe" label="Subscription Settings">
        <upgrade-plan :billing="ownerBillingInfo" @refetch="refetch" />
        <downgrade-plan :billing="ownerBillingInfo" @refetch="refetch" />
        <cancel-plan />
      </form-group>
    </template>
    <template v-else-if="!$fetchState.pending">
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
      <div class="grid max-w-3xl grid-cols-1 gap-5 rounded md:grid-cols-3">
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
import OwnerBillingMixin from '~/mixins/ownerBillingMixin'
import SubscriptionMixin from '~/mixins/subscriptionMixin'
import ContextMixin from '~/mixins/contextMixin'
import { parseISODate, formatDate } from '~/utils/date'
import { ZRadioGroup, ZRadioButton } from '@deepsourcelabs/zeal'

import { BillingInfo } from '~/types/types'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import { TeamPerms } from '~/types/permTypes'
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
  OwnerBillingMixin,
  SubscriptionMixin,
  ActiveUserMixin,
  ContextMixin
) {
  public parseISODate = parseISODate
  public formatDate = formatDate
  public loading = true

  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    const params = {
      login: owner,
      provider
    }
    await this.fetchOwnerDetails(params)
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

  get cancellationDate(): string | undefined {
    if (this.owner.billingInfo)
      return getHumanizedTimeFromNow(this.owner.billingInfo.upcomingCancellationDate)
    return undefined
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
</script>
