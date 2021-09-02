<template>
  <hero-card>
    <h1 class="text-vanilla-100 font-bold text-2xl leading-snug text-center">
      Choose a GitLab account
    </h1>
    <p class="text-vanilla-400 text-base text-center mt-4">
      You would be able to use DeepSource on all repositories that you have access to.
    </p>
    <div class="flex flex-col items-center mt-10 space-y-4">
      <button
        v-for="account in viewer.gitlabAccounts"
        :key="account.login"
        @click="selectAccount(account)"
        :disabled="loading"
        class="rounded-md w-full text-vanilla-100 px-3 py-2 flex items-center space-x-2 group mt-2"
        :class="account.installed ? 'bg-ink-200 cursor' : 'bg-ink-200 hover:bg-ink-300'"
      >
        <z-avatar
          v-if="account.avatar_url"
          :image="account.avatar_url"
          :userName="account.login"
          class="flex-shrink-0"
        ></z-avatar>
        <div class="flex-grow text-left overflow-ellipsis overflow-hidden">
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
          class="transform duration-100 ease-linear group-hover:translate-x-1 flex-shrink-0"
        ></z-icon>
      </button>
    </div>
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
import { ZButton, ZAvatar, ZIcon } from '@deepsourcelabs/zeal'
import ActiveUserMixin from '~/mixins/activeUserMixin'
import ContextMixin from '~/mixins/contextMixin'

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
  }
})
export default class InstallationProvider extends mixins(ContextMixin, ActiveUserMixin) {
  async fetch(): Promise<void> {
    await this.fetchActiveUser()
    await this.fetchActiveUserGitlabAccounts()
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
        this.$router.push(['', 'onboard', 'gl', login, 'issue-type'].join('/'))
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
