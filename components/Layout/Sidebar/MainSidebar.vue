<template>
  <aside
    class="absolute h-screen duration-200 flex flex-col border-r transition-width transform-gpu lg:relative lg:left-0 border-ink-200 group bg-ink-400"
    v-outside-click="closeMenu"
    :class="[isOpen ? 'left-0' : '-left-full', collapsedSidebar ? 'w-14' : 'w-80']"
  >
    <section class="flex items-center p-2.5 pb-0">
      <context-switcher :isCollapsed="isCollapsed" />
    </section>
    <section
      class="p-2.5 space-y-2 hide-scroll flex-grow"
      :class="isCollapsed ? '' : 'overflow-y-scroll'"
    >
      <button
        v-if="canActivateRepo"
        class="flex items-center w-full p-2 space-x-2 leading-none border rounded-sm bg-ink-300 border-ink-200 hover:bg-ink-200"
        @click="showAddRepoModal = true"
      >
        <z-icon icon="book" size="small" color="vanilla-400" class="min-w-4 min-h-4"></z-icon>
        <span class="text-sm font-medium" v-show="!isCollapsed">Activate new repository</span>
      </button>
      <sidebar-item
        :isCollapsed="isCollapsed"
        icon="home"
        :active="$route.path === `/${provider}/${owner}/`"
        :to="getRoute('')"
      >
        {{ activeDashboardContext.type === 'team' ? 'Team home' : 'Home' }}
      </sidebar-item>
      <recently-active-repo :isCollapsed="isCollapsed" />
      <sidebar-item
        :isCollapsed="isCollapsed"
        icon="layers"
        :active="isActive('provider-owner-all-repos')"
        :to="getRoute('all-repos')"
        >All repositories</sidebar-item
      >
      <sidebar-item
        :isCollapsed="isCollapsed"
        v-if="showTeamMembers"
        icon="users"
        :active="isActive('provider-owner-members')"
        :to="getRoute('members/active')"
      >
        My team
      </sidebar-item>
      <sidebar-item
        :isCollapsed="isCollapsed"
        v-if="showTeamSettings"
        icon="settings"
        :active="isActive('provider-owner-settings')"
        :to="getRoute('settings')"
      >
        Settings
      </sidebar-item>
    </section>
    <section class="justify-self-end self-end w-full relative group">
      <div class="p-2.5 border-t border-ink-200 space-y-2">
        <sidebar-item
          :isCollapsed="isCollapsed"
          icon="dashboard"
          :active="$route.path === '/me'"
          to="/me"
        >
          Dashboard
        </sidebar-item>
        <sidebar-item
          :to="encodeURI(`mailto:${$config.supportEmail}?body=\n\nPath: ${$route.path}`)"
          :isCollapsed="isCollapsed"
          icon="support"
        >
          Get help
        </sidebar-item>
        <div
          class="items-center hidden lg:flex"
          :class="{ 'lg:space-x-1 w-full justify-between': !isCollapsed, 'w-8': isCollapsed }"
        >
          <user-menu :isCollapsed="isCollapsed" />
          <client-only>
            <change-log v-show="!isCollapsed" />
          </client-only>
        </div>
      </div>
      <div class="p-4 border-t border-ink-200">
        <div class="flex items-center justify-between space-x-2 leading-none">
          <z-icon
            icon="logo"
            size="small"
            color="vanilla-100"
            class="min-w-4 min-h-4 flex-shrink-0"
          ></z-icon>
          <span
            class="text-xs text-vanilla-300 self-end transition-all"
            :class="{
              'opacity-0 hidden delay-300': isCollapsed,
              'opacity-1 flex delay-0': !isCollapsed
            }"
            >© {{ currentYear }} DeepSource Corp.</span
          >
        </div>
      </div>
      <div class="absolute -top-2.5 -right-2.5 md:group-hover:block hidden">
        <button
          @click="toggleSidebarCollapse"
          class="bg-ink-100 w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate cursor-pointer group focus:outline-none"
        >
          <z-icon
            icon="chevron-left"
            size="small"
            color="vanilla-400"
            class="transition-transform transform-gpu duration-300"
            :class="isCollapsed ? 'rotate-180' : ''"
          />
        </button>
      </div>
    </section>
    <add-repo-modal
      :showModal="showAddRepoModal"
      @close="showAddRepoModal = false"
    ></add-repo-modal>
  </aside>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'

import { TeamMemberRoleChoices } from '~/types/types'

// types
import ContextMixin from '@/mixins/contextMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import { TeamPerms } from '~/types/permTypes'

@Component({
  components: {
    ZIcon
  }
})
export default class Sidebar extends mixins(ContextMixin, ActiveUserMixin) {
  public isCollapsed = false
  public collapsedSidebar = false
  public toggleCollapsed = false
  public isOpen = false
  public showAddRepoModal = false
  public largeScreenSize = 1024

  async fetch(): Promise<void> {
    await this.fetchContext()
    await this.fetchActiveUser()
  }

  mounted() {
    this.isCollapsed = Boolean(this.$localStore.get('ui-state', 'sidebar-collapsed'))
    this.collapsedSidebar = Boolean(this.$localStore.get('ui-state', 'sidebar-collapsed'))
    this.$root.$on('ui:show-sidebar-menu', () => {
      this.isCollapsed = false
      this.collapsedSidebar = false
      this.isOpen = true
    })
  }

  get modalStyle(): string {
    if (this.collapsedSidebar) {
      return 'w-80 md:w-13'
    }
    if (this.isOpen) {
      return 'w-80 lg:left-0 left-0'
    }
    return 'w-80 lg:left-0 -left-full'
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

    this.$localStore.set('ui-state', 'sidebar-collapsed', newVal)
  }

  containsElement(parentCandidate: HTMLElement, target: HTMLElement): boolean {
    return Boolean(
      parentCandidate && (target === parentCandidate || parentCandidate.contains(target))
    )
  }

  closeMenu(event: Event): void {
    const target = event.target as HTMLElement
    const toggleButton = document.getElementById('mobile-menu-toggle')
    if (!toggleButton) {
      this.isOpen = false
    } else if (!this.containsElement(toggleButton, target) && target.id !== 'mobile-menu-toggle') {
      this.isOpen = false
    }
  }

  public getRoute(params: string): string {
    return `/${this.provider}/${this.owner}/${params}`
  }

  get provider(): string {
    return this.activeProvider
  }

  get owner(): string {
    return this.activeOwner
  }

  public isActive(params: string): boolean {
    return this.$route.name?.startsWith(params) || false
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen
  }

  get canActivateRepo(): boolean {
    const role = this.activeDashboardContext.role as TeamMemberRoleChoices
    return this.$gateKeeper.team(TeamPerms.ACTIVATE_ANALYSIS, role)
  }

  get showTeamMembers(): boolean {
    if ('type' in this.activeDashboardContext) {
      if (this.activeDashboardContext.type === 'user') {
        return false
      }
      const role = this.activeDashboardContext.role as TeamMemberRoleChoices
      return this.$gateKeeper.team(TeamPerms.MANAGE_TEAM_MEMEBERS, role)
    }
    return false
  }

  get showTeamSettings(): boolean {
    if ('type' in this.activeDashboardContext) {
      if (this.activeDashboardContext.type === 'user') {
        return false
      }
    }

    if ('role' in this.activeDashboardContext) {
      const role = this.activeDashboardContext.role as TeamMemberRoleChoices
      return this.$gateKeeper.team(
        [
          TeamPerms.CHANGE_PLAN,
          TeamPerms.UPDATE_SEATS,
          TeamPerms.UPDATE_BILLING_DETAILS,
          TeamPerms.MANAGE_TEAM_MEMEBERS,
          TeamPerms.VIEW_ACCESS_CONTROL_DASHBOARD,
          TeamPerms.DELETE_TEAM_ACCOUNT
        ],
        role
      )
    }

    return false
  }

  get currentYear() {
    /**
     * Return the current year.
     */
    return new Date().getFullYear()
  }
}
</script>
