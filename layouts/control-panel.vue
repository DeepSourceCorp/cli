<template>
  <div class="mx-auto flex bg-ink-400 text-vanilla-100">
    <control-panel-sidebar />
    <div class="flex w-full flex-col">
      <mobile-nav
        class="sticky top-0 z-30 h-10 w-full border-b border-slate-400 bg-ink-300 lg:hidden"
      />
      <div
        class="sticky top-10 z-10 flex flex-row items-center justify-between border-b border-slate-400 bg-ink-400 px-3.5 py-2.5 lg:top-0"
      >
        <div class="flex items-center gap-x-2">
          <div class="h-6 w-6 flex-shrink-0 rounded-sm bg-ink-200">
            <img :src="orgInfo.logo" :alt="orgInfo.name && `${orgInfo.name}'s logo`" />
          </div>
          <!-- The key attribute is a hack to force z-breadcrumb to re-render till they become dynamic -->
          <z-breadcrumb
            :key="reRenderBreadcrumbs"
            separator="/"
            class="flex-shrink-0 text-sm text-vanilla-100"
          >
            <z-breadcrumb-item class="hidden cursor-pointer text-vanilla-400 lg:block"
              ><nuxt-link to="/control-panel">{{ orgInfo.name }}</nuxt-link></z-breadcrumb-item
            >
            <z-breadcrumb-item
              v-for="(titleElem, index) in activeRouteInfo.title"
              :key="titleElem"
              :class="{
                'hidden text-vanilla-400 lg:block': activeRouteInfo.title.length - 1 !== index
              }"
              ><component
                :is="isSubroute && index < 1 ? 'nuxt-link' : 'span'"
                :to="isSubroute && index < 1 ? parentRoute : null"
                >{{ titleElem }}</component
              ></z-breadcrumb-item
            >
          </z-breadcrumb>
        </div>
        <z-button
          button-type="secondary"
          icon="feather"
          label="Feedback"
          size="small"
          :to="`mailto:${$config.supportEmail}`"
        />
      </div>
      <div
        class="grid flex-grow"
        :class="pageSubroutes.length ? 'grid-cols-1 lg:grid-cols-sidebar' : 'grid-cols-1'"
      >
        <div
          class="control-panel-sub-sidebar-offset sticky z-10 flex flex-nowrap gap-5 overflow-auto border-b border-slate-400 bg-ink-400 px-4 pt-3 lg:hidden"
        >
          <z-tab
            v-for="cpItem in pageSubroutes"
            :key="getPageTitle(cpItem.title)"
            :icon="cpItem.icon"
            border-active-color="vanilla-100"
            :is-active="subRoute === cpItem.to || subRoute === cpItem.navTo"
          >
            <nuxt-link :to="cpItem.to ? cpItem.to : cpItem.href">
              {{ getPageTitle(cpItem.title) }}
            </nuxt-link>
          </z-tab>
        </div>
        <nav
          v-if="pageSubroutes.length"
          class="control-panel-sub-sidebar sticky hidden space-y-2.5 border-r border-slate-400 p-2.5 lg:block"
        >
          <sidebar-item
            v-for="cpItem in pageSubroutes"
            :key="getPageTitle(cpItem.title)"
            :icon="cpItem.icon"
            icon-color="current"
            :active="subRoute === cpItem.to || subRoute === cpItem.navTo"
            :to="cpItem.to ? cpItem.to : cpItem.href"
          >
            {{ getPageTitle(cpItem.title) }}
          </sidebar-item>
        </nav>
        <Nuxt />
      </div>
    </div>
    <!-- <control-panel-feedback-modal v-if="showFeedbackModal" @close="showFeedbackModal = false" /> -->
    <!-- TODO remove this later and inject via zeal -->
    <portal-target class="z-1000" name="modal" @change="modalToggled"></portal-target>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Watch } from 'nuxt-property-decorator'
import { MobileNav } from '@/components/Layout'
import AuthMixin from '@/mixins/authMixin'
import PortalMixin from '@/mixins/portalMixin'

import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'
import { stripTrailingSlash } from '~/utils/string'
import { ControlPanelRouteT } from '~/types/control-panel'

/**
 * Layout for control panel
 */
@Component({
  components: {
    MobileNav
  },
  head: {
    bodyAttrs: {
      class: 'antialiased stroke-2 min-h-screen bg-ink-400'
    }
  },
  meta: {
    auth: { strict: true }
  },
  middleware: ['restrictControlPanelAccess']
})
export default class ControlPanelLayout extends mixins(
  AuthMixin,
  PortalMixin,
  ControlPanelBaseMixin
) {
  showFeedbackModal = false
  reRenderBreadcrumbs = false

  /**
   * Fetch hook to get data about the org
   * @return {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.getOrgBaseData()
  }

  get activeRouteInfo(): ControlPanelRouteT | undefined {
    if (this.isSubroute) {
      const subRoutes = this.CONTROL_PANELS.find(
        ({ to }) => to === stripTrailingSlash(this.parentRoute ?? '')
      )?.subroutes
      if (subRoutes) {
        return (
          subRoutes.find(({ to }) => to === stripTrailingSlash(this.$route.path)) ||
          this.CONTROL_PANELS.find(({ to }) => to === stripTrailingSlash(this.parentRoute))
        )
      }
    }
    return this.CONTROL_PANELS.find(({ to }) => to === stripTrailingSlash(this.$route.path))
  }

  get pageSubroutes(): ControlPanelRouteT[] {
    return (
      this.CONTROL_PANELS.find(({ to }) => to === stripTrailingSlash(this.parentRoute ?? ''))
        ?.subroutes || []
    )
  }

  // ! Hack to force re-render breadcrumbs till they support dynamic updates
  @Watch('$route.path')
  updateBreadcrumbs() {
    this.reRenderBreadcrumbs = !this.reRenderBreadcrumbs
  }
}
</script>
<style scoped>
.control-panel-sub-sidebar {
  height: calc(100vh - 53px);
  top: 53px;
}
.control-panel-sub-sidebar-offset {
  top: 93px;
}
</style>
