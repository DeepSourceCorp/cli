<template>
  <z-menu placement="top" class="w-full">
    <template v-slot:trigger="{ toggle, isOpen }">
      <sidebar-item :is-collapsed="isCollapsed" :active="isOpen" icon="help-circle" @click="toggle">
        Help and support
      </sidebar-item>
    </template>
    <template slot="body" class="z-10">
      <z-menu-section :divider="false" title="Help and support">
        <z-menu-item
          icon="book-open"
          as="a"
          href="https://deepsource.io/docs"
          target="_blank"
          rel="noopener noreferrer"
          >Read documentation</z-menu-item
        >
        <z-menu-item v-if="hasPaidPlan" icon="support" as="nuxt-link" to="/support"
          >Contact support</z-menu-item
        >
        <z-menu-item
          as="a"
          icon="bulb"
          href="https://roadmap.deepsource.io/feature-requests"
          target="_blank"
          rel="noopener noreferrer"
          >Create feature request</z-menu-item
        >
        <z-menu-item
          as="a"
          icon="message-square"
          href="https://discuss.deepsource.io/"
          target="_blank"
          rel="noopener noreferrer"
          >DeepSource Discuss</z-menu-item
        >
      </z-menu-section>
    </template>
  </z-menu>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import { ZMenu, ZMenuItem, ZMenuSection } from '@deepsourcelabs/zeal'
import ActiveUserMixin, { DashboardContext } from '~/mixins/activeUserMixin'
import { FREE_PLAN_SLUG } from '~/types/subscription'

/**
 * Support Menu, for the sidebar
 */
@Component({
  components: {
    ZMenu,
    ZMenuItem,
    ZMenuSection
  }
})
export default class SupportMenu extends mixins(ActiveUserMixin) {
  @Prop()
  isCollapsed: boolean

  get hasPaidPlan(): boolean {
    return (
      (this.activeDashboardContext as DashboardContext).subscribed_plan_info?.slug !==
      FREE_PLAN_SLUG
    )
  }
}
</script>
