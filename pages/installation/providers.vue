<template>
  <hero-card>
    <h1 class="text-vanilla-100 font-bold text-2xl leading-snug">
      Create a new DeepSource workspace
    </h1>
    <p class="text-vanilla-400 text-base mt-2">
      You can connect an existing personal or organization account.
    </p>
    <div class="flex flex-col items-center mt-6 space-y-4">
      <a
        v-for="opt in loginOptions"
        :key="opt.provider"
        :href="loginUrls[opt.provider]"
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
    <p v-if="!$config.onPrem && viewer.availableCredits" class="text-vanilla-100 text-base mt-6">
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
      >.
    </p>
  </hero-card>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZIcon } from '@deepsourcelabs/zeal'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'
import AuthMixin from '~/mixins/authMixin'
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
