<template>
  <div class="relative grid grid-cols-1 gap-4 p-3 rounded-md bg-ink-300 ph-no-capture">
    <div
      class="absolute right-0 top-0 leading-none bg-ink-200 rounded-bl-md text-xs px-2 py-1.5 text-vanilla-400"
    >
      Powered by
      <img class="inline" width="30" height="14" alt="stripe" src="~/assets/images/stripe.svg" />
    </div>
    <fieldset class="space-y-1 text-sm">
      <label class="leading-loose">Billing email</label>
      <z-input
        required="true"
        type="email"
        :show-border="validBillingEmail"
        :class="{
          'border border-cherry': !validBillingEmail
        }"
        v-model="billingEmail"
        @blur="(ev) => validateEmail(ev.target)"
        placeholder="jane@deepsource.io"
      />
      <p v-if="!validBillingEmail" class="text-xs text-cherry">Please enter a valid email.</p>
    </fieldset>
    <fieldset class="space-y-1 text-sm">
      <label class="leading-loose">Name</label>
      <z-input required="true" v-model="fullName" placeholder="Jane Doe" />
    </fieldset>
    <fieldset class="space-y-1 text-sm">
      <label class="leading-loose">Credit card number</label>
      <stripe-card-input
        ref="checkout-box-stripe-input"
        class="px-3 py-3 text-sm border bg-ink-400"
        @change="handleStripeCardChange"
      />
    </fieldset>
    <z-button
      v-if="!checkoutLoading && checkoutState === null"
      class="mt-3"
      icon="z-lock"
      icon-size="small"
      :disabled="!enableCheckout"
      @click="checkout"
    >
      Pay securely with Stripe
    </z-button>
    <z-button
      v-else-if="checkoutState === 'SUCCESS'"
      class="mt-3 text-vanilla-100 hover:bg-ink-300"
      icon="check-circle"
      icon-color="vanilla-100"
      :disabled="true"
      button-type="primary"
    >
      <span>Payment successful</span>
    </z-button>
    <z-button
      v-else-if="checkoutState === 'FAIL'"
      icon="repeat"
      class="mt-3"
      icon-size="small"
      :disabled="!enableCheckout"
      @click="checkout"
    >
      Retry payment
    </z-button>
    <z-button
      v-else-if="checkoutState === 'PARTIAL'"
      class="mt-3 text-vanilla-100 hover:bg-ink-300"
      icon="spin-loader"
      icon-color="vanilla-100"
      :disabled="true"
      :is-loading="true"
      button-type="secondary"
    >
      <span>Authorization failed, redirecting...</span>
    </z-button>
    <z-button
      v-else
      class="mt-3 cursor-wait text-vanilla-100 hover:bg-ink-300"
      button-type="secondary"
    >
      <z-icon class="animate-spin" icon="spin-loader" color="juniper" />
      <span>Processing payment</span>
    </z-button>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Prop, Ref } from 'nuxt-property-decorator'
import { ZButton, ZInput, ZIcon } from '@deepsource/zeal'
import SubscriptionMixin from '~/mixins/subscriptionMixin'

import { StripeCardElement, StripeCardElementChangeEvent } from '@stripe/stripe-js'
import { SubscriptionCheckoutPayload, SubscriptionStatusChoice } from '~/types/types'
import OwnerBillingMixin from '~/mixins/ownerBillingMixin'
import StripeCardInput from './StripeCardInput.vue'
import ActiveUserMixin from '~/mixins/activeUserMixin'

/**
 * Checkout component built with Stripe for handling payments.
 */
@Component({
  components: {
    ZButton,
    ZInput,
    ZIcon
  },
  name: 'StripeCheckoutBox'
})
export default class StripeCheckoutBox extends mixins(
  SubscriptionMixin,
  OwnerBillingMixin,
  ActiveUserMixin
) {
  @Prop({ required: true })
  planSlug: string

  @Prop({ required: true })
  coupon: string

  public billingEmail = ''
  public validBillingEmail = true
  public fullName = ''
  public cardDetails = ''
  public validCardDetails = false
  public cardInputFocus = false
  public checkoutLoading = false
  public checkoutState: null | 'SUCCESS' | 'FAIL' | 'PARTIAL' = null

  public cardElement: StripeCardElement

  @Ref('checkout-box-stripe-input')
  stripeInput: StripeCardInput

  /**
   * Event handler for stripe card element `change` event. Updates card validity status.
   *
   * @returns {void}
   */
  handleStripeCardChange(event: StripeCardElementChangeEvent): void {
    this.validCardDetails = event.error ? false : true
  }

  /**
   * Fetch hook for checkout box component. Fetches owner details.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchOwnerDetails({
      login: owner,
      provider
    })

    if (this.owner.primaryUser) {
      this.billingEmail = this.owner.primaryUser.email
      this.fullName = this.owner.primaryUser.fullName || ''
    }
  }

  /**
   * Verifies if the given email in the email input is valid or not.
   *
   * @returns {void}
   */
  validateEmail(el: HTMLInputElement): void {
    this.validBillingEmail = el.checkValidity()
  }

  get enableCheckout(): boolean {
    return Boolean(
      this.billingEmail && this.validBillingEmail && this.fullName && this.validCardDetails
    )
  }

  /**
   * Polling function that retries fetching billing status for an owner for 5 times.
   * This is used once a user performs SCA verification to verify if the payment succeeded or not.
   *
   * @returns {Promise<void>}
   */
  async tempAwaitStripeScaUpdate(): Promise<void> {
    let RETRY_COUNT = 5
    const { owner, provider } = this.$route.params
    /**
     * Function that attempts `network-only` refetch of billing status for an owner.
     *
     * @returns {Promise<void>}
     */
    const retryFunction = async (): Promise<void> => {
      const statusResponse = await this.fetchBillingStatus({
        login: owner,
        provider,
        refetch: true
      })
      if (RETRY_COUNT >= 0 && statusResponse.status === SubscriptionStatusChoice.ScaRequired) {
        RETRY_COUNT -= 1
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await retryFunction()
      }
      return
    }
    await retryFunction()
  }

  /**
   * Checks out the user with their given payment details and attempts verification of the payment.
   * - Updates `checkoutState` to a valid state based on if the payment succeded or not.
   * - Redirects user to the billing page if payment succeded or SCA is pending.
   * - Shows an error message if payment failed.
   *
   * @returns {Promise<void>}
   */
  async checkout(): Promise<void> {
    this.checkoutLoading = true
    this.checkoutState = null
    if (!this.owner.vcsInstallationId) {
      await this.$fetch
    }

    try {
      const res = await this.$stripe?.createToken(this.stripeInput.cardElement, {
        name: this.fullName
      })
      if (res?.error) {
        throw res.error
      }

      if (res?.token) {
        const params = {
          email: this.billingEmail,
          name: this.fullName,
          token: res.token.id,
          seats: this.seats,
          coupon: this.coupon || '',
          planSlug: this.planSlug,
          installationId: this.owner.vcsInstallationId || ''
        }
        const checkoutResponse: SubscriptionCheckoutPayload = await this.subscriptionCheckout(
          params
        )

        const { provider, owner } = this.$route.params
        this.fetchBillingDetails({
          provider,
          login: owner,
          refetch: true
        })

        let redirectRoute = this.$generateRoute([])

        if (checkoutResponse.nextAction === 'BILLING') {
          await this.fetchActiveUser({ refetch: true })
          this.checkoutState = 'SUCCESS'
          this.$toast.success('🎉 Subscription activated! Redirecting you to the billing page.')
          redirectRoute = this.$generateRoute(['settings', 'billing'])
          setTimeout(() => {
            this.$router.push(redirectRoute)
          }, 1200)
        } else if (checkoutResponse.nextAction === 'ACTIVATE_NEW_REPO') {
          await this.fetchActiveUser({ refetch: true })
          this.checkoutState = 'SUCCESS'
          this.$toast.success(
            "🎉 Subscription activated! Let's activate a repository and get started."
          )
          redirectRoute = this.$generateRoute(['all-repos'])
          setTimeout(() => {
            this.$router.push(redirectRoute)
          }, 1200)
        } else if (checkoutResponse.nextAction === 'SCA') {
          const result = await this.$stripe?.confirmCardPayment(
            checkoutResponse.clientSecret as string
          )

          if (result?.paymentIntent && result.paymentIntent.status === 'succeeded') {
            await this.tempAwaitStripeScaUpdate()
            await this.fetchActiveUser({ refetch: true })
            this.checkoutState = 'SUCCESS'
            this.$toast.success('🎉 Subscription activated! Redirecting you to the billing page.')
            setTimeout(() => {
              this.$router.push(this.$generateRoute(['settings', 'billing']))
            }, 1200)
          } else {
            await this.fetchActiveUser({ refetch: true })
            this.checkoutState = 'PARTIAL'
            if (result?.error?.message) {
              this.$toast.show({
                type: 'danger',
                message: result.error.message,
                timeout: 10
              })
            } else {
              this.$toast.show({
                type: 'danger',
                message:
                  'We are unable to authenticate your payment method. Please choose a different payment method and try again.',
                timeout: 6
              })
            }
            setTimeout(() => {
              this.$router.push(this.$generateRoute(['settings', 'billing']))
            }, 6200)
          }
        }
      }
    } catch (e) {
      this.checkoutState = 'FAIL'
      const err = e as Error
      try {
        const errorMessage = JSON.parse(err.message.replace('GraphQL error: ', ''))
        if (Array.isArray(errorMessage)) {
          this.$toast.danger(errorMessage.join('\n'))
        } else {
          this.$toast.danger(errorMessage)
        }
      } catch (_parseError) {
        if (err.message) {
          this.$toast.show({
            type: 'danger',
            message: err.message.replace('GraphQL error: ', ''),
            timeout: 10
          })
        } else {
          this.$toast.danger(
            'Something went wrong processing your card payment. Please check your card details or contact support.'
          )
        }
      } finally {
        this.logErrorForUser(e as Error, 'Billing error', {})
      }
    } finally {
      this.checkoutLoading = false
    }
  }
}
</script>
