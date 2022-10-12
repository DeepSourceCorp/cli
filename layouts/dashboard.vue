<template>
  <div class="flex min-h-screen mx-auto bg-ink-400 text-vanilla-100 dashboard-layout">
    <sidebar v-if="loggedIn" @show-palette="showPalette = true" />
    <logged-out-sidebar v-else />
    <div class="w-full">
      <mobile-nav
        class="sticky top-0 z-30 w-full h-10 border-b lg:hidden bg-ink-300 border-ink-200"
      />
      <dashboard-header class="z-30 w-full md:sticky md:top-10 lg:top-0" />

      <!-- Tabs list -->
      <div
        class="sticky z-30 flex px-3 pt-3 overflow-x-scroll border-b border-ink-200 gap-x-5 bg-ink-400 hide-scroll tabs-list-container"
      >
        <template v-for="tab in tabsList">
          <nuxt-link
            v-if="'validator' in tab ? tab.validator : true"
            :key="tab.label"
            :to="tab.link"
          >
            <z-tab
              :is-active="getTabActiveStatus(tab)"
              :icon="tab.icon"
              border-active-color="juniper-500"
            >
              {{ tab.label }}
            </z-tab>
          </nuxt-link>
        </template>
      </div>

      <Nuxt ref="page" />
    </div>
    <!-- remove this later and inject via zeal -->
    <portal-target name="modal" class="z-1000" @change="modalToggled" />

    <!-- Set a lower `z-index` so that menu items appear above FAB for the `Members` page -->
    <portal-target name="floating-nav" class="z-5" />
    <client-only>
      <palette
        v-if="showPalette && allowPalette"
        @close="showPalette = false"
        @toggle="showPalette = !showPalette"
        class="z-1000"
      ></palette>
    </client-only>
  </div>
</template>

<script lang="ts">
import { ZTab } from '@deepsourcelabs/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import { DashboardHeader, LoggedOutSidebar, MobileNav } from '~/components/Layout'
import { Sidebar } from '~/components/Layout/Sidebar'
import AuthMixin from '~/mixins/authMixin'
import ContextMixin from '~/mixins/contextMixin'
import PaletteMixin from '~/mixins/paletteMixin'
import PortalMixin from '~/mixins/portalMixin'
import { AppFeatures, TeamPerms } from '~/types/permTypes'
import { TeamMemberRoleChoices } from '~/types/types'

interface ITabsList {
  label: string
  icon: string
  link: string
  validator?: boolean
}

@Component({
  components: {
    Sidebar,
    DashboardHeader,
    LoggedOutSidebar,
    MobileNav,
    ZTab
  },
  head: {
    bodyAttrs: {
      class: 'antialiased stroke-2 hide-scroll'
    }
  }
})
export default class DashboardLayout extends mixins(
  AuthMixin,
  ContextMixin,
  PortalMixin,
  PaletteMixin
) {
  get tabsList() {
    return [
      {
        label: 'Home',
        icon: 'home',
        link: this.getLink()
      },
      {
        label: 'Repositories',
        icon: 'layers',
        link: this.getLink('all-repos')
      },
      {
        label: 'Reports',
        icon: 'pie-chart',
        link: this.getLink('reports'),
        validator: this.canViewReports
      },
      {
        label: 'Members',
        icon: 'users',
        link: this.getLink('members'),
        validator: this.showTeamMembers
      },
      // {
      //   label: 'Analyzers',
      //   icon: 'public-analyzer',
      //   link: this.getLink('analyzers')
      // },
      {
        label: 'Settings',
        icon: 'wrench',
        link: this.settingsUrl,
        validator: this.showTeamSettings
      }
    ] as ITabsList[]
  }

  /**
   * Fetch hook for the dashboard layout
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchActiveUser()
  }

  get allowedAutoOnboard(): boolean {
    if (!this.$gateKeeper.provider(AppFeatures.AUTO_ONBOARD, this.activeProvider)) {
      return false
    }

    if (this.activeDashboardContext && 'role' in this.activeDashboardContext) {
      const role = this.activeDashboardContext.role as TeamMemberRoleChoices
      return this.$gateKeeper.team(
        [TeamPerms.AUTO_ONBOARD_CRUD_FOR_TEMPLATE, TeamPerms.AUTO_ONBOARD_VIEW_TEMPLATE],
        role
      )
    }

    return false
  }

  get canViewReports(): boolean {
    return this.$gateKeeper.team(TeamPerms.VIEW_REPORTS, this.teamPerms.permission)
  }

  get showTeamMembers(): boolean {
    if (this.activeDashboardContext && 'type' in this.activeDashboardContext) {
      if (this.activeDashboardContext.type === 'user') {
        return false
      }

      const role = this.activeDashboardContext.role as TeamMemberRoleChoices
      return this.$gateKeeper.team(TeamPerms.MANAGE_TEAM_MEMEBERS, role)
    }
    return false
  }

  get showTeamSettings(): boolean {
    if (this.activeDashboardContext && 'type' in this.activeDashboardContext) {
      if (this.activeDashboardContext.type === 'user') {
        return false
      }
    }

    if (this.activeDashboardContext && 'role' in this.activeDashboardContext) {
      const role = this.activeDashboardContext.role as TeamMemberRoleChoices
      return (
        this.$gateKeeper.team(
          [
            TeamPerms.CHANGE_PLAN,
            TeamPerms.UPDATE_SEATS,
            TeamPerms.UPDATE_BILLING_DETAILS,
            TeamPerms.MANAGE_TEAM_MEMEBERS,
            TeamPerms.VIEW_ACCESS_CONTROL_DASHBOARD,
            TeamPerms.DELETE_TEAM_ACCOUNT
          ],
          role
        ) || this.allowedAutoOnboard
      )
    }

    return false
  }

  get allowedBilling(): boolean {
    if (this.$config.onPrem) {
      return false
    }
    if ('role' in this.activeDashboardContext) {
      const role = this.activeDashboardContext.role as TeamMemberRoleChoices
      return this.$gateKeeper.team(
        [TeamPerms.CHANGE_PLAN, TeamPerms.UPDATE_SEATS, TeamPerms.UPDATE_BILLING_DETAILS],
        role
      )
    }
    return false
  }

  get allowedAccessControl(): boolean {
    if ('role' in this.activeDashboardContext) {
      const role = this.activeDashboardContext.role as TeamMemberRoleChoices
      return this.$gateKeeper.team(TeamPerms.VIEW_ACCESS_CONTROL_DASHBOARD, role)
    }
    return false
  }

  get settingsUrl(): string {
    if (this.allowedBilling && !this.$config.onPrem) {
      return this.getLink('settings/billing')
    }
    if (this.allowedAccessControl) {
      return this.getLink('settings/access')
    }
    if (this.allowedAutoOnboard) {
      return this.getLink('settings/auto-onboard')
    }
    return this.getLink('settings')
  }

  /**
   * Generates and returns routes for the given path
   *
   * @param {string} [path='']
   * @returns {string}
   */
  getLink(path = ''): string {
    return this.$generateRoute([path])
  }

  /**
   * Method to compute the tab active status
   *
   * @param {ITabsList} tab
   * @returns {boolean}
   */
  getTabActiveStatus({ label, link }: ITabsList): boolean {
    if (label === 'Home') {
      return this.$route.name === 'provider-owner'
    }

    // Return the top level route path for `settings`
    return this.$route.path.startsWith(label === 'Settings' ? this.getLink('settings') : link)
  }
}
</script>

<style scoped>
.dashboard-layout {
  /* The dashboard header comprising of the team/user avatar, VCS icon, etc. */
  --dashboard-header-height: 53px;

  /* The top position for horizontal navbar on mobile */
  --tabs-list-top-offset: 39px;
}

.tabs-list-container {
  top: var(--tabs-list-top-offset);
}

@media (min-width: 768px) {
  .dashboard-layout {
    --tabs-list-top-offset: 40px;
  }

  .tabs-list-container {
    top: calc(var(--dashboard-header-height) + var(--tabs-list-top-offset));
  }
}

@media (min-width: 1024px) {
  .tabs-list-container {
    top: var(--dashboard-header-height);
  }
}
</style>
