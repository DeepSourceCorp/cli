<template>
  <div class="grid gap-5">
    <h2 class="text-lg font-medium">Upgrade to get more for your team</h2>
    <z-radio-group
      :model-value="billingCycle"
      @change="updateBillingCycle"
      class="flex font-medium"
    >
      <z-radio-button value="yearly">
        Pay yearly <span class="inline text-juniper">(Save 20%)</span>
      </z-radio-button>
      <z-radio-button value="monthly"> Pay monthly </z-radio-button>
    </z-radio-group>
    <div class="grid max-w-4xl grid-cols-1 gap-5 rounded md:grid-cols-3">
      <plan-card
        v-for="name in plansInContext"
        :key="name"
        :name="name"
        :billing-cycle="billingCycle"
        :current-plan-name="showCurrentPlan && currentPlan.name"
        v-bind="planDetails[name]"
        @next="subscribe"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { ZRadioButton, ZRadioGroup } from '@deepsourcelabs/zeal'

import UpgradePlanDetailMixin from '~/mixins/upgradePlanDetailMixin'

@Component({
  components: {
    ZRadioButton,
    ZRadioGroup
  }
})
export default class PlanCards extends mixins(UpgradePlanDetailMixin) {
  @Prop({ default: false })
  showCurrentPlan!: boolean
}
</script>
