<template>
  <section class="grid gap-6 max-w-3xl grid-cols-1 p-4">
    <div class="w-full space-y-0.5">
      <h2 class="font-medium">Workspaces</h2>
      <div class="text-sm text-vanilla-400">Manage your workspaces.</div>
      <div class="pt-3 w-full flex items-center gap-x-2">
        <z-input
          v-model="searchCandidate"
          :show-border="false"
          :clearable="searchCandidate !== ''"
          spacing="tight"
          background-color="ink-300"
          placeholder="Search..."
          size="small"
        >
          <template #left>
            <z-icon
              :color="searchCandidate ? 'vanilla-100' : 'vanilla-400'"
              icon="search"
              class="ml-1.5"
            />
          </template>
        </z-input>
        <nuxt-link :to="context.installationProvidersUrl">
          <z-button size="small" button-type="primary" icon="plus"> New workspace </z-button>
        </nuxt-link>
      </div>
    </div>

    <!-- Personal accounts -->
    <div v-if="!searchCandidate" class="space-y-2">
      <div class="text-sm">Personal</div>
      <!-- Loading state -->
      <div v-if="isLoading" class="grid divide-y divide-ink-200 border border-ink-200 rounded-md">
        <div v-for="i in 3" :key="i" class="animate-pulse bg-ink-300 h-17"></div>
      </div>
      <div
        v-else-if="personalAccounts.length"
        class="grid divide-y divide-ink-200 border border-ink-200 rounded-md"
      >
        <account-card v-for="account in personalAccounts" :key="account.id" v-bind="account" />
      </div>

      <lazy-empty-state
        v-else-if="!searchCandidate"
        :webp-image-path="require('~/assets/images/ui-states/no-personal-accounts.webp')"
        :png-image-path="require('~/assets/images/ui-states/no-personal-accounts.png')"
        :show-border="true"
        :use-v2="true"
        title="No personal workspace"
        subtitle="You do not have a personal DeepSource yet. Sign in with your personal ID and start shipping good code."
      >
        <template #action>
          <nuxt-link :to="context.installationProvidersUrl">
            <z-button size="small" button-type="primary" icon="plus">
              Add a personal workspace
            </z-button>
          </nuxt-link>
        </template>
      </lazy-empty-state>
    </div>

    <!-- Team accounts -->
    <div v-if="!searchCandidate" class="space-y-2">
      <div class="text-sm">Teams</div>
      <!-- Loading state -->
      <div v-if="isLoading" class="grid divide-y divide-ink-200 border border-ink-200 rounded-md">
        <div v-for="i in 5" :key="i" class="animate-pulse bg-ink-300 h-17"></div>
      </div>
      <div
        v-else-if="teamAccounts.length"
        class="grid divide-y divide-ink-200 border border-ink-200 rounded-md"
      >
        <account-card v-for="account in teamAccounts" :key="account.id" v-bind="account" />
      </div>
      <lazy-empty-state
        v-else-if="!searchCandidate"
        :webp-image-path="require('~/assets/images/ui-states/repo/no-collaborators-136px.webp')"
        :png-image-path="require('~/assets/images/ui-states/repo/no-collaborators-136px.png')"
        :show-border="true"
        :use-v2="true"
        title="No team workspaces"
        subtitle="We write better code with teams. Invite your team to DeepSource and start shipping good code."
      >
        <template #action>
          <nuxt-link :to="context.installationProvidersUrl">
            <z-button size="small" button-type="primary" icon="plus">
              Add a team workspace
            </z-button>
          </nuxt-link>
        </template>
      </lazy-empty-state>
    </div>

    <!-- Search Results -->
    <div
      v-if="searchCandidate && isLoading"
      class="grid divide-y divide-ink-200 border border-ink-200 rounded-md"
    >
      <div v-for="i in 5" :key="i" class="animate-pulse bg-ink-300 h-17"></div>
    </div>
    <div
      v-else-if="searchCandidate && searchResults.length"
      class="grid divide-y divide-ink-200 border border-ink-200 rounded-md"
    >
      <account-card v-for="account in searchResults" :key="account.id" v-bind="account" />
    </div>
    <lazy-empty-state
      v-else-if="noSearchResults"
      :png-image-path="require('~/assets/images/ui-states/directory/empty-search.gif')"
      :webp-image-path="require('~/assets/images/ui-states/directory/empty-search.webp')"
      :show-border="true"
      :use-v2="true"
      :title="`No results for '${searchCandidate}'`"
      :subtitle="`We could not find any workspace called '${searchCandidate}'. Create a new one?`"
    >
      <template #action>
        <nuxt-link :to="context.installationProvidersUrl">
          <z-button size="small" button-type="primary" icon="plus"> New workspace </z-button>
        </nuxt-link>
      </template>
    </lazy-empty-state>
  </section>
</template>

<script lang="ts">
import { ZAvatar, ZButton, ZIcon, ZInput } from '@deepsource/zeal'
import { Component, Mixins } from 'vue-property-decorator'

import AccountCard from '~/components/Settings/AccountCard.vue'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'

import { Owner } from '~/types/types'
import { resolveNodes } from '~/utils/array'

/**
 * User workspaces page, shows personal and team accounts for the active user
 */
@Component({
  components: {
    ZButton,
    ZIcon,
    ZInput,
    ZAvatar,
    AccountCard
  }
})
export default class Workspaces extends Mixins(ActiveUserMixin, ContextMixin) {
  public searchCandidate = ''
  public isLoading = false

  /**
   * Fetch the list of workspaces associated with the user
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchWorkspaces({
      login: ''
    })

    this.isLoading = false
  }

  /**
   * The created hook
   * Prevent showing skeleton loaders if hitting the cache
   *
   * @returns {void}
   */
  created(): void {
    setTimeout(() => {
      if (this.$fetchState.pending) {
        this.isLoading = true
      }
    }, 300)
  }

  /**
   * Returns personal workspaces
   *
   * @returns {Array<Owner>}
   */
  get personalAccounts() {
    return resolveNodes(this.viewer.personalAccounts) ?? []
  }

  /**
   * Returns team workspaces
   *
   * @returns {Array<Owner>}
   */
  get teamAccounts() {
    return resolveNodes(this.viewer.teamAccounts) ?? []
  }

  /**
   * Returns search results for personal and team accounts combined
   *
   * @returns {Array<Owner>}
   */
  get searchResults() {
    return [...this.personalAccounts, ...this.teamAccounts].filter(({ login }) =>
      login.toLowerCase().includes(this.searchCandidate.toLowerCase())
    )
  }

  /**
   * Returns a boolean indicating there are no search results
   *
   * @returns {boolean}
   */
  get noSearchResults() {
    return this.searchCandidate && this.searchResults.length === 0
  }
}
</script>
