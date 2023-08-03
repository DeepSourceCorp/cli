<template>
  <div class="mb-12 space-y-5">
    <div class="border-b border-slate-400 px-4 py-3">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item class="cursor-pointer text-vanilla-400"
          ><nuxt-link :to="$generateRoute(['settings', 'billing'])"
            >Billing</nuxt-link
          ></z-breadcrumb-item
        >
        <z-breadcrumb-item class="cursor-pointer">Plans</z-breadcrumb-item>
      </z-breadcrumb>
    </div>

    <plan-cards :has-paid-plan="true" class="px-4" />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import OwnerBillingMixin from '~/mixins/ownerBillingMixin'

@Component({})
export default class Plans extends mixins(OwnerBillingMixin) {
  async fetch() {
    const { owner, provider } = this.$route.params
    const params = {
      login: owner,
      provider
    }
    await this.fetchBillingDetails(params)
  }
}
</script>
