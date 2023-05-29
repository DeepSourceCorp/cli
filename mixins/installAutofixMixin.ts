import { Component, mixins } from 'nuxt-property-decorator'
import { Maybe } from '~/types/types'
import ActiveUserMixin from './activeUserMixin'
import OwnerDetailMixin from './ownerDetailMixin'
import RepoDetailMixin from './repoDetailMixin'

@Component
export default class InstallAutofixMixin extends mixins(
  RepoDetailMixin,
  OwnerDetailMixin,
  ActiveUserMixin
) {
  public installing = false

  // Will trigger a fail 5 seconds after window closing if autofix is not enabled
  public failTimeout: ReturnType<typeof setTimeout>

  // Will check for window close every 1 second
  public popUpTimer: ReturnType<typeof setInterval>

  // Will poll asgard every 1.2 seconds to check if autofix is enabled
  // If enabled, we trigger the success action
  public pollTimer: ReturnType<typeof setInterval>

  // Close method exposed by the modal for a graceful close
  public close: Maybe<() => void> = null

  // VCS installation window
  public installWindow: Window | null = null

  get isRepoLevel(): boolean {
    return Boolean(this.baseRouteParams.name)
  }

  get ownerParams(): { login: string; provider: string } {
    return { login: this.activeOwner, provider: this.activeProvider }
  }

  async fetch(): Promise<void> {
    if (this.isRepoLevel) await this.fetchRepoDetails(this.baseRouteParams)
    else {
      await this.fetchOwnerDetails(this.ownerParams)
    }
  }

  async refetchRepo(): Promise<void> {
    await this.fetchBasicRepoDetails({
      ...this.baseRouteParams,
      refetch: true
    })
  }

  async refetchOwner(): Promise<void> {
    await this.fetchOwnerDetails({
      ...this.ownerParams,
      refetch: true
    })
  }

  clearTimers(): void {
    clearTimeout(this.failTimeout)
    clearInterval(this.popUpTimer)
    clearInterval(this.pollTimer)
  }

  openAutofixInstallationUrl(close?: () => void): void {
    // Assign the close received from the modal
    this.close = close ? close : null
    this.installing = true

    // fetch installation url from repository
    const installationUrl = this.isRepoLevel
      ? this.repository.vcsProvider === 'GITHUB'
        ? this.repository.autofixGithubAppInstallationUrl
        : this.repository.autofixBitbucketAddonInstallationUrl
      : this.owner.autofixInstallationUrl
    if (installationUrl) {
      // open the window
      this.installWindow = window.open(installationUrl, '', 'resizable=no,width=1000,height=600')

      this.popUpTimer = setInterval(() => {
        if (this.installWindow?.closed) {
          this.failTimeout = setTimeout(this.fail, 5000)
          clearInterval(this.popUpTimer)
        }
      }, 1000)

      if (this.isRepoLevel) {
        this.pollTimer = setInterval(async () => {
          await this.refetchRepo()
          if (this.repository.isAutofixEnabled) {
            clearInterval(this.pollTimer)
            await this.success()
          }
        }, 1200)
      } else {
        this.pollTimer = setInterval(async () => {
          await this.refetchOwner()
          if (this.owner.isAutofixEnabled) {
            clearInterval(this.pollTimer)
            await this.success()
          }
        }, 1200)
      }

      this.$socket.$on('autofix-installation-complete', async () => {
        await this.success()
      })
    }
  }

  async success(): Promise<void> {
    this.clearTimers()
    // close the install window on success
    this.installWindow?.close()
    this.$toast.success('Successfully installed Autofix app')
    await this.finish()
  }

  async fail(): Promise<void> {
    this.clearTimers()
    this.$toast.danger(
      'Autofix app was not installed. It could take a while to reflect these changes on DeepSource, check back in a few minutes '
    )
    await this.finish()
  }

  async finish(): Promise<void> {
    if (this.isRepoLevel) await this.refetchRepo()

    this.clearTimers()
    this.$socket.$off('autofix-installation-complete')

    if (this.close && typeof this.close === 'function') {
      this.close()
    } else {
      this.$emit('close')
    }
    this.installing = false
  }

  beforeDestroy(): void {
    this.clearTimers()
    this.$socket.$off('autofix-installation-complete')
  }
}
