<template>
  <div class="flex mx-auto bg-ink-400 text-vanilla-100">
    <control-panel-sidebar />
    <div class="flex flex-col w-full">
      <mobile-nav
        class="sticky top-0 z-30 w-full h-10 border-b lg:hidden bg-ink-300 border-ink-200"
      />
      <div
        class="
          sticky
          flex flex-row
          items-center
          justify-between
          border-b
          top-10
          lg:top-0
          border-ink-200
          px-3.5
          py-2.5
          z-10
          bg-ink-400
        "
      >
        <div class="flex items-center gap-x-2">
          <div class="flex-shrink-0 w-6 h-6 rounded-sm bg-ink-200">
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
                'hidden lg:block text-vanilla-400': activeRouteInfo.title.length - 1 !== index
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
          class="
            sticky
            z-10
            flex
            gap-5
            px-4
            pt-3
            overflow-auto
            border-b
            control-panel-sub-sidebar-offset
            lg:hidden
            flex-nowrap
            border-ink-200
            bg-ink-400
          "
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
          class="
            control-panel-sub-sidebar
            sticky
            border-r border-ink-200
            p-2.5
            space-y-2.5
            hidden
            lg:block
          "
        >
          <sidebar-item
            v-for="cpItem in pageSubroutes"
            :key="getPageTitle(cpItem.title)"
            :icon="cpItem.icon"
            icon-color="currentColor"
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

import { ZButton, ZBreadcrumb, ZBreadcrumbItem, ZTab } from '@deepsourcelabs/zeal'
import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'
import { stripTrailingSlash } from '~/utils/string'
import { ControlPanelRouteT } from '~/types/control-panel'

@Component({
  components: {
    MobileNav,
    ZButton,
    ZBreadcrumb,
    ZBreadcrumbItem,
    ZTab
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
