<template>
  <hero-card>
    <h1 class="text-2xl font-bold leading-snug text-vanilla-100">
      Create a new DeepSource workspace
    </h1>
    <p class="mt-2 text-base text-vanilla-400">
      You can connect an existing personal or organization account.
    </p>
    <div class="flex flex-col items-center mt-6 space-y-4">
      <button
        v-for="opt in loginOptions"
        :key="opt.provider"
        class="flex items-center justify-center w-full p-2 space-x-2 text-base font-medium rounded-sm text-vanilla-100 hover:bg-opacity-90"
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
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'
import AuthMixin, { LoginOption } from '~/mixins/authMixin'
import MetaMixin from '~/mixins/metaMixin'

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
      this.fetchActiveUserGitlabAccounts(),
      this.fetchActiveUserGSRProjects()
    ])
  }

  /**
   * Trigger account click action when adding a new org
   *
   * @returns void
   */
  triggerAccountClickAction({ provider }: LoginOption) {
    if (provider === this.$providerMetaMap['gl'].auth) {
      const nextUrl = ['', 'accounts', 'gitlab', 'login'].join('/')
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
      gsr: this.hasGSRProjects ? '/accounts/gsr/projects' : this.authUrls.gsr
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
}
</script>
