<template>
  <div class="space-y-5">
    <h2 class="text-lg font-medium">Upgrade to get more for your team</h2>
    <z-radio-group
      :model-value="billingCycle"
      class="flex font-medium"
      @change="updateBillingCycle"
    >
      <z-radio-button value="yearly">
        Pay yearly <span class="inline text-juniper">(Save 20%)</span>
      </z-radio-button>
      <z-radio-button value="monthly"> Pay monthly </z-radio-button>
    </z-radio-group>

    <!-- Apply classes conditionally based on the current plan tier
    For `free plan` there are 3 available upgrade plans
    For `paid plan`, the current plan is excluded from the view -->
    <div
      class="grid grid-cols-1 gap-5 rounded max-w-4xl md:grid-cols-3 xl:grid-cols-3"
      :class="hasPaidPlan ? 'lg:grid-cols-2' : 'lg:grid-cols-1'"
    >
      <plan-card
        v-for="name in plans"
        :key="name"
        :name="name"
        :billing-cycle="billingCycle"
        :current-plan-name="hasPaidPlan ? currentPlan.name : null"
        v-bind="planDetails[name]"
        @next="subscribe"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { ZRadioButton, ZRadioGroup } from '@deepsource/zeal'

import PlanDetailMixin from '~/mixins/planDetailMixin'

@Component({
  components: {
    ZRadioButton,
    ZRadioGroup
  }
})
export default class PlanCards extends mixins(PlanDetailMixin) {
  @Prop({ default: false })
  hasPaidPlan!: boolean

  get plans() {
    // Show all plan cards for the free tier
    if (!this.hasPaidPlan) {
      return this.plansInContext
    }
    return this.plansInContext.filter((plan) => plan !== this.currentPlan.slug)
  }

  subscribe(plan: string): void {
    this.setPlan({
      selectedPlan: plan
    })
    this.$router.push(this.$generateRoute(['settings', 'billing', 'subscribe', plan]))
  }
}
</script>
