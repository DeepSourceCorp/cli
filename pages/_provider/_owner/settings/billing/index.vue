<template>
  <div class="grid grid-cols-1 gap-6 p-5">
    <template v-if="owner.hasPremiumPlan && !loading">
      <h2 class="text-lg font-medium">Billing</h2>
      <plan-info :billing="billing" :id="owner.id"></plan-info>
      <billing-info></billing-info>
      <invoice-list></invoice-list>
      <form-group label="Subscription Settings">
        <upgrade-plan :billing="billing" @refetch="refetch" />
        <downgrade-plan :billing="billing" @refetch="refetch" />
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
    <!-- form-group label="Account Settings">
      <button-input
        label="Delete DeepSource"
        inputId="repo-settings-analysis-config"
        buttonType="danger"
        buttonLabel="Delete DeepSource"
        inputWidth="small"
        icon="x"
      >
        <template slot="description">
          Deleting this organization will permanently delete the deepsource.toml from your
          repositories. <a href="#" class="text-juniper hover:underline">Learn more.</a>
        </template>
      </button-input>
    </form-group>-->
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
