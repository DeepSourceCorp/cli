<template>
  <section class="flex flex-col space-y-4 h-full">
    <div class="px-4 py-3 border-b border-ink-200 flex flex-row items-center">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item v-if="hasAutoOnboardEvents" class="text-vanilla-400 cursor-pointer">
          <span @click="$emit('backToStart')">Auto Onboard</span>
        </z-breadcrumb-item>
        <z-breadcrumb-item class="text-vanilla-400 cursor-pointer">
          <span @click="$emit('back')">All templates</span>
        </z-breadcrumb-item>
        <z-breadcrumb-item>Select repositories</z-breadcrumb-item>
      </z-breadcrumb>
    </div>
    <div class="px-4">
      <z-input
        v-model="searchCandidate"
        icon="search"
        class="p-2"
        :showBorder="false"
        backgroundColor="ink-400"
        @debounceInput="search"
        placeholder="Search repositories..."
      >
        <template slot="left">
          <z-icon icon="search" class="ml-1.5" size="small"></z-icon>
        </template>
      </z-input>
    </div>
    <div class="overflow-scroll flex-grow px-5">
      <template v-if="fetchingData">
        <div
          v-for="ii in 20"
          :key="ii"
          class="h-7 animate-pulse w-full rounded-md my-0.5 bg-ink-200 bg-opacity-50"
        ></div>
      </template>
      <template v-if="onboardableRepositories.length">
        <z-checkbox
          size="small"
          class="cursor-pointer py-1.5 font-semibold"
          :class="{
            'hover:text-vanilla-100 opacity-50': !selectAll,
            'text-vanilla-100': selectAll
          }"
          :disabled="onboardableRepositories.length === 0"
          @change="selectAllRepositories"
          v-model="selectAll"
          :label="`Select all (${selectedRepos.length} selected)`"
        />
        <z-checkbox
          v-for="repo in onboardableRepositories"
          v-model="selectedRepos"
          :value="repo.id"
          :key="repo.id"
          :label="`${activeOwner} / ${repo.name}`"
          size="small"
          class="cursor-pointer py-1.5 hover:text-vanilla-100"
        />
        <z-button
          v-if="hasMoreReposToOnboard"
          buttonType="ghost"
          class="w-full"
          size="x-small"
          @click="loadMore"
          >Load more</z-button
        >
      </template>
      <div
        v-else-if="!fetchingData"
        class="flex flex-col items-center justify-center p-2 gap-y-5 text-center"
      >
        <img
          v-if="searchCandidate"
          class="mx-auto"
          height="100px"
          width="auto"
          src="~/assets/images/ui-states/directory/empty-search.png"
          :alt="searchCandidate"
        />
        <div>
          <p class="text-vanilla-100 font-semibold">
            {{
              searchCandidate
                ? `No results found for "${searchCandidate}"`
                : 'We couldn’t find any repositories linked to this account.'
            }}
          </p>

          <p class="max-w-md mt-1 text-sm text-vanilla-400">
            {{
              owner.hasGrantedAllRepoAccess
                ? `You can sync your repositories from ${activeProviderName}`
                : 'Make sure to grant DeepSource access to the Git repositories you’d like to import.'
            }}
          </p>
        </div>
        <div class="flex gap-x-2">
          <z-button
            v-if="!owner.hasGrantedAllRepoAccess && owner.appConfigurationUrl"
            label="Manage Permissions"
            size="small"
            :to="owner.appConfigurationUrl"
            target="_blank"
            rel="noopener noreferrer"
            icon="settings"
            icon-color="vanilla-100"
            class="bg-ink-200 hover:bg-ink-200 hover:opacity-80 text-vanilla-100"
          />
          <z-button
            label="Sync repositories"
            icon="refresh-cw"
            loading-label="Syncing repositories"
            :is-loading="fetchingData"
            :disabled="fetchingData"
            size="small"
            @click="refetchData"
          />
        </div>
      </div>
    </div>
    <div class="flex items-center justify-between gap-4 px-4 pb-4">
      <span
        >Using template <b class="text-vanilla-100">{{ selectedTemplate.title }}</b></span
      >
      <z-button size="small" icon="fast-forward" @click="triggerOnboarding">
        Start onboarding
      </z-button>
    </div>
  </section>
</template>
<script lang="ts">
import { Component, Watch, mixins } from 'nuxt-property-decorator'
import {
  ZInput,
  ZIcon,
  ZCheckbox,
  ZBreadcrumb,
  ZBreadcrumbItem,
  ZButton
} from '@deepsourcelabs/zeal'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import AutoOnboardMixin from '~/mixins/autoOnboardMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

@Component({
  components: {
    ZInput,
    ZIcon,
    ZCheckbox,
    ZBreadcrumb,
    ZBreadcrumbItem,
    ZButton
  }
})
export default class SelectReposToOnboard extends mixins(
  ActiveUserMixin,
  AutoOnboardMixin,
  OwnerDetailMixin
) {
  public searchCandidate = ''
  public onboardingRepos = false
  public selectAll = false
  public fetchingData = false
  public selectedRepos: string[] = []
  public limit = 50
  public currentPage = 1

  /**
   * Mounted hook for Vue component
   *
   * @returns {void}
   */
  mounted(): void {
    this.resetListConfig()
    this.$socket.$on('vcs-installed-repos-updated', this.refetchData)
  }

  /**
   * Refetch repos that can be auto-onboarded
   *
   * @returns {Promise<void>}
   */
  async refetchData(): Promise<void> {
    this.fetchingData = true
    await this.fetchAutoOnboardableRepoList({
      login: this.activeOwner,
      provider: this.activeProvider,
      currentPageNumber: this.currentPage,
      limit: this.limit,
      query: this.searchCandidate,
      refetch: true
    })
    this.fetchingData = false
  }

  /**
   * The fetch hook
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.refetchData()
  }

  @Watch('activeOwner')
  resetListConfig(): void {
    this.currentPage = 1
    this.resetOnboardableReposList()
  }

  async loadMore(): Promise<void> {
    this.currentPage = this.currentPage + 1
    await this.refetchData()
  }

  async search(): Promise<void> {
    this.resetListConfig()
    await this.refetchData()
  }

  async triggerOnboarding() {
    if (this.selectedRepos.length === 0) {
      this.$toast.show('Please select at least one repository to onboard.')
      return
    }

    if (!this.selectedTemplate) {
      this.$emit('back')
    } else {
      this.onboardingRepos = true

      try {
        const res = await this.startOnboarding({
          shortcode: this.selectedTemplate.shortcode,
          repoIds: this.selectedRepos
        })

        if (res.ok) {
          await this.fetchOnboardingEventList({
            login: this.activeOwner,
            provider: this.activeProvider,
            refetch: true
          })
          this.$toast.success('Onboarding started successfully')
          this.$emit('onboardingTriggered')
        } else {
          throw new Error('Onboarding trigger failed with a non true ok response')
        }
      } catch (e) {
        this.$toast.danger(
          'Something went wrong while onboarding these repositories, contact support'
        )
        this.logErrorForUser(e, 'Onboarding repositories using auto onboard', {
          shortcode: this.selectedTemplate.shortcode,
          repoIds: this.selectedRepos.join(', ')
        })
      } finally {
        this.onboardingRepos = false
      }
    }
  }

  clearAllRepos(): void {
    this.selectedRepos = []
    this.selectAll = false
  }

  selectAllRepositories(val: boolean) {
    if (val) {
      this.selectedRepos = [...new Set(this.onboardableRepositories.map((repo) => repo.id))]
    } else {
      const availableRepos = this.onboardableRepositories.map((repo) => repo.id)
      this.selectedRepos = [
        ...new Set(this.selectedRepos.filter((repoId) => !availableRepos.includes(repoId)))
      ]
    }
  }

  /**
   * beforeDestroy hook for Vue component
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$socket.$off('vcs-installed-repos-updated', this.refetchData)
  }
}
</script>
