<template>
  <form-group
    label="Payment Method"
    :divide="false"
    bodyClass="space-y-2"
    class="mt-5"
    v-if="isBilledByStripe && ownerBillingInfo.activeCard"
  >
    <div
      class="
        flex
        items-center
        justify-between
        w-full
        p-4
        border
        rounded-md
        border-ink-200 border-opacity-70
      "
    >
      <div class="flex items-center space-x-4">
        <img
          :src="
            require(`~/assets/images/payments/${getCardIcon(
              ownerBillingInfo.activeCard.brand
            )}.png`)
          "
          :alt="ownerBillingInfo.activeCard.brand"
          class="w-auto h-6"
        />
        <div class="ml-6 leading-5 text-vanilla-100">
          {{ ownerBillingInfo.activeCard.brand }}
        </div>
      </div>
      <div class="flex items-center space-x-1.5 text-vanilla-400">
        <div>•••• •••• ••••</div>
        <div>{{ ownerBillingInfo.activeCard.endingIn }}</div>
      </div>
    </div>
    <div class="flex items-center justify-end w-full">
      <z-button
        @click="showUpdateCardModal = true"
        size="small"
        button-type="secondary"
        iconColor="vanilla-200 m-px"
        icon="credit-card"
      >
        Update card
      </z-button>
    </div>
    <portal to="modal">
      <update-card-modal v-if="showUpdateCardModal" @close="showUpdateCardModal = false" />
    </portal>
  </form-group>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import { FormGroup } from '~/components/Form'
import UpdateBillingDetailsModal from './Modals/UpdateBillingDetailsModal.vue'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'
import OwnerBillingMixin from '~/mixins/ownerBillingMixin'

@Component({
  components: {
    FormGroup,
    ZButton,
    ZIcon,
    UpdateBillingDetailsModal
  },
  layout: 'dashboard'
})
export default class BillingInfoBox extends mixins(OwnerBillingMixin) {
  async fetch(): Promise<void> {
    const { owner, provider } = this.$route.params
    await this.fetchBillingDetails({
      login: owner,
      provider
    })
  }

  getCardIcon(name: string): string {
    const cards: Record<string, string> = {
      'American Express': 'amex',
      'Diners Club': 'diners',
      UnionPay: 'union',
      Discover: 'discover',
      JCB: 'jcb',
      Visa: 'visa',
      Maestro: 'maestro',
      MasterCard: 'mastercard',
      Unknown: 'stripe'
    }

    if (name in cards) {
      return cards[name]
    }
    return 'stripe'
  }

  public showUpdateCardModal = false
}
</script>
