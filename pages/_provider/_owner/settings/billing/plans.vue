<template>
  <div class="grid gap-5">
    <div class="border-b border-ink-200 p-4">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item class="cursor-pointer text-vanilla-400"
          ><nuxt-link :to="$generateRoute(['settings', 'billing'])"
            >Billing</nuxt-link
          ></z-breadcrumb-item
        >
        <z-breadcrumb-item class="cursor-pointer">Plans</z-breadcrumb-item>
      </z-breadcrumb>
    </div>

    <plan-cards :show-current-plan="true" class="px-4" />
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZBreadcrumb, ZBreadcrumbItem } from '@deepsourcelabs/zeal'

import UpgradePlanDetailMixin from '~/mixins/upgradePlanDetailMixin'

@Component({
  components: {
    ZBreadcrumb,
    ZBreadcrumbItem
  }
})
export default class Plans extends mixins(UpgradePlanDetailMixin) {
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
