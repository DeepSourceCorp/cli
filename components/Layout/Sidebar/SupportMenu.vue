<template>
  <z-menu placement="top">
    <template v-slot:trigger="{ toggle, isOpen }">
      <sidebar-item
        :is-collapsed="isCollapsed"
        :active="isOpen"
        icon="message-square"
        @click="toggle"
      >
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
        <z-menu-item icon="support" as="nuxt-link" to="/support">Contact support</z-menu-item>
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
          icon="discord"
          href="https://deepsource.io/discord"
          target="_blank"
          rel="noopener noreferrer"
          >Join Discord community</z-menu-item
        >
      </z-menu-section>
    </template>
  </z-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZMenu, ZMenuItem, ZMenuSection } from '@deepsourcelabs/zeal'

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
export default class SupportMenu extends Vue {
  @Prop()
  isCollapsed: boolean
}
</script>
