<template>
  <div v-if="Object.keys(availableDowngradePlans).length > 0">
    <button-input
      label="Downgrade Plan"
      inputId="billing-settings-downgrade-plan"
      buttonType="secondary"
      :buttonLabel="`Downgrade to ${availableDowngradePlans.name}`"
      icon="arrow-down"
      @click="showDowngradePlanModal"
    >
      <template slot="description">
        You will be downgraded to the {{ availableDowngradePlans.name }} plan.
        <a
          href="/pricing"
          target="_blank"
          rel="noopener noreferrer"
          class="text-juniper hover:underline"
          >See pricing.</a
        >
      </template>
    </button-input>
    <portal to="modal">
      <z-confirm
        v-if="showConfirmDialog"
        primaryActionType="danger"
        title="Are you sure you want to downgrade your DeepSource subscription"
        :subtitle="message"
        @primaryAction="downgrade"
        @onClose="close"
      >
        <template v-slot:footer="{ close }">
          <div class="mt-6 space-x-4 text-right text-vanilla-100 flex items-center justify-end">
            <z-button buttonType="ghost" class="text-vanilla-100" size="small" @click="close">
              I changed my mind
            </z-button>
            <z-button
              v-if="updating"
              class="w-60 flex items-center"
              buttonType="danger"
              size="small"
              :disabled="true"
            >
              <z-icon icon="spin-loader" color="ink" class="animate-spin mr-2"></z-icon>
              Downgrading subscription
            </z-button>
            <z-button
              v-else
              icon="check-circle"
              class="modal-primary-action w-60"
              buttonType="danger"
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
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import SubscriptionMixin from '~/mixins/subscriptionMixin'
import { ZIcon, ZConfirm, ZButton } from '@deepsourcelabs/zeal'
import { BillingInfo } from '~/types/types'
import ContextMixin from '~/mixins/contextMixin'

@Component({
  components: {
    ZIcon,
    ZConfirm,
    ZButton
  }
})
export default class DowngradePlan extends mixins(
  ContextMixin,
  OwnerDetailMixin,
  SubscriptionMixin
) {
  @Prop({ default: {} })
  billing: BillingInfo

  showConfirmDialog = false
  updating = false
  message = `Your team will lose access to Autofix, Transformers, and other automation features.`

  async fetch() {
    await this.fetchContext()
  }

  get downgradeOptions(): string[] {
    if (this.billing.planSlug) {
      return this.planDowngradeOptions[this.billing.planSlug]
    }
    return []
  }

  get availableDowngradePlans(): Record<string, string> {
    const plans = this.downgradeOptions
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

  async refetchData(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchBillingDetails({
      login: owner,
      provider,
      refetch: true
    })
  }

  showDowngradePlanModal() {
    this.showConfirmDialog = true
  }

  close() {
    this.showConfirmDialog = false
  }
}
</script>
