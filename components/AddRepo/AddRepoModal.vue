<template>
  <portal to="modal">
    <ZModal v-if="showModal" @onClose="close" title="Choose a repository to proceed">
      <div class="p-4 space-y-2 border-b border-ink-200">
        <z-input
          v-model="searchCandidate"
          icon="search"
          class="flex-grow"
          backgroundColor="ink-300"
          placeholder="Search repositories..."
          ><template slot="left">
            <z-icon icon="search" size="small" class="ml-1.5"></z-icon>
          </template>
        </z-input>
      </div>
      <div class="h-80 hide-scroll overflow-x-hidden">
        <template v-if="newRepos.edges && newRepos.edges.length">
          <repo-card
            class="rounded-none hover:bg-ink-200 cursor-pointer border-b border-ink-200 px-2 md:px-0.5 py-2 md:py-0.5"
            v-for="repo in newRepos.edges"
            v-bind="repo.node"
            size="small"
            route="generate-config"
            :removeDefaultStyle="true"
            :key="repo.node.id"
            :showInfo="false"
          ></repo-card>
        </template>
        <div
          class="space-y-5 p-2 text-center flex flex-col items-center justify-center h-full"
          v-else
        >
          <img
            v-if="searchCandidate"
            class="mx-auto"
            height="100px"
            width="auto"
            src="~/assets/images/ui-states/onboard-empty-search.png"
            alt="Searcing"
          />
          <div>
            <template v-if="searchCandidate">
              We couldn’t find any matches for "{{ searchCandidate }}"
            </template>
            <template v-else> We couldn’t find any repositories linked to this account. </template>
            <p class="text-sm text-vanilla-400 mt-1">
              You can sync your repositories from VCS Provider
            </p>
          </div>
          <z-button
            v-if="repoSyncLoading"
            size="small"
            class="flex items-center w-48"
            :disabled="true"
          >
            <z-icon
              icon="spin-loader"
              class="animate-spin mr-2"
              size="small"
              color="ink-400"
            ></z-icon>
            <span>Syncing repositories</span>
          </z-button>
          <z-button v-else size="small" class="w-48" icon="refresh-cw" @click="syncRepos">
            Sync repositories
          </z-button>
        </div>
      </div>
    </ZModal>
  </portal>
</template>
<script lang="ts">
import { Component, namespace, Prop, Watch, mixins } from 'nuxt-property-decorator'
import { ZInput, ZButton, ZIcon, ZModal } from '@deepsourcelabs/zeal'
import { RepoCard } from '@/components/AddRepo'

import { RepoListActions } from '~/store/repository/list'

// types
import { RepositoryConnection } from '~/types/types'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import OwnerDetailMixin from '~/mixins/ownerDetailMixin'

const repoListStore = namespace('repository/list')

@Component({
  components: {
    ZInput,
    ZButton,
    ZIcon,
    RepoCard,
    ZModal
  },
  layout: 'dashboard'
})
export default class AddNewRepo extends mixins(ActiveUserMixin, OwnerDetailMixin) {
  @Prop({ default: false })
  showModal: boolean

  @repoListStore.State
  newRepos: RepositoryConnection

  public searchCandidate = ''
  public pageSize = 20
  public timeout: ReturnType<typeof setTimeout>
  public repoSyncLoading = false

  @repoListStore.Action(RepoListActions.FETCH_NEW_REPOSITORY_LIST)
  fetchRepoList: (params: Record<string, string | boolean | number | null>) => Promise<void>

  @Watch('searchCandidate')
  updateSearch(): void {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.getData()
    }, 300)
  }

  async getData(): Promise<void> {
    await this.fetchRepoList({
      login: this.activeOwner,
      provider: this.activeProvider,
      limit: this.pageSize,
      currentPageNumber: 1,
      query: this.searchCandidate ? this.searchCandidate : null
    })
  }

  async fetch(): Promise<void> {
    await this.getData()
  }

  async syncRepos(): Promise<void> {
    this.repoSyncLoading = true
    try {
      await this.syncReposForOwner()
    } catch {
      this.$toast.danger('Error while syncing repositories. Please try again.')
    }

    this.$socket.$on('repo-sync', async (data: { status: string }) => {
      if (data.status === 'success') {
        await this.getData()
        this.$toast.success('Repositories synced successfully.')
      } else if (data.status === 'failure') {
        this.$toast.danger('Error while syncing repositories. Please try again.')
      }
      this.repoSyncLoading = false
    })
  }

  beforeDestroy(): void {
    this.$socket.$off('repo-sync')
    this.repoSyncLoading = false
  }

  @Watch('$route.path')
  close(): void {
    this.$emit('close')
  }
}
</script>
