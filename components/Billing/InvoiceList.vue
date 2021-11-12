<template>
  <form-group label="Invoices" :divide="false" bodyClass="space-y-2">
    <template v-if="Array.isArray(billing.invoices)">
      <a
        :href="inv.url"
        target="blank"
        rel="noopener noreferrer"
        v-for="inv in billing.invoices"
        :key="inv.invoiceId"
        class="
          flex
          items-center
          w-full
          p-4
          space-x-4
          border
          rounded-md
          cursor-pointer
          group
          border-ink-200 border-opacity-70
          hover:bg-ink-300 hover:border-ink-200
          text-vanilla-400
          hover:text-vanilla-100
        "
      >
        <!-- Replace with PDF -->
        <z-icon icon="file-text" size="base" color="current" />
        <span class="w-1/3 text-vanilla-300 leading-6 group-hover:text-vanilla-100">
          Invoice {{ formatDate(parseISODate(inv.date), 'MMM YYYY') }}
        </span>
        <span class="flex-grow text-vanilla-300 leading-6 group-hover:text-vanilla-100">
          Generated on {{ formatDate(parseISODate(inv.date)) }}
        </span>
        <z-icon icon="download" size="base" color="current" />
      </a>
    </template>
    <template v-else>
      <div
        v-for="idx in 6"
        :key="idx"
        class="w-full rounded-md h-14 bg-ink-300 animate-pulse"
      ></div>
    </template>
  </form-group>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { FormGroup } from '~/components/Form'
import { ZIcon } from '@deepsourcelabs/zeal'
import { parseISODate, formatDate } from '~/utils/date'
import { BillingInfo } from '~/types/types'
import OwnerBillingMixin from '~/mixins/ownerBillingMixin'

@Component({
  components: { FormGroup, ZIcon },
  layout: 'dashboard'
})
export default class InvoiceList extends mixins(OwnerBillingMixin) {
  get billing(): BillingInfo | {} {
    return this.owner.billingInfo ? this.owner.billingInfo : {}
  }

  async fetch(): Promise<void> {
    if (!this.billing) {
      const { owner, provider } = this.$route.params
      await this.fetchBillingDetails({
        login: owner,
        provider
      })
    }
  }

  private parseISODate = parseISODate
  private formatDate = formatDate
}
</script>
