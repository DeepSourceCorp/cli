<template>
  <div>
    <button-input
      label="Resume subscription"
      inputId="billing-settings-resume-plan"
      buttonType="primary"
      buttonLabel="Resume subscription"
      icon="play-circle"
      @click="showResumePlanModal"
    >
      <template slot="description">
        This will void the plan cancellation request, and you will get full access to your existing
        plan.
      </template>
    </button-input>
    <portal to="modal">
      <z-confirm
        v-if="showConfirmDialog"
        primaryActionType="primary"
        title="Resume your DeepSource subscription?"
        :subtitle="message"
        @primaryAction="resumePlan(close)"
        @onClose="close"
      >
        <template v-slot:footer="{ close }">
          <div class="mt-6 space-x-4 text-right text-vanilla-100 flex items-center justify-end">
            <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
              Cancel
            </z-button>
            <z-button
              v-if="updating"
              class="flex items-center"
              buttonType="primary"
              size="small"
              :disabled="true"
            >
              <z-icon icon="spin-loader" color="ink" class="animate-spin mr-2"></z-icon>
              Resuming plan
            </z-button>
            <z-button
              v-else
              icon="check-circle"
              class="modal-primary-action"
              buttonType="primary"
              size="small"
              @click="resumePlan(close)"
            >
              Yes, resume my plan
            </z-button>
          </div>
        </template>
      </z-confirm>
    </portal>
  </div>
</template>
<script lang="ts">
import { mixins, Component } from 'nuxt-property-decorator'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'
import SubscriptionMixin from '~/mixins/subscriptionMixin'
import { ZIcon, ZConfirm, ZButton } from '@deepsourcelabs/zeal'

@Component({
  components: {
    ZIcon,
    ZConfirm,
    ZButton
  }
})
export default class CancelPlan extends mixins(OwnerDetailMixin, SubscriptionMixin) {
  showConfirmDialog = false
  message =
    'Confirm to void the plan cancellation request. This will give you full access to your existing plan.'

  private updating = false

  showResumePlanModal() {
    this.showConfirmDialog = true
  }

  close() {
    this.showConfirmDialog = false
  }

  async resumePlan(close: () => void): Promise<void> {
    this.updating = true
    try {
      await this.revertSubscriptionCancellation({
        id: this.owner.id
      })
      this.$toast.success('Plan successfully resumed. Welcome back!')
    } catch (e) {
      this.$toast.danger('Something went wrong while resuming your plan.')
    } finally {
      this.$emit('refetch')
      await this.refetchData()
      this.updating = false
      if (close) {
        close()
      } else {
        this.showConfirmDialog = false
      }
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
}
</script>
