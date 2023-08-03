<template>
  <z-menu v-if="viewer.dashboardContext" class="w-full">
    <template #trigger="{ toggle, isOpen }">
      <button
        type="button"
        class="flex w-full items-center space-x-2 truncate rounded-sm p-1 text-sm text-vanilla-200 outline-none transition-all duration-75 focus:outline-none"
        :class="getTriggerButtonStyle(isOpen)"
        @click="() => handleToggle(toggle)"
      >
        <z-avatar
          :image="activeDashboardContext.avatar_url"
          :user-name="activeDashboardContext.login"
          :fallback-image="
            getDefaultAvatar(activeDashboardContext.login, activeDashboardContext.type === 'user')
          "
          size="sm"
          stroke="bg-ink-100 p-0.5"
          class="flex-shrink-0"
          :class="{ 'mx-auto': isCollapsed }"
        />
        <span v-show="!isCollapsed">{{
          activeDashboardContext.team_name || activeDashboardContext.login
        }}</span>
      </button>
    </template>
    <template #body="{ close }">
      <z-menu-section>
        <z-input
          v-model="searchCandidate"
          :show-border="false"
          spacing="tight"
          background-color="ink-300"
          placeholder="Search..."
        >
          <template #left>
            <z-icon
              :color="searchCandidate ? 'vanilla-100' : 'vanilla-400'"
              icon="search"
              class="ml-1.5"
            />
          </template>
        </z-input>
      </z-menu-section>
      <div class="hide-scroll max-h-80 overflow-y-auto">
        <lazy-empty-state
          v-if="contextsByType.length === 0 && searchCandidate"
          :webp-image-path="require('~/assets/images/ui-states/no-accounts.webp')"
          :png-image-path="require('~/assets/images/ui-states/no-accounts.png')"
        >
          <template #subtitle
            ><span class="text-sm leading-3 text-vanilla-400">No accounts found</span></template
          >
        </lazy-empty-state>

        <z-menu-section
          v-for="contextType in contextsByType"
          :key="contextType.type"
          :divider="false"
        >
          <div
            v-if="!searchCandidate"
            class="mb-2 mt-2.5 px-3 text-11px font-semibold uppercase tracking-wider text-slate"
          >
            {{ contextType.type }}
          </div>
          <z-menu-item
            v-for="context in contextType.contexts"
            :key="context.id"
            :to="`/${context.vcs_provider}/${context.login}`"
            spacing="p-2"
            as="nuxt-link"
            :class="{
              'border-l-2 border-juniper bg-ink-200': isActive(context)
            }"
            class="flex w-full items-center gap-x-1"
            @click.native="close"
          >
            <z-avatar
              :image="context.avatar_url"
              :fallback-image="getDefaultAvatar(context.login, context.type === 'user')"
              :user-name="context.login"
              size="sm"
              stroke="bg-ink-100 p-0.5"
              type="span"
            />
            <div class="flex-1 flex-col truncate">
              <span
                :class="isActive(context) ? 'text-vanilla-100' : 'text-vanilla-400'"
                class="text-sm font-medium leading-4"
                >{{ context.team_name || context.login }}</span
              >
            </div>
            <div class="pr-2">
              <z-icon
                v-tooltip="context.vcs_provider_display"
                :icon="providerIcon(context.vcs_provider)"
                class="min-h-4 min-w-4"
              />
            </div>
          </z-menu-item>
          <z-divider
            v-if="!searchCandidate"
            color="ink-100"
            margin="m-0"
            :class="{ 'mt-1': !searchCandidate }"
          />
        </z-menu-section>
      </div>
      <z-menu-section v-if="contextsByType.length && !searchCandidate" :divider="false">
        <z-menu-item
          :to="context.installationProvidersUrl"
          icon="plus"
          as="nuxt-link"
          class="text-vanilla-400 hover:text-vanilla-100"
        >
          Add an account
        </z-menu-item>
      </z-menu-section>
    </template>
  </z-menu>
</template>
<script lang="ts">
import { Component, Prop, mixins } from 'nuxt-property-decorator'

// types
import ActiveUserMixin, { DashboardContext } from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'
import { getDefaultAvatar } from '~/utils/ui'

/**
 * Context switcher component
 */
@Component({
  methods: {
    getDefaultAvatar
  }
})
export default class ContextSwitcher extends mixins(ActiveUserMixin, ContextMixin) {
  searchCandidate = ''

  @Prop()
  isCollapsed: boolean

  /**
   * Fetch hook for context switcher
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchContext()
  }

  /**
   * Returns a boolean indicating if `context` is currently active
   *
   * @param {DashboardContext} context - The context to check
   * @returns {boolean}
   */
  isActive(context: DashboardContext): boolean {
    return (
      (context.login === this.activeDashboardContext.login ||
        context.team_name === this.activeDashboardContext.team_name) &&
      context.vcs_provider == this.activeDashboardContext.vcs_provider
    )
  }

  /**
   * Returns the icon name for the given VCS provider shortcode
   *
   * @param {string} vcsShortcode - Provider shortcode
   * @returns {string}
   */
  providerIcon(vcsShortcode: string): string {
    return this.$providerMetaMap[vcsShortcode]?.icon ?? ''
  }

  /**
   * Checks if the given `contextName` matches the current `searchCandidate`
   *
   * @param {string} contextName - The context name to check against the current search query
   * @returns {boolean}
   */
  filterByQuery(context: DashboardContext): boolean {
    const contextName = context.team_name || context.login
    return this.searchCandidate
      ? contextName.toLowerCase().includes(this.searchCandidate.toLowerCase())
      : true
  }

  /**
   * Getter for available contexts, divided by type (team / user) and filtered by the search query
   *
   * @returns {Array<Record<string, Array<DashboardContext>>>}
   */
  get contextsByType() {
    if (this.searchCandidate) {
      const searchResults = this.viewer.dashboardContext.filter(this.filterByQuery)
      return searchResults.length
        ? [
            {
              type: 'all',
              contexts: searchResults
            }
          ]
        : []
    }

    const teamAccounts = this.viewer.dashboardContext.filter(
      (context: Record<string, string>) => context.type === 'team'
    )
    const personalAcounts = this.viewer.dashboardContext.filter(
      (context: Record<string, string>) => context.type === 'user'
    )

    const contexts = []

    if (teamAccounts.length)
      contexts.push({
        type: 'teams',
        contexts: teamAccounts
      })
    if (personalAcounts.length)
      contexts.push({
        type: 'personal',
        contexts: personalAcounts
      })
    return contexts
  }

  /**
   * Returns a class string for the menu trigger depending on its open state
   *
   * @param {boolean} isOpen - The state of the menu trigger
   */
  getTriggerButtonStyle(isOpen: boolean) {
    return this.isCollapsed ? 'hover:opacity-75 px-0' : isOpen ? 'bg-ink-200' : 'hover:bg-ink-200'
  }

  /**
   * Resets the search query
   *
   * @returns {void}
   */
  resetSearch() {
    this.searchCandidate = ''
  }

  /**
   * Function to open/close the menu
   *
   * @callback ToggleCallback
   * @returns {void}
   */

  /**
   * Handles the menu toggle and resets the search query
   *
   * @param {ToggleCallback} toggle - The callback to toggle the menu
   * @returns {void}
   */
  handleToggle(toggle: Function) {
    toggle()
    this.resetSearch()
  }
}
</script>
