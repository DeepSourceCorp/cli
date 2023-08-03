<template>
  <z-modal title="Update card" @onClose="$emit('close')">
    <fieldset class="space-y-1 p-4 text-sm">
      <label class="leading-loose">Credit card details</label>
      <stripe-card-input
        ref="card-modal-stripe-input"
        class="rounded-md border bg-ink-400 px-3 py-3 text-sm"
        @change="handleStripeCardChange"
      />
    </fieldset>
    <template #footer="{ close }">
      <div class="flex justify-between space-x-4 border-slate-400 p-4 text-vanilla-100">
        <div class="flex items-end">
          <span class="rounded-bl-md bg-ink-200 px-2 py-1.5 text-xs leading-none text-vanilla-400">
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
import SubscriptionMixin from '~/mixins/subscriptionMixin'

import { StripeCardElement, StripeCardElementChangeEvent } from '@stripe/stripe-js'
import { UpdatePaymentActionChoice } from '~/types/types'
import OwnerBillingMixin from '~/mixins/ownerBillingMixin'
import StripeCardInput from '../StripeCardInput.vue'

@Component({})
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
