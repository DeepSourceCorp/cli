<template>
  <z-modal title="Update card" @onClose="$emit('close')">
    <fieldset class="p-4 space-y-1 text-sm">
      <label class="leading-loose">Credit card details</label>
      <stripe-card-input
        ref="card-modal-stripe-input"
        class="px-3 py-3 text-sm border rounded-md bg-ink-400"
        @change="handleStripeCardChange"
      />
    </fieldset>
    <template #footer="{ close }">
      <div class="flex justify-between p-4 space-x-4 text-vanilla-100 border-slate-400">
        <div class="flex items-end">
          <span class="leading-none bg-ink-200 rounded-bl-md text-xs px-2 py-1.5 text-vanilla-400">
            Powered by
            <img
              class="inline"
              width="30"
              height="14"
              alt="stripe"
              src="~/assets/images/stripe.svg"
            />
          </span>
        </div>
        <z-button
          class="mt-3"
          :is-loading="updateCardLoading"
          loading-label="Updating payment details"
          label="Confirm and update"
          icon="check"
          size="small"
          :disabled="!validCardDetails"
          @click="updateCard(close)"
        />
      </div>
    </template>
  </z-modal>
</template>

<script lang="ts">
import { Component, Ref, mixins } from 'nuxt-property-decorator'
import { ZModal, ZButton, ZInput, ZIcon } from '@deepsource/zeal'
import SubscriptionMixin from '~/mixins/subscriptionMixin'

import { StripeCardElement, StripeCardElementChangeEvent } from '@stripe/stripe-js'
import { UpdatePaymentActionChoice } from '~/types/types'
import OwnerBillingMixin from '~/mixins/ownerBillingMixin'
import StripeCardInput from '../StripeCardInput.vue'

@Component({
  components: {
    ZModal,
    ZButton,
    ZInput,
    ZIcon
  }
})
export default class UpdateCardModal extends mixins(SubscriptionMixin, OwnerBillingMixin) {
  public cardDetails = ''
  public validCardDetails = false
  public cardInputFocus = false
  public updateCardLoading = false
  public updateCardState: null | 'SUCCESS' | 'FAIL' = null

  public cardElement: StripeCardElement

  @Ref('card-modal-stripe-input')
  stripeInput: StripeCardInput

  handleStripeCardChange(event: StripeCardElementChangeEvent) {
    this.validCardDetails = event.error ? false : true
  }

  async updateCard(close: () => void): Promise<void> {
    this.updateCardLoading = true
    this.updateCardState = null

    try {
      const res = await this.$stripe?.createToken(this.stripeInput.cardElement)

      if (res && res.token) {
        const updateRes = await this.updatePaymentSource({
          id: this.owner.id,
          token: res.token.id,
          action: UpdatePaymentActionChoice.Update
        })
        if (updateRes.ok) {
          const { owner, provider } = this.$route.params
          await this.fetchBillingDetails({
            login: owner,
            provider,
            refetch: true
          })
          this.$toast.success('We have updated the card successfully')
          this.updateCardState = 'SUCCESS'
          close()
        } else {
          throw new Error()
        }
      }
    } catch (e) {
      this.updateCardState = 'FAIL'
      this.$toast.danger(
        'Something went wrong processing your card payment. Please check your card details or contact support.'
      )
    } finally {
      this.updateCardLoading = false
    }
  }
}
</script>
