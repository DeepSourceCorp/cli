<template>
  <!-- TODO the sidebar shouldn't need a z-index in lg+ screens but conflicts with zeal components block this  -->
  <aside
    v-outside-click="closeMenu"
    class="fixed top-0 z-50 flex flex-col h-screen duration-200 border-r lg:sticky lg:left-0 transition-width transform-gpu border-slate-400 group bg-ink-400"
    :class="[isOpen ? 'left-0' : '-left-full', collapsedSidebar ? 'w-14' : 'w-72']"
  >
    <section class="p-4 border-b border-slate-400">
      <nuxt-link :to="homeUrl">
        <img class="h-5 mt-0.5" src="~/assets/images/logo-wordmark-white.svg" alt="DeepSource" />
      </nuxt-link>
    </section>
    <section
      class="flex flex-col justify-between flex-grow h-full p-3 space-y-3 overflow-y-scroll hide-scroll border-slate-400"
    >
      <div class="space-y-2">
        <nuxt-link
          v-if="loggedIn"
          icon="add-watchlist"
          :active="$route.name === 'discover-watchlist'"
          to="/discover/watchlist"
          class="flex items-center w-full p-2 gap-x-2 text-sm leading-none border rounded-sm bg-ink-300 border-slate-400 hover:bg-ink-200"
        >
          <z-icon icon="plus" size="small" color="vanilla-400" class="min-w-4 min-h-4" />
          <span class="flex justify-between w-full">
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
            class="ml-0.5 text-xs leading-none font-medium tracking-wider uppercase text-vanilla-400"
          >
            Filter by technology
          </span>
          <div class="flex flex-wrap gap-1.5 mt-2">
            <template v-for="analyzer in analyzerList">
              <nuxt-link
                v-if="!['test-coverage', 'secrets'].includes(analyzer.shortcode)"
                :key="analyzer.id"
                class="inline-flex items-center justify-center pr-2 pl-1 py-1 mb-0.5 mr-0.5 space-x-1 text-sm rounded-full cursor-pointer"
                :class="[
                  $route.params.lang === analyzer.shortcode
                    ? 'bg-robin'
                    : 'bg-ink-200 hover:bg-ink-100 bg-opacity-80 text-vanilla-400'
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

    <section class="relative self-end w-full border-t border-slate-400 justify-self-end group">
      <div v-if="loggedIn" class="p-2.5 space-y-2">
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
          class="items-center hidden lg:flex"
          :class="[isCollapsed ? 'w-8' : 'lg:space-x-1 w-full justify-between']"
        >
          <user-menu :is-collapsed="isCollapsed" />
        </div>
      </div>

      <footer
        v-else
        class="w-full p-3 border-solid border-slate-400 bg-gradient-dark-dawn backdrop-blur-xl"
      >
        <h3 class="text-lg font-semibold">Run your first analysis.</h3>
        <p class="mt-2 text-sm text-vanilla-400">
          Find thousands of code security and quality issues in your codebase, before they end up in
          production.
        </p>
        <nuxt-link to="/signup">
          <z-button button-type="primary" class="w-full mt-4">Start now</z-button>
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
            class="flex-shrink-0 cursor-pointer min-w-4 min-h-4"
          />
          <z-icon
            v-else
            icon="logo"
            size="small"
            color="vanilla-100"
            class="flex-shrink-0 cursor-pointer min-w-4 min-h-4"
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
import { ZButton, ZConfirm, ZIcon, ZTag } from '@deepsource/zeal'

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
  components: {
    ZButton,
    ZConfirm,
    ZIcon,
    ZTag
  },
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
