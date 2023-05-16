<template>
  <!-- TODO the sidebar shouldn't need a z-index in lg+ screens but conflicts with zeal components block this  -->
  <aside
    v-outside-click="closeMenu"
    class="transition-width group fixed top-0 z-50 flex h-screen transform-gpu flex-col border-r border-slate-400 bg-ink-400 duration-200 lg:sticky lg:left-0"
    :class="[isOpen ? 'left-0' : '-left-full', collapsedSidebar ? 'w-14' : 'w-72']"
  >
    <template v-if="!toOnboard">
      <!-- Context switcher -->
      <section class="flex items-center p-2.5 pb-0">
        <context-switcher :is-collapsed="isCollapsed" />
      </section>
      <!-- Menu options -->
      <section
        class="hide-scroll flex-grow space-y-2 p-2.5"
        :class="isCollapsed ? '' : 'overflow-y-scroll'"
      >
        <button
          v-if="canActivateRepo"
          v-tooltip="{
            content: isCollapsed ? 'Activate new repository' : '',
            placement: 'right'
          }"
          class="flex w-full items-center space-x-2 rounded-sm border border-slate-400 bg-ink-300 p-2 leading-none hover:bg-ink-200"
          @click="showAddRepoModal = true"
        >
          <z-icon icon="plus" size="small" color="vanilla-400" class="min-h-4 min-w-4" />
          <span v-show="!isCollapsed" class="text-sm font-medium">Activate new repository</span>
        </button>
        <nav class="space-y-2">
          <sidebar-item
            v-tooltip="{
              content: isCollapsed ? 'Home' : '',
              placement: 'right'
            }"
            :is-collapsed="isCollapsed"
            icon="home"
            :active="$route.name === 'provider-owner'"
            :to="getRoute('')"
          >
            Home
          </sidebar-item>
          <client-only>
            <pending-adhoc-repos :is-collapsed="isCollapsed" />
          </client-only>

          <sidebar-item
            v-if="viewer.isBetaTester"
            :is-collapsed="isCollapsed"
            icon="search"
            class="hidden md:flex"
            @click="$emit('show-palette')"
          >
            Quick search
          </sidebar-item>

          <recently-active-repo :is-collapsed="isCollapsed" />

          <sidebar-item
            v-if="$config.onPrem && isViewerSuperadmin"
            :is-collapsed="isCollapsed"
            icon="window"
            to="/control-panel"
          >
            Enterprise Control Panel
          </sidebar-item>
        </nav>
      </section>
    </template>
    <!-- Dummy menu when user isn't onboarded -->
    <section v-else class="hide-scroll flex-grow">
      <div class="border-b border-slate-400" :class="[isCollapsed ? 'py-4 pl-5' : 'py-4 pl-5']">
        <deep-source-logo :is-collapsed="isCollapsed" />
      </div>
      <nav class="space-y-2 p-2.5">
        <a
          v-if="installationUrl.startsWith('http')"
          v-tooltip="{
            content: isCollapsed ? 'Activate new repository' : '',
            placement: 'right'
          }"
          :href="installationUrl"
          class="mb-2 flex w-full items-center space-x-2 rounded-sm border border-slate-400 bg-ink-300 p-2 leading-none hover:bg-ink-200"
        >
          <z-icon icon="plus" size="small" color="vanilla-400" class="min-h-4 min-w-4" />
          <span v-show="!isCollapsed" class="text-sm font-medium">Activate new repository</span>
        </a>
        <nuxt-link
          v-else
          v-tooltip="{
            content: isCollapsed ? 'Activate new repository' : '',
            placement: 'right'
          }"
          :to="installationUrl"
          class="mb-2 flex w-full items-center space-x-2 rounded-sm border border-slate-400 bg-ink-300 p-2 leading-none hover:bg-ink-200"
        >
          <z-icon icon="plus" size="small" color="vanilla-400" class="min-h-4 min-w-4" />
          <span v-show="!isCollapsed" class="text-sm font-medium">Activate new repository</span>
        </nuxt-link>
        <sidebar-item
          v-tooltip="{
            content: isCollapsed ? 'Home' : '',
            placement: 'right'
          }"
          :is-collapsed="isCollapsed"
          icon="home"
          to="/installation/pending"
        >
          <span>Home</span>
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
          to="https://docs.deepsource.com/docs"
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
      class="border-t border-slate-400 p-4"
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
    <section class="group relative w-full self-end justify-self-end">
      <div class="space-y-2 border-t border-slate-400 p-2.5">
        <div class="lg:flex">
          <support-menu :is-collapsed="isCollapsed" />
        </div>
        <nav class="flex items-center">
          <sidebar-item
            v-tooltip="{
              content: isCollapsed ? 'Dashboard' : '',
              placement: 'right'
            }"
            :is-collapsed="isCollapsed"
            icon="dashboard"
            :active="$route.path === '/me'"
            to="/me"
          >
            Dashboard
          </sidebar-item>
          <extras-menu v-if="!isCollapsed" />
        </nav>
        <div
          class="hidden items-center lg:flex"
          :class="{ 'w-full justify-between lg:space-x-1': !isCollapsed, 'w-8': isCollapsed }"
        >
          <user-menu :is-collapsed="isCollapsed" />
        </div>
      </div>
      <div class="border-t border-slate-400 p-4" :class="{ 'pt-2': isChristmasSeason() }">
        <div class="flex items-center justify-between space-x-2 leading-none">
          <img
            v-if="isChristmasSeason()"
            v-tooltip="`'Tis the season`"
            src="~/assets/images/christmas-logo.svg"
            alt="Deepsource logo"
            class="min-h-4 min-w-4 flex-shrink-0 cursor-pointer"
          />
          <z-icon
            v-else
            icon="logo"
            size="small"
            color="vanilla-100"
            class="min-h-4 min-w-4 flex-shrink-0"
          />
          <span
            class="self-end text-xs text-vanilla-300 transition-all"
            :class="{
              'hidden opacity-0 delay-300': isCollapsed,
              'opacity-1 delay-0 flex': !isCollapsed
            }"
            >© {{ currentYear }} DeepSource Corp.</span
          >
        </div>
      </div>
      <div class="absolute -top-2.5 -right-2.5 hidden md:group-hover:block">
        <button
          class="focus:outline-none group flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-ink-100 hover:bg-slate"
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
    <add-repo-modal :show-modal="showAddRepoModal" @close="showAddRepoModal = false" />
  </aside>
</template>

<script lang="ts">
import { ZButton, ZIcon, ZTag } from '@deepsource/zeal'
import { Component, mixins, namespace, Watch } from 'nuxt-property-decorator'

import ContextMixin from '@/mixins/contextMixin'
import OwnerDetailMixin from '@/mixins/ownerDetailMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ControlPanelBaseMixin from '~/mixins/control-panel/ControlPanelBaseMixin'
import PlanDetailMixin from '~/mixins/planDetailMixin'
import RepoListMixin from '~/mixins/repoListMixin'

import { AuthGetterTypes } from '~/store/account/auth'

// types
import { TeamPerms } from '~/types/permTypes'
import { TeamMemberRoleChoices } from '~/types/types'

import { isChristmasSeason } from '~/utils/easter'
import { containsElement } from '~/utils/ui'

const authStore = namespace('account/auth')
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
  @authStore.Getter(AuthGetterTypes.GET_LOGGED_IN)
  isLoggedIn: boolean

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

    if (process.client && this.isLoggedIn) {
      // Identify the user via RudderStack
      const { avatar, dateJoined: createdAt, email, firstName, id, lastName } = this.viewer

      if (id && email) {
        const userId = Buffer.from(id, 'base64').toString().toLowerCase().replace('user:', '')

        // @ts-ignore
        this.$rudder?.identify(userId, {
          avatar,
          createdAt,
          email,
          firstName,
          lastName
        })
      }

      // Identify the team via RudderStack
      const {
        avatar_url: team_avatar_url,
        id: groupId,
        subscribed_plan_info,
        team_name,
        type,
        vcs_provider_display
      } = this.activeDashboardContext

      if (type === 'team' && groupId && team_name) {
        const stringifiedGroupId = String(groupId)

        this.$rudder?.group(stringifiedGroupId, {
          groupType: 'organization',
          avatar: team_avatar_url,
          name: team_name,
          plan:
            typeof subscribed_plan_info === 'object'
              ? subscribed_plan_info.name
              : subscribed_plan_info,
          vcsProvider: vcs_provider_display
        })
      }
    }
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
    } else if (!containsElement(toggleButton, target) && target.id !== 'mobile-menu-toggle') {
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
