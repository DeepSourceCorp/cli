<template>
  <div class="bg-ink-300 rounded-md grid grid-cols-1 gap-4 p-3 relative">
    <div
      class="absolute right-0 top-0 leading-none bg-ink-200 rounded-bl-md text-xs px-2 py-1.5 text-vanilla-400"
    >
      Powered by
      <img class="inline" width="30" height="14" alt="stripe" src="~/assets/images/stripe.svg" />
    </div>
    <fieldset class="text-sm space-y-1">
      <label class="leading-loose">Billing email</label>
      <z-input
        required="true"
        type="email"
        :showBorder="validBillingEmail"
        :class="{
          'border border-cherry': !validBillingEmail
        }"
        v-model="billingEmail"
        @blur="(ev) => validateEmail(ev.target)"
        placeholder="jane@deepsource.io"
      ></z-input>
      <p v-if="!validBillingEmail" class="text-xs text-cherry">Please enter a valid email.</p>
    </fieldset>
    <fieldset class="text-sm space-y-1">
      <label class="leading-loose">Name</label>
      <z-input required="true" v-model="fullName" placeholder="Jane Doe"></z-input>
    </fieldset>
    <fieldset class="text-sm space-y-1">
      <label class="leading-loose">Credit card number</label>
      <div
        id="card-input-container"
        class="bg-ink-400 py-3 px-3 text-sm border"
        :class="{
          'border-vanilla-200': cardInputFocus,
          'border-ink-100': !cardInputFocus
        }"
      ></div>
    </fieldset>
    <z-button
      v-if="!checkoutLoading && checkoutState === null"
      class="mt-3"
      icon="lock"
      iconSize="small"
      :disabled="!enableCheckout"
      @click="checkout"
    >
      Pay securely with Stripe
    </z-button>
    <z-button
      v-else-if="checkoutState === 'SUCCESS'"
      class="mt-3 text-vanilla-100 hover:bg-ink-300"
      icon="check-circle"
      iconColor="vanilla-100"
      :disabled="true"
      buttonType="primary"
    >
      <span>Payment successful</span>
    </z-button>
    <z-button
      v-else-if="checkoutState === 'FAIL'"
      icon="repeat"
      class="mt-3"
      iconSize="small"
      :disabled="!enableCheckout"
      @click="checkout"
    >
      Retry payment
    </z-button>
    <z-button
      v-else
      class="mt-3 text-vanilla-100 hover:bg-ink-300 cursor-wait"
      buttonType="secondary"
    >
      <z-icon class="animate-spin" icon="spin-loader" color="juniper"></z-icon>
      <span>Processing payment</span>
    </z-button>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { ZButton, ZInput, ZIcon } from '@deepsourcelabs/zeal'
import SubscriptionMixin from '~/mixins/subscriptionMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

import { StripeCardElement } from '@stripe/stripe-js'
import { SubscriptionCheckoutPayload } from '~/types/types'

@Component({
  components: {
    ZButton,
    ZInput,
    ZIcon
  }
})
export default class Subscribe extends mixins(SubscriptionMixin, OwnerDetailMixin) {
  @Prop({ required: true })
  planSlug: string

  @Prop({ required: true })
  coupon: string

  private billingEmail = ''
  private validBillingEmail = true
  private fullName = ''
  private cardDetails = ''
  private validCardDetails = false
  private cardInputFocus = false
  private checkoutLoading = false
  private checkoutState: null | 'SUCCESS' | 'FAIL' = null

  private cardElement: StripeCardElement

  mounted() {
    this.createStripCardInput()
  }

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

  createStripCardInput(): void {
    if (this.$stripe) {
      const elements = this.$stripe.elements()
      const card = elements.create('card', {
        iconStyle: 'solid',
        style: {
          base: {
            iconColor: '#373c49',
            color: '#fff',
            fontWeight: 500,
            fontSize: '14px',
            fontSmoothing: 'antialiased'
          },
          invalid: {
            iconColor: '#D6435B',
            color: '#da5565'
          }
        }
      })
      card.mount('#card-input-container')
      card.on('focus', () => (this.cardInputFocus = true))
      card.on('blur', () => (this.cardInputFocus = false))
      card.on('change', (event) => (this.validCardDetails = event.error ? false : true))
      this.cardElement = card
    }
  }

  validateEmail(el: HTMLInputElement): void {
    this.validBillingEmail = el.checkValidity()
  }

  get enableCheckout(): boolean {
    return Boolean(
      this.billingEmail && this.validBillingEmail && this.fullName && this.validCardDetails
    )
  }

  async checkout(): Promise<void> {
    this.checkoutLoading = true
    this.checkoutState = null
    if (!this.owner.vcsInstallationId) {
      await this.$fetch
    }

    try {
      const res = await this.$stripe?.createToken(this.cardElement, {
        name: this.fullName
      })
      if (res && res.token) {
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

        this.checkoutState = 'SUCCESS'

        let redirectRoute = this.$generateRoute([])
        if (checkoutResponse.nextAction === 'BILLING') {
          this.$toast.success('🎉 Subscription Activated! Redirecting you to the billing Page.')
          redirectRoute = this.$generateRoute(['settings', 'billing'])
        } else if (checkoutResponse.nextAction === 'ACTIVATE_NEW_REPO') {
          this.$toast.success(
            "🎉 Subscription Activated! Let's activate a repository and get started."
          )
          redirectRoute = this.$generateRoute(['all-repos'])
        }

        setTimeout(() => {
          this.$router.push(redirectRoute)
        }, 1200)
      }
    } catch (e) {
      this.checkoutState = 'FAIL'
      this.$toast.danger(
        'Something went wrong processing your card payment. Please check your card details or contact support.'
      )
    } finally {
      this.checkoutLoading = false
    }
  }
}
</script>
