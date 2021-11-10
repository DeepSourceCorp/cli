<template>
  <div class="flex flex-col max-w-2xl p-4 space-y-4">
    <!-- title -->
    <div class="text-lg font-medium text-vanilla-100">Ignored rules</div>
    <!-- Search and filter -->
    <!-- <div class="flex space-x-2">
      TODO: API pending
      <div class="flex-grow lg:min-w-80">
        <z-input
          v-model="searchRule"
          icon="search"
          backgroundColor="ink-300"
          :showBorder="false"
          placeholder="Search for issue title, file or issue code"
          class="px-2 py-1.5"
        >
          <template slot="left">
            <z-icon icon="search" size="small"></z-icon>
          </template>
        </z-input>
      </div>
      <z-menu direction="left" width="40" class="text-vanilla-100">
        <button
          slot="trigger"
          class="inline-flex items-center px-3 pt-2 pb-1.5 space-x-2 text-sm leading-none rounded-sm shadow-sm outline-none lg:px-4 bg-ink-300 hover:bg-ink-200 text-vanilla-100 focus:outline-none"
        >
          <div class="flex items-center space-x-2">
            <z-icon icon="amount-down" size="small"></z-icon>
            <span class="hidden xl:inline-block">Filter</span>
          </div>
        </button>
        <template slot="body" class="text-vanilla-200">
          <z-menu-item v-for="filter in filters" v-bind:key="filter.name" :icon="filter.icon">
            {{ filter.label }}
          </z-menu-item>
        </template>
      </z-menu>
    </div> -->
    <!-- List of Ignored rules -->
    <div v-if="loadingRules" class="space-y-2">
      <div v-for="idx in 3" :key="idx" class="h-20 rounded-md bg-ink-300 animate-pulse"></div>
    </div>
    <div
      v-else-if="repository.silenceRules && repository.silenceRules.totalCount > 0"
      class="divide-y divide-ink-300"
    >
      <ignored-rule
        v-for="rule in repository.silenceRules.edges"
        :key="rule.node.id"
        class="py-4"
        :rule="rule.node"
      ></ignored-rule>
    </div>
    <empty-state
      v-else
      title="No ignored rules"
      class="py-20 border border-2 border-dashed rounded-lg border-ink-200"
    ></empty-state>
  </div>
</template>

<script lang="ts">
import { Component, namespace, mixins } from 'nuxt-property-decorator'
import { IgnoredRule } from '@/components/Repository/index'
import { ZDivider, ZInput, ZMenu, ZMenuItem, ZIcon } from '@deepsourcelabs/zeal'
import RepoDetailMixin from '~/mixins/repoDetailMixin'

const repoStore = namespace('repository/detail')

@Component({
  components: {
    IgnoredRule,
    ZDivider,
    ZInput,
    ZMenu,
    ZMenuItem,
    ZIcon
  },
  layout: 'repository'
})
export default class SettingsAutofix extends mixins(RepoDetailMixin) {
  public loadingRules = false
  public searchRule = ''
  filters: Array<Record<string, string | boolean>> = [
    { label: 'Most Frequent', icon: 'most-frequent', name: 'most-frequent' },
    { label: 'Least Frequent', icon: 'least-frequent', name: 'least-frequent' },
    { label: 'First Seen', icon: 'first-seen', name: 'first-seen' },
    { label: 'Last Seen', icon: 'last-seen', name: 'last-seen' }
  ]

  async fetch(): Promise<void> {
    this.loadingRules = true
    await this.fetchRepositorySettingsIgnoreRules({
      ...this.baseRouteParams,
      limit: 30,
      currentPageNumber: 1
    })
    this.loadingRules = false
  }
}
</script>
