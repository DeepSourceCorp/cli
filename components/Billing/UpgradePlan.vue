<template>
  <div v-if="Object.keys(availableUpgradePlans).length > 0">
    <button-input
      label="Upgrade plan"
      input-id="billing-settings-upgrade-plan"
      button-type="primary"
      :button-label="`Upgrade to ${availableUpgradePlans.name}`"
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
            <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
              Nevermind
            </z-button>
            <z-button
              v-if="updating"
              class="w-52 flex items-center"
              button-type="primary"
              size="small"
              :disabled="true"
            >
              <z-icon icon="spin-loader" color="ink" class="animate-spin mr-2" />
              Upgrading subscription
            </z-button>
            <z-button
              v-else
              icon="check-circle"
              class="modal-primary-action w-52"
              button-type="primary"
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
export default class UpgradePlan extends mixins(PlanDetailMixin) {
  @Prop({ default: {} })
  billing: BillingInfo

  showConfirmDialog = false
  updating = false
  message = `Upgrading will give your team access to features like Autofix, Transformers and more. You can dowgrade anytime you want just as easily.`

  async fetch() {
    await this.fetchContext()
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

  showUpgradeConfirmModal() {
    this.showConfirmDialog = true
  }

  close() {
    this.showConfirmDialog = false
  }
}
</script>
