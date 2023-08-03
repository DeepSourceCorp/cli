<template>
  <!-- TODO the sidebar shouldn't need a z-index in lg+ screens but conflicts with zeal components block this  -->
  <nav
    v-outside-click="closeMenu"
    class="transition-width group fixed top-0 z-50 flex h-screen transform-gpu flex-col border-r border-slate-400 bg-ink-400 duration-200 lg:sticky lg:left-0"
    :class="[isOpen ? 'left-0' : '-left-full', collapsedSidebar ? 'w-14' : 'w-72']"
  >
    <section class="border-b border-slate-400 p-3">
      <nuxt-link to="/control-panel" class="flex cursor-pointer items-center gap-0.5 rounded-sm">
        <img
          src="~/assets/images/deepsource-only-logo-white.svg"
          alt="DeepSource's logo"
          class="h-7"
        />
        <span v-if="!isCollapsed" class="text-sm capitalize">Enterprise Control Panel</span>
      </nuxt-link>
    </section>
    <section class="space-y-2.5 p-2.5" :class="isCollapsed ? '' : 'overflow-y-auto'">
      <sidebar-item
        v-for="cpItem in mainControlPanelMenus"
        :key="getPageTitle(cpItem.title)"
        :is-collapsed="isCollapsed"
        :icon="cpItem.icon"
        icon-color="current"
        :active="parentRoute === cpItem.to"
        :to="cpItem.to ? cpItem.to : cpItem.href ? cpItem.href : managementConsoleUrl"
        :target="cpItem.to ? false : '_blank'"
        :rel="cpItem.to ? false : 'noopener noreferrer'"
      >
        {{ getPageTitle(cpItem.title) }}
      </sidebar-item>
    </section>
    <section class="group relative w-full">
      <div class="space-y-2 border-t border-slate-400 p-2.5">
        <sidebar-item
          v-for="cpItem in secondaryControlPanelMenus"
          :key="getPageTitle(cpItem.title)"
          :is-collapsed="isCollapsed"
          :icon="cpItem.icon"
          :active="parentRoute === cpItem.to"
          :to="cpItem.to ? cpItem.to : cpItem.href ? cpItem.href : managementConsoleUrl"
          :target="cpItem.to ? false : '_blank'"
          :rel="cpItem.to ? false : 'noopener noreferrer'"
        >
          {{ getPageTitle(cpItem.title) }}
        </sidebar-item>
      </div>
      <div class="absolute -right-2.5 -top-2.5 hidden md:group-hover:block">
        <button
          class="group flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-ink-100 hover:bg-slate focus:outline-none"
          @click="toggleSidebarCollapse"
        >
          <z-icon
            icon="chevron-left"
            size="small"
            color="vanilla-400"
            class="transform-gpu transition-transform duration-300"
            :class="isCollapsed ? 'rotate-180' : ''"
          />
        </button>
      </div>
    </section>
  </nav>
</template>

<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'
import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'

import { ControlPanelRouteT } from '~/types/control-panel'
import { containsElement } from '~/utils/ui'

@Component({})
export default class Sidebar extends mixins(ControlPanelBaseMixin) {
  public isCollapsed = false
  public collapsedSidebar = false
  public isOpen = false

  created() {
    this.isCollapsed = Boolean(this.$nuxt.$cookies.get('ui-state-sidebar-collapsed'))
    this.collapsedSidebar = Boolean(this.$nuxt.$cookies.get('ui-state-sidebar-collapsed'))
  }

  mounted() {
    this.$root.$on('ui:show-sidebar-menu', () => {
      this.isCollapsed = false
      this.collapsedSidebar = false
      this.isOpen = true
    })

    this.$root.$on('ui:toggle-sidebar-menu', () => {
      this.isCollapsed = !this.isCollapsed
      this.collapsedSidebar = !this.collapsedSidebar
      this.isOpen = !this.isOpen
    })
  }

  beforeDestroy() {
    this.$root.$off('ui:show-sidebar-menu')
    this.$root.$off('ui:toggle-sidebar-menu')
  }

  get mainControlPanelMenus(): ControlPanelRouteT[] {
    return this.CONTROL_PANELS.filter(
      ({ title }) => !this.secondaryMenuList.includes(this.getPageTitle(title))
    )
  }

  get secondaryControlPanelMenus(): ControlPanelRouteT[] {
    return this.CONTROL_PANELS.filter(({ title }) =>
      this.secondaryMenuList.includes(this.getPageTitle(title))
    )
  }

  toggleSidebarCollapse(): void {
    const newVal = !this.isCollapsed

    if (newVal) {
      this.isCollapsed = !this.isCollapsed
      this.collapsedSidebar = !this.collapsedSidebar
    } else {
      this.collapsedSidebar = !this.collapsedSidebar
      setTimeout(() => {
        this.isCollapsed = !this.isCollapsed
      }, 100)
    }

    this.$nuxt.$cookies.set('ui-state-sidebar-collapsed', newVal)
  }

  closeMenu(event: Event): void {
    const target = event.target as HTMLElement
    const toggleButton = document.getElementById('mobile-menu-toggle')
    if (!toggleButton) {
      this.isOpen = false
    } else if (!containsElement(toggleButton, target) && target.id !== 'mobile-menu-toggle') {
      this.isOpen = false
    }
  }

  public isActive(params: string): boolean {
    return this.$route.name?.startsWith(params) || false
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen
  }

  @Watch('isOpen')
  disableScroll(newIsOpen: boolean) {
    if (newIsOpen && process.client) {
      document.body.classList.add('no-scroll')
    } else if (process.client) {
      document.body.classList.remove('no-scroll')
    }
  }
}
</script>
