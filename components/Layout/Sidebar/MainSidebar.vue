<template>
  <!-- TODO the sidebar shouldn't need a z-index in lg+ screens but conflicts with zeal components block this  -->
  <aside
    class="
      fixed
      top-0
      z-50
      flex flex-col
      h-screen
      duration-200
      border-r
      lg:sticky lg:left-0
      transition-width
      transform-gpu
      border-ink-200
      group
      bg-ink-400
    "
    v-outside-click="closeMenu"
    :class="[isOpen ? 'left-0' : '-left-full', collapsedSidebar ? 'w-14' : 'w-72']"
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
        class="
          flex
          items-center
          w-full
          p-2
          space-x-2
          leading-none
          border
          rounded-sm
          bg-ink-300
          border-ink-200
          hover:bg-ink-200
        "
        @click="showAddRepoModal = true"
      >
        <z-icon icon="plus" size="small" color="vanilla-400" class="min-w-4 min-h-4"></z-icon>
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
      <client-only>
        <pending-adhoc-repos :isCollapsed="isCollapsed" />
      </client-only>
      <recently-active-repo :isCollapsed="isCollapsed" />
      <sidebar-item
        :isCollapsed="isCollapsed"
        icon="layers"
        :active="isActive('provider-owner-all-repos')"
        :to="getRoute('all-repos')"
      >
        <span class="flex justify-between w-full">
          <span>All repositories</span>
          <z-tag
            v-if="repositoryList.totalCount"
            bgColor="ink-100"
            textSize="xs"
            spacing="px-2 py-0.5"
          >
            {{ repositoryList.totalCount }}
          </z-tag>
        </span>
      </sidebar-item>
      <sidebar-item
        :isCollapsed="isCollapsed"
        v-if="showTeamMembers"
        icon="users"
        :active="isActive('provider-owner-members')"
        :to="getRoute('members/active')"
      >
        Team members
      </sidebar-item>
      <sidebar-item
        :isCollapsed="isCollapsed"
        v-if="showTeamSettings"
        icon="settings"
        :active="isActive('provider-owner-settings')"
        :to="settingsUrl"
      >
        Settings
      </sidebar-item>
    </section>

    <section
      v-if="
        !isCollapsed && owner.maxUsagePercentage >= 100 && Object.keys(availableUpgradePlans).length
      "
      class="p-4 border-t border-ink-200"
    >
      <h4 class="mb-2 text-sm font-medium leading-6 text-vanilla-100">Usage quota exhausted :(</h4>
      <p class="mb-4 text-xs font-normal leading-5 text-vanilla-400">
        You have exhausted your usage quota for this month. Upgrade your plan to keep things
        running.
      </p>
      <z-button
        button-type="primary"
        icon="zap"
        label="Upgrade plan"
        size="small"
        class="w-full"
        @click="$router.push($generateRoute(['settings', 'billing', 'plans'], false))"
      />
    </section>

    <section class="relative self-end w-full justify-self-end group">
      <div class="p-2.5 border-t border-ink-200 space-y-2">
        <sidebar-item
          to="/support"
          :active="$route.path === '/support'"
          :isCollapsed="isCollapsed"
          icon="support"
        >
          Get help
        </sidebar-item>
        <div class="flex items-center">
          <sidebar-item
            :isCollapsed="isCollapsed"
            icon="dashboard"
            :active="$route.path === '/me'"
            to="/me"
          >
            Dashboard
          </sidebar-item>
          <extras-menu v-if="!isCollapsed" />
        </div>

        <div
          class="items-center hidden lg:flex"
          :class="{ 'lg:space-x-1 w-full justify-between': !isCollapsed, 'w-8': isCollapsed }"
        >
          <user-menu :isCollapsed="isCollapsed" />
          <client-only>
            <change-log v-show="!isCollapsed" class="pr-px" />
          </client-only>
        </div>
      </div>

      <div class="p-4 border-t border-ink-200">
        <div class="flex items-center justify-between space-x-2 leading-none">
          <z-icon
            icon="logo"
            size="small"
            color="vanilla-100"
            class="flex-shrink-0 min-w-4 min-h-4"
          ></z-icon>
          <span
            class="self-end text-xs transition-all text-vanilla-300"
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
          class="
            flex
            items-center
            justify-center
            w-5
            h-5
            rounded-full
            cursor-pointer
            bg-ink-100
            hover:bg-slate
            group
            focus:outline-none
          "
        >
          <z-icon
            icon="chevron-left"
            size="small"
            color="vanilla-400"
            class="transition-transform duration-300 transform-gpu"
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
import { Component, Watch, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon, ZTag } from '@deepsourcelabs/zeal'

// types
import { TeamPerms } from '~/types/permTypes'
import { TeamMemberRoleChoices } from '~/types/types'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '@/mixins/contextMixin'
import OwnerDetailMixin from '@/mixins/ownerDetailMixin'
import PlanDetailMixin from '~/mixins/planDetailMixin'
import RepoListMixin from '~/mixins/repoListMixin'

@Component({
  components: {
    ZButton,
    ZIcon,
    ZTag
  }
})
export default class Sidebar extends mixins(
  ActiveUserMixin,
  ContextMixin,
  OwnerDetailMixin,
  PlanDetailMixin,
  RepoListMixin
) {
  public isCollapsed = false
  public collapsedSidebar = false
  public toggleCollapsed = false
  public isOpen = false
  public showAddRepoModal = false
  public largeScreenSize = 1024

  created() {
    this.isCollapsed = Boolean(this.$nuxt.$cookies.get('ui-state-sidebar-collapsed'))
    this.collapsedSidebar = Boolean(this.$nuxt.$cookies.get('ui-state-sidebar-collapsed'))
  }

  async fetch(): Promise<void> {
    const { owner: login, provider } = this.$route.params
    await Promise.all([
      this.fetchContext(),
      this.fetchActiveUser(),
      this.fetchMaxUsagePercentage({ login, provider })
    ])
  }

  @Watch('$route.params.owner')
  async fetchMaxUsageInfo() {
    const { owner: login, provider } = this.$route.params
    const params = { login, provider, refetch: true }
    await this.fetchMaxUsagePercentage(params)
  }

  @Watch('activeOwner')
  async fetchRepoCount(refetch?: boolean): Promise<void> {
    const pageSize =
      (this.$localStore.get(
        `${this.activeProvider}-${this.activeOwner}-all-repos`,
        `currentPageSize`
      ) as number) || 10
    await this.fetchRepoList({
      provider: this.activeProvider,
      login: this.activeOwner,
      limit: pageSize,
      currentPageNumber: 1,
      query: '',
      refetch
    })
  }

  mounted() {
    // this.isCollapsed = Boolean(this.$nuxt.$cookies.get('ui-state-sidebar-collapsed'))
    // this.collapsedSidebar = Boolean(this.$nuxt.$cookies.get('ui-state-sidebar-collapsed'))
    this.$root.$on('ui:show-sidebar-menu', () => {
      this.isCollapsed = false
      this.collapsedSidebar = false
      this.isOpen = true
    })

    this.fetchRepoCount()
    this.$socket.$on('repo-onboarding-completed', () => {
      this.fetchRepoCount(true)
    })
  }

  beforeDestroy() {
    this.$socket.$off('repo-onboarding-completed')
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

    this.$nuxt.$cookies.set('ui-state-sidebar-collapsed', newVal)
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
    return `/${this.provider}/${this.activeOwner}/${params}`
  }

  get provider(): string {
    return this.activeProvider
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
  get allowedAutoOnboard(): boolean {
    if (!['gh', 'ghe'].includes(this.activeProvider)) {
      return false
    }
    if ('role' in this.activeDashboardContext) {
      const role = this.activeDashboardContext.role as TeamMemberRoleChoices
      return this.$gateKeeper.team(
        [TeamPerms.AUTO_ONBOARD_CRUD_FOR_TEMPLATE, TeamPerms.AUTO_ONBOARD_VIEW_TEMPLATE],
        role
      )
    }

    return false
  }

  get settingsUrl(): string {
    if (this.allowedBilling && !this.$config.onPrem) {
      return this.getRoute('settings/billing')
    }
    if (this.allowedAccessControl) {
      return this.getRoute('settings/access')
    }
    if (this.allowedAutoOnboard) {
      return this.getRoute('settings/auto-onboard')
    }
    return this.getRoute('settings')
  }

  get showTeamSettings(): boolean {
    if ('type' in this.activeDashboardContext) {
      if (this.activeDashboardContext.type === 'user') {
        return false
      }
    }

    if ('role' in this.activeDashboardContext) {
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

  get currentYear() {
    /**
     * Return the current year.
     */
    return new Date().getFullYear()
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
