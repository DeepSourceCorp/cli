<template>
  <z-menu placement="top" class="w-full">
    <template #trigger="{ toggle, isOpen }">
      <sidebar-item :is-collapsed="isCollapsed" :active="isOpen" icon="help-circle" @click="toggle">
        Help and support
      </sidebar-item>
    </template>

    <template #body>
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
          icon="message-square"
          href="https://discuss.deepsource.io/"
          target="_blank"
          rel="noopener noreferrer"
          >Join DeepSource Discuss</z-menu-item
        >
      </z-menu-section>
    </template>
  </z-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ZMenu, ZMenuItem, ZMenuSection } from '@deepsource/zeal'

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
