<template>
  <aside
    class="absolute flex flex-col h-screen duration-200 border-r transition-width transform-gpu lg:relative lg:left-0 border-ink-200 group bg-ink-400"
    v-outside-click="closeMenu"
    :class="[isOpen ? 'left-0' : '-left-full', collapsedSidebar ? 'w-14' : 'w-72']"
  >
    <section class="p-4 border-b border-ink-200">
      <div class="flex items-center space-x-2 leading-none">
        <z-icon
          icon="logo"
          size="small"
          color="vanilla-100"
          class="flex-shrink-0 min-w-4 min-h-4"
        />
        <span
          :class="{
            'opacity-0 hidden delay-300': isCollapsed,
            'opacity-1 flex delay-0': !isCollapsed
          }"
          >deepsource</span
        >
      </div>
    </section>

    <section
      class="p-2.5 hide-scroll flex flex-col flex-grow border-b border-ink-200 min-h-20"
      :class="[isCollapsed ? '' : 'overflow-y-scroll', loggedIn ? 'justify-between' : '']"
    >
      <div>
        <nuxt-link :to="loggedIn ? '/discover/watchlist' : '/'">
          <z-button
            v-if="!isCollapsed"
            class="justify-start w-full leading-none border bg-ink-300 border-ink-200 hover:bg-ink-200"
          >
            <img
              v-if="loggedIn"
              :src="require('@/assets/images/discover/unwatched-repo-icon.svg')"
              alt="Watched repos"
              class="w-4 h-4"
            />
            <z-icon
              v-else
              icon="arrow-left"
              size="small"
              color="vanilla-400"
              class="min-w-4 min-h-4"
            />
            <span class="text-sm font-medium text-vanilla-100">
              {{
                loggedIn
                  ? `Watching ${watchedRepositories.totalCount} ${
                      watchedRepositories.totalCount === 1 ? 'project' : 'projects'
                    }`
                  : 'Back to deepsource.io'
              }}
            </span>
          </z-button>
        </nuxt-link>

        <div v-if="loggedIn && !isCollapsed" class="mt-2 border rounded-sm border-ink-200">
          <sidebar-item
            :isCollapsed="isCollapsed"
            icon="heart"
            class="border-b rounded-none border-ink-200"
          >
            Favourites
            <span class="float-right mt-0.5"
              ><z-icon icon="edit-2" @click="showUpdateTechnologiesModal = true"
            /></span>
          </sidebar-item>
          <div
            v-if="
              preferredTechnologies &&
              preferredTechnologies.edges &&
              preferredTechnologies.edges.length
            "
            class="grid grid-cols-6 gap-1 p-1"
          >
            <img
              v-for="edge in preferredTechnologies.edges"
              :key="edge.node.id"
              :src="edge.node.analyzerLogo"
              :alt="edge.node.shortcode"
              class="w-5 h-5"
            />
          </div>
        </div>
      </div>

      <div v-if="!isCollapsed" class="p-2.5" :class="{ 'mt-8': !loggedIn }">
        <span class="text-xs font-medium tracking-wider uppercase text-vanilla-400"
          >Filter by technology</span
        >
        <div class="flex flex-wrap gap-2 mt-2">
          <div
            v-for="analyzer in analyzerList"
            :key="analyzer.id"
            class="inline-flex items-center justify-center px-2 py-1 mb-0.5 mr-0.5 space-x-1 text-sm rounded-full cursor-pointer text-vanilla-100"
            :class="[
              analyzerIdList.includes(analyzer.id) ? 'bg-robin' : 'bg-ink-200 hover:bg-ink-100'
            ]"
            role="button"
            @click="applyFilter(analyzer.id)"
          >
            <img
              v-if="analyzer.analyzerLogo"
              :src="analyzer.analyzerLogo"
              :alt="analyzer.name"
              class="flex-shrink-0 w-auto h-4"
            />
            <span class="text-xs text-vanilla-400"> {{ analyzer.name }} </span>
          </div>
        </div>
      </div>
    </section>

    <section class="relative self-end w-full justify-self-end group">
      <div v-if="loggedIn">
        <div class="p-2.5 border-t border-ink-200 space-y-2">
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

        <div class="p-4 border-t border-ink-200">
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
      </div>

      <div v-else>
        <z-button
          v-if="!isCollapsed"
          to="/signup"
          button-type="secondary"
          size="medium"
          class="w-full mt-2"
        >
          <z-icon icon="plus" size="small" color="vanilla-400"></z-icon>
          <span class="text-sm">Add your project</span>
        </z-button>
        <footer class="w-full px-4 py-4 border-t border-solid border-ink-200">
          <h3 class="text-lg font-semibold">Code quality made simple.</h3>
          <p class="mt-2 text-sm text-vanilla-400">
            Avoid the grunt work of fixing issues. Save developer time. Maintain code quality.
          </p>
          <z-button to="/signup" buttonType="primary" class="w-full mt-4">Get started</z-button>
        </footer>
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

    <update-preferred-technologies
      v-if="showUpdateTechnologiesModal"
      @close="showUpdateTechnologiesModal = false"
    />
  </aside>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { ZButton, ZConfirm, ZIcon, ZTag } from '@deepsourcelabs/zeal'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import AuthMixin from '~/mixins/authMixin'

import { UpdatePreferredTechnologies } from '~/components/Discover'

import { AnalyzerInterface, AnalyzerListActions, AnalyzerListGetters } from '~/store/analyzer/list'
import { DiscoverUserActions, DiscoverUserGetters } from '~/store/discover/user'
import { AnalyzerConnection, RepositoryConnection, Scalars } from '~/types/types'
import { DiscoverRepoActions } from '~/store/discover/repositories'

const analyzerListStore = namespace('analyzer/list')
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
  @analyzerListStore.Getter(AnalyzerListGetters.ANALYZERS)
  analyzerList: AnalyzerInterface[]

  @analyzerListStore.Action(AnalyzerListActions.FETCH_ANALYZER_LIST)
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
  public analyzerIdList: Array<Scalars['ID']> = []
  public showInDiscoverInfoDialog = false
  public showUpdateTechnologiesModal = false

  async fetch(): Promise<void> {
    await this.fetchAnalyzers()

    if (this.loggedIn) {
      await Promise.all([
        this.fetchActiveUser(),
        this.fetchPreferredTechnologies(),
        this.fetchWatchedRepositories()
      ])
    }
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

  get currentYear() {
    /**
     * Return the current year.
     */
    return new Date().getFullYear()
  }

  async applyFilter(id: Scalars['ID']) {
    if (this.analyzerIdList.includes(id)) {
      const idx = this.analyzerIdList.indexOf(id)
      this.analyzerIdList.splice(idx, 1)
    } else {
      this.analyzerIdList.push(id)
    }
    await this.fetchDiscoverRepositories({ preferredTechnologies: this.analyzerIdList })
  }
}
</script>
