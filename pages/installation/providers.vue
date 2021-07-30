<template>
  <hero-card>
    <h1 class="text-vanilla-100 font-bold text-2xl leading-snug">
      Connect a new account with DeepSource
    </h1>
    <p class="text-vanilla-400 text-base mt-4">Connect your team or personal workspace.</p>
    <div class="flex flex-col items-center mt-10 space-y-4">
      <a
        v-for="opt in loginOptions.filter((opt) => opt.enabled)"
        :key="opt.provider"
        :href="opt.link"
        class="w-full flex items-center left-section__btn"
      >
        <button
          class="p-2 text-vanilla-100 w-full space-x-2 flex items-center font-medium text-base rounded-sm justify-center hover:bg-opacity-90"
          :class="opt.bg"
        >
          <z-icon :icon="opt.icon" size="base" />
          <span>{{ opt.label }}</span>
        </button>
      </a>
    </div>
    <p class="text-vanilla-100 text-base mt-6">
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
    <p class="text-vanilla-400 mt-4 text-sm">
      Need help? Write to us at
      <a
        :href="`mailto:${$config.supportEmail}`"
        class="text-juniper hover:underline cursor-pointer"
        >{{ $config.supportEmail }}</a
      >
    </p>
  </hero-card>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'
import AuthMixin from '~/mixins/authMixin'

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
export default class InstallationProvider extends mixins(ContextMixin, ActiveUserMixin, AuthMixin) {
  async fetch(): Promise<void> {
    this.fetchAuthUrls()
  }

  get loginOptions(): Record<string, string | null | undefined>[] {
    return [
      {
        provider: 'github',
        icon: 'github',
        label: 'Connect with GitHub',
        bg: 'bg-ink-200',
        enabled: this.$config.githubEnabled,
        link: this.context.installationUrls?.github
      },
      {
        provider: 'gitlab',
        icon: 'gitlab',
        label: this.hasGitlabAccounts ? 'Choose GitLab account' : 'Connect with GitLab',
        bg: 'bg-gitlab',
        enabled: this.$config.gitlabEnabled,
        link: this.gitLabLink
      },
      {
        provider: 'bitbucket',
        icon: 'bitbucket',
        label: 'Connect with Bitbucket',
        bg: 'bg-bitbucket',
        enabled: this.$config.bitbucketEnabled,
        link: this.context.installationUrls?.bitbucket
      }
    ]
  }

  get gitLabLink(): string {
    if (!this.hasGitlabAccounts) {
      return this.authUrls.gitlab
    }
    return '/accounts/gitlab/login'
  }

  get hasGitlabAccounts(): boolean {
    const gla = this.viewer.gitlabAccounts
    if (Array.isArray(gla) && gla.length) {
      return true
    }
    return false
  }
}
</script>
