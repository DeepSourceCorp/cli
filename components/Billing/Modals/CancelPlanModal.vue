<template>
  <z-modal
    title="Are you sure you want to cancel your subscription?"
    :close-after-primary-action="false"
    @onClose="$emit('close')"
  >
    <div class="p-4 text-sm text-vanilla-400 min-h-20">
      <p v-if="paymentDate">
        You will have access to the current plan until
        <span class="font-semibold text-vanilla-300">{{ paymentDate }}</span
        >.
      </p>
      <p class="mt-2">Once the subscription has been canceled:</p>
      <ul class="list-disc pl-3.5 pt-0.5">
        <li>
          The analysis on all private repositories except the most recent one will be deactivated
          and you will lose access to the repository dashboards for them.
        </li>
        <li>
          You will no longer be able to activate analysis on more than one private repository.
        </li>
      </ul>
      <h6 class="mt-4 text-sm text-vanilla-100">Confirm cancellation</h6>
      <p>
        To confirm cancellation, enter
        <span class="font-medium text-juniper"> {{ owner.login }} </span>
        in the textbox.
      </p>
      <label for="cancel-sub-confirm" class="sr-only">Organization name</label>
      <z-input
        id="cancel-sub-confirm"
        v-model="userEnteredOwner"
        :disabled="updating"
        :read-only="updating"
        class="px-2 mt-3"
        size="small"
        placeholder="Organization name"
      />
    </div>
    <template v-slot:footer="{ close }">
      <div
        class="flex items-center justify-end p-4 space-x-4 text-right text-vanilla-100 border-slate-400"
      >
        <z-button button-type="ghost" class="text-vanilla-100" size="small" @click="close">
          I've changed my mind
        </z-button>
        <z-button
          v-if="updating"
          class="flex items-center w-48"
          button-type="danger"
          size="small"
          :disabled="true"
        >
          <z-icon icon="spin-loader" color="ink" class="mr-2 animate-spin" />
          Cancelling plan
        </z-button>
        <z-button
          v-else
          icon="x-circle"
          class="w-48 modal-primary-action"
          button-type="danger"
          size="small"
          :disabled="owner.login && userEnteredOwner.toLowerCase() !== owner.login.toLowerCase()"
          @click="cancelPlan(close)"
        >
          Yes, cancel my plan
        </z-button>
      </div>
    </template>
  </z-modal>
</template>
<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZModal, ZButton, ZInput } from '@deepsource/zeal'

import SubscriptionMixin from '~/mixins/subscriptionMixin'
import { parseISODate, formatDate } from '~/utils/date'
import OwnerBillingMixin from '~/mixins/ownerBillingMixin'

@Component({
  name: 'CancelPlanModal',
  components: {
    ZIcon,
    ZModal,
    ZButton,
    ZInput
  }
})
export default class CancelPlanModal extends mixins(OwnerBillingMixin, SubscriptionMixin) {
  private updating = false
  private userEnteredOwner = ''

  get paymentDate(): string | undefined {
    if (this.owner.billingInfo)
      return formatDate(parseISODate(this.owner.billingInfo.upcomingPaymentDate))
    return undefined
  }

  async cancelPlan(close: () => void): Promise<void> {
    this.updating = true
    try {
      await this.cancelSubscriptionPlan({
        id: this.owner.id
      })
      this.$toast.success('Subscription successfully cancelled.')
    } catch (e) {
      this.$toast.danger('Something went wrong while cancelling your subscription.')
    } finally {
      this.$emit('refetch')
      await this.refetchData()
      this.updating = false
      close()
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
