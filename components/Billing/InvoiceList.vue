<template>
  <form-group label="Invoices" :divide="false" body-class="space-y-2">
    <template v-if="Array.isArray(invoices)">
      <a
        v-for="inv in invoices"
        :key="inv.invoiceId"
        :href="inv.url"
        target="blank"
        rel="noopener noreferrer"
        class="group flex w-full cursor-pointer items-center space-x-4 rounded-md border border-slate-400 border-opacity-70 p-4 text-vanilla-400 hover:border-slate-400 hover:bg-ink-300 hover:text-vanilla-100"
      >
        <!-- Replace with PDF -->
        <z-icon icon="file-text" size="base" color="current" />
        <span class="w-1/3 leading-6 text-vanilla-300 group-hover:text-vanilla-100">
          Invoice {{ formatDate(parseISODate(inv.date), 'MMM YYYY') }}
        </span>
        <span class="flex-grow leading-6 text-vanilla-300 group-hover:text-vanilla-100">
          Generated on {{ formatDate(parseISODate(inv.date)) }}
        </span>
        <z-icon icon="download" size="base" color="current" />
      </a>

      <div
        v-if="invoices.length !== billing.invoices.length"
        class="flex w-full items-center justify-center space-x-2"
      >
        <z-divider color="ink-300" class="border-dashed" />
        <z-button button-type="secondary" size="small" @click="itemsCount += 5">
          <span> Load more </span>
          <z-icon icon="chevron-down" />
        </z-button>
        <z-divider color="ink-300" class="border-dashed" />
      </div>
    </template>
    <template v-else>
      <div
        v-for="idx in 6"
        :key="idx"
        class="h-14 w-full animate-pulse rounded-md bg-ink-300"
      ></div>
    </template>
  </form-group>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { FormGroup } from '~/components/Form'
import { parseISODate, formatDate } from '~/utils/date'
import { BillingInfo } from '~/types/types'
import OwnerBillingMixin from '~/mixins/ownerBillingMixin'

@Component({
  components: { FormGroup },
  layout: 'dashboard',
  methods: {
    parseISODate,
    formatDate
  }
})
export default class InvoiceList extends mixins(OwnerBillingMixin) {
  itemsCount = 5

  get billing(): BillingInfo | {} {
    return this.owner.billingInfo ? this.owner.billingInfo : {}
  }

  get invoices() {
    return this.owner?.billingInfo?.invoices?.slice(0, this.itemsCount)
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
}
</script>
