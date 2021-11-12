<template>
  <portal to="modal">
    <z-modal title="Upgrade your account" @onClose="$emit('close')">
      <div class="p-4">
        <div>
          <p class="font-normal leading-snug text-vanilla-400">
            You have exhausted the quota of {{ maxFeatureUsage }} Autofix runs included in your
            current plan for this billing cycle. Consider upgrading your account to keep things
            running.
          </p>
        </div>

        <div class="flex justify-end py-5">
          <z-button
            v-if="Object.keys(availableUpgradePlans).length"
            button-type="primary"
            icon="zap"
            label="Upgrade account"
            size="small"
            @click="$router.push($generateRoute(['settings', 'billing', 'plans'], false))"
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
import PlanDetailMixin from '~/mixins/planDetailMixin'

@Component({
  components: {
    ZButton,
    ZModal
  }
})
export default class UpgradeAccountModal extends mixins(OwnerDetailMixin, PlanDetailMixin) {
  get maxFeatureUsage(): number {
    return this.owner.featureUsage.find(
      ({ shortcode }: Record<string, unknown>) => shortcode === 'autofix'
    ).max
  }
}
</script>
