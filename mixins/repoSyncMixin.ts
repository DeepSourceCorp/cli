import { Component, mixins } from 'nuxt-property-decorator'

import OwnerDetailMixin from './ownerDetailMixin'
import RepoListMixin from './repoListMixin'

/**
 * Mixin for repo sync utilities
 */
@Component
export default class RepoSyncMixin extends mixins(OwnerDetailMixin, RepoListMixin) {
  public repoSyncLoading = false

  /**
   * Method to sync repositories
   *
   * @returns {Promise<void>}
   */
  async syncRepos(): Promise<void> {
    this.repoSyncLoading = true
    try {
      await this.syncReposForOwner()
    } catch {
      this.$toast.danger('Error while syncing repositories. Please try again.')
    }

    this.$socket.$on('repo-sync', this.repoSyncCallback)
  }

  /**
   * A proxy for nuxt fetch, override this for custom query
   *
   * @return {Promise<void>}
   */
  async fetchReposAfterSync(): Promise<void> {
    // override this function
  }

  /**
   * Callback function for repo-sync event
   *
   * @returns {Promise<void>}
   */
  async repoSyncCallback(data: { status: string }): Promise<void> {
    if (data.status === 'success') {
      await this.fetchReposAfterSync()
      this.$toast.success('Repositories synced successfully.')
    } else if (data.status === 'failure') {
      this.$toast.danger('Error while syncing repositories. Please try again.')
    }
    this.$socket.$off('repo-sync', this.repoSyncCallback)
    this.repoSyncLoading = false
  }

  /**
   * beforeDestroy hook for Vue component
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$socket.$off('repo-sync', this.repoSyncCallback)
    this.repoSyncLoading = false
  }
}
