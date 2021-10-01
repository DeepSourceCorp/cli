<template>
  <aside
    class="absolute flex flex-col h-screen duration-200 border-r transition-width transform-gpu lg:relative lg:left-0 border-ink-200 group bg-ink-400"
    v-outside-click="closeMenu"
    :class="[isOpen ? 'left-0' : '-left-full', collapsedSidebar ? 'w-14' : 'w-72']"
  >
    <section class="px-2.5 py-4 border-b border-ink-200">
      <img
        class="w-auto h-5 mt-0.5"
        src="~/assets/images/logo-wordmark-white.svg"
        alt="DeepSource"
      />
    </section>
    <section
      class="p-2.5 hide-scroll flex flex-col flex-grow border-ink-200 min-h-20 justify-between"
      :class="[isCollapsed ? '' : 'overflow-y-scroll']"
    >
      <div>
        <nuxt-link v-if="loggedIn" to="/discover/watchlist">
          <z-button
            v-if="!isCollapsed"
            icon="add-watchlist"
            button-type="secondary"
            size="small"
            class="w-full border bg-ink-300 border-ink-200 hover:bg-ink-200"
          >
            Watching {{ watchedRepositories.totalCount }}
            {{ watchedRepositories.totalCount === 1 ? 'project' : 'projects' }}
          </z-button>
        </nuxt-link>
        <z-button
          v-else
          to="https://deepsource.io"
          icon="arrow-left"
          color="vanilla-200"
          size="small"
          button-type="secondary"
          class="w-full border bg-ink-300 border-ink-200 hover:bg-ink-200"
        >
          Back to deepsource.io
        </z-button>
      </div>

      <div v-if="!isCollapsed" :class="{ 'mt-4': !loggedIn }">
        <span class="ml-0.5 text-xs font-medium tracking-wider uppercase text-vanilla-400"
          >Filter by technology</span
        >
        <div class="flex flex-wrap gap-1.5 mt-2">
          <nuxt-link
            v-for="analyzer in analyzerList"
            :key="analyzer.id"
            class="inline-flex items-center justify-center px-2 py-1 mb-0.5 mr-0.5 space-x-1 text-sm rounded-full cursor-pointer"
            :class="[
              $route.params.lang === analyzer.shortcode
                ? 'bg-gradient-dawn'
                : 'bg-ink-200 hover:bg-ink-100 bg-opacity-80 text-vanilla-400'
            ]"
            :to="
              $route.params.lang === analyzer.shortcode
                ? `/discover`
                : `/discover/${analyzer.shortcode}`
            "
            role="button"
          >
            <img
              v-if="analyzer.analyzerLogo"
              :src="analyzer.analyzerLogo"
              :alt="analyzer.name"
              class="flex-shrink-0 w-auto h-4"
            />
            <span class="text-xs"> {{ analyzer.name }} </span>
          </nuxt-link>
        </div>
      </div>
    </section>

    <section class="relative self-end w-full border-t border-ink-200 justify-self-end group">
      <div v-if="loggedIn">
        <div class="p-2.5 space-y-2">
          <z-button
            v-if="!isCollapsed"
            button-type="primary"
            size="small"
            class="w-full mt-2"
            icon="plus"
            @click="showInDiscoverInfoDialog = true"
          >
            Add your project
          </z-button>
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
            <extras-menu />
          </div>
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
      </div>

      <div v-else class="p-2.5 space-y-2.5">
        <z-button
          v-if="!isCollapsed"
          to="/signup"
          button-type="secondary"
          size="small"
          icon="plus"
          class="w-full"
        >
          Add your project
        </z-button>
        <footer class="w-full border-solid border-ink-200">
          <h3 class="text-lg font-semibold">Code quality made simple.</h3>
          <p class="mt-2 text-sm text-vanilla-400">
            Avoid the grunt work of fixing issues. Save developer time. Maintain code quality.
          </p>
          <z-button to="/signup" buttonType="primary" class="w-full mt-4">Get started</z-button>
        </footer>
      </div>
      <div class="py-4 px-2.5 border-t border-ink-200">
        <div class="flex items-center justify-between space-x-2 leading-none">
          <z-icon
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
    </section>

    <portal to="modal">
      <z-confirm
        v-if="showInDiscoverInfoDialog"
        @onClose="showInDiscoverInfoDialog = false"
        title="Show in discover"
        subtitle="On the repository settings page, scroll to the bottom to find the Add to discover button."
        primaryActionLabel="Okay"
        @primaryAction="showInDiscoverInfoDialog = false"
      />
    </portal>
  </aside>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { ZButton, ZConfirm, ZIcon, ZTag } from '@deepsourcelabs/zeal'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import AuthMixin from '~/mixins/authMixin'

import { UpdatePreferredTechnologies } from '~/components/Discover'

import { DirectoryActions, DirectoryGetters } from '~/store/directory/directory'
import { DiscoverUserActions, DiscoverUserGetters } from '~/store/discover/user'
import { Analyzer, AnalyzerConnection, RepositoryConnection, Scalars } from '~/types/types'
import { DiscoverRepoActions } from '~/store/discover/repositories'

const directoryStore = namespace('directory/directory')
const discoverUserStore = namespace('discover/user')
const discoverRepositoriesStore = namespace('discover/repositories')

@Component({
  components: {
    ZButton,
    ZConfirm,
    ZIcon,
    ZTag,
    UpdatePreferredTechnologies
  }
})
export default class Sidebar extends mixins(ActiveUserMixin, AuthMixin) {
  @directoryStore.Getter(DirectoryGetters.DIRECTORY_ANALYZERS)
  analyzerList: Analyzer[]

  @directoryStore.Action(DirectoryActions.FETCH_ANALYZER_DIR_LIST)
  fetchAnalyzers: () => Promise<void>

  @discoverUserStore.Getter(DiscoverUserGetters.GET_PREFERRED_TECHNOLOGIES)
  preferredTechnologies: AnalyzerConnection

  @discoverUserStore.Action(DiscoverUserActions.FETCH_PREFERRED_TECHNOLOGIES)
  fetchPreferredTechnologies: (args?: { refetch?: boolean }) => Promise<void>

  @discoverUserStore.Getter(DiscoverUserGetters.GET_WATCHED_REPOSITORIES)
  watchedRepositories: RepositoryConnection

  @discoverUserStore.Action(DiscoverUserActions.FETCH_WATCHED_REPOSITORIES)
  fetchWatchedRepositories: (args?: { refetch?: boolean }) => Promise<void>

  @discoverRepositoriesStore.Action(DiscoverRepoActions.FETCH_DISCOVER_REPOSITORIES)
  fetchDiscoverRepositories: (args?: {
    name_Icontains?: string
    preferredTechnologies?: Array<Scalars['ID']>
    refetch?: boolean
  }) => Promise<void>

  public isCollapsed = false
  public collapsedSidebar = false
  public toggleCollapsed = false
  public isOpen = false
  public currentAnalyzer = ''
  public showInDiscoverInfoDialog = false
  public showUpdateTechnologiesModal = false
  public debounceTimer: ReturnType<typeof setTimeout>

  async fetch(): Promise<void> {
    await this.fetchAnalyzers()
    const currentAnalyzerShortcode = this.$route.query.lang as string

    if (currentAnalyzerShortcode) {
      const idx = this.analyzerList.findIndex(
        (analyzer) => analyzer.shortcode === currentAnalyzerShortcode
      )
      this.currentAnalyzer = this.analyzerList[idx].id
    }

    if (this.loggedIn) {
      await Promise.all([
        this.fetchActiveUser(),
        this.fetchPreferredTechnologies(),
        this.fetchWatchedRepositories()
      ])
    }
  }

  containsElement(parentCandidate: HTMLElement, target: HTMLElement): boolean {
    return Boolean(
      parentCandidate && (target === parentCandidate || parentCandidate.contains(target))
    )
  }

  openSidebar() {
    this.isCollapsed = false
    this.collapsedSidebar = false
    this.isOpen = true
  }

  mounted() {
    this.$root.$on('ui:show-sidebar-menu', this.openSidebar)
  }

  beforeDestroy() {
    this.$root.$off('ui:show-sidebar-menu', this.openSidebar)
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

  get currentYear() {
    /**
     * Return the current year.
     */
    return new Date().getFullYear()
  }

  // async applyFilter(analyzer: Analyzer, isSelected: boolean) {
  //   if (isSelected) {
  //     this.currentAnalyzer = analyzer.id
  //     this.$nuxt.$router.replace({ query: { lang: analyzer.shortcode } })
  //   } else {
  //     this.currentAnalyzer = ''
  //     this.$nuxt.$router.replace({ query: {} })
  //   }
  // }
}
</script>
