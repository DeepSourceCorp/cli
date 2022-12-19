<template>
  <alert-box text-color="text-honey-300" bg-color="bg-honey">
    <div>
      <p>
        We are processing your payment for the
        <span class="font-semibold"> {{ currentPlanName }}</span> plan.
      </p>
      <ul class="mt-2 space-y-1 list-disc">
        <li class="ml-4">
          If you have already authorized the payment, please wait while we confirm it.
        </li>
        <li class="ml-4">
          If you have not authorized a payment, please check your email for an invoice from
          DeepSource to complete the same. If the payment is not authorized within 23 hours of
          {{ failedPaymentDate || '... ' }}, you will be downgraded to the
          <span class="font-semibold"> Free </span> plan.
        </li>
      </ul>
    </div>
  </alert-box>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { parseISODate, formatDate } from '~/utils/date'
import { ZButton } from '@deepsource/zeal'
import { BillingInfo } from '~/types/types'

@Component({
  name: 'StripeScaPendingAlert',
  components: {
    ZButton
  }
})
export default class StripeScaPendingAlert extends Vue {
  @Prop({ required: true })
  currentPlanName: string

  @Prop({ required: true })
  isBillingScaPending: boolean

  @Prop({ required: true })
  ownerBillingInfo: BillingInfo

  public loading = false
  public lastPaymentAttemptDate = -1

  async created(): Promise<void> {
    if (this.isBillingScaPending) await this.getLastPaymentAttemptDate()
  }

  get failedPaymentDate(): string | undefined {
    if (this.lastPaymentAttemptDate >= 0)
      return formatDate(parseISODate(this.lastPaymentAttemptDate), 'lll')
    return undefined
  }

  async getLastPaymentAttemptDate(): Promise<void> {
    if (this.ownerBillingInfo.clientSecret) {
      const stripePaymentIntent = await this.$stripe?.retrievePaymentIntent(
        this.ownerBillingInfo.clientSecret
      )
      if (stripePaymentIntent?.paymentIntent?.created) {
        this.lastPaymentAttemptDate = stripePaymentIntent.paymentIntent.created * 1000
        return
      }
    }
    this.lastPaymentAttemptDate = -1
  }
}
</script>
