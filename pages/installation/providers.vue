<template>
  <hero-layout>
    <template #header>
      <div class="flex justify-between">
        <div class="flex flex-grow items-center justify-between sm:flex-grow-0">
          <button
            class="flex items-center gap-x-2 text-sm leading-9 text-vanilla-400 hover:text-vanilla-100 focus:text-vanilla-100"
            @click="goBack"
          >
            <z-icon icon="arrow-left" color="current" size="small" />
            <span>Back</span>
          </button>

          <z-divider
            color="ink-200"
            direction="vertical"
            margin="ml-3 mr-1.5"
            class="hidden sm:block"
          />

          <div
            v-if="$fetchState.pending"
            class="flex h-6 w-44 animate-pulse items-center gap-x-2 rounded-md bg-ink-200"
          ></div>

          <logout-menu
            v-else-if="viewer"
            v-bind="logoutMenuProps"
            :is-loading="$fetchState.pending"
            @sign-out="signOut"
          />
        </div>
        <a
          v-if="$config.supportEmail"
          :href="`mailto:${$config.supportEmail}`"
          class="hidden h-9 items-center gap-2 rounded-sm border border-slate-400 px-3 py-1 text-sm text-vanilla-400 hover:bg-ink-300 focus:bg-ink-300 sm:flex"
        >
          <z-icon icon="support" />
          <span>Get help</span>
        </a>
      </div>
    </template>
    <template #title>
      <span> Create a new workspace </span>
    </template>
    <template #subtitle>
      <span>You can connect an existing personal or organization account </span>
    </template>
    <div class="flex flex-col items-center space-y-4">
      <button
        v-for="opt in loginOptions"
        :key="opt.provider"
        class="login-btn flex w-full items-center justify-center gap-x-3 rounded-md p-3"
        :class="[`login-btn-${opt.icon}`]"
        @click="triggerAccountClickAction(opt)"
      >
        <z-icon :icon="opt.icon" size="base" />
        <span>{{ opt.label }}</span>
      </button>
    </div>
  </hero-layout>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import ActiveUserMixin from '~/mixins/activeUserMixin'
import AuthMixin, { LoginOption } from '~/mixins/authMixin'
import ContextMixin from '~/mixins/contextMixin'
import MetaMixin from '~/mixins/metaMixin'
import { routerVcsMap } from '~/plugins/helpers/provider'
import { VcsProviderChoices } from '~/types/types'
import { getDefaultAvatar } from '~/utils/ui'

@Component({
  methods: { getDefaultAvatar },
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
      this.fetchADSOrganizations(),
      this.fetchActiveUser()
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

  get loginUrls(): Record<VcsProviderChoices, string> {
    return {
      ...this.context.installationUrls,
      [VcsProviderChoices.Gitlab]: this.hasGitlabAccounts
        ? '/accounts/gitlab/login'
        : this.authUrls.find(({ provider }) => provider === VcsProviderChoices.Gitlab)?.url,
      [VcsProviderChoices.Gsr]: this.hasGSRProjects
        ? '/accounts/gsr/projects'
        : this.authUrls.find(({ provider }) => provider === VcsProviderChoices.Gsr)?.url,
      [VcsProviderChoices.Ads]: this.hasADSOrganizations
        ? '/accounts/ads/login'
        : this.authUrls.find(({ provider }) => provider === VcsProviderChoices.Ads)?.url
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

  get logoutMenuProps() {
    const { avatar, email, fullName } = this.viewer
    return {
      avatar,
      email,
      fullName,
      isLoading: this.$fetchState.pending
    }
  }

  goBack() {
    if (process.client) window.history.back()
  }
}
</script>

<style lang="postcss" scoped>
/* Login buttons */

.login-btn {
  border: theme('spacing.px') solid theme('colors.transparent');
  background:
    linear-gradient(theme(colors.ink.200), theme(colors.ink.200)) padding-box,
    linear-gradient(113.04deg, #393c43 14.99%, #282b33 77.27%) border-box;
}

.login-btn:hover {
  background:
    linear-gradient(#303540, #303540) padding-box,
    linear-gradient(113.04deg, #454a54 14.99%, #454a54 77.27%) border-box;
}

.login-btn-no-hover:hover {
  border: theme('spacing.px') solid theme('colors.transparent');
  background:
    linear-gradient(theme(colors.ink.200), theme(colors.ink.200)) padding-box,
    linear-gradient(113.04deg, #393c43 14.99%, #282b33 77.27%) border-box;
}

.login-btn-github {
  background:
    linear-gradient(theme(colors.ink.200), theme(colors.ink.200)) padding-box,
    linear-gradient(113.04deg, #393c43 14.99%, #282b33 77.27%) border-box;
}

.login-btn-github:hover {
  background:
    linear-gradient(#303540, #303540) padding-box,
    linear-gradient(113.04deg, #454a54 14.99%, #454a54 77.27%) border-box;
}

.login-btn-gitlab {
  background:
    linear-gradient(90.54deg, #1b1928 2.76%, #1b1928 99.43%) padding-box,
    linear-gradient(113.04deg, #2a2740 14.99%, #1f1b2f 77.27%) border-box;
}

.login-btn-gitlab:hover {
  background:
    linear-gradient(#282246, #282246) padding-box,
    linear-gradient(113.04deg, #352e59 14.99%, #352e59 77.27%) border-box;
}

.login-btn-bitbucket {
  background:
    linear-gradient(#1c243e, #1c243e) padding-box,
    linear-gradient(113.04deg, #313a52 14.99%, #1f2943 77.27%) border-box;
}

.login-btn-bitbucket:hover {
  background:
    linear-gradient(#1c2a58, #1c2a58) padding-box,
    linear-gradient(113.04deg, #37446c 14.99%, #37446c 77.27%) border-box;
}

.login-btn-gsr {
  background:
    linear-gradient(theme(colors.ink.200), theme(colors.ink.200)) padding-box,
    linear-gradient(113.04deg, #393c43 14.99%, #282b33 77.27%) border-box;
}

.login-btn-gsr:hover {
  background:
    linear-gradient(#303540, #303540) padding-box,
    linear-gradient(113.04deg, #454a54 14.99%, #454a54 77.27%) border-box;
}
</style>
