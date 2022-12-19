<template>
  <hero-card>
    <h1 class="text-2xl font-bold leading-snug text-center text-vanilla-100">
      Choose a GitLab account
    </h1>
    <p class="mt-4 text-base text-center text-vanilla-400">
      You would be able to use DeepSource on all repositories that you have access to.
    </p>
    <div class="flex flex-col items-center mt-10 space-y-4">
      <button
        v-for="account in viewer.gitlabAccounts"
        :key="account.login"
        @click="selectAccount(account)"
        :disabled="loading"
        class="flex items-center w-full px-3 py-2 mt-2 space-x-2 rounded-md text-vanilla-100 group"
        :class="account.installed ? 'bg-ink-200 cursor' : 'bg-ink-200 hover:bg-ink-300'"
      >
        <z-avatar
          v-if="account.avatar_url"
          :image="account.avatar_url"
          :fallback-image="getDefaultAvatar(account.login, !account.is_team)"
          :userName="account.login"
          class="flex-shrink-0"
        ></z-avatar>
        <div class="flex-grow overflow-hidden text-left overflow-ellipsis">
          <div>{{ account.login }}</div>
          <p class="text-xs text-vanilla-400">
            {{ account.is_team ? 'Team Account' : 'Personal Account' }}
          </p>
        </div>
        <z-icon v-if="account.installed" icon="check-circle" size="medium" color="juniper"></z-icon>
        <z-icon
          v-if="loadingAccount === account.login"
          icon="spin-loader"
          size="medium"
          color="juniper"
          class="animate-spin"
        ></z-icon>
        <z-icon
          v-else
          icon="chevron-right"
          size="medium"
          class="flex-shrink-0 duration-100 ease-linear transform group-hover:translate-x-1"
        ></z-icon>
      </button>
    </div>
    <p class="mt-4 text-sm text-vanilla-400">
      Need help? Write to us at
      <a
        :href="`mailto:${$config.supportEmail}`"
        class="cursor-pointer text-juniper hover:underline"
        >{{ $config.supportEmail }}</a
      >
    </p>
  </hero-card>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZButton, ZAvatar, ZIcon } from '@deepsource/zeal'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import { getDefaultAvatar } from '~/utils/ui'

import GitlabMutation from '@/apollo/mutations/installation/gitlabInstallationLanding.gql'

@Component({
  components: {
    ZButton,
    ZAvatar,
    ZIcon
  },
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  },
  methods: { getDefaultAvatar }
})
export default class InstallationProvider extends mixins(ActiveUserMixin) {
  async fetch(): Promise<void> {
    try {
      await this.fetchActiveUser()
      await this.fetchActiveUserGitlabAccounts()
    } catch (e) {
      this.$logErrorAndToast(
        e as Error,
        'Unable to fetch GitLab accounts, please contact support.',
        this.viewer
      )
    }
  }

  loading = false
  loadingAccount = ''

  async selectAccount({ login, installed }: { login: string; installed: boolean }): Promise<void> {
    if (installed) {
      this.$router.push(['', 'gl', login].join('/'))
      return
    }

    this.loading = true
    this.loadingAccount = login
    try {
      await this.$applyGraphqlMutation(GitlabMutation, { input: { login } })
      this.$toast.success(`Successfully connected ${login} with DeepSource.`)
      setTimeout(() => {
        this.$router.push(['', 'onboard', 'gl', login, 'repositories'].join('/'))
      }, 300)
    } catch (e) {
      this.$toast.danger('Something went wrong while connecting your account')
    } finally {
      this.loading = false
      this.loadingAccount = ''
    }
  }
}
</script>
