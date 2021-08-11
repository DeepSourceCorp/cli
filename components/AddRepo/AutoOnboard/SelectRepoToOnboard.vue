<template>
  <section class="flex flex-col space-y-4 h-full">
    <div class="px-4 py-3 border-b border-ink-200 flex flex-row items-center">
      <z-breadcrumb separator="/" class="text-sm text-vanilla-100">
        <z-breadcrumb-item v-if="hasAutoOnboardEvents" class="text-vanilla-400 cursor-pointer">
          <span @click="$emit('backToStart')">AutoOnboard</span>
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
      <empty-state v-else>
        <template slot="title">
          <span class="text-base font-medium">
            Found no repositories matching name "{{ searchCandidate }}"</span
          >
        </template>
      </empty-state>
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
import { Component, mixins } from 'nuxt-property-decorator'
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
  ActiveUserMixin
) {
  private searchCandidate = ''
  private onboardingRepos = false
  private selectAll = false
  public selectedRepos: string[] = []
  public limit = 50
  public currentPage = 1

  async fetch(): Promise<void> {
    await this.fetchAutoOnboardableRepoList({
      login: this.activeOwner,
      provider: this.activeProvider,
      currentPageNumber: this.currentPage,
      limit: this.limit,
      query: this.searchCandidate,
      refetch: true
    })
  }

  async loadMore(): Promise<void> {
    this.limit = this.limit + 50
    await this.$fetch()
  }

  async search(): Promise<void> {
    await this.$fetch()
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
        this.logSentryErrorForUser(e, 'Onboarding repositories using auto onboard', {
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
}
</script>
