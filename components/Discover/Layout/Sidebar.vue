<template>
  <!-- TODO the sidebar shouldn't need a z-index in lg+ screens but conflicts with zeal components block this  -->
  <aside
    v-outside-click="closeMenu"
    class="transition-width group fixed top-0 z-50 flex h-screen transform-gpu flex-col border-r border-slate-400 bg-ink-400 duration-200 lg:sticky lg:left-0"
    :class="[isOpen ? 'left-0' : '-left-full', collapsedSidebar ? 'w-14' : 'w-72']"
  >
    <section class="border-b border-slate-400 p-4">
      <nuxt-link :to="homeUrl">
        <img class="mt-0.5 h-5" src="~/assets/images/logo-wordmark-white.svg" alt="DeepSource" />
      </nuxt-link>
    </section>
    <section
      class="hide-scroll flex h-full flex-grow flex-col justify-between space-y-3 overflow-y-scroll border-slate-400 p-3"
    >
      <div class="space-y-2">
        <nuxt-link
          v-if="loggedIn"
          icon="add-watchlist"
          :active="$route.name === 'discover-watchlist'"
          to="/discover/watchlist"
          class="flex w-full items-center gap-x-2 rounded-sm border border-slate-400 bg-ink-300 p-2 text-sm leading-none hover:bg-ink-200"
        >
          <z-icon icon="plus" size="small" color="vanilla-400" class="min-h-4 min-w-4" />
          <span class="flex w-full justify-between">
            <span>Watchlist</span>
            <z-tag
              v-if="watchedRepositoriesCount"
              bg-color="ink-100"
              text-size="xs"
              spacing="px-2 py-0.5"
            >
              {{ watchedRepositoriesCount }}
            </z-tag>
          </span>
        </nuxt-link>

        <sidebar-item
          v-tooltip="{
            content: isCollapsed ? activeDashboardHome : '',
            placement: 'right'
          }"
          :is-collapsed="isCollapsed"
          icon="home"
          :to="homeUrl"
          class="ml-px"
        >
          Home
        </sidebar-item>

        <div class="ml-2">
          <span
            class="ml-0.5 text-xs font-medium uppercase leading-none tracking-wider text-vanilla-400"
          >
            Filter by technology
          </span>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <template v-for="analyzer in analyzerList">
              <nuxt-link
                v-if="!['test-coverage', 'secrets'].includes(analyzer.shortcode)"
                :key="analyzer.id"
                class="mb-0.5 mr-0.5 inline-flex cursor-pointer items-center justify-center space-x-1 rounded-full py-1 pl-1 pr-2 text-sm"
                :class="[
                  $route.params.lang === analyzer.shortcode
                    ? 'bg-robin'
                    : 'bg-ink-200 bg-opacity-80 text-vanilla-400 hover:bg-ink-100'
                ]"
                :to="
                  $route.params.lang === analyzer.shortcode
                    ? `/discover`
                    : `/discover/${analyzer.shortcode}`
                "
                role="button"
              >
                <analyzer-logo
                  :analyzer-logo="analyzer.analyzerLogo"
                  :shortcode="analyzer.shortcode"
                />
                <span class="text-xs"> {{ analyzer.name }} </span>
              </nuxt-link>
            </template>
          </div>
        </div>
      </div>
      <div class="justify-self-end">
        <z-button
          v-if="loggedIn"
          button-type="primary"
          size="small"
          class="w-full"
          icon="plus"
          @click="showInDiscoverInfoDialog = true"
        >
          Add your project
        </z-button>
        <z-button
          v-else
          to="/signup"
          button-type="secondary"
          size="small"
          class="w-full"
          icon="plus"
        >
          Add your project
        </z-button>
      </div>
    </section>

    <section class="group relative w-full self-end justify-self-end border-t border-slate-400">
      <div v-if="loggedIn" class="space-y-2 p-2.5">
        <div class="lg:flex">
          <support-menu :is-collapsed="isCollapsed" />
        </div>
        <div class="flex items-center">
          <sidebar-item
            :is-collapsed="isCollapsed"
            icon="dashboard"
            :active="$route.path === '/me'"
            to="/me"
          >
            Dashboard
          </sidebar-item>
          <extras-menu />
        </div>
        <div
          class="hidden items-center lg:flex"
          :class="[isCollapsed ? 'w-8' : 'w-full justify-between lg:space-x-1']"
        >
          <user-menu :is-collapsed="isCollapsed" />
        </div>
      </div>

      <footer
        v-else
        class="w-full border-solid border-slate-400 p-3 backdrop-blur-xl bg-gradient-dark-dawn"
      >
        <h3 class="text-lg font-semibold">Run your first analysis.</h3>
        <p class="mt-2 text-sm text-vanilla-400">
          Find thousands of code security and quality issues in your codebase, before they end up in
          production.
        </p>
        <nuxt-link to="/signup">
          <z-button button-type="primary" class="mt-4 w-full">Start now</z-button>
        </nuxt-link>
      </footer>
      <div
        class="border-t border-slate-400"
        :class="[isChristmasSeason() ? 'p-4 pt-2' : 'px-2 py-4']"
      >
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
            class="min-h-4 min-w-4 flex-shrink-0 cursor-pointer"
          />
          <span
            class="self-end text-xs text-vanilla-300 transition-all"
            :class="{
              'hidden opacity-0 delay-300': isCollapsed,
              'opacity-1 flex delay-0': !isCollapsed
            }"
            >© {{ currentYear }} DeepSource Corp.</span
          >
        </div>
      </div>
    </section>
    <portal to="modal">
      <z-confirm
        v-if="showInDiscoverInfoDialog"
        title="Show in discover"
        subtitle="On the repository settings page, scroll to the bottom to find the Add to discover button."
        primary-action-label="Okay"
        @onClose="showInDiscoverInfoDialog = false"
        @primaryAction="showInDiscoverInfoDialog = false"
      />
    </portal>
  </aside>
</template>

<script lang="ts">
import { Component, mixins, namespace, Watch } from 'nuxt-property-decorator'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import AuthMixin from '~/mixins/authMixin'
import { isChristmasSeason } from '~/utils/easter'

import { DirectoryActions, DirectoryGetters } from '~/store/directory/directory'
import { DiscoverUserActions } from '~/store/discover/user'
import { Analyzer } from '~/types/types'
import { containsElement } from '~/utils/ui'

const directoryStore = namespace('directory/directory')
const discoverUserStore = namespace('discover/user')

@Component({
  methods: {
    isChristmasSeason
  }
})
export default class Sidebar extends mixins(ActiveUserMixin, AuthMixin) {
  @directoryStore.Getter(DirectoryGetters.DIRECTORY_ANALYZERS)
  analyzerList: Analyzer[]

  @directoryStore.Action(DirectoryActions.FETCH_ANALYZER_DIR_LIST)
  fetchAnalyzers: () => Promise<void>

  @discoverUserStore.State
  watchedRepositoriesCount: number

  @discoverUserStore.Action(DiscoverUserActions.FETCH_WATCHED_REPOSITORIES_COUNT)
  fetchWatchedRepositoriesCount: () => Promise<void>

  public isCollapsed = false
  public collapsedSidebar = false
  public toggleCollapsed = false
  public isOpen = false
  public showInDiscoverInfoDialog = false
  public showUpdateTechnologiesModal = false
  public debounceTimer: ReturnType<typeof setTimeout>

  async fetch(): Promise<void> {
    if (this.loggedIn) {
      await this.fetchActiveUser()
    }
    await this.fetchAnalyzers()
  }

  openSidebar() {
    this.isCollapsed = false
    this.collapsedSidebar = false
    this.isOpen = true
  }

  closeSidebar() {
    this.isCollapsed = true
    this.collapsedSidebar = true
    this.isOpen = false
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed
    this.collapsedSidebar = !this.collapsedSidebar
    this.isOpen = !this.isOpen
  }

  mounted() {
    if (this.loggedIn) {
      this.fetchWatchedRepositoriesCount()
    }
    this.$root.$on('ui:show-sidebar-menu', this.openSidebar)
    this.$root.$on('ui:hide-sidebar-menu', this.closeSidebar)
    this.$root.$on('ui:toggle-sidebar-menu', this.toggleSidebar)
  }

  beforeDestroy() {
    this.$root.$off('ui:show-sidebar-menu', this.openSidebar)
    this.$root.$off('ui:hide-sidebar-menu', this.closeSidebar)
    this.$root.$off('ui:toggle-sidebar-menu', this.toggleSidebar)
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

  get currentYear() {
    /**
     * Return the current year.
     */
    return new Date().getFullYear()
  }

  get activeDashboardHome(): string {
    return this.activeDashboardContext.type === 'team' ? 'Team home' : 'Home'
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
