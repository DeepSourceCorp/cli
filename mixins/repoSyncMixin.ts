import { Component, mixins } from 'nuxt-property-decorator'

import OwnerDetailMixin from './ownerDetailMixin'
import RepoListMixin from './repoListMixin'

/**
 * Mixin for repo sync utilities
 */
@Component
export default class RepoSyncMixin extends mixins(OwnerDetailMixin, RepoListMixin) {
  public repoSyncLoading = false

  public repoToSync = ''
  public singleRepoSyncLoading = false
  // To show err message in UI while syncing single repo
  public singleRepoSyncErrMsg = ''

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
   * Method to sync single repository
   *
   * @param {string} repositoryName
   * @param {string} ownerId
   * @returns {Promise<void>}
   */
  async syncSingleRepo(repositoryName: string, ownerId: string): Promise<void> {
    if (!repositoryName) {
      return
    }

    this.singleRepoSyncLoading = true
    this.singleRepoSyncErrMsg = ''
    this.repoToSync = repositoryName

    try {
      const repoSynced = await this.syncSingleRepoForOwner({ repositoryName, ownerId })

      if (!repoSynced) {
        this.singleRepoSyncErrMsg = 'Error while syncing repository. Please try again.'
        this.singleRepoSyncLoading = false
      }
    } catch (e) {
      this.singleRepoSyncLoading = false
      this.singleRepoSyncErrMsg = 'Error while syncing repository. Please try again.'
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
  async repoSyncCallback(data: { status: string; message?: string }): Promise<void> {
    // Show success/error toast if not syncing single repo.
    // Show err message text in UI if syncing single repo.
    if (data.status === 'success') {
      await this.fetchReposAfterSync()
      this.repoToSync = ''
      this.singleRepoSyncErrMsg = ''

      if (!this.repoToSync) {
        this.$toast.success('Repositories synced successfully.')
      }
    } else if (data.status === 'failure') {
      const errMsg = data.message ?? 'Error while syncing repositories. Please try again.'

      if (this.repoToSync) {
        this.singleRepoSyncErrMsg = errMsg
      } else {
        this.$toast.danger(errMsg)
      }
    }
    this.$socket.$off('repo-sync', this.repoSyncCallback)
    this.repoSyncLoading = false
    this.singleRepoSyncLoading = false
  }

  /**
   * beforeDestroy hook for Vue component
   *
   * @returns {void}
   */
  beforeDestroy(): void {
    this.$socket.$off('repo-sync', this.repoSyncCallback)
    this.repoSyncLoading = false
    this.singleRepoSyncLoading = false
  }
}
