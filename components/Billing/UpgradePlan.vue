<template>
  <div v-if="Object.keys(availableUpgradePlans).length > 0">
    <button-input
      label="Upgrade plan"
      inputId="billing-settings-upgrade-plan"
      buttonType="primary"
      :buttonLabel="`Upgrade to ${availableUpgradePlans.name}`"
      icon="arrow-up"
      @click="showUpgradeConfirmModal"
    >
      <template slot="description">
        Upgrade to the {{ availableUpgradePlans.name }} plan and get more for your team.
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
        title="Upgrading your DeepSource subscription"
        :subtitle="message"
        @primaryAction="upgrade"
        @onClose="close"
      >
        <template v-slot:footer="{ close }">
          <div class="mt-6 space-x-4 text-right text-vanilla-100 flex items-center justify-end">
            <z-button buttonType="ghost" class="text-vanilla-100" size="small" @click="close">
              Nevermind
            </z-button>
            <z-button
              v-if="updating"
              class="w-52 flex items-center"
              buttonType="primary"
              size="small"
              :disabled="true"
            >
              <z-icon icon="spin-loader" color="ink" class="animate-spin mr-2"></z-icon>
              Upgrading subscription
            </z-button>
            <z-button
              v-else
              icon="check-circle"
              class="modal-primary-action w-52"
              buttonType="primary"
              size="small"
              @click="upgrade(close)"
            >
              Yes, upgrade my account
            </z-button>
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>
<script lang="ts">
import { mixins, Component, Prop } from 'nuxt-property-decorator'
import SubscriptionMixin from '~/mixins/subscriptionMixin'
import { ZIcon, ZConfirm, ZButton } from '@deepsourcelabs/zeal'
import { BillingInfo } from '~/types/types'
import ContextMixin from '~/mixins/contextMixin'
import OwnerBillingMixin from '~/mixins/ownerBillingMixin'

@Component({
  components: {
    ZIcon,
    ZConfirm,
    ZButton
  }
})
export default class UpgradePlan extends mixins(
  ContextMixin,
  OwnerBillingMixin,
  SubscriptionMixin
) {
  @Prop({ default: {} })
  billing: BillingInfo

  showConfirmDialog = false
  updating = false
  message = `Upgrading will give your team access to features like Autofix, Transformers and more. You can dowgrade anytime you want just as easily.`

  async fetch() {
    await this.fetchContext()
  }

  get upgradeOptions(): string[] {
    if (this.billing.planSlug) {
      return this.planUpgradeOptions[this.billing.planSlug]
    }
    return []
  }

  get availableUpgradePlans(): Record<string, string> {
    const plans = this.upgradeOptions
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

  async upgrade(close: () => void): Promise<void> {
    const upgradeTo = this.availableUpgradePlans.planSlug
    this.updating = true
    try {
      await this.changeSubscriptionPlan({
        id: this.owner.id,
        planSlug: upgradeTo
      })
      if (close) {
        close()
      } else {
        this.showConfirmDialog = false
      }
    } catch (e) {
      this.$toast.danger('Something went wrong while upgrading your plan')
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

  showUpgradeConfirmModal() {
    this.showConfirmDialog = true
  }

  close() {
    this.showConfirmDialog = false
  }
}
</script>
