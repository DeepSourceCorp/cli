<template>
  <div v-if="Object.keys(availableDowngradePlans).length > 0">
    <button-input
      label="Downgrade plan"
      input-id="billing-settings-downgrade-plan"
      button-type="secondary"
      :button-label="`Downgrade to ${availableDowngradePlans.name}`"
      icon="arrow-down"
      @click="showDowngradePlanModal"
    >
      <template slot="description">
        You will be downgraded to the {{ availableDowngradePlans.name }} plan.
        <nuxt-link
          :to="$generateRoute(['settings', 'billing', 'plans'])"
          class="text-juniper hover:underline"
          >See pricing.</nuxt-link
        >
      </template>
    </button-input>
    <portal to="modal">
      <z-confirm
        v-if="showConfirmDialog"
        primary-action-type="danger"
        title="Are you sure you want to downgrade your DeepSource subscription"
        :subtitle="message"
        @primaryAction="downgrade"
        @onClose="close"
      >
        <template v-slot:footer="{ close }">
          <div class="mt-6 space-x-4 text-right text-vanilla-100 flex items-center justify-end">
            <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
              I changed my mind
            </z-button>
            <z-button
              v-if="updating"
              class="w-60 flex items-center"
              button-type="danger"
              size="small"
              :disabled="true"
            >
              <z-icon icon="spin-loader" color="ink" class="animate-spin mr-2" />
              Downgrading subscription
            </z-button>
            <z-button
              v-else
              icon="check-circle"
              class="modal-primary-action w-60"
              button-type="danger"
              size="small"
              @click="downgrade(close)"
            >
              Yes, downgrade my account
            </z-button>
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>
<script lang="ts">
import { mixins, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon, ZConfirm, ZButton } from '@deepsource/zeal'

import { BillingInfo } from '~/types/types'

import PlanDetailMixin from '~/mixins/planDetailMixin'

@Component({
  components: {
    ZIcon,
    ZConfirm,
    ZButton
  }
})
export default class DowngradePlan extends mixins(PlanDetailMixin) {
  @Prop({ default: {} })
  billing: BillingInfo

  showConfirmDialog = false
  updating = false
  message = `Your team will lose access to Autofix, Transformers, and other automation features.`

  async fetch() {
    await this.fetchContext()
  }

  async downgrade(close: () => void): Promise<void> {
    const dowgradeTo = this.availableDowngradePlans.planSlug
    this.updating = true
    try {
      await this.changeSubscriptionPlan({
        id: this.owner.id,
        planSlug: dowgradeTo
      })
      if (close) {
        close()
      } else {
        this.showConfirmDialog = false
      }
    } catch (e) {
      this.$toast.danger('Something went wrong while downgrading your plan')
    } finally {
      this.$emit('refetch')
      await this.refetchData()
      this.updating = false
    }
  }

  showDowngradePlanModal() {
    this.showConfirmDialog = true
  }

  close() {
    this.showConfirmDialog = false
  }
}
</script>
