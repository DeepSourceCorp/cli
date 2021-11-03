<template>
  <base-card :to="issuesPageUrl" :remove-default-style="removeDefaultStyle" :show-info="showInfo">
    <template slot="title">
      <div class="font-normal text-vanilla-400" :class="showInfo ? 'text-lg' : 'text-base'">
        <div class="inline mr-2">
          <span class="transition-colors duration-75 cursor-pointer">{{
            repoInfo.owner.login
          }}</span>
          <span>/</span>
          <span class="font-bold text-vanilla-100">
            {{ repoInfo.name }}
          </span>
        </div>

        <span v-if="this.loggedIn" class="flex-shrink-0 inline">
          <button
            :disabled="updatingWatchlist"
            class="focus:outline-none"
            @click.stop.prevent="updateWatchList(repoInfo.id, repoInfo.isWatched)"
          >
            <z-icon
              v-if="updatingWatchlist"
              icon="spin-loader"
              color="juniper"
              class="-mb-px animate-spin"
            />
            <z-icon
              v-else
              class="-mb-px"
              v-tooltip="repoInfo.isWatched ? 'Remove from watchlist' : 'Add to watchlist'"
              :key="repoInfo.id"
              :icon="repoInfo.isWatched ? 'remove-watchlist' : 'add-watchlist'"
            />
          </button>
        </span>
      </div>
    </template>

    <template slot="description">
      <div class="flex flex-col space-y-1">
        <div v-if="showDescription && repoInfo.description" class="flex flex-wrap space-x-4">
          <div class="flex items-center space-x-1.5 mb-2 line-clamp-3">
            <span class="text-sm tracking-wide text-vanilla-400">{{ repoInfo.description }} </span>
          </div>
        </div>
        <div class="flex flex-wrap gap-3">
          <div v-if="repoInfo.primaryAnalyzer" class="flex items-center space-x-1">
            <analyzer-logo :shortcode="repoInfo.primaryAnalyzer.shortcode" />
            <span class="text-sm tracking-wide text-vanilla-400">{{
              repoInfo.primaryAnalyzer.name
            }}</span>
          </div>
          <div class="items-center hidden space-x-1 md:flex">
            <slot name="stats">
              <z-icon icon="flag" size="x-small" color="vanilla-400" />
              <span class="text-sm text-vanilla-400">
                {{ shortenNumber(repoInfo.recommendedIssueCount) }}
                {{ repoInfo.recommendedIssueCount === 1 ? 'issue' : 'issues' }}
              </span>
            </slot>
          </div>
        </div>
      </div>
    </template>

    <template slot="info">
      <div class="hidden h-full md:flex">
        <div
          class="
            flex-col
            justify-center
            flex-grow
            hidden
            py-4
            text-xs
            leading-none
            lg:space-y-2
            sm:flex
          "
        >
          <div class="text-center heading3 text-vanilla-100">
            {{ shortenNumber(repoInfo.recommendedIssueCount) }}
            <span class="block text-sm font-medium text-vanilla-400">{{
              repoInfo.recommendedIssueCount === 1 ? 'issue' : 'issues'
            }}</span>
          </div>
        </div>
      </div>
    </template>
  </base-card>
</template>

<script lang="ts">
import { ZIcon } from '@deepsourcelabs/zeal'
import { Component, mixins, namespace, Prop } from 'nuxt-property-decorator'

import { BaseCard } from '@/components/History'
import { ActionChoice, Maybe, Repository, Scalars } from '~/types/types'
import { DiscoverUserActions } from '~/store/discover/user'
import AuthMixin from '@/mixins/authMixin'
import { DiscoverRepoActions } from '~/store/discover/repositories'
import { shortenLargeNumber } from '~/utils/string'
import { fromNow } from '~/utils/date'

const discoverRepositoriesStore = namespace('discover/repositories')
const discoverUserStore = namespace('discover/user')

@Component({
  components: {
    BaseCard,
    ZIcon
  }
})
export default class RepoCard extends mixins(AuthMixin) {
  @discoverRepositoriesStore.Action(DiscoverRepoActions.FETCH_DISCOVER_REPOSITORIES)
  fetchDiscoverRepositories: (args?: {
    name_Icontains?: string
    preferredTechnologies?: Array<Scalars['ID']>
    refetch?: boolean
  }) => Promise<void>

  @discoverRepositoriesStore.Action(DiscoverRepoActions.FETCH_EDITORS_PICK_REPOSITORY)
  fetchEditorsPickRepository: (args?: { refetch?: boolean }) => Promise<void>

  @discoverRepositoriesStore.Action(DiscoverRepoActions.SET_WATCHING_STATE)
  updateWatchLocally: (args: { repoId: string; isWatched: boolean }) => Promise<void>

  @discoverRepositoriesStore.Action(DiscoverRepoActions.FETCH_TRENDING_REPOSITORIES)
  fetchTrendingRepositories: (args?: { refetch?: boolean }) => Promise<void>

  @discoverUserStore.Action(DiscoverUserActions.UPDATE_WATCHED_REPOSITORIES)
  updateWatchedRepositories: (args?: {
    action: ActionChoice
    refetch?: boolean
    repoId: Scalars['ID']
  }) => Promise<void>

  @Prop({ default: false })
  removeDefaultStyle: boolean

  @Prop({ required: true })
  repoInfo: Maybe<Repository>

  @Prop({ default: true })
  showDescription: boolean

  @Prop({ default: true })
  showInfo: boolean

  updatingWatchlist = false

  get issuesPageUrl(): string {
    return `/${this.vcsProviderShortcode}/${this.repoInfo?.owner.login}/${this.repoInfo?.name}/issues`
  }

  get vcsProviderShortcode(): string {
    if (this.repoInfo) {
      return this.$providerMetaMap[this.repoInfo?.vcsProvider].shortcode || 'gh'
    }
    return 'gh'
  }

  public shortenNumber = shortenLargeNumber
  public fromNow = fromNow

  public async updateWatchList(id: string, isWatched: boolean): Promise<void> {
    this.updatingWatchlist = true

    const { Add, Remove } = ActionChoice
    try {
      await this.updateWatchedRepositories({
        repoId: id,
        action: isWatched ? Remove : Add
      })

      await this.updateWatchLocally({ repoId: id, isWatched: !isWatched })
      const actionTaken = isWatched ? 'removed from' : 'added to'

      this.$toast.success(`Successfully ${actionTaken} watchlist`)
    } catch (err) {
      this.$toast.danger('Something went wrong while updating the watchlist')
      await this.updateWatchLocally({ repoId: id, isWatched: isWatched })
    }

    this.updatingWatchlist = false

    this.fetchDiscoverRepositories({ refetch: true })
    this.fetchEditorsPickRepository({ refetch: true })
    this.fetchTrendingRepositories({ refetch: true })
  }
}
</script>
