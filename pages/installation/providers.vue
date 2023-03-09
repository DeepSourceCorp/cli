<template>
  <hero-card>
    <h1 class="text-2xl font-bold leading-snug text-vanilla-100">
      Create a new DeepSource workspace
    </h1>
    <p class="mt-2 text-base text-vanilla-400">
      You can connect an existing personal or organization account.
    </p>
    <div class="mt-6 flex flex-col items-center space-y-4">
      <button
        v-for="opt in loginOptions"
        :key="opt.provider"
        class="flex w-full items-center justify-center space-x-2 rounded-sm p-2 text-base font-medium text-vanilla-100 hover:bg-opacity-90"
        :class="opt.bg"
        @click="triggerAccountClickAction(opt)"
      >
        <z-icon :icon="opt.icon" size="base" />
        <span>{{ opt.label }}</span>
      </button>
    </div>
    <p v-if="!$config.onPrem && viewer.availableCredits" class="mt-6 text-base text-vanilla-100">
      You have
      <span
        class="inline"
        :class="{
          'font-semibold': viewer.availableCredits > 0
        }"
        >${{ viewer.availableCredits }}</span
      >
      in available credits.
    </p>
    <p class="mt-4 text-sm text-vanilla-400">
      Need help? Write to us at
      <a
        :href="`mailto:${$config.supportEmail}`"
        class="cursor-pointer text-juniper hover:underline"
        >{{ $config.supportEmail }}</a
      >.
    </p>
  </hero-card>
</template>

<script lang="ts">
import { ZButton, ZIcon } from '@deepsource/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import AuthMixin, { LoginOption } from '~/mixins/authMixin'
import ContextMixin from '~/mixins/contextMixin'
import MetaMixin from '~/mixins/metaMixin'
import { routerVcsMap } from '~/plugins/helpers/provider'

@Component({
  components: {
    ZButton,
    ZIcon
  },
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  }
})
export default class InstallationProvider extends mixins(
  ContextMixin,
  ActiveUserMixin,
  AuthMixin,
  MetaMixin
) {
  created() {
    this.metaTitle = `Create new workspace • DeepSource`
  }

  async fetch(): Promise<void> {
    await Promise.all([
      this.fetchContext(),
      this.fetchAuthUrls(),
      this.fetchGitlabAccounts(),
      this.fetchGSRProjects(),
      this.fetchADSOrganizations()
    ])
  }

  /**
   * Fetch Gitlab accouts for a user
   *
   * @return {Promise<void>}
   */
  async fetchGitlabAccounts() {
    try {
      await this.fetchActiveUserGitlabAccounts()
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Unable to fetch GitLab accounts, please contact support.',
        this.viewer
      )
    }
  }

  /**
   * Fetch GSR Projects
   *
   * @return {Promise<void>}
   */
  async fetchGSRProjects(): Promise<void> {
    if (!this.$config.gsrEnabled) return

    try {
      await this.fetchActiveUserGSRProjects()
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Unable to fetch Google Cloud projects, please contact support.',
        this.viewer
      )
    }
  }

  /**
   * Fetch ADS organizations
   *
   * @return {Promise<void>}
   */
  async fetchADSOrganizations(): Promise<void> {
    if (!this.$config.adsEnabled) return

    try {
      await this.fetchActiveUserADSOrganizations()
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Unable to fetch Azure DevOps Services organizations, please contact support.',
        this.viewer
      )
    }
  }

  /**
   * Trigger account click action when adding a new org
   *
   * @returns void
   */
  triggerAccountClickAction({ provider, shortcode }: LoginOption) {
    if (shortcode === this.$providerMetaMap[routerVcsMap.gl].shortcode) {
      const nextUrl = ['', 'accounts', 'gitlab', 'login'].join('/')
      const expiry = new Date().getTime() + 5 * 60 * 1000 // 5 min life
      this.$nuxt.$cookies.set('bifrost-post-auth-redirect', nextUrl, {
        expires: new Date(expiry),
        path: '/'
      })
    }

    if (shortcode === this.$providerMetaMap[routerVcsMap.ads].shortcode) {
      const nextUrl = ['', 'accounts', 'ads', 'login'].join('/')
      const expiry = new Date().getTime() + 5 * 60 * 1000 // 5 min life
      this.$nuxt.$cookies.set('bifrost-post-auth-redirect', nextUrl, {
        expires: new Date(expiry),
        path: '/'
      })
    }

    window.location.href = this.loginUrls[provider]
  }

  get loginUrls(): Record<string, string> {
    return {
      ...this.context.installationUrls,
      gitlab: this.hasGitlabAccounts ? '/accounts/gitlab/login' : this.authUrls.gitlab,
      gsr: this.hasGSRProjects ? '/accounts/gsr/projects' : this.authUrls.gsr,
      ads: this.hasADSOrganizations ? '/accounts/ads/login' : this.authUrls.ads
    }
  }

  get hasGitlabAccounts(): boolean {
    const gla = this.viewer.gitlabAccounts
    if (Array.isArray(gla) && gla.length) {
      return true
    }
    return false
  }

  get hasGSRProjects(): boolean {
    const gsrProjects = this.viewer.gsrProjects
    if (Array.isArray(gsrProjects) && gsrProjects.length) {
      return true
    }
    return false
  }

  get hasADSOrganizations(): boolean {
    const { adsOrganizations } = this.viewer
    return Boolean(Array.isArray(adsOrganizations) && adsOrganizations.length)
  }
}
</script>
