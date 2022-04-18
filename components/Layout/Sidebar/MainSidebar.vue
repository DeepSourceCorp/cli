<template>
  <!-- TODO the sidebar shouldn't need a z-index in lg+ screens but conflicts with zeal components block this  -->
  <aside
    class="fixed top-0 z-50 flex flex-col h-screen duration-200 border-r lg:sticky lg:left-0 transition-width transform-gpu border-ink-200 group bg-ink-400"
    v-outside-click="closeMenu"
    :class="[isOpen ? 'left-0' : '-left-full', collapsedSidebar ? 'w-14' : 'w-72']"
  >
    <template v-if="!toOnboard">
      <!-- Context switcher -->
      <section class="flex items-center p-2.5 pb-0">
        <context-switcher :is-collapsed="isCollapsed" />
      </section>
      <!-- Menu options -->
      <section
        class="p-2.5 space-y-2 hide-scroll flex-grow"
        :class="isCollapsed ? '' : 'overflow-y-scroll'"
      >
        <button
          v-if="canActivateRepo"
          v-tooltip="{
            content: isCollapsed ? 'Activate new repository' : '',
            placement: 'right'
          }"
          class="flex items-center w-full p-2 space-x-2 leading-none border rounded-sm bg-ink-300 border-ink-200 hover:bg-ink-200"
          @click="showAddRepoModal = true"
        >
          <z-icon icon="plus" size="small" color="vanilla-400" class="min-w-4 min-h-4" />
          <span v-show="!isCollapsed" class="text-sm font-medium">Activate new repository</span>
        </button>
        <nav class="space-y-2">
          <sidebar-item
            v-tooltip="{
              content: isCollapsed ? activeDashboardHome : '',
              placement: 'right'
            }"
            :is-collapsed="isCollapsed"
            icon="home"
            :active="$route.name === 'provider-owner'"
            :to="getRoute('')"
          >
            {{ activeDashboardHome }}
          </sidebar-item>
          <client-only>
            <pending-adhoc-repos :is-collapsed="isCollapsed" />
          </client-only>
          <recently-active-repo :is-collapsed="isCollapsed" />
          <sidebar-item
            v-tooltip="{
              content: isCollapsed ? 'All repositories' : '',
              placement: 'right'
            }"
            :is-collapsed="isCollapsed"
            icon="layers"
            :active="isActive('provider-owner-all-repos')"
            :to="getRoute('all-repos')"
          >
            <span class="flex items-center justify-between w-full">
              <span>All repositories</span>
              <z-tag
                v-if="repositoryList.totalCount"
                bg-color="ink-100"
                text-size="xs"
                spacing="px-2 py-1"
                class="leading-none"
              >
                <span class="mt-px">{{ repositoryList.totalCount }}</span>
              </z-tag>
            </span>
          </sidebar-item>
          <sidebar-item
            v-if="showTeamMembers"
            v-tooltip="{
              content: isCollapsed ? 'Team members' : '',
              placement: 'right'
            }"
            :is-collapsed="isCollapsed"
            icon="users"
            :active="isActive('provider-owner-members')"
            :to="getRoute('members/active')"
          >
            Team members
          </sidebar-item>
          <sidebar-item
            v-if="showTeamSettings"
            v-tooltip="{
              content: isCollapsed ? 'Settings' : '',
              placement: 'right'
            }"
            :is-collapsed="isCollapsed"
            icon="settings"
            :active="isActive('provider-owner-settings')"
            :to="settingsUrl"
          >
            Settings
          </sidebar-item>
          <sidebar-item
            v-if="$config.onPrem && isViewerSuperadmin"
            :is-collapsed="isCollapsed"
            icon="window"
            to="/control-panel"
          >
            Control panel
          </sidebar-item>
        </nav>
      </section>
    </template>
    <!-- Dummy menu when user isn't onboarded -->
    <section v-else class="flex-grow hide-scroll">
      <div class="border-b border-ink-200" :class="[isCollapsed ? 'py-4 pl-5' : 'py-4 pl-5']">
        <deep-source-logo :is-collapsed="isCollapsed" />
      </div>
      <nav class="p-2.5 space-y-2">
        <a
          v-if="installationUrl.startsWith('http')"
          v-tooltip="{
            content: isCollapsed ? 'Activate new repository' : '',
            placement: 'right'
          }"
          :href="installationUrl"
          class="flex items-center w-full p-2 mb-2 space-x-2 leading-none border rounded-sm bg-ink-300 border-ink-200 hover:bg-ink-200"
        >
          <z-icon icon="plus" size="small" color="vanilla-400" class="min-w-4 min-h-4" />
          <span v-show="!isCollapsed" class="text-sm font-medium">Activate new repository</span>
        </a>
        <nuxt-link
          v-else
          v-tooltip="{
            content: isCollapsed ? 'Activate new repository' : '',
            placement: 'right'
          }"
          :to="installationUrl"
          class="flex items-center w-full p-2 mb-2 space-x-2 leading-none border rounded-sm bg-ink-300 border-ink-200 hover:bg-ink-200"
        >
          <z-icon icon="plus" size="small" color="vanilla-400" class="min-w-4 min-h-4" />
          <span v-show="!isCollapsed" class="text-sm font-medium">Activate new repository</span>
        </nuxt-link>
        <sidebar-item
          v-tooltip="{
            content: isCollapsed ? 'Team home' : '',
            placement: 'right'
          }"
          :is-collapsed="isCollapsed"
          icon="home"
          to="/installation/pending"
        >
          <span>Team home</span>
        </sidebar-item>
        <sidebar-item
          v-tooltip="{
            content: isCollapsed ? 'All repositories' : '',
            placement: 'right'
          }"
          :is-collapsed="isCollapsed"
          icon="layers"
          to="/installation/pending"
        >
          <span>All repositories</span>
        </sidebar-item>
        <sidebar-item
          v-tooltip="{
            content: isCollapsed ? 'Resources' : '',
            placement: 'right'
          }"
          :is-collapsed="isCollapsed"
          icon="resources"
          to="https://docs.deepsource.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>Resources</span>
        </sidebar-item>
      </nav>
    </section>
    <!-- Quota exhausted CTA -->
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
    <!-- User menu -->
    <section class="relative self-end w-full justify-self-end group">
      <div class="p-2.5 border-t border-ink-200 space-y-2">
        <div class="lg:flex">
          <support-menu :is-collapsed="isCollapsed" />
        </div>
        <nav class="flex items-center">
          <sidebar-item
            v-tooltip="{
              content: isCollapsed ? 'Dashboard' : '',
              placement: 'right'
            }"
            :isCollapsed="isCollapsed"
            icon="dashboard"
            :active="$route.path === '/me'"
            to="/me"
          >
            Dashboard
          </sidebar-item>
          <extras-menu v-if="!isCollapsed" />
        </nav>
        <div
          class="items-center hidden lg:flex"
          :class="{ 'lg:space-x-1 w-full justify-between': !isCollapsed, 'w-8': isCollapsed }"
        >
          <user-menu :is-collapsed="isCollapsed" />
          <client-only>
            <change-log v-if="!$config.onPrem" v-show="!isCollapsed" class="pr-px" />
          </client-only>
        </div>
      </div>
      <div class="p-4 border-t border-ink-200" :class="{ 'pt-2': isChristmasSeason() }">
        <div class="flex items-center justify-between space-x-2 leading-none">
          <img
            v-if="isChristmasSeason()"
            v-tooltip="`'Tis the season`"
            src="~/assets/images/christmas-logo.svg"
            alt="Deepsource logo"
            class="flex-shrink-0 cursor-pointer min-w-4 min-h-4"
          />
          <z-icon
            v-else
            icon="logo"
            size="small"
            color="vanilla-100"
            class="flex-shrink-0 min-w-4 min-h-4"
          />
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
          class="flex items-center justify-center w-5 h-5 rounded-full cursor-pointer bg-ink-100 hover:bg-slate group focus:outline-none"
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
import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'
import { isChristmasSeason } from '~/utils/easter'

/**
 * Primary sidebar containing information and navigation for a user and the currently active owner.
 */
@Component({
  components: {
    ZButton,
    ZIcon,
    ZTag
  },
  methods: {
    isChristmasSeason
  }
})
export default class Sidebar extends mixins(
  ActiveUserMixin,
  ContextMixin,
  OwnerDetailMixin,
  PlanDetailMixin,
  RepoListMixin,
  ControlPanelBaseMixin
) {
  public isCollapsed = false
  public collapsedSidebar = false
  public toggleCollapsed = false
  public isOpen = false
  public showAddRepoModal = false
  public largeScreenSize = 1024

  /**
   * Created hook for the component. Initializes sidebar state from values in cookies.
   *
   * @returns {void}
   */
  created(): void {
    this.isCollapsed = Boolean(this.$nuxt.$cookies.get('ui-state-sidebar-collapsed'))
    this.collapsedSidebar = Boolean(this.$nuxt.$cookies.get('ui-state-sidebar-collapsed'))
  }

  /**
   * Fetch hook for the sidebar.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await Promise.all([
      this.fetchContext(),
      this.fetchActiveUser(),
      ...(this.$config.onPrem ? [this.getViewerSuperadminStatus()] : [])
    ])
  }

  /**
   * Fetches usage parameters for the active owner.
   *
   * @returns {Promise<void>}
   */
  @Watch('$route.params.owner')
  async fetchMaxUsageInfo(): Promise<void> {
    const { owner: login, provider } = this.$route.params
    const params = { login, provider, refetch: true }
    await this.fetchMaxUsagePercentage(params)
  }

  /**
   * Fetches the count for activated repositories for the active owner.
   *
   * @returns {Promise<void>}
   */
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

  /**
   * Mounted hook for the component. Binds listeners for events and fetches repository count.
   *
   * @returns {void}
   */
  mounted(): void {
    const { owner: login, provider } = this.$route.params

    this.$root.$on('ui:show-sidebar-menu', () => {
      this.isCollapsed = false
      this.collapsedSidebar = false
      this.isOpen = true
    })

    this.$socket.$on('repo-onboarding-completed', () => {
      this.fetchRepoCount(true)
    })

    this.fetchRepoCount()
    this.fetchMaxUsagePercentage({ login, provider })
  }

  /**
   * Before destroy hook for the component. Unbinds listeners for events.
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$root.$off('ui:show-sidebar-menu')
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

  /**
   * Toggles sidebar between collapsed and uncollapsed state.
   *
   * @returns {void}
   */
  toggleSidebarCollapse(): void {
    const newVal = !this.isCollapsed

    if (newVal) {
      this.isCollapsed = !this.isCollapsed
      this.collapsedSidebar = !this.collapsedSidebar
    } else {
      this.collapsedSidebar = !this.collapsedSidebar
      setTimeout(() => {
        this.isCollapsed = !this.isCollapsed
      }, 120)
    }

    this.$nuxt.$cookies.set('ui-state-sidebar-collapsed', newVal)
  }

  /**
   * Verifies if a given `parentCandidate` contains a `target` element.
   *
   * @param {HTMLElement} parentCandidate - Parent to find `target` in.
   * @param {HTMLElement} target - Element to find.
   * @returns {boolean} `true` if `target` is found in `parentCandidate`, else returns `false`.
   */
  containsElement(parentCandidate: HTMLElement, target: HTMLElement): boolean {
    return Boolean(
      parentCandidate && (target === parentCandidate || parentCandidate.contains(target))
    )
  }

  /**
   * Closes the sidebar menu on mobile view.
   *
   * @param {Event} event
   * @returns {void}
   */
  closeMenu(event: Event): void {
    const target = event.target as HTMLElement
    const toggleButton = document.getElementById('mobile-menu-toggle')
    if (!toggleButton) {
      this.isOpen = false
    } else if (!this.containsElement(toggleButton, target) && target.id !== 'mobile-menu-toggle') {
      this.isOpen = false
    }
  }

  /**
   * Generates and returns routes for given repositories.
   *
   * @param {string} param - Parameter to generate route for.
   * @returns {string} Route for the given parameter.
   */
  public getRoute(params: string): string {
    return `/${this.provider}/${this.activeOwner}/${params}`
  }

  get provider(): string {
    return this.activeProvider
  }

  /**
   * Returns if the given route is active or not.
   *
   * @param {string} param - Route name to check for.
   * @returns {boolean} `true` if the route is active, otherwise returns `false`.
   */
  public isActive(params: string): boolean {
    return this.$route.name?.startsWith(params) || false
  }

  /**
   * Toggles between sidebar's `open` and `close` states.
   *
   * @returns {void}
   */
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

  get activeDashboardHome(): string {
    return this.activeDashboardContext.type === 'team' ? 'Team home' : 'Home'
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

  get installationUrl(): string {
    if (this.viewer.connectedVcsProviders?.length && this.viewer.connectedVcsProviders.length > 1) {
      return '/installation/providers'
    }
    const provider = this.viewer.connectedVcsProviders?.[0]
    return provider
      ? this.installationUrls[this.$providerMetaMap[provider].auth]
      : '/installation/providers'
  }

  /**
   * Disables scrolling for the main `<body>` element if sidebar is `open`, otherwise enables it.
   *
   * @returns {void}
   */
  @Watch('isOpen')
  disableScroll(newIsOpen: boolean): void {
    if (newIsOpen && process.client) {
      document.body.classList.add('no-scroll')
    } else if (process.client) {
      document.body.classList.remove('no-scroll')
    }
  }
}
</script>
