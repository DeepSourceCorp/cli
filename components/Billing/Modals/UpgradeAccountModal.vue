<template>
  <portal to="modal">
    <z-modal title="Upgrade your account" @onClose="$emit('close')">
      <div class="p-4">
        <div>
          <p class="font-normal leading-snug text-vanilla-400">
            You have exhausted the quota of {{ maxFeatureUsage }} Autofix runs included in your
            current plan. Consider upgrading your account to keep things running.
          </p>
        </div>

        <div class="flex justify-end py-5">
          <z-button
            v-if="Object.keys(availableUpgradePlans).length"
            button-type="primary"
            icon="zap"
            label="Upgrade account"
            size="small"
            :to="subscriptionPath"
          />
        </div>
      </div>
    </z-modal>
  </portal>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZModal } from '@deepsourcelabs/zeal'

import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import UpgradePlanDetailMixin from '~/mixins/upgradePlanDetailMixin'
import { Plan } from '~/mixins/subscriptionMixin'

@Component({
  components: {
    ZButton,
    ZModal
  }
})
export default class UpgradeAccountModal extends mixins(OwnerDetailMixin, UpgradePlanDetailMixin) {
  get maxFeatureUsage(): number {
    return this.owner.featureUsage.find(
      ({ shortcode }: Record<string, unknown>) => shortcode === 'autofix'
    ).max
  }

  get upgradePlanInfo(): Plan {
    return this.planDetails[this.availableUpgradePlans.name.toLowerCase()]
  }

  get subscriptionPath(): string {
    const plan = this.upgradePlanInfo.planName.toLowerCase()
    const path = plan === 'business' ? 'premium' : plan
    return this.$generateRoute(['settings', 'billing', 'subscribe', path], false)
  }
}
</script>
